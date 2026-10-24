<?php

namespace App\Services;

use App\Models\SuratType;
use Carbon\Carbon;

class LetterNumberService
{
    private static array $romanMonths = [
        1 => 'I',
        2 => 'II',
        3 => 'III',
        4 => 'IV',
        5 => 'V',
        6 => 'VI',
        7 => 'VII',
        8 => 'VIII',
        9 => 'IX',
        10 => 'X',
        11 => 'XI',
        12 => 'XII',
    ];

    private static array $indonesianDays = [
        'Sunday' => 'Minggu',
        'Monday' => 'Senin',
        'Tuesday' => 'Selasa',
        'Wednesday' => 'Rabu',
        'Thursday' => 'Kamis',
        'Friday' => 'Jumat',
        'Saturday' => 'Sabtu',
    ];

    private static array $indonesianMonths = [
        1 => 'Januari',
        2 => 'Februari',
        3 => 'Maret',
        4 => 'April',
        5 => 'Mei',
        6 => 'Juni',
        7 => 'Juli',
        8 => 'Agustus',
        9 => 'September',
        10 => 'Oktober',
        11 => 'November',
        12 => 'Desember',
    ];

    /**
     * Get detailed Indonesian calendar data for today or specific date.
     */
    public static function getCalendarData(?Carbon $date = null): array
    {
        $date = $date ?: Carbon::now('Asia/Jakarta');

        $dayNum = (int)$date->format('d');
        $monthNum = (int)$date->format('n');
        $yearNum = (int)$date->format('Y');
        $englishDay = $date->format('l');

        return [
            'iso_date' => $date->format('Y-m-d'),
            'tanggal' => str_pad($dayNum, 2, '0', STR_PAD_LEFT),
            'hari' => self::$indonesianDays[$englishDay] ?? $englishDay,
            'bulan_angka' => str_pad($monthNum, 2, '0', STR_PAD_LEFT),
            'bulan_nama' => self::$indonesianMonths[$monthNum] ?? $date->format('F'),
            'bulan_romawi' => self::$romanMonths[$monthNum] ?? 'I',
            'tahun' => (string)$yearNum,
            'formatted' => str_pad($dayNum, 2, '0', STR_PAD_LEFT) . ' ' . (self::$indonesianMonths[$monthNum] ?? '') . ' ' . $yearNum,
            'timestamp' => $date->timestamp,
            'sumber' => 'Kalender Resmi Pemerintah RI',
        ];
    }

    /**
     * Generate official letter number based on letter type configuration, sequence, and calendar date.
     */
    public static function generateNumber(SuratType $suratType, ?int $sequence = null, ?Carbon $date = null): string
    {
        $cal = self::getCalendarData($date);
        $seq = $sequence !== null ? $sequence : (($suratType->nomor_terakhir ?? 0) + 1);
        $paddedNo = str_pad($seq, 3, '0', STR_PAD_LEFT);

        $template = $suratType->format_nomor ?: '{KLASIFIKASI}/{NO}/418.66.04/{BULAN_ROMAWI}/{TAHUN}';
        $klasifikasi = $suratType->kode_klasifikasi ?: '470';

        $replacements = [
            '{NO}' => $paddedNo,
            '{KLASIFIKASI}' => $klasifikasi,
            '{KODE}' => $suratType->kode_surat,
            '{TANGGAL}' => $cal['tanggal'],
            '{BULAN}' => $cal['bulan_angka'],
            '{BULAN_ROMAWI}' => $cal['bulan_romawi'],
            '{TAHUN}' => $cal['tahun'],
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
}
