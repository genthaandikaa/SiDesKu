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
        // 1. Buat tabel master tenant desas jika belum ada
        if (!Schema::hasTable('desas')) {
            Schema::create('desas', function (Blueprint $table) {
                $table->id();
                $table->string('nama_desa', 100);
                $table->string('kode_desa', 30)->unique();
                $table->string('kecamatan', 100);
                $table->string('kabupaten', 100);
                $table->string('provinsi', 100)->default('Jawa Timur');
                $table->string('kode_pos', 10)->default('64182');
                $table->string('alamat_kantor')->default('Jl. Raya Doko No. 12, Kec. Ngasem, Kab. Kediri');
                $table->string('telepon', 25)->nullable();
                $table->string('email', 100)->nullable();
                $table->string('website', 150)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Backfill data master Desa Doko sebagai Tenant 1
        $existingSetting = DB::table('desa_settings')->first();
        DB::table('desas')->updateOrInsert(
            ['id' => 1],
            [
                'nama_desa' => $existingSetting->nama_desa ?? 'Desa Doko',
                'kode_desa' => $existingSetting->kode_desa ?? '35.06.04.2001',
                'kecamatan' => $existingSetting->kecamatan ?? 'Kecamatan Ngasem',
                'kabupaten' => $existingSetting->kabupaten ?? 'Kabupaten Kediri',
                'provinsi' => $existingSetting->provinsi ?? 'Jawa Timur',
                'kode_pos' => $existingSetting->kode_pos ?? '64182',
                'alamat_kantor' => $existingSetting->alamat_kantor ?? 'Jl. Raya Doko No. 12, Kec. Ngasem, Kab. Kediri',
                'telepon' => $existingSetting->telepon ?? '0354-681234',
                'email' => $existingSetting->email ?? 'pemdes.doko@kedirikab.go.id',
                'website' => $existingSetting->website ?? 'https://doko.kedirikab.go.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 3. Tambahkan kolom desa_id (nullable terlebih dahulu untuk keamanan backfill)
        $operationalTables = [
            'desa_settings',
            'users',
            'dusuns',
            'rws',
            'rts',
            'kartu_keluargas',
            'warga_profiles',
            'surat_types',
            'surat_requests',
            'surat_trackings',
            'apbdes_categories',
            'apbdes_records',
            'kas_rt_categories',
            'kas_rt_transactions',
            'bantuan_sosials',
            'bantuan_penerimas',
            'pengaduan_wargas',
            'notifikasi_logs',
            'beritas',
            'pengumumans',
            'mutasi_penduduks',
            'activity_logs',
            'idempotency_keys',
        ];

        foreach ($operationalTables as $tableName) {
            if (Schema::hasTable($tableName) && !Schema::hasColumn($tableName, 'desa_id')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $table->unsignedBigInteger('desa_id')->nullable()->after('id')->index();
                });
            }
        }

        // 4. Backfill seluruh data existing ke Tenant 1 (Desa Doko)
        foreach ($operationalTables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'desa_id')) {
                DB::table($tableName)->whereNull('desa_id')->update(['desa_id' => 1]);
            }
        }

        // 5. Foreign Key Constraints & Indexing
        foreach ($operationalTables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'desa_id')) {
                // Buat foreign key aman jika belum ada
                try {
                    Schema::table($tableName, function (Blueprint $table) {
                        $table->foreign('desa_id')->references('id')->on('desas')->cascadeOnDelete();
                    });
                } catch (\Throwable $e) {
                    // Foreign key sudah ada atau constraint skip
                }
            }
        }

        // 6. Pemisahan Role: Update role lama dan buat role super_admin
        if (Schema::hasTable('roles')) {
            // Update role lama id 1 menjadi admin_desa
            DB::table('roles')->where('id', 1)->update([
                'name' => 'Admin Desa',
                'slug' => 'admin_desa',
                'display_name' => 'Administrator Desa',
                'description' => 'Akses penuh administrasi dan operasional untuk desa bersangkutan',
            ]);

            // Buat role super_admin jika belum ada
            $superAdminRole = DB::table('roles')->where('slug', 'super_admin')->first();
            if (!$superAdminRole) {
                DB::table('roles')->insert([
                    'name' => 'Super Admin',
                    'slug' => 'super_admin',
                    'display_name' => 'Super Administrator Platform',
                    'description' => 'Pengelola multi-tenant platform SiDesKu lintas desa',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $operationalTables = [
            'desa_settings',
            'users',
            'dusuns',
            'rws',
            'rts',
            'kartu_keluargas',
            'warga_profiles',
            'surat_types',
            'surat_requests',
            'surat_trackings',
            'apbdes_categories',
            'apbdes_records',
            'kas_rt_categories',
            'kas_rt_transactions',
            'bantuan_sosials',
            'bantuan_penerimas',
            'pengaduan_wargas',
            'notifikasi_logs',
            'beritas',
            'pengumumans',
            'mutasi_penduduks',
            'activity_logs',
            'idempotency_keys',
        ];

        foreach ($operationalTables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'desa_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropForeign(['desa_id']);
                    $table->dropColumn('desa_id');
                });
            }
        }

        Schema::dropIfExists('desas');
    }
};
