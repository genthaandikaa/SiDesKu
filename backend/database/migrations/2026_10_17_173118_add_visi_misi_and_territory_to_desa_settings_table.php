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
        Schema::table('desa_settings', function (Blueprint $table) {
            $table->text('visi')->nullable()->after('alamat_kantor');
            $table->text('misi')->nullable()->after('visi');
            $table->json('struktur_organisasi_json')->nullable()->after('misi');
            $table->longText('territory_geojson')->nullable()->after('struktur_organisasi_json');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('desa_settings', function (Blueprint $table) {
            $table->dropColumn(['visi', 'misi', 'struktur_organisasi_json', 'territory_geojson']);
        });
    }
};
