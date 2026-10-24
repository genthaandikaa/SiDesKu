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
        Schema::create('agendas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('desa_id')->default(1)->constrained('desas')->cascadeOnDelete();
            $table->string('judul');
            $table->string('tipe')->default('Pemerintahan');
            $table->string('peserta')->default('Semuanya');
            $table->date('tanggal');
            $table->string('waktu');
            $table->string('tempat');
            $table->text('keterangan')->nullable();
            $table->boolean('is_custom')->default(true);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['desa_id', 'tanggal']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendas');
    }
};

