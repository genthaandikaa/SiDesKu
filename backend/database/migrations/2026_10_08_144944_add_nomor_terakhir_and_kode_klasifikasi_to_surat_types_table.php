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
        Schema::table('surat_types', function (Blueprint $table) {
            $table->string('kode_klasifikasi', 50)->nullable()->after('format_nomor');
            $table->unsignedInteger('nomor_terakhir')->default(0)->after('kode_klasifikasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat_types', function (Blueprint $table) {
            $table->dropColumn(['kode_klasifikasi', 'nomor_terakhir']);
        });
    }
};
