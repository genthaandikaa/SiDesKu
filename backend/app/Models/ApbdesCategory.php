<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApbdesCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'jenis',
        'kode_rekening',
        'nama_kategori',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(ApbdesRecord::class, 'category_id');
    }
}
