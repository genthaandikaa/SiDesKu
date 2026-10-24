<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pengumuman extends Model
{
    use HasFactory, BelongsToDesa;

    protected $table = 'pengumumans';

    protected $fillable = [
        'desa_id',
        'judul',
        'kategori',
        'oleh',
        'status_label',
        'status',
        'bantuan_sosial_id',
        'isi',
        'level_target',
        'target_id',
        'file_lampiran',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_active',
        'created_by_user_id',
        'approved_by_kades_user_id',
        'approved_at',
        'catatan_penolakan_kades',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'is_active' => 'boolean',
            'approved_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function approvedByKadesUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_kades_user_id');
    }

    public function bantuanSosial(): BelongsTo
    {
        return $this->belongsTo(BantuanSosial::class, 'bantuan_sosial_id');
    }
}
