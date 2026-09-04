<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use App\Models\KartuKeluarga;
use App\Models\NotifikasiLog;
use App\Models\Pengumuman;
use App\Models\SuratRequest;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicInfoController extends Controller
{
    public function getBeritas(Request $request): JsonResponse
    {
        $beritas = Berita::with('author')
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->take(6)
            ->get();

        return response()->json(['success' => true, 'data' => $beritas]);
    }

    public function getPengumumans(): JsonResponse
    {
        $pengumumans = Pengumuman::where('is_active', true)
            ->orderBy('tanggal_mulai', 'desc')
            ->take(5)
            ->get();

        return response()->json(['success' => true, 'data' => $pengumumans]);
    }

    public function getVillageStats(): JsonResponse
    {
        $totalWarga = WargaProfile::count();
        $totalLaki = WargaProfile::where('jenis_kelamin', 'L')->count();
        $totalPerempuan = WargaProfile::where('jenis_kelamin', 'P')->count();
        $totalKK = KartuKeluarga::count();
        $totalSuratSelesai = SuratRequest::where('status', 'completed')->count();
        $pkhEligible = WargaProfile::where('status_ekonomi', 'Kurang Mampu (PKH/BLT Eligible)')->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_warga' => $totalWarga,
                'total_laki' => $totalLaki,
                'total_perempuan' => $totalPerempuan,
                'total_kk' => $totalKK,
                'total_surat_selesai' => $totalSuratSelesai,
                'pkh_eligible' => $pkhEligible,
            ],
        ]);
    }

    public function getNotifikasiLogs(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        $query = NotifikasiLog::with(['wargaProfile', 'user']);

        if ($user->hasRole('warga') && $user->wargaProfile) {
            $query->where('warga_profile_id', $user->wargaProfile->id);
        }

        $logs = $query->orderBy('created_at', 'desc')->take(20)->get();

        return response()->json(['success' => true, 'data' => $logs]);
    }
}
