<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WargaProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'kk_id',
        'rt_id',
        'nik',
        'nama_lengkap',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'agama',
        'status_perkawinan',
        'pekerjaan',
        'pendidikan_terakhir',
        'golongan_darah',
        'no_hp_wa',
        'alamat_ktp',
        'foto_ktp',
        'status_keluarga',
        'status_ekonomi',
        'status_kependudukan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function kartuKeluarga(): BelongsTo
    {
        return $this->belongsTo(KartuKeluarga::class, 'kk_id');
    }

    public function rt(): BelongsTo
    {
        return $this->belongsTo(Rt::class);
    }

    public function suratRequests(): HasMany
    {
        return $this->hasMany(SuratRequest::class);
    }

    public function bantuanPenerimas(): HasMany
    {
        return $this->hasMany(BantuanPenerima::class);
    }

    public function pengaduans(): HasMany
    {
        return $this->hasMany(PengaduanWarga::class);
    }
}
