<?php

namespace Database\Seeders;

use App\Models\Umkm;
use App\Models\UmkmReview;
use Illuminate\Database\Seeder;

class UmkmSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = __DIR__ . '/data/umkm_50.json';
        if (file_exists($jsonPath)) {
            $data = json_decode(file_get_contents($jsonPath), true);
            $items = $data['umkms'] ?? [];
            $reviews = $data['reviews'] ?? [];

            foreach ($items as $itemData) {
                Umkm::updateOrCreate(
                    ['id' => $itemData['id']],
                    $itemData
                );
            }

            foreach ($reviews as $rev) {
                UmkmReview::firstOrCreate(
                    [
                        'umkm_id' => $rev['umkm_id'],
                        'reviewer_name' => $rev['reviewer_name']
                    ],
                    [
                        'user_id' => $rev['user_id'] ?? null,
                        'rating' => $rev['rating'],
                        'komentar' => $rev['komentar'],
                        'reviewer_rt_rw' => $rev['reviewer_rt_rw'] ?? null,
                        'created_at' => $rev['created_at'] ?? now(),
                    ]
                );
            }
        }
    }
}
