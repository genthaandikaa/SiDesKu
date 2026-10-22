<?php

namespace App\Http\Controllers\Api\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\ApbdesCategory;
use App\Models\ApbdesRecord;
use App\Services\TenantSecurityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApbdesController extends Controller
{
    public function publicSummary(Request $request): JsonResponse
    {
        $tahun = $request->query('tahun', date('Y'));
        $user = $request->user('sanctum');
        $desaId = $user ? $user->desa_id : ($request->query('desa_id') ?? 1);

        $records = ApbdesRecord::withoutGlobalScope('tenant')
            ->with('category')
            ->where('desa_id', $desaId)
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

        $latestRecord = $records->sortByDesc('updated_at')->first();
        $lastUpdatedAt = $latestRecord ? $latestRecord->updated_at?->toIso8601String() : null;
        $isPublished = $records->isNotEmpty();
        $desaObj = \App\Models\Desa::withoutGlobalScope('tenant')->find($desaId);
        $namaDesa = $desaObj ? $desaObj->nama_desa : 'Doko';

        return response()->json([
            'success' => true,
            'tahun' => (int) $tahun,
            'desa_id' => (int) $desaId,
            'nama_desa' => $namaDesa,
            'last_updated_at' => $lastUpdatedAt,
            'is_published' => $isPublished,
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

        $category = ApbdesCategory::withoutGlobalScope('tenant')->findOrFail($validated['category_id']);
        TenantSecurityService::enforceUserTenant($request->user(), $category->desa_id);

        $validated['desa_id'] = $request->user()->desa_id;
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
        $record = ApbdesRecord::withoutGlobalScope('tenant')->findOrFail($id);
        TenantSecurityService::enforceUserTenant($request->user(), $record->desa_id);

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

    public function destroy(Request $request, $id): JsonResponse
    {
        $record = ApbdesRecord::withoutGlobalScope('tenant')->findOrFail($id);
        TenantSecurityService::enforceUserTenant($request->user(), $record->desa_id);

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pos APBDes berhasil dihapus.',
        ]);
    }
}
