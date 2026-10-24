<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Desa extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_desa',
        'kode_desa',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'kode_pos',
        'alamat_kantor',
        'telepon',
        'email',
        'website',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function setting(): HasOne
    {
        return $this->hasOne(DesaSetting::class, 'desa_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'desa_id');
    }

    public function dusuns(): HasMany
    {
        return $this->hasMany(Dusun::class, 'desa_id');
    }

    public function rws(): HasMany
    {
        return $this->hasMany(Rw::class, 'desa_id');
    }

    public function rts(): HasMany
    {
        return $this->hasMany(Rt::class, 'desa_id');
    }

    public function wargaProfiles(): HasMany
    {
        return $this->hasMany(WargaProfile::class, 'desa_id');
    }

    public function suratRequests(): HasMany
    {
        return $this->hasMany(SuratRequest::class, 'desa_id');
    }

    public function apbdesRecords(): HasMany
    {
        return $this->hasMany(ApbdesRecord::class, 'desa_id');
    }

    public function bantuanSosials(): HasMany
    {
        return $this->hasMany(BantuanSosial::class, 'desa_id');
    }

    public function beritas(): HasMany
    {
        return $this->hasMany(Berita::class, 'desa_id');
    }

    public function pengumumans(): HasMany
    {
        return $this->hasMany(Pengumuman::class, 'desa_id');
    }
}
