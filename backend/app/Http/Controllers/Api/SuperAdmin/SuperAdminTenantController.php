<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Desa;
use App\Models\DesaSetting;
use App\Models\Role;
use App\Models\SuratType;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SuperAdminTenantController extends Controller
{
    /**
     * Tampilkan seluruh tenant desa yang terdaftar beserta ringkasan operasional.
     */
    public function index(Request $request): JsonResponse
    {
        $desas = Desa::with(['setting'])
            ->withCount(['users', 'wargaProfiles', 'suratRequests', 'dusuns'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar seluruh tenant desa berhasil dimuat.',
            'data' => $desas,
        ]);
    }

    /**
     * Daftarkan tenant desa baru dan inisialisasi akun admin desa serta konfigurasinya.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_desa' => 'required|string|max:100',
            'kode_desa' => 'required|string|max:30|unique:desas,kode_desa',
            'kecamatan' => 'required|string|max:100',
            'kabupaten' => 'required|string|max:100',
            'provinsi' => 'nullable|string|max:100',
            'kode_pos' => 'nullable|string|max:10',
            'alamat_kantor' => 'nullable|string|max:255',
            'telepon' => 'nullable|string|max:25',
            'email' => 'nullable|email|max:100',
            'website' => 'nullable|string|max:150',
            'admin_name' => 'required|string|max:100',
            'admin_username' => 'required|string|max:50|unique:users,username',
            'admin_email' => 'required|email|max:100|unique:users,email',
            'admin_password' => 'nullable|string|min:6',
        ], [
            'kode_desa.unique' => 'Kode desa sudah terdaftar pada tenant lain.',
            'admin_username.unique' => 'Username admin sudah digunakan.',
            'admin_email.unique' => 'Email admin sudah digunakan.',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Buat Tenant Desa
            $desa = Desa::create([
                'nama_desa' => $validated['nama_desa'],
                'kode_desa' => $validated['kode_desa'],
                'kecamatan' => $validated['kecamatan'],
                'kabupaten' => $validated['kabupaten'],
                'provinsi' => $validated['provinsi'] ?? 'Jawa Timur',
                'kode_pos' => $validated['kode_pos'] ?? '64182',
                'alamat_kantor' => $validated['alamat_kantor'] ?? ('Kantor Desa ' . $validated['nama_desa']),
                'telepon' => $validated['telepon'] ?? null,
                'email' => $validated['email'] ?? null,
                'website' => $validated['website'] ?? null,
                'is_active' => true,
            ]);

            // 2. Buat Pengaturan Desa Awal (Kop Surat & Identitas)
            $desaSetting = DesaSetting::create([
                'desa_id' => $desa->id,
                'nama_desa' => $desa->nama_desa,
                'kode_desa' => $desa->kode_desa,
                'kecamatan' => $desa->kecamatan,
                'kabupaten' => $desa->kabupaten,
                'provinsi' => $desa->provinsi,
                'kode_pos' => $desa->kode_pos,
                'alamat_kantor' => $desa->alamat_kantor,
                'telepon' => $desa->telepon,
                'email' => $desa->email,
                'website' => $desa->website,
                'kop_atas' => strtoupper('PEMERINTAH KABUPATEN ' . str_replace('Kabupaten ', '', $desa->kabupaten)),
                'kop_tengah' => strtoupper($desa->kecamatan),
                'kop_bawah' => strtoupper('KANTOR KEPALA ' . $desa->nama_desa),
                'kop_footer' => $desa->alamat_kantor . ', Telp. ' . ($desa->telepon ?? '-') . ', Email: ' . ($desa->email ?? '-'),
                'nama_kades' => 'Kepala ' . $desa->nama_desa,
                'nama_sekdes' => 'Sekretaris ' . $desa->nama_desa,
            ]);

            // 3. Inisialisasi Tipe Surat Baku Khusus untuk Tenant Desa Baru
            $baseSuratTypes = [
                ['kode_surat' => 'SKTP', 'nama_surat' => 'Surat Pengantar KTP-el', 'kode_klasifikasi' => '471', 'format_nomor' => '471/{NO}/' . $desa->kode_desa . '/{BULAN_ROMAWI}/{TAHUN}'],
                ['kode_surat' => 'SKKK', 'nama_surat' => 'Surat Pengantar Kartu Keluarga', 'kode_klasifikasi' => '472', 'format_nomor' => '472/{NO}/' . $desa->kode_desa . '/{BULAN_ROMAWI}/{TAHUN}'],
                ['kode_surat' => 'SKTM', 'nama_surat' => 'Surat Keterangan Tidak Mampu', 'kode_klasifikasi' => '401', 'format_nomor' => '401/{NO}/' . $desa->kode_desa . '/{BULAN_ROMAWI}/{TAHUN}'],
                ['kode_surat' => 'SKD', 'nama_surat' => 'Surat Keterangan Domisili', 'kode_klasifikasi' => '470', 'format_nomor' => '470/{NO}/' . $desa->kode_desa . '/{BULAN_ROMAWI}/{TAHUN}'],
                ['kode_surat' => 'SKU', 'nama_surat' => 'Surat Keterangan Usaha', 'kode_klasifikasi' => '503', 'format_nomor' => '503/{NO}/' . $desa->kode_desa . '/{BULAN_ROMAWI}/{TAHUN}'],
                ['kode_surat' => 'SKCK', 'nama_surat' => 'Surat Pengantar SKCK', 'kode_klasifikasi' => '300', 'format_nomor' => '300/{NO}/' . $desa->kode_desa . '/{BULAN_ROMAWI}/{TAHUN}'],
                ['kode_surat' => 'SKL', 'nama_surat' => 'Surat Keterangan Kelahiran', 'kode_klasifikasi' => '474.1', 'format_nomor' => '474.1/{NO}/' . $desa->kode_desa . '/{BULAN_ROMAWI}/{TAHUN}'],
                ['kode_surat' => 'SKM', 'nama_surat' => 'Surat Keterangan Kematian', 'kode_klasifikasi' => '474.3', 'format_nomor' => '474.3/{NO}/' . $desa->kode_desa . '/{BULAN_ROMAWI}/{TAHUN}'],
            ];

            foreach ($baseSuratTypes as $st) {
                SuratType::create([
                    'desa_id' => $desa->id,
                    'kode_surat' => $st['kode_surat'],
                    'nama_surat' => $st['nama_surat'],
                    'format_nomor' => $st['format_nomor'],
                    'kode_klasifikasi' => $st['kode_klasifikasi'],
                    'nomor_terakhir' => 0,
                    'template_body' => 'Menerangkan bahwa pemohon adalah benar warga penduduk ' . $desa->nama_desa . ' dan surat ini diterbitkan secara sah.',
                    'persyaratan_json' => ['Foto KTP Pemohon', 'Foto Kartu Keluarga'],
                    'masa_berlaku_hari' => 30,
                    'is_active' => true,
                ]);
            }

            // 4. Buat Akun Admin Desa yang terikat khusus ke tenant ini
            $adminRole = Role::whereIn('slug', ['admin_desa', 'admin'])->first();
            $adminUser = User::create([
                'desa_id' => $desa->id,
                'role_id' => $adminRole->id,
                'name' => $validated['admin_name'],
                'username' => $validated['admin_username'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['admin_password'] ?? 'password123'),
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tenant ' . $desa->nama_desa . ' berhasil didaftarkan secara terisolasi.',
                'data' => [
                    'desa' => $desa,
                    'setting' => $desaSetting,
                    'admin_user' => [
                        'id' => $adminUser->id,
                        'name' => $adminUser->name,
                        'username' => $adminUser->username,
                        'email' => $adminUser->email,
                        'desa_id' => $adminUser->desa_id,
                    ],
                ],
            ], 201);
        });
    }

    /**
     * Tampilkan detail tenant desa tertentu.
     */
    public function show(int $id): JsonResponse
    {
        $desa = Desa::with(['setting'])
            ->withCount(['users', 'wargaProfiles', 'suratRequests', 'dusuns'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail tenant desa berhasil dimuat.',
            'data' => $desa,
        ]);
    }

    /**
     * Perbarui data atau status aktif tenant desa.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $desa = Desa::findOrFail($id);

        $validated = $request->validate([
            'nama_desa' => 'sometimes|string|max:100',
            'telepon' => 'nullable|string|max:25',
            'email' => 'nullable|email|max:100',
            'website' => 'nullable|string|max:150',
            'alamat_kantor' => 'sometimes|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $desa->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Informasi tenant desa berhasil diperbarui.',
            'data' => $desa,
        ]);
    }
}
