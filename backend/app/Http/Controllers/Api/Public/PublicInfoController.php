<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use App\Models\DesaSetting;
use App\Models\Dusun;
use App\Models\KartuKeluarga;
use App\Models\NotifikasiLog;
use App\Models\Pengumuman;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\SuratRequest;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicInfoController extends Controller
{
    private function resolveDesaId(Request $request): int
    {
        return (int) ($request->query('desa_id') ?? 1);
    }

    public function getBeritas(Request $request): JsonResponse
    {
        $desaId = $this->resolveDesaId($request);
        $beritas = Berita::withoutGlobalScope('tenant')
            ->where('desa_id', $desaId)
            ->with('author')
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->take(6)
            ->get();

        return response()->json(['success' => true, 'data' => $beritas]);
    }

    public function getPengumumans(Request $request): JsonResponse
    {
        $desaId = $this->resolveDesaId($request);
        $pengumumans = Pengumuman::withoutGlobalScope('tenant')
            ->where('desa_id', $desaId)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where('status', 'published')->orWhereNull('status');
            })
            ->orderBy('tanggal_mulai', 'desc')
            ->take(5)
            ->get();

        return response()->json(['success' => true, 'data' => $pengumumans]);
    }

    public function getVillageStats(Request $request): JsonResponse
    {
        $desaId = $this->resolveDesaId($request);
        $totalWarga = WargaProfile::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        $totalLaki = WargaProfile::withoutGlobalScope('tenant')->where('desa_id', $desaId)->where('jenis_kelamin', 'L')->count();
        $totalPerempuan = WargaProfile::withoutGlobalScope('tenant')->where('desa_id', $desaId)->where('jenis_kelamin', 'P')->count();
        $totalKK = KartuKeluarga::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        $totalSuratSelesai = SuratRequest::withoutGlobalScope('tenant')->where('desa_id', $desaId)->where('status', 'completed')->count();
        $pkhEligible = WargaProfile::withoutGlobalScope('tenant')->where('desa_id', $desaId)->where('status_ekonomi', 'Kurang Mampu (PKH/BLT Eligible)')->count();

        $totalDusun = Dusun::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        if ($totalDusun === 0) {
            $totalDusun = Dusun::withoutGlobalScope('tenant')->count();
        }
        $totalRw = Rw::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        if ($totalRw === 0) {
            $totalRw = Rw::withoutGlobalScope('tenant')->count();
        }
        $totalRt = Rt::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        if ($totalRt === 0) {
            $totalRt = Rt::withoutGlobalScope('tenant')->count();
        }

        return response()->json([
            'success' => true,
            'stats' => [
                'total_warga' => $totalWarga,
                'total_laki' => $totalLaki,
                'total_perempuan' => $totalPerempuan,
                'total_kk' => $totalKK,
                'total_surat_selesai' => $totalSuratSelesai,
                'pkh_eligible' => $pkhEligible,
                'total_dusun' => $totalDusun,
                'total_rw' => $totalRw,
                'total_rt' => $totalRt,
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

    public function getPublicHome(Request $request): JsonResponse
    {
        $desaId = $this->resolveDesaId($request);
        $desa = DesaSetting::withoutGlobalScope('tenant')->where('desa_id', $desaId)->first()
            ?? DesaSetting::withoutGlobalScope('tenant')->first();

        if ($desa) {
            $dirty = false;
            if (empty($desa->visi)) {
                $desa->visi = 'Terwujudnya Masyarakat Desa Doko yang Maju, Sejahtera, Mandiri, Agamis, dan Terdepan dalam Tata Kelola Pelayanan Berbasis Teknologi Informasi.';
                $dirty = true;
            }
            if (empty($desa->misi)) {
                $desa->misi = "1. Meningkatkan profesionalisme aparatur pemerintah desa dengan digitalisasi tata kelola administrasi dan persuratan realtime.\n2. Membangun sarana dan prasarana infrastruktur jalan, irigasi pertanian tersier, serta drainase lingkungan yang merata.\n3. Mengembangkan perekonomian kerakyatan berbasis potensi pertanian organik, UMKM kerajinan, dan pemberdayaan BUMDes.\n4. Mewujudkan transparansi pengelolaan keuangan APBDes secara terbuka dan akuntabel kepada seluruh warga.";
                $dirty = true;
            }
            if ($dirty) {
                $desa->save();
            }
        }

        $totalWarga = WargaProfile::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        $totalLaki = WargaProfile::withoutGlobalScope('tenant')->where('desa_id', $desaId)->where('jenis_kelamin', 'L')->count();
        $totalPerempuan = WargaProfile::withoutGlobalScope('tenant')->where('desa_id', $desaId)->where('jenis_kelamin', 'P')->count();
        $totalKK = KartuKeluarga::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        $totalSuratSelesai = SuratRequest::withoutGlobalScope('tenant')->where('desa_id', $desaId)->where('status', 'completed')->count();
        $pkhEligible = WargaProfile::withoutGlobalScope('tenant')->where('desa_id', $desaId)->where('status_ekonomi', 'Kurang Mampu (PKH/BLT Eligible)')->count();

        $totalDusun = Dusun::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        if ($totalDusun === 0) {
            $totalDusun = Dusun::withoutGlobalScope('tenant')->count();
        }
        $totalRw = Rw::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        if ($totalRw === 0) {
            $totalRw = Rw::withoutGlobalScope('tenant')->count();
        }
        $totalRt = Rt::withoutGlobalScope('tenant')->where('desa_id', $desaId)->count();
        if ($totalRt === 0) {
            $totalRt = Rt::withoutGlobalScope('tenant')->count();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'desa' => $desa,
                'stats' => [
                    'total_warga' => $totalWarga,
                    'total_laki' => $totalLaki,
                    'total_perempuan' => $totalPerempuan,
                    'total_kk' => $totalKK,
                    'total_surat_selesai' => $totalSuratSelesai,
                    'pkh_eligible' => $pkhEligible,
                    'total_dusun' => $totalDusun,
                    'total_rw' => $totalRw,
                    'total_rt' => $totalRt,
                ],
            ],
        ]);
    }
}
