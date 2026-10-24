<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
    /**
     * List all users with filtering, sorting, and roles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with([
            'role',
            'wargaProfile.rt.rw',
            'wargaProfile.kartuKeluarga',
        ]);

        if ($request->has('role_id') && $request->role_id !== 'all' && !empty($request->role_id)) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->has('role_slug') && $request->role_slug !== 'all' && !empty($request->role_slug)) {
            $slug = $request->role_slug;
            $query->whereHas('role', function ($q) use ($slug) {
                $q->where('slug', $slug);
            });
        }

        if ($request->has('is_active') && $request->is_active !== 'all' && $request->is_active !== '') {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $s = trim($request->query('search'));
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('username', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('phone_number', 'like', "%{$s}%")
                    ->orWhereHas('wargaProfile', function ($wq) use ($s) {
                        $wq->where('nama_lengkap', 'like', "%{$s}%")
                            ->orWhere('nik', 'like', "%{$s}%");
                    });
            });
        }

        $users = $query->orderByDesc('id')->get();

        $roles = Role::orderBy('id')->get();

        $stats = [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
            'by_role' => Role::where('slug', '!=', 'super_admin')->withCount('users')->get()->mapWithKeys(function ($r) {
                return [$r->slug => $r->users_count];
            }),
        ];

        return response()->json([
            'success' => true,
            'data' => $users,
            'roles' => $roles,
            'stats' => $stats,
        ]);
    }

    /**
     * Get all available system roles.
     */
    public function roles(): JsonResponse
    {
        $roles = Role::orderBy('id')->get();
        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * Create a new user account by Admin.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'nullable|email|max:255|unique:users,email',
            'phone_number' => 'nullable|string|max:255',
            'role_id' => 'required|exists:roles,id',
            'password' => 'required|string|min:6',
            'nik' => 'nullable|string|size:16|unique:warga_profiles,nik',
            'rt_id' => 'nullable|exists:rts,id',
        ], [
            'username.unique' => 'Username ini sudah terdaftar di sistem.',
            'email.unique' => 'Alamat email ini sudah terdaftar.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'nik.unique' => 'NIK ini sudah terdaftar dalam master kependudukan.',
            'nik.size' => 'NIK harus berjumlah 16 digit angka.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $targetRole = Role::findOrFail($request->role_id);
        if ($targetRole->slug === 'super_admin' && !$request->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Super Admin platform yang dapat menugaskan hak akses Super Admin.',
            ], 403);
        }

        if ($targetRole->slug === 'admin' && !$request->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Super Admin platform yang berhak menambahkan akun Admin Desa.',
            ], 403);
        }

        if ($request->filled('rt_id')) {
            \App\Services\TenantSecurityService::validateRt($request->user(), (int) $request->rt_id);
        }

        $user = User::create([
            'desa_id' => $request->user()->desa_id,
            'role_id' => $request->role_id,
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        // Optional create warga profile if NIK or RT provided
        if ($request->filled('nik')) {
            WargaProfile::create([
                'desa_id' => $request->user()->desa_id,
                'user_id' => $user->id,
                'nik' => $request->nik,
                'nama_lengkap' => $request->name,
                'rt_id' => $request->rt_id,
                'status_kependudukan' => 'Tetap',
            ]);
        }

        ActivityLog::create([
            'desa_id' => $request->user()->desa_id,
            'user_id' => $request->user()->id,
            'action' => 'USER_CREATE',
            'entity_type' => User::class,
            'entity_id' => $user->id,
            'description' => "Administrator membuat pengguna baru '{$user->username}' ({$user->name}) dengan hak akses {$targetRole->name}.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Pengguna {$user->username} berhasil ditambahkan.",
            'data' => $user->load(['role', 'wargaProfile.rt.rw']),
        ], 201);
    }

    /**
     * Toggle user active/inactive status.
     */
    public function toggleStatus(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if ((int)$currentUser->id === (int)$id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menonaktifkan akun administrator Anda sendiri.',
            ], 403);
        }

        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        $statusStr = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        ActivityLog::create([
            'user_id' => $currentUser->id,
            'action' => 'USER_STATUS_TOGGLE',
            'entity_type' => User::class,
            'entity_id' => $user->id,
            'description' => "Administrator mengubah status akun '{$user->username}' menjadi {$statusStr}.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Status akun {$user->username} berhasil {$statusStr}.",
            'data' => $user->load(['role', 'wargaProfile']),
        ]);
    }

    /**
     * Admin forced password reset for any user.
     */
    public function resetPassword(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'new_password' => 'required|string|min:6',
        ], [
            'new_password.required' => 'Kata sandi baru wajib diisi.',
            'new_password.min' => 'Kata sandi baru minimal 6 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::findOrFail($id);
        $user->password = Hash::make($request->new_password);
        $user->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'PASSWORD_RESET',
            'entity_type' => User::class,
            'entity_id' => $user->id,
            'description' => "Administrator melakukan reset kata sandi paksa untuk akun '{$user->username}'.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Kata sandi untuk pengguna {$user->username} berhasil diperbarui.",
        ]);
    }

    /**
     * Update user details.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => "nullable|email|max:255|unique:users,email,{$id}",
            'phone_number' => 'nullable|string|max:255',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'role_id' => $request->role_id,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'USER_UPDATE',
            'entity_type' => User::class,
            'entity_id' => $user->id,
            'description' => "Administrator memperbarui profil pengguna '{$user->username}'.",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Data pengguna {$user->username} berhasil diperbarui.",
            'data' => $user->load(['role', 'wargaProfile']),
        ]);
    }
}
