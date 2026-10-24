<?php

namespace App\Http\Controllers\Api\Sekdes;

use App\Http\Controllers\Controller;
use App\Models\KartuKeluarga;
use App\Models\Role;
use App\Models\User;
use App\Models\WargaProfile;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class WargaManagementController extends Controller
{
    /**
     * Get registered warga list with pagination, search, and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = WargaProfile::with(['user', 'rt.rw.dusun', 'kartuKeluarga.anggotaKeluarga']);

        if ($request->filled('search')) {
            $s = trim($request->query('search'));
            $query->where(function ($q) use ($s) {
                $q->where('nama_lengkap', 'like', "%{$s}%")
                  ->orWhere('nik', 'like', "%{$s}%")
                  ->orWhereHas('kartuKeluarga', function ($k) use ($s) {
                      $k->where('no_kk', 'like', "%{$s}%")
                        ->orWhere('nama_kepala_keluarga', 'like', "%{$s}%");
                  });
            });
        }

        if ($request->filled('rt_id')) {
            $query->where('rt_id', $request->query('rt_id'));
        }

        if ($request->filled('rw_id')) {
            $rwId = $request->query('rw_id');
            $query->whereHas('rt', function ($q) use ($rwId) {
                $q->where('rw_id', $rwId);
            });
        }

        if ($request->filled('kk_id')) {
            $query->where('kk_id', $request->query('kk_id'));
        }

        if ($request->filled('status_keluarga')) {
            $query->where('status_keluarga', $request->query('status_keluarga'));
        }

        $wargas = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $wargas,
        ]);
    }

    /**
     * Get detailed data of a single registered citizen.
     */
    public function show($id): JsonResponse
    {
        $warga = WargaProfile::with(['user', 'rt.rw.dusun', 'kartuKeluarga.anggotaKeluarga'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $warga,
        ]);
    }

    /**
     * Register a new citizen (Warga) directly by the Village Administration (Desa).
     * Automatically creates user credentials so the citizen can login immediately
     * using their NIK and Tanggal Lahir as password.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nik' => 'required|string|size:16|unique:warga_profiles,nik',
            'nama_lengkap' => 'required|string|max:255',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P',
            'agama' => 'nullable|string|max:50',
            'status_perkawinan' => 'nullable|string|max:50',
            'pekerjaan' => 'nullable|string|max:100',
            'pendidikan_terakhir' => 'nullable|string|max:50',
            'golongan_darah' => 'nullable|string|max:5',
            'no_hp_wa' => 'nullable|string|max:20',
            'alamat_ktp' => 'required|string|max:500',
            'rt_id' => 'required|integer|exists:rts,id',
            'no_kk' => 'nullable|string|max:20',
            'nama_kepala_keluarga' => 'nullable|string|max:255',
            'status_keluarga' => 'nullable|string|max:50',
            'status_ekonomi' => 'nullable|string|max:100',
            'status_kependudukan' => 'nullable|string|max:50',
        ], [
            'nik.required' => 'NIK wajib diisi 16 digit.',
            'nik.size' => 'NIK harus tepat 16 digit angka.',
            'nik.unique' => 'NIK ini sudah terdaftar di database kependudukan desa.',
            'nama_lengkap.required' => 'Nama lengkap warga wajib diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi (digunakan untuk password login warga).',
            'alamat_ktp.required' => 'Alamat KTP wajib diisi.',
            'rt_id.required' => 'RT domisili wajib dipilih.',
        ]);

        $currentUser = $request->user();
        \App\Services\TenantSecurityService::validateRt($currentUser, (int) $request->input('rt_id'));

        return DB::transaction(function () use ($request, $currentUser) {
            $nik = trim($request->input('nik'));
            $namaLengkap = trim($request->input('nama_lengkap'));
            $tanggalLahirRaw = $request->input('tanggal_lahir');
            $dob = Carbon::parse($tanggalLahirRaw);

            // Cari atau buat Kartu Keluarga jika nomor KK diisi
            $kkId = null;
            if ($request->filled('no_kk')) {
                $noKk = trim($request->input('no_kk'));
                $namaKepala = trim($request->input('nama_kepala_keluarga') ?? '');
                if (empty($namaKepala)) {
                    $namaKepala = $namaLengkap;
                }

                $kk = KartuKeluarga::firstOrCreate(
                    [
                        'desa_id' => $currentUser->desa_id,
                        'no_kk' => $noKk,
                    ],
                    [
                        'nama_kepala_keluarga' => $namaKepala,
                        'rt_id' => $request->input('rt_id'),
                        'alamat_lengkap' => $request->input('alamat_ktp') ?: 'Desa ' . ($currentUser->desa->nama_desa ?? ''),
                        'no_telp_rumah' => $request->input('no_hp_wa'),
                    ]
                );
                $kkId = $kk->id;
            }

            // Dapatkan role warga
            $wargaRole = Role::where('slug', 'warga')->first();
            $roleId = $wargaRole ? $wargaRole->id : 9;

            // Password default warga adalah format tanggal lahirnya
            // (Disimpan hash, dan saat login AuthController juga memeriksa kecocokan tanggal lahir secara langsung)
            $passwordBirthDate = $dob->format('dmY'); // e.g. 15051984

            // Buat User Akun Sistem
            $user = User::create([
                'desa_id' => $currentUser->desa_id,
                'role_id' => $roleId,
                'name' => $namaLengkap,
                'username' => $nik,
                'email' => "{$nik}@warga.desa.id",
                'phone_number' => $request->input('no_hp_wa'),
                'password' => Hash::make($passwordBirthDate),
                'is_active' => true,
            ]);

            // Buat WargaProfile
            $wargaProfile = WargaProfile::create([
                'desa_id' => $currentUser->desa_id,
                'user_id' => $user->id,
                'kk_id' => $kkId,
                'rt_id' => $request->input('rt_id'),
                'nik' => $nik,
                'nama_lengkap' => $namaLengkap,
                'tempat_lahir' => $request->input('tempat_lahir'),
                'tanggal_lahir' => $dob->format('Y-m-d'),
                'jenis_kelamin' => $request->input('jenis_kelamin'),
                'agama' => $request->input('agama') ?: 'Islam',
                'status_perkawinan' => $request->input('status_perkawinan') ?: 'Kawin',
                'pekerjaan' => $request->input('pekerjaan') ?: 'Buruh / Petani / Wiraswasta',
                'pendidikan_terakhir' => $request->input('pendidikan_terakhir') ?: 'SMA/Sederajat',
                'golongan_darah' => $request->input('golongan_darah') ?: '-',
                'no_hp_wa' => $request->input('no_hp_wa'),
                'alamat_ktp' => $request->input('alamat_ktp'),
                'status_keluarga' => $request->input('status_keluarga') ?: 'Kepala Keluarga',
                'status_ekonomi' => $request->input('status_ekonomi') ?: 'Menengah',
                'status_kependudukan' => $request->input('status_kependudukan') ?: 'Tetap',
            ]);

            return response()->json([
                'success' => true,
                'message' => "Warga {$namaLengkap} (NIK: {$nik}) berhasil didaftarkan ke Database Desa. Warga dapat langsung login menggunakan NIK dan password Tanggal Lahir ({$dob->format('d-m-Y')}).",
                'data' => $wargaProfile->load(['user', 'rt.rw.dusun', 'kartuKeluarga']),
                'login_info' => [
                    'nik' => $nik,
                    'password_hint' => "Tanggal Lahir (contoh: {$dob->format('dmY')} atau {$dob->format('Y-m-d')})",
                ],
            ], 201);
        });
    }
}
