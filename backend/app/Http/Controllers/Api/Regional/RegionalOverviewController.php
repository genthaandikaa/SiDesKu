<?php

namespace App\Http\Controllers\Api\Regional;

use App\Http\Controllers\Controller;
use App\Models\Desa;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegionalOverviewController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasRole(['kecamatan', 'kabupaten_kota']), 403);

        $anchorDesa = Desa::query()
            ->whereKey($user->desa_id)
            ->where('is_active', true)
            ->firstOrFail();

        $isDistrictRole = $user->hasRole('kecamatan');
        $areaColumn = $isDistrictRole ? 'kecamatan' : 'kabupaten';
        $areaName = $anchorDesa->{$areaColumn};
        $desas = Desa::query()
            ->where('is_active', true)
            ->where($areaColumn, $areaName)
            ->orderBy('nama_desa')
            ->get(['id', 'nama_desa', 'kecamatan', 'kabupaten', 'telepon', 'email']);
        $desaIds = $desas->pluck('id')->all();

        $users = $this->countsByDesa(DB::table('users')->where('is_active', true), $desaIds);
        $warga = $this->countsByDesa(DB::table('warga_profiles'), $desaIds);
        $surat = DB::table('surat_requests')
            ->select('desa_id')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed", ['completed'])
            ->selectRaw("SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as rejected", ['rejected'])
            ->whereIn('desa_id', $desaIds)
            ->groupBy('desa_id')
            ->get()
            ->keyBy('desa_id');
        $pengaduan = DB::table('pengaduan_wargas')
            ->select('desa_id')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed", ['Selesai'])
            ->selectRaw("SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as rejected", ['Ditolak'])
            ->whereIn('desa_id', $desaIds)
            ->groupBy('desa_id')
            ->get()
            ->keyBy('desa_id');
        $bansos = DB::table('bantuan_sosials')
            ->select('desa_id')
            ->selectRaw("SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as total", ['published'])
            ->whereIn('desa_id', $desaIds)
            ->groupBy('desa_id')
            ->get()
            ->keyBy('desa_id');
        $desaNames = $desas->keyBy('id')->map(fn (Desa $desa) => $desa->nama_desa);

        $announcements = DB::table('pengumumans')
            ->whereIn('desa_id', $desaIds)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->where('status', 'published')->orWhereNull('status');
            })
            ->orderByDesc('tanggal_mulai')
            ->limit(50)
            ->get(['id', 'desa_id', 'judul', 'isi', 'level_target', 'tanggal_mulai', 'tanggal_selesai'])
            ->map(fn ($item) => [
                'id' => $item->id,
                'desa' => $desaNames->get($item->desa_id, 'Desa'),
                'judul' => $item->judul,
                'isi' => $item->isi,
                'level_target' => $item->level_target,
                'tanggal_mulai' => $item->tanggal_mulai,
                'tanggal_selesai' => $item->tanggal_selesai,
            ])
            ->values();

        $agendas = DB::table('agendas')
            ->whereIn('desa_id', $desaIds)
            ->orderByDesc('tanggal')
            ->limit(100)
            ->get(['id', 'desa_id', 'judul', 'tipe', 'tanggal', 'waktu', 'tempat'])
            ->map(fn ($item) => [
                'id' => $item->id,
                'desa' => $desaNames->get($item->desa_id, 'Desa'),
                'judul' => $item->judul,
                'tipe' => $item->tipe,
                'tanggal' => $item->tanggal,
                'waktu' => $item->waktu,
                'tempat' => $item->tempat,
            ])
            ->values();

        $programs = DB::table('bantuan_sosials')
            ->join('desas', 'desas.id', '=', 'bantuan_sosials.desa_id')
            ->whereIn('bantuan_sosials.desa_id', $desaIds)
            ->where('bantuan_sosials.status', 'published')
            ->orderByDesc('bantuan_sosials.tanggal_penyaluran')
            ->limit(100)
            ->get([
                'bantuan_sosials.id',
                'bantuan_sosials.desa_id',
                'desas.nama_desa',
                'bantuan_sosials.nama_bantuan',
                'bantuan_sosials.sumber_dana',
                'bantuan_sosials.tahun',
                'bantuan_sosials.tahap',
                'bantuan_sosials.kuota_penerima',
                'bantuan_sosials.tanggal_penyaluran',
            ]);

        $dispositions = DB::table('pengaduan_wargas')
            ->select('desa_id', 'disposisi_ke', 'status')
            ->selectRaw('COUNT(*) as jumlah')
            ->whereIn('desa_id', $desaIds)
            ->groupBy('desa_id', 'disposisi_ke', 'status')
            ->get()
            ->map(fn ($item) => [
                'desa' => $desaNames->get($item->desa_id, 'Desa'),
                'disposisi_ke' => $item->disposisi_ke ?: 'Belum ditentukan',
                'status' => $item->status,
                'jumlah' => (int) $item->jumlah,
            ])
            ->values();

        $villageSummaries = $desas->map(function (Desa $desa) use ($users, $warga, $surat, $pengaduan, $bansos) {
            $suratCounts = $surat->get($desa->id);
            $complaintCounts = $pengaduan->get($desa->id);
            $lettersTotal = (int) ($suratCounts->total ?? 0);
            $lettersCompleted = (int) ($suratCounts->completed ?? 0);
            $lettersRejected = (int) ($suratCounts->rejected ?? 0);
            $complaintsTotal = (int) ($complaintCounts->total ?? 0);
            $complaintsCompleted = (int) ($complaintCounts->completed ?? 0);
            $complaintsRejected = (int) ($complaintCounts->rejected ?? 0);

            return [
                'id' => $desa->id,
                'nama_desa' => $desa->nama_desa,
                'kecamatan' => $desa->kecamatan,
                'kabupaten' => $desa->kabupaten,
                'telepon' => $desa->telepon,
                'email' => $desa->email,
                'jumlah_pengguna_aktif' => (int) ($users->get($desa->id)->total ?? 0),
                'jumlah_warga' => (int) ($warga->get($desa->id)->total ?? 0),
                'jumlah_surat' => $lettersTotal,
                'surat_selesai' => $lettersCompleted,
                'surat_diproses' => max(0, $lettersTotal - $lettersCompleted - $lettersRejected),
                'pengaduan_aktif' => max(0, $complaintsTotal - $complaintsCompleted - $complaintsRejected),
                'program_bansos_aktif' => (int) ($bansos->get($desa->id)->total ?? 0),
            ];
        });

        $totals = [
            'jumlah_desa' => $villageSummaries->count(),
            'jumlah_pengguna_aktif' => $villageSummaries->sum('jumlah_pengguna_aktif'),
            'jumlah_warga' => $villageSummaries->sum('jumlah_warga'),
            'jumlah_surat' => $villageSummaries->sum('jumlah_surat'),
            'surat_diproses' => $villageSummaries->sum('surat_diproses'),
            'surat_selesai' => $villageSummaries->sum('surat_selesai'),
            'pengaduan_aktif' => $villageSummaries->sum('pengaduan_aktif'),
            'program_bansos_aktif' => $villageSummaries->sum('program_bansos_aktif'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'scope' => [
                    'role' => $user->role->slug,
                    'nama_wilayah' => $areaName,
                    'tingkat' => $isDistrictRole ? 'Kecamatan' : 'Kabupaten/Kota',
                ],
                'totals' => $totals,
                'desa' => $villageSummaries->values(),
                'pengumuman' => $announcements,
                'agenda' => $agendas,
                'program_sosial' => $programs,
                'disposisi_pengaduan' => $dispositions,
            ],
        ]);
    }

    private function countsByDesa(Builder $query, array $desaIds)
    {
        return $query
            ->select('desa_id')
            ->selectRaw('COUNT(*) as total')
            ->whereIn('desa_id', $desaIds)
            ->groupBy('desa_id')
            ->get()
            ->keyBy('desa_id');
    }
}
