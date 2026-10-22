<?php

namespace App\Services;

use App\Models\Rt;
use App\Models\Rw;
use App\Models\SuratRequest;
use App\Models\User;
use App\Models\WargaProfile;
use Illuminate\Http\Exceptions\HttpResponseException;

class TenantSecurityService
{
    /**
     * Pastikan pengguna operasional hanya beroperasi dalam desa miliknya.
     */
    public static function enforceUserTenant(User $user, ?int $targetDesaId): void
    {
        if ($user->hasRole('super_admin')) {
            return;
        }

        if (empty($user->desa_id)) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Akun Anda tidak terikat pada desa operasional yang valid.',
            ], 403));
        }

        if ($targetDesaId !== null && (int) $targetDesaId !== (int) $user->desa_id) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Pelanggaran isolasi tenant: Percobaan akses atau mutasi data lintas desa ditolak.',
            ], 403));
        }
    }

    /**
     * Validasi bahwa RT berada di desa yang sama dengan pengguna.
     */
    public static function validateRt(User $user, ?int $rtId): void
    {
        if (!$rtId || $user->hasRole('super_admin')) {
            return;
        }

        $rt = Rt::withoutGlobalScope('tenant')->find($rtId);
        if (!$rt || (int) $rt->desa_id !== (int) $user->desa_id) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Wilayah RT yang dipilih tidak berada di desa yang sama dengan akun Anda.',
            ], 422));
        }
    }

    /**
     * Validasi bahwa RW berada di desa yang sama dengan pengguna.
     */
    public static function validateRw(User $user, ?int $rwId): void
    {
        if (!$rwId || $user->hasRole('super_admin')) {
            return;
        }

        $rw = Rw::withoutGlobalScope('tenant')->find($rwId);
        if (!$rw || (int) $rw->desa_id !== (int) $user->desa_id) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Wilayah RW yang dipilih tidak berada di desa yang sama dengan akun Anda.',
            ], 422));
        }
    }

    /**
     * Validasi bahwa Warga berada di desa yang sama dengan pengguna.
     */
    public static function validateWarga(User $user, ?int $wargaProfileId): void
    {
        if (!$wargaProfileId || $user->hasRole('super_admin')) {
            return;
        }

        $warga = WargaProfile::withoutGlobalScope('tenant')->find($wargaProfileId);
        if (!$warga || (int) $warga->desa_id !== (int) $user->desa_id) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Data warga yang ditargetkan tidak berada di desa yang sama dengan akun Anda.',
            ], 403));
        }
    }

    /**
     * Validasi bahwa Surat berada di desa yang sama dengan pengguna.
     */
    public static function validateSurat(User $user, SuratRequest $surat): void
    {
        if ($user->hasRole('super_admin')) {
            return;
        }

        if ((int) $surat->desa_id !== (int) $user->desa_id) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Surat permohonan ini milik desa lain. Akses lintas batas desa ditolak.',
            ], 403));
        }
    }
}
