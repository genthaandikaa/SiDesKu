<?php

namespace App\Http\Controllers\Api\Sekdes;

use App\Http\Controllers\Controller;
use App\Models\SuratType;
use App\Services\LetterNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuratSettingController extends Controller
{
    /**
     * Get all surat types with numbering format, classification code, last sequence, and current calendar preview.
     */
    public function index(Request $request): JsonResponse
    {
        $types = SuratType::orderBy('id')->get()->map(function ($st) {
            $preview = LetterNumberService::generateNumber($st);
            return [
                'id' => $st->id,
                'kode_surat' => $st->kode_surat,
                'nama_surat' => $st->nama_surat,
                'kode_klasifikasi' => $st->kode_klasifikasi ?: '470',
                'format_nomor' => $st->format_nomor ?: '{KLASIFIKASI}/{NO}/418.66.04/{BULAN_ROMAWI}/{TAHUN}',
                'nomor_terakhir' => (int)($st->nomor_terakhir ?? 0),
                'nomor_berikutnya' => (int)($st->nomor_terakhir ?? 0) + 1,
                'preview_nomor' => $preview,
                'persyaratan_json' => is_array($st->persyaratan_json) ? $st->persyaratan_json : (json_decode($st->persyaratan_json, true) ?: []),
                'masa_berlaku_hari' => $st->masa_berlaku_hari,
                'is_active' => (bool)$st->is_active,
            ];
        });

        $calendar = LetterNumberService::getCalendarData();

        return response()->json([
            'success' => true,
            'data' => $types,
            'calendar' => $calendar,
        ]);
    }

    /**
     * Update numbering format, classification code, or sequence number for a surat type.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'format_nomor' => 'required|string|max:150',
            'kode_klasifikasi' => 'nullable|string|max:50',
            'nomor_terakhir' => 'required|integer|min:0',
            'nama_surat' => 'nullable|string|max:150',
            'persyaratan_json' => 'nullable',
        ]);

        $suratType = SuratType::findOrFail($id);

        $updateData = [
            'format_nomor' => trim($request->input('format_nomor')),
            'kode_klasifikasi' => trim($request->input('kode_klasifikasi', $suratType->kode_klasifikasi ?: '470')),
            'nomor_terakhir' => (int)$request->input('nomor_terakhir'),
        ];

        if ($request->filled('nama_surat')) {
            $updateData['nama_surat'] = trim($request->input('nama_surat'));
        }

        if ($request->has('persyaratan_json')) {
            $syarat = $request->input('persyaratan_json');
            if (is_string($syarat)) {
                $decoded = json_decode($syarat, true);
                $updateData['persyaratan_json'] = is_array($decoded) ? $decoded : array_filter(array_map('trim', explode("\n", $syarat)));
            } elseif (is_array($syarat)) {
                $updateData['persyaratan_json'] = array_values(array_filter($syarat));
            }
        }

        $suratType->update($updateData);

        $preview = LetterNumberService::generateNumber($suratType);

        return response()->json([
            'success' => true,
            'message' => "Format dan persyaratan surat {$suratType->kode_surat} berhasil diperbarui.",
            'data' => [
                'id' => $suratType->id,
                'kode_surat' => $suratType->kode_surat,
                'nama_surat' => $suratType->nama_surat,
                'kode_klasifikasi' => $suratType->kode_klasifikasi,
                'format_nomor' => $suratType->format_nomor,
                'nomor_terakhir' => (int)$suratType->nomor_terakhir,
                'nomor_berikutnya' => (int)$suratType->nomor_terakhir + 1,
                'preview_nomor' => $preview,
                'persyaratan_json' => $suratType->persyaratan_json ?: [],
            ],
        ]);
    }

    /**
     * Generate preview for a given surat type and optional custom sequence.
     */
    public function preview(Request $request, $id): JsonResponse
    {
        $suratType = SuratType::findOrFail($id);
        $sequence = $request->query('sequence') ? (int)$request->query('sequence') : null;

        $nomor = LetterNumberService::generateNumber($suratType, $sequence);
        $calendar = LetterNumberService::getCalendarData();

        return response()->json([
            'success' => true,
            'data' => [
                'nomor_surat' => $nomor,
                'sequence' => $sequence ?: (($suratType->nomor_terakhir ?? 0) + 1),
                'calendar' => $calendar,
            ],
        ]);
    }
}
