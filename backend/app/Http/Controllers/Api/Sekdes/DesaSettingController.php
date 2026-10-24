<?php

namespace App\Http\Controllers\Api\Sekdes;

use App\Http\Controllers\Controller;
use App\Models\DesaSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DesaSettingController extends Controller
{
    public function getSettings(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && $user->desa_id) {
            $setting = DesaSetting::where('desa_id', $user->desa_id)->first();
        } else {
            $desaId = $request->query('desa_id') ?? 1;
            $setting = DesaSetting::withoutGlobalScope('tenant')->where('desa_id', $desaId)->first()
                ?? DesaSetting::withoutGlobalScope('tenant')->first();
        }

        if (!$setting) {
            $setting = DesaSetting::create([
                'desa_id' => $user?->desa_id ?? 1,
                'nama_desa' => 'Desa Doko',
                'kode_desa' => '35.06.04.2001',
                'kecamatan' => 'Kecamatan Ngasem',
                'kabupaten' => 'Kabupaten Kediri',
                'provinsi' => 'Jawa Timur',
                'kode_pos' => '64182',
                'alamat_kantor' => 'Jl. Raya Doko No. 12, Kec. Ngasem, Kab. Kediri',
                'kop_atas' => 'PEMERINTAH KABUPATEN KEDIRI',
                'kop_tengah' => 'KECAMATAN NGASEM',
                'kop_bawah' => 'KANTOR KEPALA DESA DOKO',
                'kop_footer' => 'Jl. Raya Doko No. 12 Kec. Ngasem Kab. Kediri 64182, Telp. (0354) 681234, Email: pemdes.doko@kedirikab.go.id',
                'nama_kades' => 'Drs. H. Bambang Prasetyo, M.Si',
                'nip_kades' => '19680514 199403 1 004',
                'nama_sekdes' => 'Ahmad Fauzi, S.Kom',
                'nip_sekdes' => '19850412 201101 1 003',
                'visi' => 'Terwujudnya Masyarakat Desa Doko yang Maju, Sejahtera, Mandiri, Agamis, dan Terdepan dalam Tata Kelola Pelayanan Berbasis Teknologi Informasi.',
                'misi' => "1. Meningkatkan profesionalisme aparatur pemerintah desa dengan digitalisasi tata kelola administrasi dan persuratan realtime.\n2. Membangun sarana dan prasarana infrastruktur jalan, irigasi pertanian tersier, serta drainase lingkungan yang merata.\n3. Mengembangkan perekonomian kerakyatan berbasis potensi pertanian organik, UMKM kerajinan, dan pemberdayaan BUMDes.\n4. Mewujudkan transparansi pengelolaan keuangan APBDes secara terbuka dan akuntabel kepada seluruh warga.",
            ]);
        } else {
            $dirty = false;
            if (empty($setting->visi)) {
                $setting->visi = 'Terwujudnya Masyarakat Desa Doko yang Maju, Sejahtera, Mandiri, Agamis, dan Terdepan dalam Tata Kelola Pelayanan Berbasis Teknologi Informasi.';
                $dirty = true;
            }
            if (empty($setting->misi)) {
                $setting->misi = "1. Meningkatkan profesionalisme aparatur pemerintah desa dengan digitalisasi tata kelola administrasi dan persuratan realtime.\n2. Membangun sarana dan prasarana infrastruktur jalan, irigasi pertanian tersier, serta drainase lingkungan yang merata.\n3. Mengembangkan perekonomian kerakyatan berbasis potensi pertanian organik, UMKM kerajinan, dan pemberdayaan BUMDes.\n4. Mewujudkan transparansi pengelolaan keuangan APBDes secara terbuka dan akuntabel kepada seluruh warga.";
                $dirty = true;
            }
            if ($dirty) {
                $setting->save();
            }
        }

        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $user = $request->user();
        $desaId = $user?->desa_id ?? 1;
        $setting = DesaSetting::where('desa_id', $desaId)->first();

        if (!$setting) {
            $setting = DesaSetting::create([
                'desa_id' => $desaId,
                'nama_desa' => 'Desa Baru',
                'kode_desa' => '00.00.00.0000',
            ]);
        }

        $validated = $request->validate([
            'nama_desa' => 'sometimes|required|string|max:100',
            'kecamatan' => 'sometimes|required|string|max:100',
            'kabupaten' => 'sometimes|required|string|max:100',
            'kop_atas' => 'nullable|string|max:255',
            'kop_tengah' => 'nullable|string|max:255',
            'kop_bawah' => 'nullable|string|max:255',
            'kop_footer' => 'nullable|string',
            'nama_kades' => 'nullable|string|max:150',
            'nip_kades' => 'nullable|string|max:50',
            'nama_sekdes' => 'nullable|string|max:150',
            'nip_sekdes' => 'nullable|string|max:50',
            'telepon' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:100',
            'alamat_kantor' => 'nullable|string',
            'nama_bendahara' => 'nullable|string|max:150',
            'nip_bendahara' => 'nullable|string|max:50',
            'ttd_kades_url' => 'nullable|string',
            'ttd_sekdes_url' => 'nullable|string',
            'ttd_bendahara_url' => 'nullable|string',
            'visi' => 'nullable|string',
            'misi' => 'nullable|string',
            'struktur_organisasi_json' => 'nullable',
            'territory_geojson' => 'nullable|string',
        ]);

        $setting->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan identitas desa & kop surat berhasil disimpan.',
            'data' => $setting,
        ]);
    }
}
