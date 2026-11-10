<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Umkm extends Model
{
    use HasFactory;

    protected $table = 'umkms';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'desa_id',
        'user_id',
        'nama',
        'toko_nama',
        'kelurahan',
        'rt_rw',
        'kategori',
        'badge_tag',
        'harga',
        'satuan',
        'deskripsi',
        'foto_url',
        'galeri',
        'alamat',
        'lat',
        'lng',
        'wa_kontak',
        'qris_url',
        'qris_nama',
        'qris_nmid',
        'metode_pembayaran',
        'status_toko',
        'rating',
        'reviews_count',
        'terjual_text',
        'terjual',
        'buka_jam_text',
        'is_jasa',
        'pilihan_ayam',
        'pilihan_sambal',
        'pilihan_layanan_jasa',
        'keterangan_halal',
        'keterangan_higienis',
    ];

    protected $casts = [
        'harga' => 'float',
        'rating' => 'float',
        'reviews_count' => 'integer',
        'terjual' => 'integer',
        'lat' => 'float',
        'lng' => 'float',
        'is_jasa' => 'boolean',
        'galeri' => 'array',
        'metode_pembayaran' => 'array',
        'pilihan_ayam' => 'array',
        'pilihan_sambal' => 'array',
        'pilihan_layanan_jasa' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(UmkmReview::class, 'umkm_id', 'id')->orderBy('created_at', 'desc');
    }
}
