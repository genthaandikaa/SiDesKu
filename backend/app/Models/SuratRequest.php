<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SuratRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_resi',
        'warga_profile_id',
        'surat_type_id',
        'nomor_surat_resmi',
        'status',
        'keperluan',
        'form_data_json',
        'file_lampiran',
        'file_surat_pdf',
        'qr_verification_hash',
        'ttd_sekdes_at',
        'ttd_kades_at',
        'catatan_penolakan',
    ];

    protected function casts(): array
    {
        return [
            'form_data_json' => 'array',
            'ttd_sekdes_at' => 'datetime',
            'ttd_kades_at' => 'datetime',
        ];
    }

    public function wargaProfile(): BelongsTo
    {
        return $this->belongsTo(WargaProfile::class, 'warga_profile_id');
    }

    public function suratType(): BelongsTo
    {
        return $this->belongsTo(SuratType::class, 'surat_type_id');
    }

    public function trackings(): HasMany
    {
        return $this->hasMany(SuratTracking::class)->orderBy('created_at', 'desc');
    }
}
