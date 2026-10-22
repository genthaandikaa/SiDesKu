<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApbdesRecord extends Model
{
    use HasFactory, BelongsToDesa;

    protected $fillable = [
        'desa_id',
        'category_id',
        'tahun_anggaran',
        'uraian',
        'anggaran',
        'realisasi',
        'tanggal_realisasi',
        'bukti_transaksi_file',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'anggaran' => 'decimal:2',
            'realisasi' => 'decimal:2',
            'tanggal_realisasi' => 'date',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ApbdesCategory::class, 'category_id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
