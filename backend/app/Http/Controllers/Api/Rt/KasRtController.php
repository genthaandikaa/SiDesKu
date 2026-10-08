<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use App\Models\KasRtCategory;
use App\Models\KasRtTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KasRtController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        $rtId = $request->query('rt_id', $user->wargaProfile ? $user->wargaProfile->rt_id : 1);

        $transactions = KasRtTransaction::with(['category', 'wargaProfile', 'createdByUser'])
            ->where('rt_id', $rtId)
            ->orderBy('tanggal_transaksi', 'desc')
            ->get();

        $totalMasuk = KasRtTransaction::where('rt_id', $rtId)->where('tipe', 'Pemasukan')->sum('jumlah');
        $totalKeluar = KasRtTransaction::where('rt_id', $rtId)->where('tipe', 'Pengeluaran')->sum('jumlah');
        $saldo = $totalMasuk - $totalKeluar;

        $categories = KasRtCategory::where('rt_id', $rtId)->get();
        if ($categories->isEmpty()) {
            KasRtCategory::create(['rt_id' => $rtId, 'nama_kategori' => 'Iuran Sampah & Keamanan Bulanan', 'tipe' => 'Pemasukan']);
            KasRtCategory::create(['rt_id' => $rtId, 'nama_kategori' => 'Sumbangan & Donasi Kegiatan Warga', 'tipe' => 'Pemasukan']);
            KasRtCategory::create(['rt_id' => $rtId, 'nama_kategori' => 'Lain-lain (Pemasukan Kas)', 'tipe' => 'Pemasukan']);
            KasRtCategory::create(['rt_id' => $rtId, 'nama_kategori' => 'Perawatan Fasilitas & Lampu Jalan', 'tipe' => 'Pengeluaran']);
            KasRtCategory::create(['rt_id' => $rtId, 'nama_kategori' => 'Kebersihan Lingkungan & Kerja Bakti', 'tipe' => 'Pengeluaran']);
            KasRtCategory::create(['rt_id' => $rtId, 'nama_kategori' => 'Konsumsi & Rapat Warga Lingkungan', 'tipe' => 'Pengeluaran']);
            $categories = KasRtCategory::where('rt_id', $rtId)->get();
        }

        return response()->json([
            'success' => true,
            'rt_id' => (int) $rtId,
            'summary' => [
                'total_masuk' => (float) $totalMasuk,
                'total_keluar' => (float) $totalKeluar,
                'saldo' => (float) $saldo,
            ],
            'categories' => $categories,
            'transactions' => $transactions,
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        $rtId = $request->input('rt_id', $user->wargaProfile ? $user->wargaProfile->rt_id : 1);

        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:100',
            'tipe' => 'required|in:Pemasukan,Pengeluaran',
        ]);

        $cat = KasRtCategory::create([
            'rt_id' => $rtId,
            'nama_kategori' => $validated['nama_kategori'],
            'tipe' => $validated['tipe'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori kas RT berhasil ditambahkan.',
            'data' => $cat,
        ], 201);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        $rtId = $request->input('rt_id', $user->wargaProfile ? $user->wargaProfile->rt_id : 1);

        $tipe = in_array($request->input('tipe'), ['Pemasukan', 'Pengeluaran']) ? $request->input('tipe') : 'Pemasukan';
        $categoryId = $request->input('category_id') ?? $request->input('kas_category_id');

        if (!$categoryId) {
            $defaultName = $tipe === 'Pengeluaran' ? 'Operasional & Perawatan Fasilitas' : 'Iuran Sampah & Kas Warga';
            $defaultCat = KasRtCategory::firstOrCreate(
                ['rt_id' => $rtId, 'nama_kategori' => $defaultName, 'tipe' => $tipe]
            );
            $categoryId = $defaultCat->id;
        }

        $tanggal = $request->input('tanggal_transaksi') ?? $request->input('tanggal') ?? now()->toDateString();

        $request->merge([
            'category_id' => $categoryId,
            'tanggal_transaksi' => $tanggal,
            'tipe' => $tipe,
        ]);

        $validated = $request->validate([
            'category_id' => 'required|exists:kas_rt_categories,id',
            'warga_profile_id' => 'nullable|exists:warga_profiles,id',
            'tanggal_transaksi' => 'required|date',
            'tipe' => 'required|in:Pemasukan,Pengeluaran',
            'jumlah' => 'required|numeric|min:1',
            'keterangan' => 'required|string|max:255',
        ]);

        $validated['rt_id'] = $rtId;
        $validated['created_by_user_id'] = $user->id;

        $tx = KasRtTransaction::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi kas RT berhasil dicatat.',
            'data' => $tx->load(['category', 'wargaProfile']),
        ], 201);
    }
}
