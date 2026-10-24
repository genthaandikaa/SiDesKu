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
        // 1. Modify enum columns to varchar(50) for robust state transitions
        DB::statement("ALTER TABLE surat_requests MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending_rt'");
        DB::statement("ALTER TABLE surat_trackings MODIFY COLUMN status_action VARCHAR(50) NOT NULL");

        // 2. Add verification & snapshot columns to surat_requests
        Schema::table('surat_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('surat_requests', 'pemohon_snapshot')) {
                $table->json('pemohon_snapshot')->nullable()->after('form_data_json');
            }
            if (!Schema::hasColumn('surat_requests', 'catatan_koreksi')) {
                $table->text('catatan_koreksi')->nullable()->after('catatan_penolakan');
            }
            if (!Schema::hasColumn('surat_requests', 'verified_rt_user_id')) {
                $table->foreignId('verified_rt_user_id')->nullable()->after('qr_verification_hash')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('surat_requests', 'verified_rt_at')) {
                $table->timestamp('verified_rt_at')->nullable()->after('verified_rt_user_id');
            }
            if (!Schema::hasColumn('surat_requests', 'verifikasi_identitas')) {
                $table->boolean('verifikasi_identitas')->default(false)->after('verified_rt_at');
            }
            if (!Schema::hasColumn('surat_requests', 'verifikasi_domisili')) {
                $table->boolean('verifikasi_domisili')->default(false)->after('verifikasi_identitas');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verified_rt_user_id');
            $table->dropColumn([
                'pemohon_snapshot',
                'catatan_koreksi',
                'verified_rt_at',
                'verifikasi_identitas',
                'verifikasi_domisili',
            ]);
        });
    }
};
