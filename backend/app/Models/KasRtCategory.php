<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KasRtCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'rt_id',
        'nama_kategori',
        'tipe',
    ];

    public function rt(): BelongsTo
    {
        return $this->belongsTo(Rt::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(KasRtTransaction::class, 'category_id');
    }
}
