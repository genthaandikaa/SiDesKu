<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle incoming request and verify user role authorization.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Superadmin bypass
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        $allowed = false;
        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                $allowed = true;
                break;
            }
        }

        if (!$allowed) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak memiliki wewenang untuk tindakan ini.',
            ], 403);
        }

        return $next($request);
    }
}
