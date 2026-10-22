<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KartuKeluarga extends Model
{
    use HasFactory, BelongsToDesa;

    protected $fillable = [
        'desa_id',
        'no_kk',
        'nama_kepala_keluarga',
        'rt_id',
        'alamat_lengkap',
        'no_telp_rumah',
        'foto_kk',
    ];

    public function rt(): BelongsTo
    {
        return $this->belongsTo(Rt::class);
    }

    public function anggotaKeluarga(): HasMany
    {
        return $this->hasMany(WargaProfile::class, 'kk_id');
    }

    public function bantuanPenerimas(): HasMany
    {
        return $this->hasMany(BantuanPenerima::class, 'kk_id');
    }
}
