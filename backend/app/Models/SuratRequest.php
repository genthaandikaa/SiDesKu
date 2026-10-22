<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SuratRequest extends Model
{
    use HasFactory, BelongsToDesa;

    protected $fillable = [
        'desa_id',
        'nomor_resi',
        'warga_profile_id',
        'surat_type_id',
        'nomor_surat_resmi',
        'status',
        'keperluan',
        'form_data_json',
        'pemohon_snapshot',
        'file_lampiran',
        'file_surat_pdf',
        'qr_verification_hash',
        'verified_rt_user_id',
        'verified_rt_at',
        'verifikasi_identitas',
        'verifikasi_domisili',
        'processed_sekdes_user_id',
        'processed_sekdes_at',
        'approved_kades_user_id',
        'rejected_kades_user_id',
        'ttd_sekdes_at',
        'ttd_kades_at',
        'catatan_penolakan',
        'catatan_koreksi',
        'catatan_penolakan_kades',
    ];

    protected function casts(): array
    {
        return [
            'form_data_json' => 'array',
            'pemohon_snapshot' => 'array',
            'verifikasi_identitas' => 'boolean',
            'verifikasi_domisili' => 'boolean',
            'verified_rt_at' => 'datetime',
            'processed_sekdes_at' => 'datetime',
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
        return $this->hasMany(SuratTracking::class, 'surat_request_id');
    }

    public function verifiedRtUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_rt_user_id');
    }

    public function processedSekdesUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_sekdes_user_id');
    }

    public function approvedKadesUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_kades_user_id');
    }

    public function rejectedKadesUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_kades_user_id');
    }
}
