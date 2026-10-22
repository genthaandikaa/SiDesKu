<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengaduanWarga extends Model
{
    use HasFactory, BelongsToDesa;

    protected $table = 'pengaduan_wargas';

    protected $fillable = [
        'desa_id',
        'warga_profile_id',
        'rt_id',
        'kategori',
        'judul',
        'deskripsi',
        'foto_lampiran',
        'status',
        'disposisi_ke',
        'tanggapan',
        'riwayat_tanggapan',
        'ditanggapi_by_user_id',
        'ditanggapi_at',
    ];

    protected function casts(): array
    {
        return [
            'ditanggapi_at' => 'datetime',
            'riwayat_tanggapan' => 'array',
        ];
    }

    public function wargaProfile(): BelongsTo
    {
        return $this->belongsTo(WargaProfile::class);
    }

    public function rt(): BelongsTo
    {
        return $this->belongsTo(Rt::class);
    }

    public function ditanggapiByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditanggapi_by_user_id');
    }
}
