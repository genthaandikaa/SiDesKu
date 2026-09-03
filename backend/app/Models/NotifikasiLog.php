<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotifikasiLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'warga_profile_id',
        'nomor_tujuan',
        'jenis_notifikasi',
        'judul',
        'pesan',
        'status_pengiriman',
        'payload_json',
    ];

    protected function casts(): array
    {
        return [
            'payload_json' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wargaProfile(): BelongsTo
    {
        return $this->belongsTo(WargaProfile::class);
    }
}
