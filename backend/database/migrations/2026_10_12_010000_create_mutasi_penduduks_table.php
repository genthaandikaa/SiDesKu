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
        Schema::create('mutasi_penduduks', function (Blueprint $table) {
            $table->id();
            $table->enum('jenis_mutasi', ['masuk', 'keluar', 'lahir', 'mati']);
            $table->date('tanggal_peristiwa');
            $table->string('nik', 16)->nullable();
            $table->string('nama_lengkap');
            $table->enum('jenis_kelamin', ['L', 'P'])->default('L');
            $table->foreignId('rt_id')->nullable()->constrained('rts')->nullOnDelete();
            $table->string('alamat_asal')->nullable();
            $table->string('alamat_tujuan')->nullable();
            $table->text('keterangan')->nullable();
            $table->string('nomor_surat_keterangan')->nullable();
            $table->foreignId('dicatat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mutasi_penduduks');
    }
};
