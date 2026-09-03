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
        Schema::create('bantuan_sosials', function (Blueprint $table) {
            $table->id();
            $table->string('nama_bantuan', 150); // PKH, BLT Dana Desa, BPNT, Bantuan Beras
            $table->string('sumber_dana', 100)->default('Kemensos RI / APBDes');
            $table->year('tahun');
            $table->string('tahap', 50)->default('Tahap 1');
            $table->integer('kuota_penerima')->default(0);
            $table->decimal('nominal_per_penerima', 15, 2)->default(0);
            $table->date('tanggal_penyaluran');
            $table->time('waktu_mulai')->nullable();
            $table->string('lokasi_penyaluran')->default('Balai Desa Doko');
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['draft', 'published', 'selesai'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('bantuan_penerimas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bantuan_sosial_id')->constrained('bantuan_sosials')->cascadeOnDelete();
            $table->foreignId('warga_profile_id')->constrained('warga_profiles')->cascadeOnDelete();
            $table->foreignId('kk_id')->nullable()->constrained('kartu_keluargas')->nullOnDelete();
            $table->string('nomor_antrean', 20)->nullable();
            $table->string('qr_bantuan_code', 64)->unique();
            $table->enum('status_penyaluran', ['Terdaftar', 'Siap Diambil', 'Sudah Disalurkan'])->default('Terdaftar');
            $table->timestamp('disalurkan_at')->nullable();
            $table->foreignId('petugas_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('pengaduan_wargas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warga_profile_id')->constrained('warga_profiles')->cascadeOnDelete();
            $table->foreignId('rt_id')->constrained('rts')->cascadeOnDelete();
            $table->string('kategori', 50)->default('Infrastruktur'); // Infrastruktur, Pelayanan, Keamanan, Kebersihan, Bansos
            $table->string('judul', 200);
            $table->text('deskripsi');
            $table->string('foto_lampiran')->nullable();
            $table->enum('status', ['Terkirim', 'Ditinjau RT', 'Diproses Desa', 'Selesai', 'Ditolak'])->default('Terkirim');
            $table->text('tanggapan')->nullable();
            $table->foreignId('ditanggapi_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('ditanggapi_at')->nullable();
            $table->timestamps();
        });

        Schema::create('notifikasi_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('warga_profile_id')->nullable()->constrained('warga_profiles')->nullOnDelete();
            $table->string('nomor_tujuan', 30);
            $table->string('jenis_notifikasi', 50); // BANSOS_CAIR, SURAT_APPROVED_RT, SURAT_READY, ADUAN_RESPONSED
            $table->string('judul', 150);
            $table->text('pesan');
            $table->enum('status_pengiriman', ['TERKIRIM', 'GAGAL', 'PENDING'])->default('TERKIRIM');
            $table->json('payload_json')->nullable();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('entity_type', 100)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('notifikasi_logs');
        Schema::dropIfExists('pengaduan_wargas');
        Schema::dropIfExists('bantuan_penerimas');
        Schema::dropIfExists('bantuan_sosials');
    }
};
