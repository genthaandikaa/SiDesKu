<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pengumuman extends Model
{
    use HasFactory;

    protected $table = 'pengumumans';

    protected $fillable = [
        'judul',
        'kategori',
        'oleh',
        'status_label',
        'bantuan_sosial_id',
        'isi',
        'level_target',
        'target_id',
        'file_lampiran',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_active',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function bantuanSosial(): BelongsTo
    {
        return $this->belongsTo(BantuanSosial::class, 'bantuan_sosial_id');
    }
}
