<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratTracking extends Model
{
    use HasFactory;

    protected $fillable = [
        'surat_request_id',
        'actor_user_id',
        'status_stage',
        'status_action',
        'catatan',
    ];

    public function suratRequest(): BelongsTo
    {
        return $this->belongsTo(SuratRequest::class);
    }

    public function actorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
