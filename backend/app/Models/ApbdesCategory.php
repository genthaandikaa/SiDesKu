<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApbdesCategory extends Model
{
    use HasFactory, BelongsToDesa;

    protected $fillable = [
        'desa_id',
        'jenis',
        'kode_rekening',
        'nama_kategori',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(ApbdesRecord::class, 'category_id');
    }
}
