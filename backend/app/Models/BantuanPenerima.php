<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BantuanPenerima extends Model
{
    use HasFactory;

    protected $table = 'bantuan_penerimas';

    protected $fillable = [
        'bantuan_sosial_id',
        'warga_profile_id',
        'kk_id',
        'nomor_antrean',
        'qr_bantuan_code',
        'status_penyaluran',
        'disalurkan_at',
        'petugas_user_id',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'disalurkan_at' => 'datetime',
        ];
    }

    public function bantuanSosial(): BelongsTo
    {
        return $this->belongsTo(BantuanSosial::class);
    }

    public function wargaProfile(): BelongsTo
    {
        return $this->belongsTo(WargaProfile::class);
    }

    public function kartuKeluarga(): BelongsTo
    {
        return $this->belongsTo(KartuKeluarga::class, 'kk_id');
    }

    public function petugasUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'petugas_user_id');
    }
}
