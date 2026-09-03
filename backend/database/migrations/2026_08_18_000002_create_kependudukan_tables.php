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
        Schema::create('kartu_keluargas', function (Blueprint $table) {
            $table->id();
            $table->string('no_kk', 20)->unique();
            $table->string('nama_kepala_keluarga', 150);
            $table->foreignId('rt_id')->constrained('rts')->cascadeOnDelete();
            $table->text('alamat_lengkap');
            $table->string('no_telp_rumah', 20)->nullable();
            $table->string('foto_kk')->nullable();
            $table->timestamps();
        });

        Schema::create('warga_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('kk_id')->nullable()->constrained('kartu_keluargas')->nullOnDelete();
            $table->foreignId('rt_id')->constrained('rts')->cascadeOnDelete();
            $table->string('nik', 20)->unique();
            $table->string('nama_lengkap', 150);
            $table->string('tempat_lahir', 100);
            $table->date('tanggal_lahir');
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('agama', 30)->default('Islam');
            $table->string('status_perkawinan', 30)->default('Belum Kawin');
            $table->string('pekerjaan', 100)->nullable();
            $table->string('pendidikan_terakhir', 50)->nullable();
            $table->string('golongan_darah', 5)->nullable();
            $table->string('no_hp_wa', 25)->nullable()->index();
            $table->text('alamat_ktp');
            $table->string('foto_ktp')->nullable();
            $table->enum('status_keluarga', ['Kepala Keluarga', 'Suami', 'Istri', 'Anak', 'Famili Lain'])->default('Kepala Keluarga');
            $table->enum('status_ekonomi', ['Mampu', 'Menengah', 'Kurang Mampu (PKH/BLT Eligible)'])->default('Menengah');
            $table->enum('status_kependudukan', ['Tetap', 'Pindah', 'Meninggal'])->default('Tetap');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warga_profiles');
        Schema::dropIfExists('kartu_keluargas');
    }
};
