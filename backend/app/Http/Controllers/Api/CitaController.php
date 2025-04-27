<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CitaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $citas = Cita::with(['mascota.usuario', 'veterinario'])->get();
        return response()->json($citas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_mascota' => 'required|exists:mascotas,id_mascota',
            'id_veterinario' => 'required|exists:usuarios,id_usuario',
            'motivo_consulta' => 'required|string',
            'fecha_hora' => 'required|date',
            'estado' => 'required|string|in:pendiente,confirmada,completada,cancelada',
        ]);

        // Verificar que el veterinario esté disponible
        $citaExistente = Cita::where('id_veterinario', $request->id_veterinario)
            ->where('fecha_hora', $request->fecha_hora)
            ->where('estado', '!=', 'cancelada')
            ->first();

        if ($citaExistente) {
            return response()->json([
                'error' => 'El veterinario ya tiene una cita programada para esa fecha y hora'
            ], 422);
        }

        $cita = Cita::create($request->all());
        $cita->load(['mascota.usuario', 'veterinario']);

        return response()->json($cita, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Cita $cita)
    {
        $cita->load(['mascota.usuario', 'veterinario', 'tratamientos']);
        return response()->json($cita);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cita $cita)
    {
        $request->validate([
            'id_mascota' => 'sometimes|required|exists:mascotas,id_mascota',
            'id_veterinario' => 'sometimes|required|exists:usuarios,id_usuario',
            'motivo_consulta' => 'sometimes|required|string',
            'fecha_hora' => 'sometimes|required|date',
            'estado' => 'sometimes|required|string|in:pendiente,confirmada,completada,cancelada',
        ]);

        if ($request->has('fecha_hora') && $request->fecha_hora !== $cita->fecha_hora) {
            $citaExistente = Cita::where('id_veterinario', $cita->id_veterinario)
                ->where('fecha_hora', $request->fecha_hora)
                ->where('estado', '!=', 'cancelada')
                ->where('id_cita', '!=', $cita->id_cita)
                ->first();

            if ($citaExistente) {
                return response()->json([
                    'error' => 'El veterinario ya tiene una cita programada para esa fecha y hora'
                ], 422);
            }
        }

        $cita->update($request->all());
        $cita->load(['mascota.usuario', 'veterinario']);

        return response()->json($cita);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cita $cita)
    {
        $cita->delete();
        return response()->json(null, 204);
    }

    // Métodos adicionales

    // Obtener citas por estado
    public function getByEstado(Request $request)
    {
        $request->validate([
            'estado' => 'required|string|in:pendiente,confirmada,completada,cancelada',
        ]);

        $citas = Cita::where('estado', $request->estado)
            ->with(['mascota.usuario', 'veterinario'])
            ->orderBy('fecha_hora', 'asc')
            ->get();

        return response()->json($citas);
    }

    // Obtener citas por fecha
    public function getByFecha(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
        ]);

        $citas = Cita::whereDate('fecha_hora', $request->fecha)
            ->with(['mascota.usuario', 'veterinario'])
            ->orderBy('fecha_hora', 'asc')
            ->get();

        return response()->json($citas);
    }

    // Obtener citas del día actual
    public function getCitasHoy()
    {
        $citas = Cita::whereDate('fecha_hora', now())
            ->with(['mascota.usuario', 'veterinario'])
            ->orderBy('fecha_hora', 'asc')
            ->get();

        return response()->json($citas);
    }

    // Cambiar estado de la cita
    public function cambiarEstado(Request $request, Cita $cita)
    {
        $request->validate([
            'estado' => 'required|string|in:pendiente,confirmada,completada,cancelada',
        ]);

        $cita->update(['estado' => $request->estado]);
        $cita->load(['mascota.usuario', 'veterinario']);

        return response()->json($cita);
    }

    // Obtener disponibilidad del veterinario
    public function getDisponibilidadVeterinario(Request $request)
    {
        $request->validate([
            'id_veterinario' => 'required|exists:usuarios,id_usuario',
            'fecha' => 'required|date',
        ]);

        $citas = Cita::where('id_veterinario', $request->id_veterinario)
            ->whereDate('fecha_hora', $request->fecha)
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fecha_hora', 'asc')
            ->get(['fecha_hora', 'estado']);

        return response()->json($citas);
    }
}
