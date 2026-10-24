<?php

namespace App\Http\Controllers\Api\Kades;

use App\Http\Controllers\Controller;
use App\Models\KeputusanKades;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KadesKeputusanController extends Controller
{
    /**
     * Daftar SK Keputusan Kades (Internal Pemerintahan Desa).
     */
    public function index(Request $request): JsonResponse
    {
        $query = KeputusanKades::with('ditetapkanByUser.role')
            ->orderBy('tanggal_tetap', 'desc');

        if ($request->filled('kategori') && $request->kategori !== 'all') {
            $query->where('kategori', $request->query('kategori'));
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('tentang', 'like', "%{$s}%")
                  ->orWhere('nomor_sk', 'like', "%{$s}%")
                  ->orWhere('keterangan', 'like', "%{$s}%");
            });
        }

        $sks = $query->get();

        return response()->json([
            'success' => true,
            'data' => $sks,
            'total' => $sks->count(),
        ]);
    }

    /**
     * Detail SK Keputusan Kades.
     */
    public function show($id): JsonResponse
    {
        $sk = KeputusanKades::with('ditetapkanByUser.role')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $sk,
        ]);
    }

    /**
     * Penetapan SK Keputusan Kades Baru.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('kades') && !$user->hasRole('sekdes') && !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Hanya Kepala Desa atau pejabat berwenang yang dapat menetapkan SK.',
            ], 403);
        }

        $validated = $request->validate([
            'nomor_sk' => 'nullable|string|max:100',
            'tentang' => 'required|string|max:255',
            'kategori' => 'required|string|max:50',
            'tanggal_tetap' => 'nullable|date',
            'status' => 'nullable|string',
            'keterangan' => 'nullable|string',
            'is_public' => 'boolean',
        ], [
            'tentang.required' => 'Judul / Perihal penetapan SK Kepala Desa wajib diisi.',
            'tentang.max' => 'Judul SK maksimal 255 karakter.',
            'kategori.required' => 'Kategori kebijakan desa wajib dipilih.',
        ]);

        if (empty($validated['nomor_sk'])) {
            $count = KeputusanKades::whereYear('created_at', date('Y'))->count() + 1;
            $nextSeq = str_pad($count, 2, '0', STR_PAD_LEFT);
            $validated['nomor_sk'] = "188.45/{$nextSeq}/418.66.04/" . date('Y');
        }

        if (empty($validated['tanggal_tetap'])) {
            $validated['tanggal_tetap'] = date('Y-m-d');
        }

        if (empty($validated['status'])) {
            $validated['status'] = 'Berlaku';
        }

        $validated['ditetapkan_by_user_id'] = $user->id;

        $sk = KeputusanKades::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'SK Keputusan Kepala Desa berhasil ditetapkan secara sah.',
            'data' => $sk->load('ditetapkanByUser'),
        ], 201);
    }

    /**
     * Perbarui SK Keputusan Kades.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('kades') && !$user->hasRole('sekdes') && !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak.',
            ], 403);
        }

        $sk = KeputusanKades::findOrFail($id);

        $validated = $request->validate([
            'nomor_sk' => 'sometimes|required|string|max:100',
            'tentang' => 'sometimes|required|string|max:255',
            'kategori' => 'sometimes|required|string|max:50',
            'tanggal_tetap' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:Berlaku,Dicabut,Diubah',
            'keterangan' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        $sk->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'SK Keputusan Kepala Desa berhasil diperbarui.',
            'data' => $sk->fresh('ditetapkanByUser'),
        ]);
    }

    /**
     * Daftar SK Publik (Transparansi Hukum Desa Tanpa Data Pribadi).
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $desaId = $request->query('desa_id', 1);

        $query = KeputusanKades::withoutGlobalScope('tenant')
            ->where('desa_id', $desaId)
            ->where('is_public', true)
            ->where('status', 'Berlaku')
            ->orderBy('tanggal_tetap', 'desc');

        if ($request->filled('kategori') && $request->kategori !== 'all') {
            $query->where('kategori', $request->query('kategori'));
        }

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('tentang', 'like', "%{$s}%")
                  ->orWhere('nomor_sk', 'like', "%{$s}%");
            });
        }

        $sks = $query->get()->map(function ($sk) {
            return [
                'id' => $sk->id,
                'nomor_sk' => $sk->nomor_sk,
                'tentang' => $sk->tentang,
                'kategori' => $sk->kategori,
                'tanggal_tetap' => $sk->tanggal_tetap?->format('d F Y') ?? '-',
                'status' => $sk->status,
                'keterangan' => $sk->keterangan,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $sks,
        ]);
    }
}
