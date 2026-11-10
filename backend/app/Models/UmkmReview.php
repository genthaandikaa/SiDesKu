<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UmkmReview extends Model
{
    use HasFactory;

    protected $table = 'umkm_reviews';

    protected $fillable = [
        'umkm_id',
        'user_id',
        'rating',
        'komentar',
        'reviewer_name',
        'reviewer_rt_rw',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(Umkm::class, 'umkm_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
