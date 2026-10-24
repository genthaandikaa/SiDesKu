<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Agenda extends Model
{
    use HasFactory, BelongsToDesa;

    protected $table = 'agendas';

    protected $fillable = [
        'desa_id',
        'judul',
        'tipe',
        'peserta',
        'tanggal',
        'waktu',
        'tempat',
        'keterangan',
        'is_custom',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'is_custom' => 'boolean',
        ];
    }

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'desa_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}

