<?php

namespace App\Http\Controllers\Api\Sekdes;

use App\Http\Controllers\Controller;
use App\Models\NotifikasiLog;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SekdesSuratController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $surats = SuratRequest::with(['suratType', 'wargaProfile.rt.rw', 'trackings.actorUser.role'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $surats,
        ]);
    }

    public function processSekdes(Request $request, $id): JsonResponse
    {
        $surat = SuratRequest::with(['suratType', 'wargaProfile'])->findOrFail($id);
        $user = $request->user();

        // Ambil jenis surat
        $suratType = $surat->suratType;
        
        // Cek apakah nomor manual dikirim dari modal konfirmasi desa
        if ($request->filled('nomor_surat_resmi')) {
            $nomorResmi = trim($request->input('nomor_surat_resmi'));
            if ($suratType) {
                $suratType->increment('nomor_terakhir');
            }
        } elseif ($suratType) {
            $nextSeq = ($suratType->nomor_terakhir ?? 0) + 1;
            $nomorResmi = \App\Services\LetterNumberService::generateNumber($suratType, $nextSeq);
            $suratType->update(['nomor_terakhir' => $nextSeq]);
        } else {
            $countYear = SuratRequest::whereYear('created_at', date('Y'))->whereNotNull('nomor_surat_resmi')->count() + 1;
            $paddedNo = str_pad($countYear, 3, '0', STR_PAD_LEFT);
            $nomorResmi = "470/{$paddedNo}/418.66.04/" . date('Y');
        }

        $surat->update([
            'nomor_surat_resmi' => $nomorResmi,
            'status' => 'completed',
            'ttd_sekdes_at' => now(),
            'ttd_kades_at' => now(),
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Kepala Desa / Sekdes',
            'status_action' => 'Ditandatangani',
            'catatan' => "Surat resmi diterbitkan dengan nomor {$nomorResmi} dan disahkan dengan barcode serta tanda tangan digital resmi Kepala Desa Doko.",
        ]);

        if ($surat->wargaProfile && $surat->wargaProfile->no_hp_wa) {
            $namaSurat = $suratType ? $suratType->nama_surat : 'Surat';
            NotifikasiLog::create([
                'user_id' => $surat->wargaProfile->user_id,
                'warga_profile_id' => $surat->wargaProfile->id,
                'nomor_tujuan' => $surat->wargaProfile->no_hp_wa,
                'jenis_notifikasi' => 'SURAT_READY',
                'judul' => 'Surat Selesai & Sah',
                'pesan' => "Halo {$surat->wargaProfile->nama_lengkap}, surat permohonan {$namaSurat} ({$nomorResmi}) telah SELESAI dan disahkan dengan barcode & tanda tangan resmi Kepala Desa Doko. Anda dapat mengunduh dokumen sah di portal SIDes.",
                'status_pengiriman' => 'TERKIRIM',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat resmi berhasil diterbitkan dan siap diunduh oleh warga.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }

    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'alasan' => 'nullable|string|max:500',
            'catatan' => 'nullable|string|max:500',
        ]);

        $alasan = $request->input('alasan') ?: $request->input('catatan', 'Pengajuan surat ditolak oleh Pemerintah Desa.');

        $surat = SuratRequest::with('wargaProfile')->findOrFail($id);
        $user = $request->user()->load('role');

        $surat->update([
            'status' => 'rejected',
            'catatan_penolakan' => $alasan,
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => $user->role ? $user->role->display_name : 'Sekretaris Desa',
            'status_action' => 'Ditolak',
            'catatan' => 'Alasan: ' . $alasan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat telah ditolak dengan catatan perbaikan.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }
}
