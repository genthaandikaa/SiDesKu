<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\DesaSetting;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
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
            'file_lampiran' => 'nullable|string',
        ]);

        $resiCode = 'REQ-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        $qrHash = hash('sha256', $resiCode . '|' . $user->wargaProfile->nik . '|' . microtime(true));

        $suratReq = SuratRequest::create([
            'nomor_resi' => $resiCode,
            'warga_profile_id' => $user->wargaProfile->id,
            'surat_type_id' => $validated['surat_type_id'],
            'status' => 'pending_rt',
            'keperluan' => $validated['keperluan'],
            'form_data_json' => $validated['form_data'] ?? [],
            'file_lampiran' => $validated['file_lampiran'] ?? null,
            'qr_verification_hash' => $qrHash,
        ]);

        SuratTracking::create([
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
}
