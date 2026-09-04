<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesaSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DesaSettingController extends Controller
{
    public function getSettings(): JsonResponse
    {
        $setting = DesaSetting::first();
        return response()->json(['success' => true, 'data' => $setting]);
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
            'message' => 'Pengaturan desa dan kop surat berhasil diperbarui.',
            'data' => $setting,
        ]);
    }
}
