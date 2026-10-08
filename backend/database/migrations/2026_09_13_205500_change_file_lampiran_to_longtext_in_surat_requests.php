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
        Schema::table('surat_requests', function (Blueprint $table) {
            $table->longText('file_lampiran')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat_requests', function (Blueprint $table) {
            $table->string('file_lampiran', 255)->nullable()->change();
        });
    }
};
