<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RegionalRoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Kecamatan',
                'slug' => 'kecamatan',
                'display_name' => 'Pemerintah Kecamatan',
                'description' => 'Pemantauan agregat layanan desa pada kecamatan yang menjadi wilayah tugas akun.',
            ],
            [
                'name' => 'Kabupaten/Kota',
                'slug' => 'kabupaten_kota',
                'display_name' => 'Pemerintah Kabupaten/Kota',
                'description' => 'Pemantauan agregat layanan desa pada kabupaten/kota yang menjadi wilayah tugas akun.',
            ],
        ];

        $roleMap = [];
        foreach ($roles as $attributes) {
            $roleMap[$attributes['slug']] = Role::updateOrCreate(
                ['slug' => $attributes['slug']],
                $attributes,
            );
        }

        $accounts = [
            [
                'role' => 'kecamatan',
                'username' => env('NEXORA_KECAMATAN_USERNAME', 'kecamatan01'),
                'email' => 'kecamatan.ngasem@nexora.local',
                'name' => 'Petugas Kecamatan Ngasem',
                'password' => env('NEXORA_KECAMATAN_PASSWORD'),
            ],
            [
                'role' => 'kabupaten_kota',
                'username' => env('NEXORA_KABUPATEN_USERNAME', 'kabupaten01'),
                'email' => 'admin.kediri@nexora.local',
                'name' => 'Petugas Kabupaten Kediri',
                'password' => env('NEXORA_KABUPATEN_PASSWORD'),
            ],
        ];

        foreach ($accounts as $account) {
            if (!filled($account['password'])) {
                $this->command?->warn("Akun {$account['username']} tidak dibuat karena password env belum diatur.");
                continue;
            }

            User::updateOrCreate(
                ['username' => $account['username']],
                [
                    'role_id' => $roleMap[$account['role']]->id,
                    'desa_id' => 1,
                    'name' => $account['name'],
                    'email' => $account['email'],
                    'password' => Hash::make($account['password']),
                    'is_active' => true,
                ],
            );
        }
    }
}
