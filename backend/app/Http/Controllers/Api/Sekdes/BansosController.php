<?php

namespace App\Http\Controllers\Api\Sekdes;

use App\Http\Controllers\Controller;
use App\Models\BantuanPenerima;
use App\Models\BantuanSosial;
use App\Models\NotifikasiLog;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BansosController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bansos = BantuanSosial::withCount(['penerimas as total_terdaftar'])
            ->withCount(['penerimas as total_disalurkan' => function ($q) {
                $q->where('status_penyaluran', 'Sudah Disalurkan');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bansos,
        ]);
    }

    public function show($id): JsonResponse
    {
        $bansos = BantuanSosial::with(['penerimas.wargaProfile.rt.rw', 'penerimas.kartuKeluarga', 'createdByUser'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $bansos,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_bantuan' => 'required|string|max:150',
            'sumber_dana' => 'required|string|max:100',
            'tahun' => 'required|integer',
            'tahap' => 'required|string|max:50',
            'kuota_penerima' => 'required|integer|min:1',
            'nominal_per_penerima' => 'required|numeric|min:0',
            'tanggal_penyaluran' => 'required|date',
            'waktu_mulai' => 'nullable|string',
            'lokasi_penyaluran' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
        ]);

        $validated['created_by_user_id'] = $request->user()->id;
        $validated['status'] = 'draft';

        $bansos = BantuanSosial::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Program bantuan sosial berhasil dibuat.',
            'data' => $bansos,
        ], 201);
    }

    public function addPenerima(Request $request, $id): JsonResponse
    {
        $bansos = BantuanSosial::findOrFail($id);

        $validated = $request->validate([
            'warga_profile_id' => 'required|exists:warga_profiles,id',
        ]);

        $warga = WargaProfile::with('kartuKeluarga')->findOrFail($validated['warga_profile_id']);

        $exists = BantuanPenerima::where('bantuan_sosial_id', $bansos->id)
            ->where('warga_profile_id', $warga->id)
            ->exists();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Warga ini sudah terdaftar sebagai penerima.'], 422);
        }

        $count = BantuanPenerima::where('bantuan_sosial_id', $bansos->id)->count() + 1;
        $antrean = 'A-' . str_pad($count, 3, '0', STR_PAD_LEFT);
        $qrCode = strtoupper(Str::slug($bansos->nama_bantuan)) . '-' . $warga->nik;

        $penerima = BantuanPenerima::create([
            'bantuan_sosial_id' => $bansos->id,
            'warga_profile_id' => $warga->id,
            'kk_id' => $warga->kk_id,
            'nomor_antrean' => $antrean,
            'qr_bantuan_code' => $qrCode,
            'status_penyaluran' => 'Terdaftar',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penerima bantuan berhasil ditambahkan ke daftar.',
            'data' => $penerima->load('wargaProfile'),
        ], 201);
    }

    public function publishAndBroadcast(Request $request, $id): JsonResponse
    {
        $bansos = BantuanSosial::with('penerimas.wargaProfile')->findOrFail($id);

        $bansos->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        BantuanPenerima::where('bantuan_sosial_id', $bansos->id)
            ->where('status_penyaluran', 'Terdaftar')
            ->update(['status_penyaluran' => 'Siap Diambil']);

        $broadcastLogs = [];
        $nominalFormat = number_format($bansos->nominal_per_penerima, 0, ',', '.');

        foreach ($bansos->penerimas as $p) {
            $warga = $p->wargaProfile;
            if ($warga && $warga->no_hp_wa) {
                $pesan = "🌾 Undangan Resmi Penyaluran {$bansos->nama_bantuan} :\n\n" .
                    "nama penerima 👤 : *{$warga->nama_lengkap}*\n" .
                    "nik 🆔 : *{$warga->nik}*\n" .
                    "program bantuan 🌾 : *{$bansos->nama_bantuan} ({$bansos->tahap})*\n" .
                    "hari & tanggal 📆 : *{$bansos->tanggal_penyaluran->format('d/m/Y')}*\n" .
                    "waktu ⏰ : *{$bansos->waktu_mulai} WIB*\n" .
                    "lokasi 📍 : *{$bansos->lokasi_penyaluran}*\n" .
                    "nominal bantuan 💸 : *Rp {$nominalFormat}*\n" .
                    "biaya tebus 💸 : *GRATIS (Rp 0,-)*\n" .
                    "no. urut antrean 🎫 : *{$p->nomor_antrean}*\n" .
                    "kode barcode 🔢 : *{$p->qr_bantuan_code}*\n\n" .
                    "NB 📌 : *Tunjukkan NIK asli atau Kode QR ({$p->qr_bantuan_code}) pada aplikasi SIDes saat pengambilan bantuan di balai desa.*\n\n" .
                    "Salam hangat dari Pemerintah Desa Doko 🌾✨";

                $log = NotifikasiLog::create([
                    'user_id' => $warga->user_id,
                    'warga_profile_id' => $warga->id,
                    'nomor_tujuan' => $warga->no_hp_wa,
                    'jenis_notifikasi' => 'BANSOS_CAIR',
                    'judul' => "Pencairan {$bansos->nama_bantuan}",
                    'pesan' => $pesan,
                    'status_pengiriman' => 'TERKIRIM',
                ]);
                $broadcastLogs[] = $log;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Bantuan berhasil dipublikasikan dan siaran notifikasi WhatsApp otomatis telah dikirim ke " . count($broadcastLogs) . " warga penerima.",
            'total_broadcast' => count($broadcastLogs),
            'bansos' => $bansos->fresh('penerimas.wargaProfile'),
        ]);
    }

    public function verifyDisalurkan(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'qr_bantuan_code' => 'required|string',
        ]);

        $penerima = BantuanPenerima::with(['wargaProfile', 'bantuanSosial'])
            ->where('bantuan_sosial_id', $id)
            ->where('qr_bantuan_code', $validated['qr_bantuan_code'])
            ->first();

        if (!$penerima) {
            return response()->json(['success' => false, 'message' => 'Kode QR bantuan tidak cocok dengan daftar penerima ini.'], 404);
        }

        if ($penerima->status_penyaluran === 'Sudah Disalurkan') {
            return response()->json([
                'success' => false,
                'message' => "Bantuan sudah disalurkan sebelumnya pada {$penerima->disalurkan_at->format('d/m/Y H:i')}.",
            ], 422);
        }

        $penerima->update([
            'status_penyaluran' => 'Sudah Disalurkan',
            'disalurkan_at' => now(),
            'petugas_user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Bantuan untuk {$penerima->wargaProfile->nama_lengkap} berhasil diverifikasi dan tercatat telah disalurkan.",
            'data' => $penerima,
        ]);
    }
}
