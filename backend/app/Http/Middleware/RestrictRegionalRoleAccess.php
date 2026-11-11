<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictRegionalRoleAccess
{
    /**
     * Regional accounts can read aggregate data, manage their account and use
     * scoped coordination chat and personal notification settings.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !$user->hasRole(['kecamatan', 'kabupaten_kota'])) {
            return $next($request);
        }

        $allowedRoutes = [
            'GET' => [
                'api/auth/user', 'api/auth/me', 'api/regional/overview',
                'api/chat/contacts', 'api/chat/rooms', 'api/chat/unread-count',
                'api/chat/rooms/{roomId}/messages', 'api/push/status',
            ],
            'POST' => [
                'api/auth/profile', 'api/auth/password', 'api/auth/logout',
                'api/chat/rooms', 'api/chat/rooms/{roomId}/messages',
                'api/push/subscribe', 'api/push/unsubscribe', 'api/push/test',
            ],
            'PUT' => ['api/auth/profile', 'api/auth/password'],
        ];

        $routeUri = $request->route()?->uri();
        if (!in_array($routeUri, $allowedRoutes[$request->method()] ?? [], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Akun wilayah hanya dapat mengakses ringkasan wilayah, komunikasi dalam cakupan, notifikasi perangkat, dan pengaturan akunnya sendiri.',
            ], 403);
        }

        return $next($request);
    }
}
