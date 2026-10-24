<?php

namespace App\Http\Controllers\Api\Kades;

use App\Http\Controllers\Controller;
use App\Models\NotifikasiLog;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use App\Services\LetterNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KadesSuratController extends Controller
{
    /**
     * Daftar seluruh antrean surat untuk Kepala Desa.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('kades') && !$user->hasRole('admin') && !$user->hasRole('admin_desa') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Hanya Kepala Desa atau Administrator yang berwenang mengakses antrean persetujuan ini.',
            ], 403);
        }

        $query = SuratRequest::with([
            'suratType',
            'wargaProfile.rt.rw.dusun',
            'wargaProfile.kartuKeluarga',
            'trackings.actorUser.role',
            'verifiedRtUser',
            'processedSekdesUser',
            'approvedKadesUser',
        ])->orderBy('created_at', 'desc');

        // Filter status jika ada parameter query
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'pending_kades') {
                $query->whereIn('status', ['pending_kades', 'processed_sekdes', 'approved_rt']);
            } else {
                $query->where('status', $request->status);
            }
        }

        // Filter search jika ada
        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('nomor_resi', 'like', "%{$s}%")
                  ->orWhere('nomor_surat_resmi', 'like', "%{$s}%")
                  ->orWhereHas('wargaProfile', function ($wq) use ($s) {
                      $wq->where('nama_lengkap', 'like', "%{$s}%")
                        ->orWhere('nik', 'like', "%{$s}%");
                  })
                  ->orWhereHas('suratType', function ($sq) use ($s) {
                      $sq->where('nama_surat', 'like', "%{$s}%");
                  });
            });
        }

        $stats = [
            'pending_kades' => SuratRequest::whereIn('status', ['pending_kades', 'processed_sekdes', 'approved_rt'])->count(),
            'completed' => SuratRequest::where('status', 'completed')->count(),
            'rejected_kades' => SuratRequest::where('status', 'rejected_kades')->count(),
            'total' => SuratRequest::count(),
        ];

        // Parameter per_page validation & clamping [1, 100]
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        if ($request->boolean('all')) {
            $surats = $query->limit(200)->get();
            return response()->json([
                'success' => true,
                'data' => $surats,
                'stats' => $stats,
                'pagination' => [
                    'current_page' => 1,
                    'per_page' => $surats->count(),
                    'total' => $surats->count(),
                    'last_page' => 1,
                    'has_more' => false,
                ],
            ]);
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'stats' => $stats,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    /**
     * Persetujuan & Pengesahan Final Surat oleh Kepala Desa.
     * Hanya Kades yang berhak mengeksekusi endpoint ini.
     */
    public function approve(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        // 1. Otorisasi role: Kades sah atau Administrator
        if (!$user->hasRole('kades') && !$user->hasRole('admin') && !$user->hasRole('admin_desa') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Kepala Desa atau Administrator yang memiliki kewenangan menyetujui surat pemerintahan.',
            ], 403);
        }

        $surat = SuratRequest::withoutGlobalScope('tenant')->with(['suratType', 'wargaProfile'])->findOrFail($id);
        \App\Services\TenantSecurityService::validateSurat($user, $surat);

        // 2. Validasi status state machine
        if ($surat->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Surat ini sudah selesai dan disahkan sebelumnya, tidak dapat diproses ulang.',
            ], 422);
        }

        if (!in_array($surat->status, ['pending_kades', 'processed_sekdes', 'approved_rt'])) {
            return response()->json([
                'success' => false,
                'message' => 'Surat dengan status "' . $surat->status . '" tidak dapat disetujui. Surat harus diverifikasi dan disetujui terlebih dahulu oleh Ketua RT.',
            ], 422);
        }

        // 4. Transaksi Atomik Database & Alokasi Nomor Resmi
        return DB::transaction(function () use ($surat, $user, $request) {
            $suratType = $surat->suratType;

            // Generate nomor surat resmi jika belum ada
            if ($request->filled('nomor_surat_resmi')) {
                $nomorResmi = trim($request->input('nomor_surat_resmi'));
                if ($suratType) {
                    $suratType->increment('nomor_terakhir');
                }
            } elseif (!empty($surat->nomor_surat_resmi)) {
                $nomorResmi = $surat->nomor_surat_resmi;
            } elseif ($suratType) {
                $nextSeq = ($suratType->nomor_terakhir ?? 0) + 1;
                $nomorResmi = LetterNumberService::generateNumber($suratType, $nextSeq);
                $suratType->update(['nomor_terakhir' => $nextSeq]);
            } else {
                $countYear = SuratRequest::whereYear('created_at', date('Y'))->whereNotNull('nomor_surat_resmi')->count() + 1;
                $paddedNo = str_pad($countYear, 3, '0', STR_PAD_LEFT);
                $nomorResmi = "470/{$paddedNo}/418.66.04/" . date('Y');
            }

            // Pastikan QR verification hash valid
            $qrHash = $surat->qr_verification_hash;
            if (empty($qrHash)) {
                $qrHash = hash('sha256', $surat->nomor_resi . '|' . ($surat->wargaProfile?->nik ?? 'NIK') . '|' . microtime(true));
            }

            $catatan = $request->input('catatan', "Surat resmi telah disetujui, ditandatangani secara digital dengan QR Code resmi oleh Kepala Desa Doko, dan diterbitkan dengan nomor {$nomorResmi}.");

            $surat->update([
                'status' => 'completed',
                'nomor_surat_resmi' => $nomorResmi,
                'approved_kades_user_id' => $user->id,
                'ttd_kades_at' => now(),
                'ttd_sekdes_at' => $surat->ttd_sekdes_at ?: now(),
                'qr_verification_hash' => $qrHash,
                'catatan_penolakan_kades' => null,
            ]);

            SuratTracking::create([
                'surat_request_id' => $surat->id,
                'actor_user_id' => $user->id,
                'status_stage' => 'Kepala Desa',
                'status_action' => 'Ditandatangani',
                'catatan' => $catatan,
            ]);

            // Kirim notifikasi WA ke pemohon
            if ($surat->wargaProfile && $surat->wargaProfile->no_hp_wa) {
                NotifikasiLog::create([
                    'user_id' => $surat->wargaProfile->user_id,
                    'warga_profile_id' => $surat->wargaProfile->id,
                    'nomor_tujuan' => $surat->wargaProfile->no_hp_wa,
                    'jenis_notifikasi' => 'SURAT_SELESAI',
                    'judul' => 'Surat Resmi Telah Diterbitkan & Sah',
                    'pesan' => "Yth. {$surat->wargaProfile->nama_lengkap}, pengajuan surat {$surat->nomor_resi} telah DISETUJUI & DITANDATANGANI oleh Kepala Desa dengan Nomor: {$nomorResmi}. Dokumen sah siap diunduh dan dicetak.",
                    'status_pengiriman' => 'TERKIRIM',
                ]);
            }

            // Web Push Notification ke Pemohon
            try {
                if ($surat->wargaProfile && $surat->wargaProfile->user) {
                    app(\App\Services\WebPushService::class)->sendToUser(
                        $surat->wargaProfile->user,
                        'Surat Resmi Telah Disahkan',
                        'Permohonan surat Anda telah disahkan Kepala Desa dengan stempel QR resmi dan siap diunduh.',
                        '/dashboard',
                        'surat-' . $surat->id
                    );
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('[WebPush] Error on Kades approve: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => "Surat berhasil disetujui dan diterbitkan secara sah dengan nomor {$nomorResmi}.",
                'data' => $surat->fresh(['suratType', 'wargaProfile', 'trackings.actorUser.role', 'approvedKadesUser']),
            ]);
        });
    }

    /**
     * Penolakan Surat oleh Kepala Desa (Wajib alasan).
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        // 1. Otorisasi role: Kades sah atau Administrator
        if (!$user->hasRole('kades') && !$user->hasRole('admin') && !$user->hasRole('admin_desa') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Kepala Desa atau Administrator yang memiliki kewenangan menolak surat pemerintahan.',
            ], 403);
        }

        // 2. Validasi input: alasan wajib diisi
        $request->validate([
            'alasan' => 'required|string|min:5|max:500',
        ], [
            'alasan.required' => 'Alasan penolakan surat oleh Kepala Desa wajib diisi.',
            'alasan.min' => 'Alasan penolakan minimal 5 karakter.',
        ]);

        $surat = SuratRequest::withoutGlobalScope('tenant')->with(['suratType', 'wargaProfile'])->findOrFail($id);
        \App\Services\TenantSecurityService::validateSurat($user, $surat);

        // 3. Validasi status
        if (!in_array($surat->status, ['pending_kades', 'processed_sekdes', 'approved_rt'])) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya surat yang sedang menunggu pengesahan Kepala Desa yang dapat ditolak.',
            ], 422);
        }

        $alasan = trim($request->input('alasan'));

        return DB::transaction(function () use ($surat, $user, $alasan) {
            $surat->update([
                'status' => 'rejected_kades',
                'rejected_kades_user_id' => $user->id,
                'catatan_penolakan_kades' => $alasan,
                'catatan_penolakan' => $alasan,
            ]);

            SuratTracking::create([
                'surat_request_id' => $surat->id,
                'actor_user_id' => $user->id,
                'status_stage' => 'Kepala Desa',
                'status_action' => 'Ditolak',
                'catatan' => "Ditolak Kepala Desa: {$alasan}",
            ]);

            // Kirim notifikasi log
            if ($surat->wargaProfile && $surat->wargaProfile->no_hp_wa) {
                NotifikasiLog::create([
                    'user_id' => $surat->wargaProfile->user_id,
                    'warga_profile_id' => $surat->wargaProfile->id,
                    'nomor_tujuan' => $surat->wargaProfile->no_hp_wa,
                    'jenis_notifikasi' => 'SURAT_REJECTED_KADES',
                    'judul' => 'Surat Memerlukan Perbaikan dari Kades',
                    'pesan' => "Yth. {$surat->wargaProfile->nama_lengkap}, pengajuan surat {$surat->nomor_resi} ditolak oleh Kepala Desa dengan catatan: {$alasan}. Silakan hubungi Sekretariat Desa.",
                    'status_pengiriman' => 'TERKIRIM',
                ]);
            }

            // Web Push Notification ke Pemohon bila ditolak Kades
            try {
                if ($surat->wargaProfile && $surat->wargaProfile->user) {
                    app(\App\Services\WebPushService::class)->sendToUser(
                        $surat->wargaProfile->user,
                        'Pengajuan Surat Ditolak Kepala Desa',
                        'Permohonan surat Anda ditolak Kepala Desa. Silakan periksa catatan revisi di dashboard.',
                        '/dashboard',
                        'surat-' . $surat->id
                    );
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('[WebPush] Error on Kades reject: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Permohonan surat berhasil ditolak dengan catatan resmi Kepala Desa.',
                'data' => $surat->fresh(['suratType', 'wargaProfile', 'trackings.actorUser.role']),
            ]);
        });
    }
}
