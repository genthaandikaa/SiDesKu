<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\WargaProfile;
use App\Services\FileUploadSecurityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login = trim($request->input('login'));
        
        $aliases = [
            'warga1' => 'warga01',
            'warga' => 'warga01',
            'rt1' => 'rt01',
            'rt' => 'rt01',
            'rw1' => 'rw01',
            'rw' => 'rw01',
            'bendahara' => 'bendahara_desa',
            'sekertaris' => 'sekdes',
            'sekretaris' => 'sekdes',
            'sekretaris_desa' => 'sekdes',
            'kepala_desa' => 'kades',
            'lurah' => 'kades',
        ];

        $searchTerms = array_unique(array_filter([$login, $aliases[strtolower($login)] ?? null]));
        
        $user = User::with(['role', 'desa', 'wargaProfile.rt.rw.dusun', 'wargaProfile.kartuKeluarga'])
            ->where(function ($q) use ($searchTerms) {
                $q->whereIn('email', $searchTerms)
                  ->orWhereIn('username', $searchTerms)
                  ->orWhereHas('wargaProfile', function ($wp) use ($searchTerms) {
                      $wp->whereIn('nik', $searchTerms);
                  });
            })
            ->first();

        $isValid = false;

        // 1. Cek kecocokan password standar (Hash::check)
        if ($user && Hash::check($request->password, $user->password)) {
            $isValid = true;
        }

        // 2. Cek kecocokan password Tanggal Lahir (untuk Warga yang login via NIK / data warga)
        $wargaProfile = $user ? $user->wargaProfile : null;
        if (!$wargaProfile) {
            $wargaProfile = WargaProfile::where('nik', $login)->first();
        }

        if ($wargaProfile && $wargaProfile->tanggal_lahir) {
            $dob = \Carbon\Carbon::parse($wargaProfile->tanggal_lahir);
            $cleanInput = trim(str_replace([' ', '/', '-', '.'], '', $request->password));

            $allowedFormats = [
                $dob->format('Y-m-d'),    // 1984-05-15
                $dob->format('dmY'),      // 15051984
                $dob->format('d-m-Y'),    // 15-05-1984
                $dob->format('d/m/Y'),    // 15/05/1984
                $dob->format('d.m.Y'),    // 15.05.1984
                $dob->format('Ymd'),      // 19840515
                $dob->format('j-n-Y'),    // 15-5-1984
            ];

            if (in_array(trim($request->password), $allowedFormats) ||
                $cleanInput === $dob->format('dmY') ||
                $cleanInput === $dob->format('Ymd')) {
                $isValid = true;

                // Jika user belum ada untuk profil warga ini, buatkan otomatis
                if (!$user) {
                    $wargaRole = Role::where('slug', 'warga')->first();
                    $user = User::create([
                        'role_id' => $wargaRole ? $wargaRole->id : 9,
                        'desa_id' => $wargaProfile->desa_id ?? 1,
                        'name' => $wargaProfile->nama_lengkap,
                        'username' => $wargaProfile->nik,
                        'email' => "{$wargaProfile->nik}@warga.desa.id",
                        'password' => Hash::make($request->password),
                        'is_active' => true,
                    ]);
                    $wargaProfile->update(['user_id' => $user->id]);
                    $user->load(['role', 'desa', 'wargaProfile.rt.rw.dusun', 'wargaProfile.kartuKeluarga']);
                }
            }
        }

        if (!$user || !$isValid) {
            throw ValidationException::withMessages([
                'login' => ['NIK/Username atau password salah. Untuk warga desa, gunakan NIK dan password Tanggal Lahir (contoh: 15051984 atau 1984-05-15).'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan oleh Administrator.',
            ], 403);
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => $user->loadMissing('desa'),
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Pendaftaran warga mandiri tidak dibuka. Akun warga didaftarkan langsung oleh Petugas Kantor Desa. Silakan login langsung menggunakan NIK dan password tanggal lahir Anda.',
        ], 403);
    }

    public function me(Request $request): JsonResponse
    {
        $user = User::with(['role', 'desa', 'wargaProfile.rt.rw.dusun', 'wargaProfile.kartuKeluarga'])
            ->find($request->user()->id);

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return $this->me($request);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi login tidak valid. Silakan login kembali.',
            ], 401);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone_number' => 'nullable|string|max:20',
            'alamat_ktp' => 'nullable|string',
            'pekerjaan' => 'nullable|string|max:100',
            'foto_ktp' => 'nullable|string',
        ]);

        try {
            $userData = [
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
            ];

            if ($request->has('avatar')) {
                $avatarInput = $request->avatar;
                if ($avatarInput && (str_starts_with($avatarInput, 'data:') || !filter_var($avatarInput, FILTER_VALIDATE_URL))) {
                    $result = FileUploadSecurityService::processBase64Upload(
                        $avatarInput,
                        ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                        FileUploadSecurityService::MAX_AVATAR_SIZE,
                        'avatars',
                        'avatar_' . $user->id
                    );
                    if (!$result['success'] && !str_starts_with($avatarInput, 'http')) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Upload avatar gagal: ' . $result['message'],
                        ], 422);
                    }
                    if ($result['success']) {
                        $userData['avatar'] = $result['url'];
                    }
                } elseif (empty($avatarInput)) {
                    $userData['avatar'] = null;
                } else {
                    $userData['avatar'] = $avatarInput;
                }
            }

            $user->update($userData);

            if ($user->wargaProfile) {
                $profileData = [
                    'nama_lengkap' => $request->name,
                    'no_hp_wa' => $request->phone_number,
                ];
                if ($request->filled('alamat_ktp')) {
                    $profileData['alamat_ktp'] = $request->alamat_ktp;
                }
                if ($request->filled('pekerjaan')) {
                    $profileData['pekerjaan'] = $request->pekerjaan;
                }
                if ($request->has('foto_ktp')) {
                    $ktpInput = $request->foto_ktp;
                    if ($ktpInput && (str_starts_with($ktpInput, 'data:') || !filter_var($ktpInput, FILTER_VALIDATE_URL))) {
                        $result = FileUploadSecurityService::processBase64Upload(
                            $ktpInput,
                            ['image/jpeg', 'image/png', 'image/webp'],
                            FileUploadSecurityService::MAX_DOCUMENT_SIZE,
                            'ktp',
                            'ktp_' . $user->id
                        );
                        if (!$result['success'] && !str_starts_with($ktpInput, 'http')) {
                            return response()->json([
                                'success' => false,
                                'message' => 'Upload foto KTP gagal: ' . $result['message'],
                            ], 422);
                        }
                        if ($result['success']) {
                            $profileData['foto_ktp'] = $result['url'];
                        }
                    } elseif (empty($ktpInput)) {
                        $profileData['foto_ktp'] = null;
                    } else {
                        $profileData['foto_ktp'] = $ktpInput;
                    }
                }
                $user->wargaProfile->update($profileData);
            }

            $updatedUser = User::with(['role', 'wargaProfile.rt.rw.dusun', 'wargaProfile.kartuKeluarga'])
                ->find($user->id);

            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diperbarui',
                'user' => $updatedUser,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan profil: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Kata sandi saat ini tidak sesuai.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }
}
