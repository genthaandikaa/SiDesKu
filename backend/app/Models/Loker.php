<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loker extends Model
{
    use HasFactory;

    protected $table = 'lokers';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'desa_id',
        'user_id',
        'posisi',
        'perusahaan',
        'kode_reg',
        'nib',
        'company_logo_text',
        'mitra_status',
        'tag_verifikasi',
        'kategori',
        'tipe_kerja',
        'is_jasa_mitra',
        'lokasi',
        'distance_text',
        'lat',
        'lng',
        'gaji_label',
        'gaji_min',
        'gaji_max',
        'gaji_subtext',
        'pendidikan',
        'pengalaman',
        'syarat_cv',
        'syarat_dokumen',
        'ringkasan',
        'deskripsi',
        'tags',
        'waktu_kerja',
        'level_pekerjaan',
        'fasilitas_utama',
        'bidang',
        'alamat_kantor',
        'batas_pengajuan',
        'kuota_kebutuhan',
        'waktu_proses',
        'deskripsi_detail',
        'tanggung_jawab',
        'persyaratan',
        'benefits',
        'wa_hrd',
        'email_hrd',
        'disnaker_verified',
        'tanggal_posting',
        'jumlah_pelamar',
        'is_active',
    ];

    protected $casts = [
        'gaji_min' => 'float',
        'gaji_max' => 'float',
        'lat' => 'float',
        'lng' => 'float',
        'is_jasa_mitra' => 'boolean',
        'syarat_cv' => 'boolean',
        'syarat_dokumen' => 'array',
        'disnaker_verified' => 'boolean',
        'is_active' => 'boolean',
        'jumlah_pelamar' => 'integer',
        'deskripsi' => 'array',
        'tags' => 'array',
        'tanggung_jawab' => 'array',
        'persyaratan' => 'array',
        'benefits' => 'array',
    ];

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lamarans(): HasMany
    {
        return $this->hasMany(LamaranLoker::class, 'loker_id', 'id');
    }
}
