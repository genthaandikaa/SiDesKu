<?php

namespace App\Traits;

use App\Models\Desa;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToDesa
{
    public static function bootBelongsToDesa(): void
    {
        // Global scope untuk menyaring otomatis berdasarkan tenant desa yang aktif
        static::addGlobalScope('tenant', function (Builder $builder) {
            static $resolving = false;
            if ($resolving || !Auth::hasUser()) {
                return;
            }

            try {
                $resolving = true;
                $user = Auth::user();
                if (!$user) {
                    return;
                }

                // Super Admin tidak dibatasi secara global (kecuali ditentukan per konteks)
                if ($user->role_id === 10 || (isset($user->role) && $user->role->slug === 'super_admin')) {
                    return;
                }

                // Pengguna operasional dibatasi ketat ke desa_id miliknya
                if (!empty($user->desa_id)) {
                    $builder->where($builder->getModel()->getTable() . '.desa_id', $user->desa_id);
                } else {
                    // Jika akun operasional tidak memiliki desa_id yang valid, tolak data (0 hasil)
                    $builder->whereRaw('1 = 0');
                }
            } finally {
                $resolving = false;
            }
        });

        // Event creating: otomatis sematkan desa_id pengguna yang sedang login
        static::creating(function ($model) {
            if (empty($model->desa_id) && Auth::hasUser()) {
                $user = Auth::user();
                if ($user && !empty($user->desa_id)) {
                    $model->desa_id = $user->desa_id;
                }
            }
        });
    }

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'desa_id');
    }
}
