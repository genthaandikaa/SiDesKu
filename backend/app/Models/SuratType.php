<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SuratType extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_surat',
        'nama_surat',
        'format_nomor',
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
        ];
    }

    public function requests(): HasMany
    {
        return $this->hasMany(SuratRequest::class);
    }
}
