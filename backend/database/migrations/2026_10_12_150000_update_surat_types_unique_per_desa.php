<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('surat_types', function (Blueprint $table) {
            $table->dropUnique('surat_types_kode_surat_unique');
            $table->unique(['desa_id', 'kode_surat'], 'surat_types_desa_id_kode_surat_unique');
        });
    }

    public function down(): void
    {
        Schema::table('surat_types', function (Blueprint $table) {
            $table->dropUnique('surat_types_desa_id_kode_surat_unique');
            $table->unique('kode_surat', 'surat_types_kode_surat_unique');
        });
    }
};
