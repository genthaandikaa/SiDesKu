<?php

namespace App\Http\Controllers\Api\Sekdes;

use App\Http\Controllers\Controller;
use App\Models\MutasiPenduduk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MutasiPendudukController extends Controller
{
    /**
     * Get list of village population mutations.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MutasiPenduduk::with(['rt.rw.dusun', 'petugas']);

        if ($request->filled('jenis_mutasi') && $request->query('jenis_mutasi') !== 'all') {
            $query->where('jenis_mutasi', $request->query('jenis_mutasi'));
        }

        if ($request->filled('search')) {
            $s = trim($request->query('search'));
            $query->where(function ($q) use ($s) {
                $q->where('nama_lengkap', 'like', "%{$s}%")
                  ->orWhere('nik', 'like', "%{$s}%")
                  ->orWhere('nomor_surat_keterangan', 'like', "%{$s}%");
            });
        }

        if ($request->filled('rt_id')) {
            $query->where('rt_id', $request->query('rt_id'));
        }

        $records = $query->orderBy('tanggal_peristiwa', 'desc')->get();

        // Calculate summary metrics
        $summary = [
            'total' => MutasiPenduduk::count(),
            'masuk' => MutasiPenduduk::where('jenis_mutasi', 'masuk')->count(),
            'keluar' => MutasiPenduduk::where('jenis_mutasi', 'keluar')->count(),
            'lahir' => MutasiPenduduk::where('jenis_mutasi', 'lahir')->count(),
            'mati' => MutasiPenduduk::where('jenis_mutasi', 'mati')->count(),
        ];

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'data' => $records,
        ]);
    }

    /**
     * Record a new population mutation.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'jenis_mutasi' => 'required|in:masuk,keluar,lahir,mati',
            'tanggal_peristiwa' => 'required|date',
            'nama_lengkap' => 'required|string|max:255',
            'nik' => 'nullable|string|max:16',
            'jenis_kelamin' => 'required|in:L,P',
            'rt_id' => 'required|exists:rts,id',
            'alamat_asal' => 'nullable|string|max:255',
            'alamat_tujuan' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string|max:500',
            'nomor_surat_keterangan' => 'nullable|string|max:100',
        ]);

        $validated['dicatat_oleh'] = $request->user()?->id;

        $record = MutasiPenduduk::create($validated);
        $record->load(['rt.rw.dusun', 'petugas']);

        return response()->json([
            'success' => true,
            'message' => 'Catatan mutasi kependudukan berhasil disimpan di Buku Administrasi Desa.',
            'data' => $record,
        ], 201);
    }

    /**
     * Delete mutation record.
     */
    public function destroy($id): JsonResponse
    {
        $record = MutasiPenduduk::findOrFail($id);
        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catatan mutasi berhasil dihapus.',
        ]);
    }
}
