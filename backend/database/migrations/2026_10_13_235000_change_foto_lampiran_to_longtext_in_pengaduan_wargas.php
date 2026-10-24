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
        if (Schema::hasTable('pengaduan_wargas')) {
            Schema::table('pengaduan_wargas', function (Blueprint $table) {
                $table->longText('foto_lampiran')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('pengaduan_wargas')) {
            Schema::table('pengaduan_wargas', function (Blueprint $table) {
                $table->string('foto_lampiran', 255)->nullable()->change();
            });
        }
    }
};
