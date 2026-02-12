<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of the activity logs.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Solo permitir a super_admin ver esto?
        // Esto debería estar protegido por middleware/policy, pero asumimos que el route lo controla
        $logs = ActivityLog::with('user:id,nombre,correo,rol')
            ->latest()
            ->paginate(50);

        return response()->json($logs);
    }
}
