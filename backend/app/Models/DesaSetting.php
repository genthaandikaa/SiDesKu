<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DesaSetting extends Model
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
    ];
}
