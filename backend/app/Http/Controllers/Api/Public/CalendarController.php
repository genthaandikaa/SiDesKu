<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\LetterNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    /**
     * Get current official calendar date with Indonesian day, month, roman numeral, and year.
     */
    public function getToday(Request $request): JsonResponse
    {
        $calendar = LetterNumberService::getCalendarData();

        return response()->json([
            'success' => true,
            'message' => 'Data kalender resmi nasional berhasil diambil.',
            'data' => $calendar,
        ]);
    }
}
