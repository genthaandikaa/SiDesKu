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
        Schema::create('lokers', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->foreignId('desa_id')->nullable()->constrained('desas')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('posisi');
            $table->string('perusahaan');
            $table->string('kode_reg')->nullable();
            $table->string('nib')->nullable();
            $table->string('company_logo_text', 16)->nullable();
            $table->string('mitra_status')->nullable();
            $table->string('tag_verifikasi')->nullable();
            $table->string('kategori');
            $table->string('tipe_kerja');
            $table->boolean('is_jasa_mitra')->default(false);
            $table->string('lokasi');
            $table->string('distance_text')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('gaji_label')->nullable();
            $table->decimal('gaji_min', 12, 2)->default(0);
            $table->decimal('gaji_max', 12, 2)->default(0);
            $table->string('gaji_subtext')->nullable();
            $table->string('pendidikan')->nullable();
            $table->string('pengalaman')->nullable();
            $table->boolean('syarat_cv')->default(true);
            $table->text('ringkasan')->nullable();
            $table->json('deskripsi')->nullable();
            $table->json('tags')->nullable();
            $table->string('waktu_kerja')->nullable();
            $table->string('level_pekerjaan')->nullable();
            $table->string('fasilitas_utama')->nullable();
            $table->string('bidang')->nullable();
            $table->text('alamat_kantor')->nullable();
            $table->string('batas_pengajuan')->nullable();
            $table->string('kuota_kebutuhan')->nullable();
            $table->string('waktu_proses')->nullable();
            $table->text('deskripsi_detail')->nullable();
            $table->json('tanggung_jawab')->nullable();
            $table->json('persyaratan')->nullable();
            $table->json('benefits')->nullable();
            $table->string('wa_hrd', 32)->nullable();
            $table->string('email_hrd')->nullable();
            $table->boolean('disnaker_verified')->default(true);
            $table->string('tanggal_posting')->nullable();
            $table->integer('jumlah_pelamar')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('lamaran_lokers', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('loker_id', 64);
            $table->foreign('loker_id')->references('id')->on('lokers')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('loker_posisi');
            $table->string('loker_perusahaan');
            $table->string('pelamar_nama');
            $table->string('pelamar_nik')->nullable();
            $table->string('pelamar_wa')->nullable();
            $table->string('pelamar_email')->nullable();
            $table->string('pendidikan_terakhir')->nullable();
            $table->string('cv_file_name');
            $table->longText('cv_file_url')->nullable();
            $table->text('portofolio_url')->nullable();
            $table->string('portofolio_file_name')->nullable();
            $table->longText('portofolio_file_url')->nullable();
            $table->text('catatan')->nullable();
            $table->string('status')->default('Berkas Diterima HR - Wawancara Dijadwalkan');
            $table->string('substatus_text')->nullable();
            $table->string('tanggal_lamar')->nullable();
            $table->string('icon_type', 32)->nullable();
            $table->timestamps();
        });

        Schema::create('job_seeker_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('nama');
            $table->string('nik')->nullable();
            $table->string('domisili')->nullable();
            $table->string('status_kerja')->default('Siap Bekerja (Open to Work)');
            $table->string('terakhir_update')->nullable();
            $table->string('email')->nullable();
            $table->string('telepon')->nullable();
            $table->longText('avatar_url')->nullable();
            $table->json('cv_utama')->nullable();
            $table->json('berkas_pendukung')->nullable();
            $table->json('keahlian')->nullable();
            $table->json('preferensi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_seeker_profiles');
        Schema::dropIfExists('lamaran_lokers');
        Schema::dropIfExists('lokers');
    }
};
