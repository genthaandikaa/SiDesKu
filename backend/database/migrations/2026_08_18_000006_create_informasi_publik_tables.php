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
        Schema::create('beritas', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 255);
            $table->string('slug', 255)->unique();
            $table->string('kategori', 50)->default('Pemerintahan'); // Pemerintahan, Pembangunan, Kegiatan Warga, Pertanian, UMKM
            $table->text('ringkasan')->nullable();
            $table->longText('konten');
            $table->string('gambar_cover')->nullable();
            $table->integer('view_count')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('pengumumans', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 200);
            $table->text('isi');
            $table->enum('level_target', ['Semua', 'Dusun', 'RW', 'RT'])->default('Semua');
            $table->unsignedBigInteger('target_id')->nullable(); // ID Dusun / RW / RT
            $table->string('file_lampiran')->nullable();
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengumumans');
        Schema::dropIfExists('beritas');
    }
};
