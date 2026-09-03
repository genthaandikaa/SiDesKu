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
        Schema::create('apbdes_categories', function (Blueprint $table) {
            $table->id();
            $table->enum('jenis', ['Pendapatan', 'Belanja', 'Pembiayaan']);
            $table->string('kode_rekening', 30); // 1.1, 2.1, 2.2, etc
            $table->string('nama_kategori', 150);
            $table->timestamps();
        });

        Schema::create('apbdes_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('apbdes_categories')->cascadeOnDelete();
            $table->year('tahun_anggaran');
            $table->string('uraian', 255);
            $table->decimal('anggaran', 15, 2)->default(0);
            $table->decimal('realisasi', 15, 2)->default(0);
            $table->date('tanggal_realisasi')->nullable();
            $table->string('bukti_transaksi_file')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('kas_rt_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rt_id')->constrained('rts')->cascadeOnDelete();
            $table->string('nama_kategori', 100);
            $table->enum('tipe', ['Pemasukan', 'Pengeluaran']);
            $table->timestamps();
        });

        Schema::create('kas_rt_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rt_id')->constrained('rts')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('kas_rt_categories')->cascadeOnDelete();
            $table->foreignId('warga_profile_id')->nullable()->constrained('warga_profiles')->nullOnDelete();
            $table->date('tanggal_transaksi');
            $table->enum('tipe', ['Pemasukan', 'Pengeluaran']);
            $table->decimal('jumlah', 15, 2);
            $table->string('keterangan', 255);
            $table->string('bukti_pembayaran_file')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kas_rt_transactions');
        Schema::dropIfExists('kas_rt_categories');
        Schema::dropIfExists('apbdes_records');
        Schema::dropIfExists('apbdes_categories');
    }
};
