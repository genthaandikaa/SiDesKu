<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MutasiPenduduk extends Model
{
    use HasFactory, BelongsToDesa;

    protected $fillable = [
        'desa_id',
        'jenis_mutasi',
        'tanggal_peristiwa',
        'nik',
        'nama_lengkap',
        'jenis_kelamin',
        'rt_id',
        'alamat_asal',
        'alamat_tujuan',
        'keterangan',
        'nomor_surat_keterangan',
        'dicatat_oleh',
    ];

    protected $casts = [
        'tanggal_peristiwa' => 'date',
    ];

    public function rt(): BelongsTo
    {
        return $this->belongsTo(Rt::class);
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicatat_oleh');
    }
}
