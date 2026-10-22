<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, BelongsToDesa;

    protected $fillable = [
        'desa_id',
        'role_id',
        'name',
        'username',
        'email',
        'phone_number',
        'avatar',
        'password',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'desa_id');
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function wargaProfile(): HasOne
    {
        return $this->hasOne(WargaProfile::class, 'user_id');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function hasRole(string|array $roleSlug): bool
    {
        if (!$this->role) {
            return false;
        }

        if (is_array($roleSlug)) {
            foreach ($roleSlug as $r) {
                if ($this->hasRole($r)) {
                    return true;
                }
            }
            return false;
        }

        $slug = $this->role->slug;

        // Pemetaan alias fleksibel: admin_desa <=> admin
        if ($roleSlug === 'admin' || $roleSlug === 'admin_desa') {
            return $slug === 'admin_desa' || $slug === 'admin';
        }

        // Pemetaan alias bendahara
        if ($roleSlug === 'bendahara' || $roleSlug === 'bendahara_desa') {
            return $slug === 'bendahara_desa' || $slug === 'bendahara';
        }

        return $slug === $roleSlug;
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->hasRole($roles);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role && $this->role->slug === 'super_admin';
    }

    public function getAuthorizedRtId(): ?int
    {
        $rt = Rt::where('ketua_rt_user_id', $this->id)
            ->orWhere('sekretaris_rt_user_id', $this->id)
            ->orWhere('bendahara_rt_user_id', $this->id)
            ->first();

        if ($rt) {
            return (int) $rt->id;
        }

        if ($this->wargaProfile && $this->wargaProfile->rt_id) {
            return (int) $this->wargaProfile->rt_id;
        }

        return null;
    }

    public function getAuthorizedRwId(): ?int
    {
        $rw = Rw::where('ketua_rw_user_id', $this->id)->first();
        if ($rw) {
            return (int) $rw->id;
        }

        if ($this->wargaProfile && $this->wargaProfile->rt && $this->wargaProfile->rt->rw_id) {
            return (int) $this->wargaProfile->rt->rw_id;
        }

        return null;
    }
}
