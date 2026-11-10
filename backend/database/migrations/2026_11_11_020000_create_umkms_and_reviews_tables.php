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
        Schema::create('umkms', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->foreignId('desa_id')->nullable()->constrained('desas')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nama');
            $table->string('toko_nama');
            $table->string('kelurahan')->nullable();
            $table->string('rt_rw')->nullable();
            $table->string('kategori');
            $table->string('badge_tag')->nullable();
            $table->decimal('harga', 12, 2)->default(0);
            $table->string('satuan')->nullable();
            $table->text('deskripsi')->nullable();
            $table->longText('foto_url')->nullable();
            $table->json('galeri')->nullable();
            $table->text('alamat')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('wa_kontak', 32)->nullable();
            $table->text('qris_url')->nullable();
            $table->string('qris_nama')->nullable();
            $table->string('qris_nmid')->nullable();
            $table->json('metode_pembayaran')->nullable();
            $table->string('status_toko')->default('Buka');
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('reviews_count')->default(0);
            $table->string('terjual_text')->nullable();
            $table->integer('terjual')->default(0);
            $table->string('buka_jam_text')->nullable();
            $table->boolean('is_jasa')->default(false);
            $table->json('pilihan_ayam')->nullable();
            $table->json('pilihan_sambal')->nullable();
            $table->json('pilihan_layanan_jasa')->nullable();
            $table->string('keterangan_halal')->nullable();
            $table->string('keterangan_higienis')->nullable();
            $table->timestamps();
        });

        Schema::create('umkm_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('umkm_id', 64);
            $table->foreign('umkm_id')->references('id')->on('umkms')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->text('komentar');
            $table->string('reviewer_name');
            $table->string('reviewer_rt_rw')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('umkm_reviews');
        Schema::dropIfExists('umkms');
    }
};
