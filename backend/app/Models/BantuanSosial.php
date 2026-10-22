<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BantuanSosial extends Model
{
    use HasFactory, BelongsToDesa;

    protected $table = 'bantuan_sosials';

    protected $fillable = [
        'desa_id',
        'nama_bantuan',
        'sumber_dana',
        'tahun',
        'tahap',
        'kuota_penerima',
        'nominal_per_penerima',
        'tanggal_penyaluran',
        'waktu_mulai',
        'lokasi_penyaluran',
        'deskripsi',
        'status',
        'published_at',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_penyaluran' => 'date',
            'nominal_per_penerima' => 'decimal:2',
            'published_at' => 'datetime',
        ];
    }

    public function penerimas(): HasMany
    {
        return $this->hasMany(BantuanPenerima::class);
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
