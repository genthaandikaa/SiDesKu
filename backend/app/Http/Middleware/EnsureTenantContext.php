<?php

namespace App\Http\Middleware;

use App\Models\Desa;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantContext
{
    /**
     * Pastikan konteks tenant divalidasi ketat pada setiap request berotentikasi.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // Super Admin memiliki hak istimewa lintas desa (hanya untuk operasi platform)
            if ($user->hasRole('super_admin')) {
                return $next($request);
            }

            // Seluruh pengguna operasional WAJIB memiliki desa_id yang valid & aktif
            if (empty($user->desa_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Akun Anda tidak terikat dengan desa operasional yang sah.',
                ], 403);
            }

            // Validasi apakah desa terdaftar dan aktif
            $desa = Desa::find($user->desa_id);
            if (!$desa || !$desa->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Desa Anda sedang dinonaktifkan atau tidak ditemukan.',
                ], 403);
            }

            // Cegah manipulasi parameter desa_id (IDOR / Cross-Tenant Injection)
            if ($request->has('desa_id') && (int) $request->input('desa_id') !== (int) $user->desa_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pelanggaran keamanan: Manipulasi tenant desa_id lintas batas ditolak.',
                ], 403);
            }

            if ($request->query->has('desa_id') && (int) $request->query('desa_id') !== (int) $user->desa_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pelanggaran keamanan: Manipulasi query parameter desa_id ditolak.',
                ], 403);
            }

            $request->attributes->set('tenant_desa_id', $user->desa_id);
            $request->attributes->set('tenant_desa', $desa);
        }

        return $next($request);
    }
}
