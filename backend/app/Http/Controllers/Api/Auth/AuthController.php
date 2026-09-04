<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\WargaProfile;
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
        
        $user = User::with(['role', 'wargaProfile.rt.rw.dusun', 'wargaProfile.kartuKeluarga'])
            ->where(function ($q) use ($searchTerms) {
                $q->whereIn('email', $searchTerms)
                  ->orWhereIn('username', $searchTerms)
                  ->orWhereHas('wargaProfile', function ($wp) use ($searchTerms) {
                      $wp->whereIn('nik', $searchTerms);
                  });
            })
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Username/Email atau password salah.'],
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
            'user' => $user,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'nik' => 'required|string|size:16|unique:warga_profiles,nik',
            'nama_lengkap' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'no_hp_wa' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'rt_id' => 'nullable|integer',
            'alamat' => 'nullable|string',
        ]);

        $wargaRole = Role::where('slug', 'warga')->first();
        $roleId = $wargaRole ? $wargaRole->id : 9;

        $user = User::create([
            'role_id' => $roleId,
            'name' => $request->nama_lengkap,
            'username' => $request->username,
            'email' => $request->email,
            'phone_number' => $request->no_hp_wa,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        $profile = WargaProfile::create([
            'user_id' => $user->id,
            'nik' => $request->nik,
            'nama_lengkap' => $request->nama_lengkap,
            'no_hp_wa' => $request->no_hp_wa,
            'rt_id' => $request->rt_id ?: 1,
            'alamat_ktp' => $request->alamat ?: 'Desa Doko, Kec. Ngasem, Kab. Kediri',
            'tempat_lahir' => 'Kediri',
            'tanggal_lahir' => '1995-01-01',
            'jenis_kelamin' => 'L',
            'agama' => 'Islam',
            'status_perkawinan' => 'Belum Menikah',
            'status_keluarga' => 'Kepala Keluarga',
            'status_ekonomi' => 'Mampu',
            'status_kependudukan' => 'Tetap',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;
        $userWithRelations = User::with(['role', 'wargaProfile.rt.rw.dusun'])->find($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran akun warga berhasil',
            'token' => $token,
            'user' => $userWithRelations,
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        $user = User::with(['role', 'wargaProfile.rt.rw.dusun', 'wargaProfile.kartuKeluarga'])
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
                if ($avatarInput && str_starts_with($avatarInput, 'data:image')) {
                    try {
                        if (preg_match('/^data:image\/(\w+);base64,/', $avatarInput, $type)) {
                            $imageData = substr($avatarInput, strpos($avatarInput, ',') + 1);
                            $extension = strtolower($type[1]);
                            if (!in_array($extension, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                                $extension = 'png';
                            }
                            $decoded = base64_decode($imageData);
                            if ($decoded !== false) {
                                $avatarDir = public_path('uploads/avatars');
                                if (!file_exists($avatarDir)) {
                                    mkdir($avatarDir, 0755, true);
                                }
                                $fileName = 'avatar_' . $user->id . '_' . time() . '.' . $extension;
                                file_put_contents($avatarDir . DIRECTORY_SEPARATOR . $fileName, $decoded);
                                $userData['avatar'] = url('uploads/avatars/' . $fileName);
                            }
                        }
                    } catch (\Exception $e) {
                        $userData['avatar'] = null;
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
