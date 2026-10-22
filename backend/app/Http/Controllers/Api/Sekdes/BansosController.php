<?php

namespace App\Http\Controllers\Api\Sekdes;

use App\Http\Controllers\Controller;
use App\Models\BantuanPenerima;
use App\Models\BantuanSosial;
use App\Models\NotifikasiLog;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    public function update(Request $request, $id): JsonResponse
    {
        $bansos = BantuanSosial::findOrFail($id);
        if ($request->user() && $bansos->desa_id !== $request->user()->desa_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized desa access.'], 403);
        }

        $validated = $request->validate([
            'nama_bantuan' => 'sometimes|required|string|max:150',
            'sumber_dana' => 'sometimes|required|string|max:100',
            'tahun' => 'sometimes|required|integer',
            'tahap' => 'sometimes|required|string|max:50',
            'kuota_penerima' => 'sometimes|required|integer|min:1',
            'nominal_per_penerima' => 'sometimes|required|numeric|min:0',
            'tanggal_penyaluran' => 'sometimes|required|date',
            'waktu_mulai' => 'nullable|string',
            'lokasi_penyaluran' => 'sometimes|required|string|max:150',
            'deskripsi' => 'nullable|string',
        ]);

        $bansos->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal dan informasi bantuan berhasil diperbarui.',
            'data' => $bansos,
        ]);
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
        $bansos = BantuanSosial::with(['penerimas.wargaProfile', 'desa'])->findOrFail($id);

        if ($request->user() && $bansos->desa_id !== $request->user()->desa_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized desa access.'], 403);
        }

        if (empty($bansos->lokasi_penyaluran) || empty($bansos->tanggal_penyaluran)) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal publikasi: Lokasi dan tanggal penyaluran wajib diisi dengan jelas sebelum diterbitkan.',
            ], 422);
        }

        $totalBroadcast = 0;

        DB::transaction(function () use ($bansos, &$totalBroadcast) {
            $bansos->update([
                'status' => 'published',
                'published_at' => now(),
            ]);

            BantuanPenerima::where('bantuan_sosial_id', $bansos->id)
                ->where('status_penyaluran', 'Terdaftar')
                ->update(['status_penyaluran' => 'Siap Diambil']);

            $broadcastLogs = [];
            $nominalFormat = number_format($bansos->nominal_per_penerima, 0, ',', '.');
            $namaDesa = $bansos->desa->nama_desa ?? 'Pemerintah Desa';
            $now = now();

            foreach ($bansos->penerimas as $p) {
                $warga = $p->wargaProfile;
                if ($warga && $warga->no_hp_wa) {
                    $tanggalStr = $bansos->tanggal_penyaluran ? $bansos->tanggal_penyaluran->format('d/m/Y') : '-';
                    $pesan = "🌾 Undangan Resmi Penyaluran {$bansos->nama_bantuan} :\n\n" .
                        "nama penerima 👤 : *{$warga->nama_lengkap}*\n" .
                        "nik 🆔 : *{$warga->nik}*\n" .
                        "program bantuan 🌾 : *{$bansos->nama_bantuan} ({$bansos->tahap})*\n" .
                        "hari & tanggal 📆 : *{$tanggalStr}*\n" .
                        "waktu ⏰ : *{$bansos->waktu_mulai} WIB*\n" .
                        "lokasi 📍 : *{$bansos->lokasi_penyaluran}*\n" .
                        "nominal bantuan 💸 : *Rp {$nominalFormat}*\n" .
                        "biaya tebus 💸 : *GRATIS (Rp 0,-)*\n" .
                        "no. urut antrean 🎫 : *{$p->nomor_antrean}*\n" .
                        "kode barcode 🔢 : *{$p->qr_bantuan_code}*\n\n" .
                        "NB 📌 : *Tunjukkan NIK asli atau Kode QR ({$p->qr_bantuan_code}) pada aplikasi SiDesKu saat pengambilan bantuan di balai desa.*\n\n" .
                        "Salam hangat dari {$namaDesa} 🌾✨";

                    $broadcastLogs[] = [
                        'desa_id' => $bansos->desa_id,
                        'user_id' => $warga->user_id,
                        'warga_profile_id' => $warga->id,
                        'nomor_tujuan' => $warga->no_hp_wa,
                        'jenis_notifikasi' => 'BANSOS_CAIR',
                        'judul' => "Pencairan {$bansos->nama_bantuan}",
                        'pesan' => $pesan,
                        'status_pengiriman' => 'TERKIRIM',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if (!empty($broadcastLogs)) {
                foreach (array_chunk($broadcastLogs, 100) as $chunk) {
                    NotifikasiLog::insert($chunk);
                }
                $totalBroadcast = count($broadcastLogs);
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Bantuan berhasil dipublikasikan dan siaran notifikasi WhatsApp otomatis telah dikirim ke {$totalBroadcast} warga penerima.",
            'total_broadcast' => $totalBroadcast,
            'bansos' => $bansos->fresh('penerimas.wargaProfile'),
        ]);
    }
    public function verifyDisalurkan(Request $request, $id): JsonResponse
    {
        $searchKey = $request->input('qr_bantuan_code') ?? $request->input('nik') ?? $request->input('code');
        if (empty($searchKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode QR atau NIK warga wajib diisi.',
            ], 422);
        }

        $code = trim((string)$searchKey);

        $penerima = BantuanPenerima::with(['wargaProfile', 'bantuanSosial'])
            ->where('bantuan_sosial_id', $id)
            ->where(function ($q) use ($code) {
                $q->where('qr_bantuan_code', $code)
                  ->orWhereHas('wargaProfile', function ($sub) use ($code) {
                      $sub->where('nik', $code);
                  });
            })
            ->first();

        if (!$penerima) {
            return response()->json([
                'success' => false,
                'message' => 'Kode QR atau NIK warga tidak cocok dengan daftar penerima program bantuan ini.',
            ], 404);
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
