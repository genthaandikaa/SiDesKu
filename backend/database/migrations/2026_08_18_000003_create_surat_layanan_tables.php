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
        Schema::create('surat_types', function (Blueprint $table) {
            $table->id();
            $table->string('kode_surat', 20)->unique(); // SKTM, SKU, SKD, SKCK, SKM, SKK
            $table->string('nama_surat', 150);
            $table->string('format_nomor', 100)->default('470/{NO}/418.66.04/{TAHUN}');
            $table->longText('template_body')->nullable();
            $table->json('persyaratan_json')->nullable();
            $table->integer('masa_berlaku_hari')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('surat_requests', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_resi', 40)->unique(); // REQ-20260818-XXXX
            $table->foreignId('warga_profile_id')->constrained('warga_profiles')->cascadeOnDelete();
            $table->foreignId('surat_type_id')->constrained('surat_types')->cascadeOnDelete();
            $table->string('nomor_surat_resmi', 100)->nullable();
            $table->enum('status', [
                'draft',
                'pending_rt',
                'approved_rt',
                'pending_rw',
                'approved_rw',
                'processed_sekdes',
                'completed',
                'rejected'
            ])->default('pending_rt');
            $table->text('keperluan');
            $table->json('form_data_json')->nullable();
            $table->string('file_lampiran')->nullable();
            $table->string('file_surat_pdf')->nullable();
            $table->string('qr_verification_hash', 64)->unique();
            $table->timestamp('ttd_sekdes_at')->nullable();
            $table->timestamp('ttd_kades_at')->nullable();
            $table->text('catatan_penolakan')->nullable();
            $table->timestamps();
        });

        Schema::create('surat_trackings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surat_request_id')->constrained('surat_requests')->cascadeOnDelete();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status_stage', 50); // RT, RW, Sekdes, Sistem
            $table->enum('status_action', ['Diajukan', 'Disetujui', 'Ditolak', 'Revisi', 'Ditandatangani', 'Selesai']);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_trackings');
        Schema::dropIfExists('surat_requests');
        Schema::dropIfExists('surat_types');
    }
};
