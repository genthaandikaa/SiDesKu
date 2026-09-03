<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('desa_settings', function (Blueprint $table) {
            $table->id();
            $table->string('nama_desa')->default('Desa Doko');
            $table->string('kode_desa', 20)->default('35.06.04.2001');
            $table->string('kecamatan')->default('Kecamatan Ngasem');
            $table->string('kabupaten')->default('Kabupaten Kediri');
            $table->string('provinsi')->default('Jawa Timur');
            $table->string('kode_pos', 10)->default('64182');
            $table->string('alamat_kantor')->default('Jl. Raya Doko No. 12, Kec. Ngasem, Kab. Kediri');
            $table->string('telepon', 25)->nullable()->default('0354-681234');
            $table->string('email')->nullable()->default('pemdes.doko@kedirikab.go.id');
            $table->string('website')->nullable()->default('https://doko.kedirikab.go.id');
            
            // Dynamic Kop Surat Fields
            $table->string('kop_atas')->default('PEMERINTAH KABUPATEN KEDIRI');
            $table->string('kop_tengah')->default('KECAMATAN NGASEM');
            $table->string('kop_bawah')->default('KANTOR KEPALA DESA DOKO');
            $table->text('kop_footer')->nullable();
            $table->string('logo_desa_path')->nullable();
            $table->string('logo_kabupaten_path')->nullable();
            
            // Penandatangan Default
            $table->string('nama_kades')->default('Drs. H. Bambang Prasetyo, M.Si');
            $table->string('nip_kades')->nullable();
            $table->string('nama_sekdes')->default('Ahmad Fauzi, S.Kom');
            $table->string('nip_sekdes')->nullable()->default('19850412 201101 1 003');
            $table->string('ttd_kades_image')->nullable();
            $table->string('stempel_desa_image')->nullable();
            $table->timestamps();
        });

        Schema::create('dusuns', function (Blueprint $table) {
            $table->id();
            $table->string('nama_dusun', 100);
            $table->string('kode_dusun', 20)->nullable();
            $table->string('kepala_dusun', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('rws', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dusun_id')->constrained('dusuns')->cascadeOnDelete();
            $table->string('nomor_rw', 10);
            $table->foreignId('ketua_rw_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('rts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rw_id')->constrained('rws')->cascadeOnDelete();
            $table->string('nomor_rt', 10);
            $table->foreignId('ketua_rt_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('sekretaris_rt_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('bendahara_rt_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rts');
        Schema::dropIfExists('rws');
        Schema::dropIfExists('dusuns');
        Schema::dropIfExists('desa_settings');
    }
};
