<?php

namespace App\Models;

use App\Traits\BelongsToDesa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DesaSetting extends Model
{
    use HasFactory, BelongsToDesa;

    protected $fillable = [
        'desa_id',
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
        'kop_atas',
        'kop_tengah',
        'kop_bawah',
        'kop_footer',
        'logo_desa_path',
        'logo_kabupaten_path',
        'nama_kades',
        'nip_kades',
        'nama_sekdes',
        'nip_sekdes',
        'ttd_kades_image',
        'stempel_desa_image',
        'ttd_kades_url',
        'ttd_sekdes_url',
        'ttd_bendahara_url',
        'nama_bendahara',
        'nip_bendahara',
        'visi',
        'misi',
        'struktur_organisasi_json',
        'territory_geojson',
    ];

    protected $casts = [
        'struktur_organisasi_json' => 'array',
    ];
}
