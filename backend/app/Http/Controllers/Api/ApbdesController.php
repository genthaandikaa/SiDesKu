<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApbdesCategory;
use App\Models\ApbdesRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApbdesController extends Controller
{
    public function publicSummary(Request $request): JsonResponse
    {
        $tahun = $request->query('tahun', date('Y'));

        $records = ApbdesRecord::with('category')
            ->where('tahun_anggaran', $tahun)
            ->get();

        $totalPendapatanAnggaran = 0;
        $totalPendapatanRealisasi = 0;
        $totalBelanjaAnggaran = 0;
        $totalBelanjaRealisasi = 0;
        $totalPembiayaanAnggaran = 0;
        $totalPembiayaanRealisasi = 0;

        foreach ($records as $r) {
            $jenis = $r->category->jenis ?? 'Belanja';
            if ($jenis === 'Pendapatan') {
                $totalPendapatanAnggaran += (float) $r->anggaran;
                $totalPendapatanRealisasi += (float) $r->realisasi;
            } elseif ($jenis === 'Belanja') {
                $totalBelanjaAnggaran += (float) $r->anggaran;
                $totalBelanjaRealisasi += (float) $r->realisasi;
            } else {
                $totalPembiayaanAnggaran += (float) $r->anggaran;
                $totalPembiayaanRealisasi += (float) $r->realisasi;
            }
        }

        $persenBelanja = $totalBelanjaAnggaran > 0 ? round(($totalBelanjaRealisasi / $totalBelanjaAnggaran) * 100, 1) : 0;
        $persenPendapatan = $totalPendapatanAnggaran > 0 ? round(($totalPendapatanRealisasi / $totalPendapatanAnggaran) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'tahun' => (int) $tahun,
            'summary' => [
                'pendapatan' => [
                    'anggaran' => $totalPendapatanAnggaran,
                    'realisasi' => $totalPendapatanRealisasi,
                    'persen' => $persenPendapatan,
                ],
                'belanja' => [
                    'anggaran' => $totalBelanjaAnggaran,
                    'realisasi' => $totalBelanjaRealisasi,
                    'persen' => $persenBelanja,
                ],
                'pembiayaan' => [
                    'anggaran' => $totalPembiayaanAnggaran,
                    'realisasi' => $totalPembiayaanRealisasi,
                ],
            ],
            'records' => $records,
        ]);
    }

    public function getCategories(): JsonResponse
    {
        $categories = ApbdesCategory::all();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:apbdes_categories,id',
            'tahun_anggaran' => 'required|integer',
            'uraian' => 'required|string|max:255',
            'anggaran' => 'required|numeric|min:0',
            'realisasi' => 'nullable|numeric|min:0',
            'tanggal_realisasi' => 'nullable|date',
        ]);

        $validated['created_by_user_id'] = $request->user()->id;

        $record = ApbdesRecord::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pos APBDes berhasil ditambahkan.',
            'data' => $record->load('category'),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $record = ApbdesRecord::findOrFail($id);

        $validated = $request->validate([
            'uraian' => 'sometimes|required|string|max:255',
            'anggaran' => 'sometimes|required|numeric|min:0',
            'realisasi' => 'nullable|numeric|min:0',
            'tanggal_realisasi' => 'nullable|date',
        ]);

        $record->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pos APBDes berhasil diperbarui.',
            'data' => $record->load('category'),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $record = ApbdesRecord::findOrFail($id);
        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pos APBDes berhasil dihapus.',
        ]);
    }
}
