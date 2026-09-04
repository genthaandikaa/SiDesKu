<?php

namespace App\Http\Controllers\Api\Sekdes;

use App\Http\Controllers\Controller;
use App\Models\DesaSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DesaSettingController extends Controller
{
    public function getSettings(): JsonResponse
    {
        $setting = DesaSetting::first() ?? DesaSetting::create([
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
        ]);

        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $setting = DesaSetting::first();

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
        ]);

        $setting->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan identitas desa dan kop surat berhasil diperbarui.',
            'data' => $setting,
        ]);
    }
}
