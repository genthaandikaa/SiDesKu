<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    /**
     * Get list of agendas with audience filtering based on user role.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $desaId = $user ? ($user->desa_id ?? 1) : (int) ($request->query('desa_id') ?? 1);

        $query = Agenda::where('desa_id', $desaId)
            ->orderBy('is_custom', 'desc')
            ->orderBy('id', 'desc');

        // Filter based on user role
        // Warga: only sees general village agendas (never sees agendas specifically for RT or RW)
        if (!$user || $user->hasRole('warga')) {
            $query->whereNotIn('peserta', ['RT', 'RW', 'RT & RW', 'Pengurus RT', 'Pengurus RW']);
        } elseif ($user->hasRole('rt')) {
            // RT sees agendas for Semuanya, Warga, RT, and RT & RW (never purely RW)
            $query->where('peserta', '!=', 'RW');
        } elseif ($user->hasRole('rw')) {
            // RW sees agendas for Semuanya, Warga, RW, and RT & RW (never purely RT)
            $query->where('peserta', '!=', 'RT');
        }
        // Kades, Sekdes, and Admin see ALL agendas

        $agendas = $query->get()->map(function ($agenda) {
            return [
                'id' => $agenda->id,
                'judul' => $agenda->judul,
                'waktu' => $agenda->waktu,
                'tempat' => $agenda->tempat,
                'peserta' => $agenda->peserta,
                'tipe' => $agenda->tipe,
                'tanggal' => $agenda->tanggal ? $agenda->tanggal->format('Y-m-d') : null,
                'keterangan' => $agenda->keterangan,
                'is_custom' => (bool) $agenda->is_custom,
                'created_at' => $agenda->created_at ? $agenda->created_at->toISOString() : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $agendas,
        ]);
    }

    /**
     * Show single agenda detail.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $desaId = $user ? ($user->desa_id ?? 1) : 1;

        $agenda = Agenda::where('desa_id', $desaId)->where('id', $id)->first();
        if (!$agenda) {
            return response()->json([
                'status' => 'error',
                'message' => 'Agenda tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $agenda->id,
                'judul' => $agenda->judul,
                'waktu' => $agenda->waktu,
                'tempat' => $agenda->tempat,
                'peserta' => $agenda->peserta,
                'tipe' => $agenda->tipe,
                'tanggal' => $agenda->tanggal ? $agenda->tanggal->format('Y-m-d') : null,
                'keterangan' => $agenda->keterangan,
                'is_custom' => (bool) $agenda->is_custom,
            ],
        ]);
    }

    /**
     * Store a newly created agenda (Create).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'tipe' => 'nullable|string|max:100',
            'peserta' => 'nullable|string|max:100',
            'tanggal' => 'required|date',
            'waktu' => 'required|string|max:255',
            'tempat' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        $user = $request->user();
        $desaId = $user ? ($user->desa_id ?? 1) : 1;

        $agenda = Agenda::create([
            'desa_id' => $desaId,
            'judul' => $validated['judul'],
            'tipe' => $validated['tipe'] ?? 'Pemerintahan',
            'peserta' => $validated['peserta'] ?? 'Semuanya',
            'tanggal' => $validated['tanggal'],
            'waktu' => $validated['waktu'],
            'tempat' => $validated['tempat'],
            'keterangan' => $validated['keterangan'] ?? null,
            'is_custom' => true,
            'created_by_user_id' => $user ? $user->id : null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Agenda berhasil ditambahkan dan disimpan ke database.',
            'data' => [
                'id' => $agenda->id,
                'judul' => $agenda->judul,
                'waktu' => $agenda->waktu,
                'tempat' => $agenda->tempat,
                'peserta' => $agenda->peserta,
                'tipe' => $agenda->tipe,
                'tanggal' => $agenda->tanggal ? $agenda->tanggal->format('Y-m-d') : null,
                'keterangan' => $agenda->keterangan,
                'is_custom' => true,
            ],
        ], 201);
    }

    /**
     * Update an existing agenda (Update).
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'tipe' => 'nullable|string|max:100',
            'peserta' => 'nullable|string|max:100',
            'tanggal' => 'required|date',
            'waktu' => 'required|string|max:255',
            'tempat' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        $user = $request->user();
        $desaId = $user ? ($user->desa_id ?? 1) : 1;

        $agenda = Agenda::where('desa_id', $desaId)->where('id', $id)->first();
        if (!$agenda) {
            return response()->json([
                'status' => 'error',
                'message' => 'Agenda tidak ditemukan.',
            ], 404);
        }

        $agenda->update([
            'judul' => $validated['judul'],
            'tipe' => $validated['tipe'] ?? $agenda->tipe,
            'peserta' => $validated['peserta'] ?? $agenda->peserta,
            'tanggal' => $validated['tanggal'],
            'waktu' => $validated['waktu'],
            'tempat' => $validated['tempat'],
            'keterangan' => $validated['keterangan'] ?? $agenda->keterangan,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Agenda berhasil diperbarui.',
            'data' => [
                'id' => $agenda->id,
                'judul' => $agenda->judul,
                'waktu' => $agenda->waktu,
                'tempat' => $agenda->tempat,
                'peserta' => $agenda->peserta,
                'tipe' => $agenda->tipe,
                'tanggal' => $agenda->tanggal ? $agenda->tanggal->format('Y-m-d') : null,
                'keterangan' => $agenda->keterangan,
                'is_custom' => (bool) $agenda->is_custom,
            ],
        ]);
    }

    /**
     * Delete an agenda (Delete).
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $desaId = $user ? ($user->desa_id ?? 1) : 1;

        $agenda = Agenda::where('desa_id', $desaId)->where('id', $id)->first();
        if (!$agenda) {
            return response()->json([
                'status' => 'error',
                'message' => 'Agenda tidak ditemukan.',
            ], 404);
        }

        $agenda->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Agenda berhasil dihapus dari database.',
        ]);
    }
}
