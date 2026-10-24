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
        Schema::table('warga_profiles', function (Blueprint $table) {
            $table->string('foto_kk')->nullable()->after('foto_ktp');
            $table->string('foto_akta_lahir')->nullable()->after('foto_kk');
            $table->string('foto_buku_nikah')->nullable()->after('foto_akta_lahir');
            $table->longText('dokumen_kependudukan_json')->nullable()->after('foto_buku_nikah');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warga_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'foto_kk',
                'foto_akta_lahir',
                'foto_buku_nikah',
                'dokumen_kependudukan_json',
            ]);
        });
    }
};
