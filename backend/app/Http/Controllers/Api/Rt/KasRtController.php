<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use App\Models\KasRtCategory;
use App\Models\KasRtTransaction;
use App\Services\IdempotencyService;
use Illuminate\Http\JsonResponse;
use App\Models\Rw;
use Illuminate\Http\Request;

class KasRtController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');

        // Khusus peran RW: Periksa aktivasi Kas RW opsional
        if ($user->hasRole('rw')) {
            $rwId = $user->getAuthorizedRwId();
            $rw = $rwId ? Rw::find($rwId) : null;
            if (!$rw || $rw->kas_status !== 'active') {
                return response()->json([
                    'success' => false,
                    'kas_status' => $rw ? $rw->kas_status : 'inactive',
                    'alasan' => $rw ? $rw->kas_pengajuan_alasan : null,
                    'catatan_desa' => $rw ? $rw->kas_catatan_desa : null,
                    'message' => 'Fitur Kas RW belum diaktifkan oleh Pemerintah Desa. Silakan ajukan aktivasi terlebih dahulu.',
                ], 403);
            }
        }

        $rtId = $request->query('rt_id', $user->getAuthorizedRtId() ?? ($user->wargaProfile ? $user->wargaProfile->rt_id : null));
        if (!$rtId) {
            $firstRt = \App\Models\Rt::first();
            $rtId = $firstRt ? $firstRt->id : null;
        }

        $transactions = KasRtTransaction::with(['category', 'wargaProfile', 'createdByUser'])
            ->where('rt_id', $rtId)
            ->orderBy('tanggal_transaksi', 'desc')
            ->get();

        $totalMasuk = KasRtTransaction::where('rt_id', $rtId)->where('tipe', 'Pemasukan')->sum('jumlah');
        $totalKeluar = KasRtTransaction::where('rt_id', $rtId)->where('tipe', 'Pengeluaran')->sum('jumlah');
        $saldo = $totalMasuk - $totalKeluar;

        $categories = $rtId ? KasRtCategory::where('rt_id', $rtId)->get() : collect();
        if ($rtId && $categories->isEmpty()) {
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
        $rtId = $request->input('rt_id', $user->getAuthorizedRtId() ?? ($user->wargaProfile ? $user->wargaProfile->rt_id : null));
        if (!$rtId) {
            $firstRt = \App\Models\Rt::first();
            $rtId = $firstRt ? $firstRt->id : null;
        }

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

        // Khusus peran RW: Periksa aktivasi Kas RW opsional
        if ($user->hasRole('rw')) {
            $rwId = $user->getAuthorizedRwId();
            $rw = $rwId ? Rw::find($rwId) : null;
            if (!$rw || $rw->kas_status !== 'active') {
                return response()->json([
                    'success' => false,
                    'kas_status' => $rw ? $rw->kas_status : 'inactive',
                    'message' => 'Fitur Kas RW belum diaktifkan oleh Pemerintah Desa.',
                ], 403);
            }
        }

        $rtId = $request->input('rt_id');
        if (!$rtId && $user->wargaProfile) {
            $rtId = $user->wargaProfile->rt_id;
        }
        if (!$rtId && $user->hasRole('rw')) {
            $firstRt = \App\Models\Rt::where('rw_id', $user->getAuthorizedRwId())->first();
            $rtId = $firstRt ? $firstRt->id : null;
        }
        if (!$rtId) {
            $firstRt = \App\Models\Rt::first();
            $rtId = $firstRt ? $firstRt->id : null;
        }

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

        $idempotencyKey = IdempotencyService::extractKey($request);

        return IdempotencyService::run(
            $user,
            'POST /api/kas-rt/transactions',
            $idempotencyKey,
            $request->all(),
            function () use ($validated) {
                $tx = KasRtTransaction::create($validated);

                return response()->json([
                    'success' => true,
                    'message' => 'Transaksi kas RT berhasil dicatat.',
                    'data' => $tx->load(['category', 'wargaProfile']),
                ], 201);
            }
        );
    }

    public function getRwKasStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $rwId = $user->getAuthorizedRwId();
        if (!$rwId) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak memiliki wilayah RW yang sah.',
            ], 403);
        }

        $rw = Rw::findOrFail($rwId);

        return response()->json([
            'success' => true,
            'data' => [
                'rw_id' => $rw->id,
                'nomor_rw' => $rw->nomor_rw,
                'kas_status' => $rw->kas_status,
                'kas_pengajuan_alasan' => $rw->kas_pengajuan_alasan,
                'kas_catatan_desa' => $rw->kas_catatan_desa,
                'kas_approved_at' => $rw->kas_approved_at?->toIso8601String(),
            ],
        ]);
    }

    public function requestRwActivation(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('rw')) {
            return response()->json(['success' => false, 'message' => 'Hanya Ketua RW yang berwenang mengajukan aktivasi kas RW.'], 403);
        }

        $rwId = $user->getAuthorizedRwId();
        if (!$rwId) {
            return response()->json(['success' => false, 'message' => 'Pengguna tidak memiliki penugasan wilayah RW.'], 403);
        }

        $validated = $request->validate([
            'alasan' => 'required|string|min:10|max:500',
        ], [
            'alasan.required' => 'Alasan permohonan aktivasi Kas RW wajib diisi.',
            'alasan.min' => 'Alasan permohonan aktivasi Kas RW minimal 10 karakter.',
            'alasan.max' => 'Alasan permohonan aktivasi Kas RW maksimal 500 karakter.',
        ]);

        $rw = Rw::findOrFail($rwId);
        $rw->update([
            'kas_status' => 'requested',
            'kas_pengajuan_alasan' => $validated['alasan'],
            'kas_catatan_desa' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan aktivasi kas RW berhasil diajukan ke Pemerintah Desa.',
            'data' => $rw,
        ]);
    }

    public function reviewRwActivation(Request $request, $rwId): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && !$user->hasRole('sekdes') && !$user->hasRole('kades')) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $status = $request->input('status');
        if (!$status && $request->has('action')) {
            $status = $request->input('action') === 'approve' ? 'active' : 'rejected';
            $request->merge(['status' => $status]);
        }

        $validated = $request->validate([
            'status' => 'required|in:active,rejected',
            'catatan' => 'nullable|string|max:500',
        ]);

        $rw = Rw::findOrFail($rwId);
        $rw->update([
            'kas_status' => $validated['status'],
            'kas_catatan_desa' => $validated['catatan'] ?? null,
            'kas_approved_at' => $validated['status'] === 'active' ? now() : null,
            'kas_approved_by_user_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => $validated['status'] === 'active' ? 'Fitur Kas RW berhasil disetujui & diaktifkan.' : 'Permohonan aktivasi Kas RW ditolak.',
            'data' => $rw,
        ]);
    }
}
