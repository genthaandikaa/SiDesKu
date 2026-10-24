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
        Schema::table('pengumumans', function (Blueprint $table) {
            $table->string('kategori', 50)->default('Umum')->after('judul');
            $table->string('oleh', 150)->default('Pemerintah Desa Doko')->after('kategori');
            $table->string('status_label', 50)->default('Penting')->after('oleh');
            $table->foreignId('bantuan_sosial_id')->nullable()->after('status_label')->constrained('bantuan_sosials')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengumumans', function (Blueprint $table) {
            $table->dropForeign(['bantuan_sosial_id']);
            $table->dropColumn(['bantuan_sosial_id', 'status_label', 'oleh', 'kategori']);
        });
    }
};
