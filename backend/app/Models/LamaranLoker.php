<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LamaranLoker extends Model
{
    use HasFactory;

    protected $table = 'lamaran_lokers';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'loker_id',
        'user_id',
        'loker_posisi',
        'loker_perusahaan',
        'pelamar_nama',
        'pelamar_nik',
        'pelamar_wa',
        'pelamar_email',
        'pendidikan_terakhir',
        'cv_file_name',
        'cv_file_url',
        'portofolio_url',
        'portofolio_file_name',
        'portofolio_file_url',
        'catatan',
        'status',
        'substatus_text',
        'tanggal_lamar',
        'icon_type',
    ];

    public function loker(): BelongsTo
    {
        return $this->belongsTo(Loker::class, 'loker_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
