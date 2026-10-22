<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SuratType extends Model
{
    use HasFactory, BelongsToDesa;

    protected $fillable = [
        'desa_id',
        'kode_surat',
        'nama_surat',
        'format_nomor',
        'kode_klasifikasi',
        'nomor_terakhir',
        'template_body',
        'persyaratan_json',
        'masa_berlaku_hari',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'persyaratan_json' => 'array',
            'is_active' => 'boolean',
            'nomor_terakhir' => 'integer',
        ];
    }

    public function requests(): HasMany
    {
        return $this->hasMany(SuratRequest::class);
    }
}
