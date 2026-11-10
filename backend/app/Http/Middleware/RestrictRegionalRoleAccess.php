<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictRegionalRoleAccess
{
    /**
     * Regional accounts are read-only and can only access their aggregate view
     * and account maintenance endpoints.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !$user->hasRole(['kecamatan', 'kabupaten_kota'])) {
            return $next($request);
        }

        $allowedRoutes = [
            'GET' => ['api/auth/user', 'api/auth/me', 'api/regional/overview'],
            'POST' => ['api/auth/profile', 'api/auth/password', 'api/auth/logout'],
            'PUT' => ['api/auth/profile', 'api/auth/password'],
        ];

        $routeUri = $request->route()?->uri();
        if (!in_array($routeUri, $allowedRoutes[$request->method()] ?? [], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Akun wilayah hanya memiliki akses baca ke ringkasan wilayah dan pengaturan akunnya sendiri.',
            ], 403);
        }

        return $next($request);
    }
}
