<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loker;
use App\Models\LamaranLoker;
use App\Models\JobSeekerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicLokerController extends Controller
{
    /**
     * Get list of job vacancies with filtering
     */
    public function index(Request $request)
    {
        $query = Loker::where('is_active', true);

        // 1. Search Query
        if ($request->filled('q')) {
            $q = trim($request->input('q'));
            $query->where(function ($b) use ($q) {
                $b->where('posisi', 'like', "%{$q}%")
                  ->orWhere('perusahaan', 'like', "%{$q}%")
                  ->orWhere('kategori', 'like', "%{$q}%")
                  ->orWhere('lokasi', 'like', "%{$q}%")
                  ->orWhere('ringkasan', 'like', "%{$q}%");
            });
        }

        // 2. Kategori Filter
        if ($request->filled('kategori') && $request->input('kategori') !== 'Semua') {
            $cat = $request->input('kategori');
            $query->where('kategori', 'like', "%{$cat}%");
        }

        // 3. Lokasi Filter
        if ($request->filled('lokasi') && $request->input('lokasi') !== 'Semua') {
            $loc = $request->input('lokasi');
            $query->where('lokasi', 'like', "%{$loc}%");
        }

        // 4. Tipe Kerja Filter
        if ($request->filled('tipe_kerja') && $request->input('tipe_kerja') !== 'Semua') {
            $type = $request->input('tipe_kerja');
            $query->where('tipe_kerja', 'like', "%{$type}%");
        }

        // 5. Quick Filter Pills
        if ($request->filled('quick_filter')) {
            $qf = $request->input('quick_filter');
            if ($qf === 'tetap') {
                $query->where(function ($b) {
                    $b->where('tipe_kerja', 'like', '%Penuh Waktu%')
                      ->orWhere('tipe_kerja', 'like', '%Full-time%');
                });
            } elseif ($qf === 'jasa') {
                $query->where(function ($b) {
                    $b->where('is_jasa_mitra', true)
                      ->orWhere('tipe_kerja', 'like', '%Jasa%')
                      ->orWhere('tipe_kerja', 'like', '%Freelance%');
                });
            } elseif ($qf === 'umk') {
                $query->where('gaji_min', '>=', 3000000);
            }
        }

        $lokers = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'total' => $lokers->count(),
            'data' => $lokers
        ]);
    }

    /**
     * Get detail of a single vacancy
     */
    public function show($id)
    {
        $loker = Loker::find($id);

        if (!$loker) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lowongan kerja tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $loker
        ]);
    }

    /**
     * Submit fast-apply job application
     */
    public function apply(Request $request, $id)
    {
        $loker = Loker::find($id);

        if (!$loker) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lowongan kerja tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'pelamar_nama' => 'required|string|max:150',
            'pelamar_nik' => 'nullable|string|max:50',
            'pelamar_wa' => 'required|string|max:50',
            'pelamar_email' => 'required|email|max:150',
            'cv_file_name' => 'required|string|max:255',
            'cv_file_url' => 'nullable|string',
            'portofolio_url' => 'nullable|string|max:500',
            'portofolio_file_name' => 'nullable|string|max:255',
            'portofolio_file_url' => 'nullable|string',
            'catatan' => 'nullable|string|max:500',
        ]);

        $user = auth('sanctum')->user();
        $isKuliner = Str::contains(strtolower($loker->kategori), 'kuliner');

        $lamaran = LamaranLoker::create([
            'id' => 'lamaran-' . Str::lower(Str::random(10)),
            'loker_id' => $loker->id,
            'user_id' => $user ? $user->id : null,
            'loker_posisi' => $loker->posisi,
            'loker_perusahaan' => $loker->perusahaan,
            'pelamar_nama' => $validated['pelamar_nama'],
            'pelamar_nik' => $validated['pelamar_nik'] ?? ($user ? $user->warga_profile?->nik : '3204•••• •••• 1002'),
            'pelamar_wa' => $validated['pelamar_wa'],
            'pelamar_email' => $validated['pelamar_email'],
            'cv_file_name' => $validated['cv_file_name'],
            'cv_file_url' => $validated['cv_file_url'] ?? null,
            'portofolio_url' => $validated['portofolio_url'] ?? null,
            'portofolio_file_name' => $validated['portofolio_file_name'] ?? null,
            'portofolio_file_url' => $validated['portofolio_file_url'] ?? null,
            'catatan' => $validated['catatan'] ?? null,
            'status' => 'Berkas Diterima HR - Wawancara Dijadwalkan',
            'substatus_text' => 'Undangan via WhatsApp & Email',
            'tanggal_lamar' => date('d M Y'),
            'icon_type' => $isKuliner ? 'coffee' : 'building',
        ]);

        // Increment applicant count
        $loker->increment('jumlah_pelamar');

        return response()->json([
            'status' => 'success',
            'message' => 'Lamaran berhasil diajukan dan diteruskan ke tim rekrutmen!',
            'data' => $lamaran
        ], 201);
    }

    /**
     * Get job seeker profile
     */
    public function getSeekerProfile(Request $request)
    {
        $user = auth('sanctum')->user();

        $profile = null;
        if ($user) {
            $profile = JobSeekerProfile::where('user_id', $user->id)->first();
        }

        if (!$profile) {
            $profile = JobSeekerProfile::first();
        }

        return response()->json([
            'status' => 'success',
            'data' => $profile
        ]);
    }

    /**
     * Update/save job seeker profile
     */
    public function saveSeekerProfile(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:150',
            'nik' => 'nullable|string|max:50',
            'domisili' => 'nullable|string|max:150',
            'status_kerja' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telepon' => 'nullable|string|max:50',
            'cv_utama' => 'nullable|array',
            'berkas_pendukung' => 'nullable|array',
            'keahlian' => 'nullable|array',
            'preferensi' => 'nullable|array',
        ]);

        $user = auth('sanctum')->user();
        $profile = null;
        if ($user) {
            $profile = JobSeekerProfile::where('user_id', $user->id)->first();
        }

        if (!$profile) {
            $profile = JobSeekerProfile::first();
        }

        if ($profile) {
            $validated['terakhir_update'] = 'Baru saja';
            $profile->update($validated);
        } else {
            $validated['user_id'] = $user ? $user->id : null;
            $validated['terakhir_update'] = 'Baru saja';
            $profile = JobSeekerProfile::create($validated);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Profil pencari kerja berhasil diperbarui!',
            'data' => $profile
        ]);
    }

    /**
     * Get submitted applications list
     */
    public function getApplications(Request $request)
    {
        $user = auth('sanctum')->user();

        $query = LamaranLoker::query();
        if ($user) {
            $query->where('user_id', $user->id);
        }

        $applications = $query->orderBy('created_at', 'desc')->get();

        // If user has no applications, return all seeded applications for high fidelity demo
        if ($applications->isEmpty()) {
            $applications = LamaranLoker::orderBy('created_at', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'total' => $applications->count(),
            'data' => $applications
        ]);
    }
}
