<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KeputusanKades extends Model
{
    use HasFactory, BelongsToDesa;

    protected $table = 'keputusan_kades';

    protected $fillable = [
        'desa_id',
        'nomor_sk',
        'tentang',
        'kategori',
        'tanggal_tetap',
        'status',
        'keterangan',
        'is_public',
        'ditetapkan_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_tetap' => 'date',
            'is_public' => 'boolean',
        ];
    }

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'desa_id');
    }

    public function ditetapkanByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditetapkan_by_user_id');
    }
}
