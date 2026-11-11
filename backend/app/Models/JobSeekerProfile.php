<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobSeekerProfile extends Model
{
    use HasFactory;

    protected $table = 'job_seeker_profiles';

    protected $fillable = [
        'user_id',
        'nama',
        'nik',
        'domisili',
        'status_kerja',
        'terakhir_update',
        'email',
        'telepon',
        'avatar_url',
        'cv_utama',
        'berkas_pendukung',
        'keahlian',
        'preferensi',
    ];

    protected $casts = [
        'cv_utama' => 'array',
        'berkas_pendukung' => 'array',
        'keahlian' => 'array',
        'preferensi' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
