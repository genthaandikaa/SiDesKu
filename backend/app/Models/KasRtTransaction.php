<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KasRtTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'rt_id',
        'category_id',
        'warga_profile_id',
        'tanggal_transaksi',
        'tipe',
        'jumlah',
        'keterangan',
        'bukti_pembayaran_file',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_transaksi' => 'date',
            'jumlah' => 'decimal:2',
        ];
    }

    public function rt(): BelongsTo
    {
        return $this->belongsTo(Rt::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(KasRtCategory::class, 'category_id');
    }

    public function wargaProfile(): BelongsTo
    {
        return $this->belongsTo(WargaProfile::class, 'warga_profile_id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
