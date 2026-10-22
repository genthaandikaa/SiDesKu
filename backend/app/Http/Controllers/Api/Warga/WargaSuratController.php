<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\DesaSetting;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use App\Services\FileUploadSecurityService;
use App\Services\IdempotencyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WargaSuratController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('role', 'wargaProfile.rt.rw');
        
        if (!$user->wargaProfile) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $surats = SuratRequest::with(['suratType', 'wargaProfile.rt.rw', 'trackings.actorUser.role'])
            ->where('warga_profile_id', $user->wargaProfile->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $surats,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        if (!$user->wargaProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Profil kependudukan warga Anda belum terdaftar.',
            ], 422);
        }

        $validated = $request->validate([
            'surat_type_id' => 'required|exists:surat_types,id',
            'keperluan' => 'required|string|max:500',
            'form_data' => 'nullable|array',
            'file_lampiran' => 'nullable',
            'file_lampirans' => 'nullable|array',
        ]);

        $suratType = \App\Models\SuratType::withoutGlobalScope('tenant')->find($validated['surat_type_id']);
        if (!$suratType || ($suratType->desa_id && (int) $suratType->desa_id !== (int) $user->desa_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis surat yang dipilih tidak terdaftar pada desa Anda.',
            ], 422);
        }

        $idempotencyKey = IdempotencyService::extractKey($request);

        return IdempotencyService::run(
            $user,
            'POST /api/surats',
            $idempotencyKey,
            $request->all(),
            function () use ($validated, $user, $request) {
                $resiCode = 'REQ-' . date('Ymd') . '-' . strtoupper(Str::random(6));
                $qrHash = hash('sha256', $resiCode . '|' . $user->wargaProfile->nik . '|' . microtime(true));

                $finalFileLampiran = $this->processLampirans(
                    $request->has('file_lampirans') ? $request->file_lampirans : ($validated['file_lampiran'] ?? null),
                    $user->id,
                    $user->wargaProfile
                );

                $suratReq = SuratRequest::create([
                    'desa_id' => $user->desa_id ?? $user->wargaProfile->desa_id,
                    'nomor_resi' => $resiCode,
                    'warga_profile_id' => $user->wargaProfile->id,
                    'surat_type_id' => $validated['surat_type_id'],
                    'status' => 'pending_rt',
                    'keperluan' => $validated['keperluan'],
                    'form_data_json' => $validated['form_data'] ?? [],
                    'file_lampiran' => $finalFileLampiran,
                    'qr_verification_hash' => $qrHash,
                ]);

                SuratTracking::create([
                    'desa_id' => $user->desa_id ?? $user->wargaProfile->desa_id,
                    'surat_request_id' => $suratReq->id,
                    'actor_user_id' => $user->id,
                    'status_stage' => 'Warga',
                    'status_action' => 'Diajukan',
                    'catatan' => 'Permohonan surat berhasil dibuat secara online oleh pemohon.',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Permohonan surat berhasil diajukan.',
                    'data' => $suratReq->load(['suratType', 'wargaProfile', 'trackings']),
                ], 201);
            }
        );
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        if (!$user->wargaProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Profil kependudukan warga Anda belum terdaftar.',
            ], 422);
        }

        $surat = SuratRequest::find($id);
        if (!$surat) {
            return response()->json([
                'success' => false,
                'message' => 'Surat permohonan tidak ditemukan.',
            ], 404);
        }

        if ($surat->warga_profile_id !== $user->wargaProfile->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk mengubah pengajuan surat ini.',
            ], 403);
        }

        if ($surat->status !== 'pending_rt') {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan surat sudah diproses oleh RT/Desa dan tidak dapat diubah lagi.',
            ], 422);
        }

        $validated = $request->validate([
            'surat_type_id' => 'sometimes|exists:surat_types,id',
            'keperluan' => 'required|string|max:500',
            'form_data' => 'nullable|array',
            'file_lampiran' => 'nullable',
            'file_lampirans' => 'nullable|array',
        ]);

        $updateData = [
            'keperluan' => $validated['keperluan'],
        ];

        if (!empty($validated['surat_type_id'])) {
            $updateData['surat_type_id'] = $validated['surat_type_id'];
        }

        if (isset($validated['form_data'])) {
            $updateData['form_data_json'] = $validated['form_data'];
        }

        if ($request->has('file_lampirans') || $request->has('file_lampiran')) {
            $lampiranPayload = $request->has('file_lampirans') ? $request->file_lampirans : $request->file_lampiran;
            $updateData['file_lampiran'] = $this->processLampirans($lampiranPayload, $user->id, $user->wargaProfile);
        }

        $surat->update($updateData);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Warga',
            'status_action' => 'Revisi',
            'catatan' => 'Data permohonan surat diperbarui oleh pemohon.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Perubahan permohonan surat berhasil disimpan.',
            'data' => $surat->fresh()->load(['suratType', 'wargaProfile', 'trackings']),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        if (!$user->wargaProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Profil kependudukan warga Anda belum terdaftar.',
            ], 422);
        }

        $surat = SuratRequest::find($id);
        if (!$surat) {
            return response()->json([
                'success' => false,
                'message' => 'Surat permohonan tidak ditemukan.',
            ], 404);
        }

        if ($surat->warga_profile_id !== $user->wargaProfile->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk membatalkan pengajuan surat ini.',
            ], 403);
        }

        if ($surat->status !== 'pending_rt') {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan surat sudah diproses dan tidak dapat dibatalkan.',
            ], 422);
        }

        $surat->trackings()->delete();
        $surat->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan surat berhasil dibatalkan dan dihapus.',
        ]);
    }

    public function show($id): JsonResponse
    {
        $surat = SuratRequest::with(['suratType', 'wargaProfile.rt.rw.dusun', 'wargaProfile.kartuKeluarga', 'trackings.actorUser.role'])->find($id);

        if (!$surat) {
            return response()->json(['success' => false, 'message' => 'Surat tidak ditemukan'], 404);
        }

        $desa = DesaSetting::first();

        return response()->json([
            'success' => true,
            'data' => $surat,
            'desa' => $desa,
        ]);
    }

    private function saveImageHelper($imageInput, $customName = null, $userId = 1): ?string
    {
        if (empty($imageInput)) return null;

        $result = FileUploadSecurityService::processBase64Upload(
            $imageInput,
            ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
            FileUploadSecurityService::MAX_DOCUMENT_SIZE,
            'lampiran',
            $customName ? Str::slug($customName) : 'lampiran_' . $userId
        );

        if (! $result['success']) {
            return null;
        }

        return $result['url'];
    }

    private function processLampirans($lampiranInput, $userId, $wargaProfile = null): ?string
    {
        $savedLampirans = [];

        $items = [];
        if (is_array($lampiranInput)) {
            $items = $lampiranInput;
        } elseif (is_string($lampiranInput) && str_starts_with(trim($lampiranInput), '[')) {
            $decoded = json_decode($lampiranInput, true);
            if (is_array($decoded)) {
                $items = $decoded;
            }
        } elseif (is_string($lampiranInput) && !empty($lampiranInput)) {
            $items = [$lampiranInput];
        }

        foreach ($items as $item) {
            if (is_array($item)) {
                $url = $this->saveImageHelper($item['url'] ?? $item['file'] ?? '', $item['nama'] ?? null, $userId);
                if ($url) {
                    $savedLampirans[] = [
                        'url' => $url,
                        'nama' => $item['nama'] ?? 'Dokumen Lampiran',
                    ];
                }
            } elseif (is_string($item)) {
                $url = $this->saveImageHelper($item, null, $userId);
                if ($url) {
                    $savedLampirans[] = [
                        'url' => $url,
                        'nama' => 'Dokumen Lampiran',
                    ];
                }
            }
        }

        // Auto-attach master documents from village registry if wargaProfile is provided
        if ($wargaProfile) {
            $hasKtp = collect($savedLampirans)->contains(function ($l) {
                return str_contains(strtolower($l['nama']), 'ktp');
            });

            if (!$hasKtp && !empty($wargaProfile->foto_ktp)) {
                $savedLampirans[] = [
                    'url' => $wargaProfile->foto_ktp,
                    'nama' => 'Foto KTP Pemohon (Database Desa)',
                ];
            }

            $hasKk = collect($savedLampirans)->contains(function ($l) {
                return str_contains(strtolower($l['nama']), 'kk') || str_contains(strtolower($l['nama']), 'keluarga');
            });

            $fotoKk = $wargaProfile->foto_kk ?? $wargaProfile->kartuKeluarga?->foto_kk;
            if (!$hasKk && !empty($fotoKk)) {
                $savedLampirans[] = [
                    'url' => $fotoKk,
                    'nama' => 'Kartu Keluarga (Database Desa)',
                ];
            }

            if (!empty($wargaProfile->foto_akta_lahir)) {
                $hasAkta = collect($savedLampirans)->contains(function ($l) {
                    return str_contains(strtolower($l['nama']), 'akta');
                });
                if (!$hasAkta) {
                    $savedLampirans[] = [
                        'url' => $wargaProfile->foto_akta_lahir,
                        'nama' => 'Akta Kelahiran (Database Desa)',
                    ];
                }
            }
        }

        return !empty($savedLampirans) ? json_encode($savedLampirans) : null;
    }
}
