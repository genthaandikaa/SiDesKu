<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('pengaduan_wargas')) {
            Schema::table('pengaduan_wargas', function (Blueprint $table) {
                if (!Schema::hasColumn('pengaduan_wargas', 'disposisi_ke')) {
                    $table->string('disposisi_ke', 100)->nullable()->default('Ketua RT')->after('status');
                }
            });

            // Ubah tipe kolom status dari ENUM ke VARCHAR agar fleksibel dan tidak error saat disposisi kustom
            try {
                DB::statement("ALTER TABLE pengaduan_wargas MODIFY COLUMN status VARCHAR(100) NOT NULL DEFAULT 'Menunggu Disposisi'");
            } catch (\Throwable $e) {
                // Ignore if already varchar
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('pengaduan_wargas')) {
            Schema::table('pengaduan_wargas', function (Blueprint $table) {
                if (Schema::hasColumn('pengaduan_wargas', 'disposisi_ke')) {
                    $table->dropColumn('disposisi_ke');
                }
            });
        }
    }
};
