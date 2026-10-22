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
        // 1. Tambah kolom alur persetujuan Kades & Sekdes pada surat_requests
        Schema::table('surat_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('surat_requests', 'approved_kades_user_id')) {
                $table->foreignId('approved_kades_user_id')->nullable()->after('verified_rt_at')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('surat_requests', 'rejected_kades_user_id')) {
                $table->foreignId('rejected_kades_user_id')->nullable()->after('approved_kades_user_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('surat_requests', 'catatan_penolakan_kades')) {
                $table->text('catatan_penolakan_kades')->nullable()->after('catatan_koreksi');
            }
            if (!Schema::hasColumn('surat_requests', 'processed_sekdes_user_id')) {
                $table->foreignId('processed_sekdes_user_id')->nullable()->after('rejected_kades_user_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('surat_requests', 'processed_sekdes_at')) {
                $table->timestamp('processed_sekdes_at')->nullable()->after('processed_sekdes_user_id');
            }
        });

        // 2. Tambah kolom state machine persetujuan Kades pada pengumumans
        Schema::table('pengumumans', function (Blueprint $table) {
            if (!Schema::hasColumn('pengumumans', 'status')) {
                $table->string('status', 50)->default('draft')->after('status_label');
            }
            if (!Schema::hasColumn('pengumumans', 'approved_by_kades_user_id')) {
                $table->foreignId('approved_by_kades_user_id')->nullable()->after('is_active')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('pengumumans', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by_kades_user_id');
            }
            if (!Schema::hasColumn('pengumumans', 'catatan_penolakan_kades')) {
                $table->text('catatan_penolakan_kades')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('pengumumans', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('catatan_penolakan_kades');
            }
        });

        // Backfill data pengumuman eksisting yang aktif agar tetap tampil di publik
        DB::table('pengumumans')
            ->where('is_active', true)
            ->where('status', 'draft')
            ->update([
                'status' => 'published',
                'published_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_kades_user_id');
            $table->dropConstrainedForeignId('rejected_kades_user_id');
            $table->dropConstrainedForeignId('processed_sekdes_user_id');
            $table->dropColumn([
                'catatan_penolakan_kades',
                'processed_sekdes_at',
            ]);
        });

        Schema::table('pengumumans', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_by_kades_user_id');
            $table->dropColumn([
                'status',
                'approved_at',
                'catatan_penolakan_kades',
                'published_at',
            ]);
        });
    }
};
