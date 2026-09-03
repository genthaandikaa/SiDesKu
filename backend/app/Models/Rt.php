<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rt extends Model
{
    use HasFactory;

    protected $fillable = [
        'rw_id',
        'nomor_rt',
        'ketua_rt_user_id',
        'sekretaris_rt_user_id',
        'bendahara_rt_user_id',
    ];

    public function rw(): BelongsTo
    {
        return $this->belongsTo(Rw::class);
    }

    public function ketuaRtUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ketua_rt_user_id');
    }

    public function sekretarisRtUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sekretaris_rt_user_id');
    }

    public function bendaharaRtUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bendahara_rt_user_id');
    }

    public function kartuKeluargas(): HasMany
    {
        return $this->hasMany(KartuKeluarga::class);
    }

    public function wargaProfiles(): HasMany
    {
        return $this->hasMany(WargaProfile::class);
    }

    public function kasCategories(): HasMany
    {
        return $this->hasMany(KasRtCategory::class);
    }

    public function kasTransactions(): HasMany
    {
        return $this->hasMany(KasRtTransaction::class);
    }
}
