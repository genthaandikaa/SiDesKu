<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dusun extends Model
{
    use HasFactory, BelongsToDesa;

    protected $fillable = [
        'desa_id',
        'nama_dusun',
        'kode_dusun',
        'kepala_dusun',
    ];

    public function rws(): HasMany
    {
        return $this->hasMany(Rw::class);
    }
}
