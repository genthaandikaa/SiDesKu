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
        // 1. Tambah riwayat_tanggapan pada tabel pengaduan_wargas
        if (Schema::hasTable('pengaduan_wargas')) {
            Schema::table('pengaduan_wargas', function (Blueprint $table) {
                if (!Schema::hasColumn('pengaduan_wargas', 'riwayat_tanggapan')) {
                    $table->json('riwayat_tanggapan')->nullable()->after('tanggapan');
                }
            });
        }

        // 2. Tambah kolom aktivasi kas opsional pada tabel rws
        if (Schema::hasTable('rws')) {
            Schema::table('rws', function (Blueprint $table) {
                if (!Schema::hasColumn('rws', 'kas_status')) {
                    $table->string('kas_status', 30)->default('inactive')->after('ketua_rw_user_id');
                }
                if (!Schema::hasColumn('rws', 'kas_pengajuan_alasan')) {
                    $table->text('kas_pengajuan_alasan')->nullable()->after('kas_status');
                }
                if (!Schema::hasColumn('rws', 'kas_catatan_desa')) {
                    $table->text('kas_catatan_desa')->nullable()->after('kas_pengajuan_alasan');
                }
                if (!Schema::hasColumn('rws', 'kas_approved_at')) {
                    $table->timestamp('kas_approved_at')->nullable()->after('kas_catatan_desa');
                }
                if (!Schema::hasColumn('rws', 'kas_approved_by_user_id')) {
                    $table->foreignId('kas_approved_by_user_id')->nullable()->after('kas_approved_at')->constrained('users')->nullOnDelete();
                }
            });
        }

        // 3. Tambah tabel keputusan_kades (SK Kepala Desa) jika belum ada
        if (!Schema::hasTable('keputusan_kades')) {
            Schema::create('keputusan_kades', function (Blueprint $table) {
                $table->id();
                $table->foreignId('desa_id')->nullable()->constrained('desas')->cascadeOnDelete();
                $table->string('nomor_sk', 100);
                $table->string('tentang', 255);
                $table->string('kategori', 50)->default('Tata Kelola'); // Tata Kelola, Kelembagaan, Pembangunan, Keuangan, Kebijakan
                $table->date('tanggal_tetap');
                $table->string('status', 30)->default('Berlaku'); // Berlaku, Dicabut, Diubah
                $table->text('keterangan')->nullable();
                $table->boolean('is_public')->default(true);
                $table->foreignId('ditetapkan_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });

            // Backfill data SK resmi eksisting untuk Desa Doko (Tenant 1)
            DB::table('keputusan_kades')->insert([
                [
                    'desa_id' => 1,
                    'nomor_sk' => '188.45/01/418.66.04/2026',
                    'tentang' => 'Penetapan APBDes Tahun Anggaran 2026 Desa Doko',
                    'kategori' => 'Keuangan',
                    'tanggal_tetap' => '2026-01-05',
                    'status' => 'Berlaku',
                    'keterangan' => 'Pagu anggaran belanja dan pendapatan desa tahun anggaran berjalan.',
                    'is_public' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'desa_id' => 1,
                    'nomor_sk' => '188.45/02/418.66.04/2026',
                    'tentang' => 'Pengangkatan dan Pengukuhan Pengurus Rukun Tetangga (RT) dan Rukun Warga (RW) Masa Bakti 2026-2031',
                    'kategori' => 'Kelembagaan',
                    'tanggal_tetap' => '2026-02-02',
                    'status' => 'Berlaku',
                    'keterangan' => 'Mencakup 13 RT dan 3 RW di seluruh wilayah Desa Doko.',
                    'is_public' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'desa_id' => 1,
                    'nomor_sk' => '188.45/03/418.66.04/2026',
                    'tentang' => 'Pembentukan Tim Pelaksana Kegiatan (TPK) Pembangunan Drainase & Rabat Beton Lingkungan Krajan',
                    'kategori' => 'Pembangunan',
                    'tanggal_tetap' => '2026-03-18',
                    'status' => 'Berlaku',
                    'keterangan' => 'Sumber dana Dana Desa Tahap I dengan skema padat karya tunai desa.',
                    'is_public' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'desa_id' => 1,
                    'nomor_sk' => '188.45/04/418.66.04/2026',
                    'tentang' => 'Penetapan Standar Operasional Prosedur Pelayanan Surat Mandiri Tanpa Perantara RW',
                    'kategori' => 'Tata Kelola',
                    'tanggal_tetap' => '2026-04-10',
                    'status' => 'Berlaku',
                    'keterangan' => 'Pemberlakuan alur cepat pelayanan digital RT langsung ke Balai Desa.',
                    'is_public' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // 4. Tambah kolom tanda_tangan_url pada desa_settings jika belum ada
        if (Schema::hasTable('desa_settings')) {
            Schema::table('desa_settings', function (Blueprint $table) {
                if (!Schema::hasColumn('desa_settings', 'ttd_kades_url')) {
                    $table->string('ttd_kades_url')->nullable()->after('nama_kades');
                }
                if (!Schema::hasColumn('desa_settings', 'ttd_sekdes_url')) {
                    $table->string('ttd_sekdes_url')->nullable()->after('nama_sekdes');
                }
                if (!Schema::hasColumn('desa_settings', 'ttd_bendahara_url')) {
                    $table->string('ttd_bendahara_url')->nullable()->after('ttd_sekdes_url');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('keputusan_kades');

        if (Schema::hasTable('rws')) {
            Schema::table('rws', function (Blueprint $table) {
                $table->dropConstrainedForeignId('kas_approved_by_user_id');
                $table->dropColumn([
                    'kas_status',
                    'kas_pengajuan_alasan',
                    'kas_catatan_desa',
                    'kas_approved_at',
                ]);
            });
        }

        if (Schema::hasTable('pengaduan_wargas')) {
            Schema::table('pengaduan_wargas', function (Blueprint $table) {
                $table->dropColumn('riwayat_tanggapan');
            });
        }

        if (Schema::hasTable('desa_settings')) {
            Schema::table('desa_settings', function (Blueprint $table) {
                $table->dropColumn([
                    'ttd_kades_url',
                    'ttd_sekdes_url',
                    'ttd_bendahara_url',
                ]);
            });
        }
    }
};
