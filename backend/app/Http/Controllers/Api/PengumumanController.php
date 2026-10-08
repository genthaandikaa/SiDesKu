<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BantuanPenerima;
use App\Models\BantuanSosial;
use App\Models\Pengumuman;
use App\Models\WargaProfile;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengumumanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $wargaProfile = null;

        if ($user) {
            $wargaProfile = WargaProfile::where('user_id', $user->id)
                ->with(['rt.rw.dusun', 'kartuKeluarga'])
                ->first();

            // Fallback for demo if logged in as admin/sekdes/warga without profile
            if (!$wargaProfile) {
                $wargaProfile = WargaProfile::with(['rt.rw.dusun', 'kartuKeluarga'])->find(1);
            }
        }

        $pengumumans = Pengumuman::with(['bantuanSosial', 'createdByUser'])
            ->where('is_active', true)
            ->orderByRaw('CASE WHEN bantuan_sosial_id IS NOT NULL THEN 0 ELSE 1 END, id DESC')
            ->get();

        $formatted = [];
        foreach ($pengumumans as $index => $p) {
            $formatted[] = $this->formatPengumuman($p, $wargaProfile, $user, $index);
        }

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $wargaProfile = null;

        if ($user) {
            $wargaProfile = WargaProfile::where('user_id', $user->id)
                ->with(['rt.rw.dusun', 'kartuKeluarga'])
                ->first() ?? WargaProfile::with(['rt.rw.dusun', 'kartuKeluarga'])->find(1);
        }

        $p = Pengumuman::with(['bantuanSosial', 'createdByUser'])->findOrFail($id);
        $formatted = $this->formatPengumuman($p, $wargaProfile, $user, 0);

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:200',
            'kategori' => 'required|string|max:50',
            'isi' => 'required|string',
            'level_target' => 'nullable|string|in:Semua,Dusun,RW,RT',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date',
            'bantuan_sosial_id' => 'nullable|exists:bantuan_sosials,id',
        ]);

        $validated['created_by_user_id'] = $request->user()->id;
        $validated['is_active'] = true;

        $pengumuman = Pengumuman::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil dipublikasikan.',
            'data' => $pengumuman,
        ], 201);
    }

    private function formatPengumuman($p, $wargaProfile, $user, $index = 0)
    {
        $tglFormat = $p->tanggal_mulai ? Carbon::parse($p->tanggal_mulai)->locale('id')->translatedFormat('d F Y') : '25 Agustus 2026';
        $noUrut = (string)($index + 1);

        $item = [
            'id' => $p->id,
            'judul' => $p->judul,
            'kategori' => $p->kategori ?? 'Umum',
            'tanggal' => $tglFormat,
            'oleh' => $p->oleh ?? 'Pemerintah Desa Doko',
            'isi' => $p->isi,
            'status' => $p->status_label ?? 'Penting',
            'bantuan_sosial_id' => $p->bantuan_sosial_id,
        ];

        $namaPenerima = $wargaProfile ? strtoupper($wargaProfile->nama_lengkap) : ($user ? strtoupper($user->name) : 'BAMBANG UTOMO');
        $nikRaw = $wargaProfile ? $wargaProfile->nik : '3506041505840001';
        $nikMasked = strlen($nikRaw) >= 16 ? '******' . substr($nikRaw, -10) : $nikRaw;
        
        $rt = $wargaProfile && $wargaProfile->rt ? str_pad($wargaProfile->rt->nomor_rt, 2, '0', STR_PAD_LEFT) : '01';
        $rw = $wargaProfile && $wargaProfile->rt && $wargaProfile->rt->rw ? str_pad($wargaProfile->rt->rw->nomor_rw, 2, '0', STR_PAD_LEFT) : '01';
        $alamat = $wargaProfile && $wargaProfile->alamat_ktp ? $wargaProfile->alamat_ktp : "RT {$rt} / RW {$rw}, Dusun Doko Krajan, Desa Doko";

        $tanggalSurat = 'Kab. Kediri, ' . Carbon::parse($p->tanggal_mulai ?? now())->locale('id')->translatedFormat('l, d F Y');
        $hariTanggal = Carbon::parse($p->tanggal_mulai ?? now())->locale('id')->translatedFormat('l, d F Y');
        $nomorSurat = 'UND/' . str_pad($p->id, 2, '0', STR_PAD_LEFT) . '/' . Carbon::parse($p->tanggal_mulai ?? now())->format('m/y') . '/' . (115000 + $p->id);
        $barcode = '3506062008' . str_pad($index + 1, 5, '0', STR_PAD_LEFT);

        // If this announcement is linked to Bantuan Sosial
        if ($p->bantuan_sosial_id && $p->bantuanSosial) {
            $bansos = $p->bantuanSosial;
            $penerima = null;

            if ($wargaProfile) {
                $penerima = BantuanPenerima::where('bantuan_sosial_id', $bansos->id)
                    ->where('warga_profile_id', $wargaProfile->id)
                    ->first();
            }

            if ($penerima && $penerima->qr_bantuan_code) {
                $barcode = $penerima->qr_bantuan_code;
            }

            $jam = $bansos->waktu_mulai ? substr($bansos->waktu_mulai, 0, 5) . ' WIB - Selesai' : '08.30 - s.d - Waktu Setempat';
            $tempat = strtoupper($bansos->lokasi_penyaluran ?? 'KANTOR BALAI DESA DOKO');

            $item['tiket'] = [
                'nomorTiket' => $nomorSurat,
                'nomorAntrean' => $noUrut,
                'sesi' => $jam,
                'lokasi' => $tempat,
                'syarat' => 'Bawa KTP Asli / IKD & Kartu Keluarga (KK)',
                'qrHash' => $barcode,
                'isSuratUndanganResmi' => true,
                'headerTitle' => 'UNDANGAN PENERIMA',
                'headerSub1' => 'BANTUAN PANGAN BERAS PERIODE BULAN JULI',
                'headerSub2' => 'SAMPAI DENGAN SEPTEMBER TAHUN 2026',
                'provinsi' => 'JAWA TIMUR',
                'kabupaten' => 'KAB. KEDIRI',
                'kecamatan' => 'Ngasem',
                'desa' => 'Doko',
                'tanggalSurat' => $tanggalSurat,
                'nomorSurat' => $nomorSurat,
                'perihal' => 'UNDANGAN PENERIMA BANTUAN',
                'namaPenerima' => $namaPenerima,
                'nik' => $nikRaw,
                'nikMasked' => $nikMasked,
                'alamat' => $alamat,
                'hariTanggal' => $hariTanggal,
                'jam' => $jam,
                'tempat' => $tempat,
                'keperluan' => 'Mengambil Bantuan Pangan alokasi bulan Juli - September 2026 sejumlah 30 (tiga puluh) Kg Beras',
                'alokasi' => '30 (tiga puluh) Kg Beras',
                'persyaratan' => [
                    '1. Membawa undangan ini',
                    '2. Jika diambil sendiri: Membawa KTP asli/IKD',
                    '3. Jika diwakilkan dalam 1 KK: membawa KTP asli/IKD orang yang mewakili, asli/fotocopy KTP orang yang diwakili, dan KK',
                    '4. Jika diwakilkan diluar KK: membawa KTP asli/IKD dan KK orang yang mewakili, serta asli/fotocopy KTP orang yang diwakili',
                    '5. Jika pengganti: membawa KTP asli/IKD dan KK',
                    '6. Jika KTP atau KK hilang/rusak agar membawa surat keterangan hilang/rusak dari aparat yang berwenang',
                ],
                'catatanBatas' => 'Harap diambil tepat pada waktunya. Jika setelah 5 (lima) hari tidak diambil tanpa keterangan, akan dilakukan penggantian PBP. Demikian atas kehadirannya disampaikan terima kasih.',
                'barcode' => $barcode,
                'noUrut' => $noUrut,
                'instansi' => 'Pemerintah Desa Doko & Perum BULOG',
                'subInstansi' => 'Perum BULOG & Pemerintah Desa Doko',
                'statusPenyaluran' => 'Siap Diambil',
            ];
        } else {
            // General Community Announcements (e.g. Posyandu, Kerja Bakti, Rekam KTP)
            $isKtp = str_contains(strtolower($p->judul), 'ktp');
            $isPosyandu = str_contains(strtolower($p->judul), 'posyandu');
            $isKerjaBakti = str_contains(strtolower($p->judul), 'kerja bakti');

            if ($isKtp) {
                $jam = '08.30 - 14.00 WIB';
                $tempat = 'RUANG PELAYANAN BALAI DESA DOKO';
                $keperluan = 'Pelayanan Rekam KTP-El Keliling Dispendukcapil di Balai Desa';
                $perihal = 'UNDANGAN PEREKAMAN KTP-EL';
                $persyaratan = [
                    '1. Membawa surat undangan resmi ini',
                    '2. Membawa fotokopi Kartu Keluarga (KK) terbaru',
                    '3. Membawa Akta Kelahiran asli atau fotokopi legalisir',
                    '4. Berpakaian rapi dan berkerah (bukan kaos oblong) untuk sesi perekaman biometrik',
                    '5. Bagi penyandang disabilitas / lansia dapat didampingi oleh pihak keluarga',
                ];
                $catatan = 'Pelayanan rekam KTP-El keliling ini diselenggarakan tanpa dipungut biaya (GRATIS). Harap hadir tepat waktu sesuai jadwal.';
                $subInstansi = 'Dispendukcapil Kab. Kediri & Sekretariat Desa Doko';
            } elseif ($isPosyandu) {
                $jam = '08.00 - 11.30 WIB';
                $tempat = 'BALAI RT 01 / POSYANDU CEMPAKA DUSUN KRAJAN';
                $keperluan = 'Layanan Posyandu Balita, Penimbangan, Imunisasi & Pemeriksaan Kesehatan Lansia Gratis';
                $perihal = 'UNDANGAN LAYANAN POSYANDU';
                $persyaratan = [
                    '1. Membawa surat undangan resmi ini',
                    '2. Membawa buku KIA / KMS balita dan catatan kesehatan lansia',
                    '3. Membawa fotokopi KK atau KTP orang tua / lansia',
                    '4. Hadir sesuai pembagian jam sesi demi menghindari antrean menumpuk',
                ];
                $catatan = 'Pelayanan imunisasi, penimbangan balita, dan cek kesehatan lansia gratis demi mewujudkan keluarga sehat dan aktif.';
                $subInstansi = 'Puskesmas Ngasem & Tim Penggerak PKK Desa Doko';
            } elseif ($isKerjaBakti) {
                $jam = '06.30 WIB - Selesai';
                $tempat = 'BALAI RW 01 & SALURAN AIR UTAMA DUSUN KRAJAN';
                $keperluan = 'Kerja Bakti Lingkungan, Pembersihan Selokan & Antisipasi Genangan Air Musim Hujan';
                $perihal = 'UNDANGAN GOTONG ROYONG WARGA';
                $persyaratan = [
                    '1. Membawa surat undangan resmi ini',
                    '2. Membawa peralatan kebersihan pribadi (cangkul / sapu / karung / sekop)',
                    '3. Mengenakan pakaian kerja bakti dan alas kaki tertutup yang aman',
                    '4. Berkumpul tepat waktu di titik kumpul Balai RW 01',
                ];
                $catatan = 'Partisipasi dan kerja sama seluruh warga RT 01 dan RT 02 sangat diharapkan demi kenyamanan lingkungan kita bersama.';
                $subInstansi = 'Pengurus RW 01 & Pemerintah Desa Doko';
            } else {
                $jam = '08.30 WIB - Selesai';
                $tempat = 'PENDOPO BALAI DESA DOKO';
                $keperluan = $p->judul;
                $perihal = 'UNDANGAN KEGIATAN DESA';
                $persyaratan = [
                    '1. Membawa surat undangan resmi ini',
                    '2. Membawa KTP asli / identitas warga yang sah',
                    '3. Menjaga ketertiban dan hadir tepat waktu sesuai jadwal',
                ];
                $catatan = 'Atas kehadiran dan kerja sama Bapak/Ibu/Saudara sekalian, kami sampaikan terima kasih.';
                $subInstansi = $p->oleh ?? 'Pemerintah Desa Doko';
            }

            $item['tiket'] = [
                'nomorTiket' => $nomorSurat,
                'nomorAntrean' => $noUrut,
                'sesi' => $jam,
                'lokasi' => $tempat,
                'syarat' => $persyaratan[1] ?? 'Bawa KTP Asli / Identitas',
                'qrHash' => $barcode,
                'isSuratUndanganResmi' => true,
                'headerTitle' => 'SURAT UNDANGAN RESMI',
                'headerSub1' => strtoupper($p->judul),
                'headerSub2' => 'PEMERINTAH DESA DOKO • KECAMATAN NGASEM',
                'provinsi' => 'JAWA TIMUR',
                'kabupaten' => 'KAB. KEDIRI',
                'kecamatan' => 'Ngasem',
                'desa' => 'Doko',
                'tanggalSurat' => $tanggalSurat,
                'nomorSurat' => $nomorSurat,
                'perihal' => $perihal,
                'namaPenerima' => $namaPenerima,
                'nik' => $nikRaw,
                'nikMasked' => $nikMasked,
                'alamat' => $alamat,
                'hariTanggal' => $hariTanggal,
                'jam' => $jam,
                'tempat' => $tempat,
                'keperluan' => $keperluan,
                'persyaratan' => $persyaratan,
                'catatanBatas' => $catatan,
                'barcode' => $barcode,
                'noUrut' => $noUrut,
                'instansi' => $p->oleh ?? 'Pemerintah Desa Doko',
                'subInstansi' => $subInstansi,
                'statusPenyaluran' => 'Jadwal Aktif',
            ];
        }

        return $item;
    }
}
