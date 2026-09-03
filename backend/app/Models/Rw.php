<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rw extends Model
{
    use HasFactory;

    protected $fillable = [
        'dusun_id',
        'nomor_rw',
        'ketua_rw_user_id',
    ];

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
