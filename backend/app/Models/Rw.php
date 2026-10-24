<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rw extends Model
{
    use HasFactory, BelongsToDesa;

    protected $fillable = [
        'desa_id',
        'dusun_id',
        'nomor_rw',
        'ketua_rw_user_id',
        'kas_status',
        'kas_pengajuan_alasan',
        'kas_catatan_desa',
        'kas_approved_at',
        'kas_approved_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'kas_approved_at' => 'datetime',
        ];
    }

    public function kasApprovedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kas_approved_by_user_id');
    }

    public function dusun(): BelongsTo
    {
        return $this->belongsTo(Dusun::class);
    }

    public function ketuaRwUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ketua_rw_user_id');
    }

    public function rts(): HasMany
    {
        return $this->hasMany(Rt::class);
    }
}
