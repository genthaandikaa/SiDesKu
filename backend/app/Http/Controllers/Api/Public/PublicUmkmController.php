<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Umkm;
use App\Models\UmkmReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PublicUmkmController extends Controller
{
    /**
     * List UMKM items with search, filters, distance calculation, and sorting.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Umkm::query()->with('reviews');

        // Search query
        if ($search = $request->input('q', $request->input('search'))) {
            $s = trim(strtolower($search));
            $query->where(function ($q) use ($s) {
                $q->whereRaw('LOWER(nama) LIKE ?', ["%{$s}%"])
                    ->orWhereRaw('LOWER(toko_nama) LIKE ?', ["%{$s}%"])
                    ->orWhereRaw('LOWER(kategori) LIKE ?', ["%{$s}%"])
                    ->orWhereRaw('LOWER(deskripsi) LIKE ?', ["%{$s}%"])
                    ->orWhereRaw('LOWER(alamat) LIKE ?', ["%{$s}%"]);
            });
        }

        // Category filter
        if ($kategori = $request->input('kategori')) {
            if ($kategori !== 'Semua' && $kategori !== 'all') {
                $query->where('kategori', $kategori);
            }
        }

        // Delivery filter
        if ($delivery = $request->input('delivery')) {
            if ($delivery === 'cod') {
                $query->where('metode_pembayaran->cod', true);
            } elseif ($delivery === 'do') {
                $query->where('metode_pembayaran->do', true);
            }
        }

        // Payment filter
        if ($payment = $request->input('payment')) {
            if ($payment === 'qris') {
                $query->where('metode_pembayaran->qris', true);
            } elseif ($payment === 'cod') {
                $query->where('metode_pembayaran->cod', true);
            }
        }

        // Rating filter
        if ($minRating = $request->input('min_rating')) {
            $query->where('rating', '>=', (float) $minRating);
        }

        $items = $query->get();

        // Distance calculation & filter if user coordinates provided
        $userLat = $request->input('user_lat');
        $userLng = $request->input('user_lng');
        $maxDistance = $request->input('max_distance');

        if ($userLat !== null && $userLng !== null) {
            $uLat = (float) $userLat;
            $uLng = (float) $userLng;

            $items = $items->map(function ($item) use ($uLat, $uLng) {
                $dist = $this->calculateDistance($uLat, $uLng, (float) $item->lat, (float) $item->lng);
                $item->calculated_distance_km = $dist;
                return $item;
            });

            if ($maxDistance && is_numeric($maxDistance) && (float) $maxDistance > 0) {
                $maxDistKm = (float) $maxDistance;
                $items = $items->filter(function ($item) use ($maxDistKm) {
                    return ($item->calculated_distance_km ?? 0) <= $maxDistKm;
                })->values();
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'distance');
        if ($sortBy === 'distance' && $userLat !== null && $userLng !== null) {
            $items = $items->sortBy('calculated_distance_km')->values();
        } elseif ($sortBy === 'rating') {
            $items = $items->sortByDesc('rating')->values();
        } elseif ($sortBy === 'price') {
            $items = $items->sortBy('harga')->values();
        } elseif ($sortBy === 'popular') {
            $items = $items->sortByDesc('terjual')->values();
        }

        return response()->json([
            'success' => true,
            'total' => $items->count(),
            'data' => $items
        ]);
    }

    /**
     * Show single UMKM details with its reviews.
     */
    public function show($id): JsonResponse
    {
        $umkm = Umkm::with(['reviews' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])->find($id);

        if (!$umkm) {
            return response()->json([
                'success' => false,
                'message' => 'Produk atau layanan UMKM tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $umkm
        ]);
    }

    /**
     * Get reviews for a specific UMKM item.
     */
    public function reviews($id): JsonResponse
    {
        $umkm = Umkm::find($id);
        if (!$umkm) {
            return response()->json([
                'success' => false,
                'message' => 'Produk UMKM tidak ditemukan.'
            ], 404);
        }

        $reviews = UmkmReview::where('umkm_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'total' => $reviews->count(),
            'data' => $reviews
        ]);
    }

    /**
     * Store citizen review for an UMKM item (Requires Citizen Auth).
     */
    public function storeReview(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Anda harus login sebagai warga terdaftar untuk menulis ulasan.'
            ], 401);
        }

        $umkm = Umkm::find($id);
        if (!$umkm) {
            return response()->json([
                'success' => false,
                'message' => 'Produk UMKM tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'required|string|min:3|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get citizen details from profile if available
        $reviewerName = $user->name ?? 'Warga Kediri';
        $rtRw = null;
        if (method_exists($user, 'wargaProfile') && $user->wargaProfile) {
            $profile = $user->wargaProfile;
            $rtObj = $profile->rt;
            $rtNum = is_object($rtObj) ? ($rtObj->nomor_rt ?? null) : (is_scalar($rtObj) ? $rtObj : null);
            $rwNum = is_object($rtObj) && is_object($rtObj->rw) ? ($rtObj->rw->nomor_rw ?? null) : null;

            $parts = [];
            if ($rtNum) {
                $parts[] = 'RT ' . $rtNum;
            }
            if ($rwNum) {
                $parts[] = 'RW ' . $rwNum;
            }
            $rtRw = !empty($parts) ? implode(' / ', $parts) : null;
        }

        $review = UmkmReview::create([
            'umkm_id' => $umkm->id,
            'user_id' => $user->id,
            'rating' => (int) $request->input('rating'),
            'komentar' => trim($request->input('komentar')),
            'reviewer_name' => $reviewerName,
            'reviewer_rt_rw' => $rtRw ?: 'Warga Setempat',
        ]);

        // Recalculate average rating & reviews_count
        $avgRating = UmkmReview::where('umkm_id', $umkm->id)->avg('rating') ?: 5.0;
        $count = UmkmReview::where('umkm_id', $umkm->id)->count();

        $umkm->update([
            'rating' => round($avgRating, 1),
            'reviews_count' => $count,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ulasan berhasil dikirim!',
            'data' => $review,
            'updated_umkm' => [
                'rating' => $umkm->rating,
                'reviews_count' => $umkm->reviews_count,
            ]
        ], 201);
    }

    /**
     * Store new UMKM item created by authenticated citizen.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya warga terdaftar yang dapat membuka toko atau mengunggah produk.'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'kategori' => 'required|string|max:100',
            'harga' => 'required|numeric|min:0',
            'ongkir' => 'nullable|numeric|min:0',
            'satuan' => 'nullable|string|max:50',
            'deskripsi' => 'nullable|string|max:2000',
            'foto_url' => 'nullable|string',
            'alamat' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'wa_kontak' => 'nullable|string|max:32',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $id = 'umkm-' . time() . '-' . rand(100, 999);
        $tokoNama = $request->input('toko_nama') ?: ($user->name ? "Usaha {$user->name}" : 'Warung Warga');

        $umkm = Umkm::create([
            'id' => $id,
            'desa_id' => $user->desa_id ?? 1,
            'user_id' => $user->id,
            'nama' => $request->input('nama'),
            'toko_nama' => $tokoNama,
            'kelurahan' => $request->input('kelurahan', 'Kel. Sukamaju'),
            'rt_rw' => $request->input('rt_rw', 'RT 03 / RW 04'),
            'kategori' => $request->input('kategori'),
            'badge_tag' => $request->input('badge_tag', 'PRODUKSI SENDIRI'),
            'harga' => (float) $request->input('harga'),
            'ongkir' => (float) $request->input('ongkir', 0),
            'satuan' => $request->input('satuan', 'Porsi'),
            'deskripsi' => $request->input('deskripsi', 'Produk segar olahan warga lokal tanpa bahan pengawet.'),
            'foto_url' => $request->input('foto_url', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'),
            'galeri' => [$request->input('foto_url', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80')],
            'alamat' => $request->input('alamat', 'Kota Kediri'),
            'lat' => $request->input('lat', -7.8166),
            'lng' => $request->input('lng', 112.0118),
            'wa_kontak' => $request->input('wa_kontak', '6281234567801'),
            'qris_url' => $request->input('qris_url', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SIDESKU_QRIS_DEMO'),
            'qris_nama' => 'QRIS ' . strtoupper($tokoNama),
            'qris_nmid' => 'ID10293847281',
            'metode_pembayaran' => [
                'qris' => (bool) $request->input('qris', true),
                'cod' => (bool) $request->input('cod', true),
                'do' => true,
                'transfer' => true,
            ],
            'status_toko' => 'Buka',
            'rating' => 5.0,
            'reviews_count' => 0,
            'terjual_text' => 'Baru • Fresh Cook',
            'terjual' => 1,
            'buka_jam_text' => $request->input('buka_jam_text', '15 - 30 Menit (Fresh Cook)'),
            'is_jasa' => $request->input('kategori') === 'Jasa Panggilan',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produk UMKM berhasil dipublikasikan!',
            'data' => $umkm
        ], 201);
    }

    /**
     * Get UMKM items owned by authenticated citizen.
     */
    public function myUmkms(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => []
            ], 401);
        }

        $items = Umkm::where('user_id', $user->id)
            ->with('reviews')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    /**
     * Delete an UMKM item owned by authenticated citizen.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $umkm = Umkm::where('id', $id)->first();
        if (!$umkm) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan.'
            ], 404);
        }

        if ($umkm->user_id && (int) $umkm->user_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk menghapus produk ini.'
            ], 403);
        }

        $umkm->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus.'
        ]);
    }

    /**
     * Haversine formula calculation in kilometers.
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        if (!$lat1 || !$lon1 || !$lat2 || !$lon2) return 0;
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadius * $c, 1);
    }
}
