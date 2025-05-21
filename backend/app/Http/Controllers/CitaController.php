<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\Mascota;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CitaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            $citas = Cita::whereHas('mascota', function($query) use ($user) {
                $query->where('id_usuario', $user->id);
            })->get();
            
            return response()->json($citas);
        } catch (\Exception $e) {
            Log::error('Error al obtener citas: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener las citas'], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'id_mascota' => 'required|exists:mascotas,id_mascota',
                'fecha_hora' => 'required|date',
                'tipo_consulta' => 'required|string',
                'motivo_consulta' => 'required|string',
                'estado' => 'required|string'
            ]);

            $user = Auth::user();
            
            // Verificar que la mascota pertenece al usuario
            $mascota = Mascota::where('id_mascota', $request->id_mascota)
                            ->where('id_usuario', $user->id)
                            ->first();
            
            if (!$mascota) {
                return response()->json(['error' => 'La mascota no pertenece al usuario'], 403);
            }

            // Obtener el veterinario disponible (primer usuario con rol veterinario)
            $veterinario = Usuario::where('rol', 'veterinario')->first();
            if (!$veterinario) {
                return response()->json(['error' => 'No hay veterinarios disponibles'], 404);
            }

            // Obtener el último ID de cita
            $ultimaCita = Cita::orderBy('id_cita', 'desc')->first();
            $nuevoId = $ultimaCita ? $ultimaCita->id_cita + 1 : 1;

            $cita = new Cita();
            $cita->id_cita = $nuevoId;
            $cita->id_mascota = $request->id_mascota;
            $cita->id_usuario = $veterinario->id_usuario;
            $cita->fecha_hora = $request->fecha_hora;
            $cita->tipo_consulta = $request->tipo_consulta;
            $cita->motivo_consulta = $request->motivo_consulta;
            $cita->estado = $request->estado;
            $cita->save();

            return response()->json($cita, 201);
        } catch (\Exception $e) {
            Log::error('Error al crear cita: ' . $e->getMessage());
            return response()->json(['error' => 'Error al crear la cita'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            $cita = Cita::whereHas('mascota', function($query) use ($user) {
                $query->where('id_usuario', $user->id);
            })->findOrFail($id);
            
            return response()->json($cita);
        } catch (\Exception $e) {
            Log::error('Error al obtener cita: ' . $e->getMessage());
            return response()->json(['error' => 'Cita no encontrada'], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'id_mascota' => 'required|exists:mascotas,id_mascota',
                'fecha_hora' => 'required|date',
                'tipo_consulta' => 'required|string',
                'motivo_consulta' => 'required|string',
                'estado' => 'required|string'
            ]);

            $user = Auth::user();
            
            // Verificar que la mascota pertenece al usuario
            $mascota = Mascota::where('id_mascota', $request->id_mascota)
                            ->where('id_usuario', $user->id)
                            ->first();
            
            if (!$mascota) {
                return response()->json(['error' => 'La mascota no pertenece al usuario'], 403);
            }

            $cita = Cita::whereHas('mascota', function($query) use ($user) {
                $query->where('id_usuario', $user->id);
            })->findOrFail($id);

            $cita->id_mascota = $request->id_mascota;
            $cita->fecha_hora = $request->fecha_hora;
            $cita->tipo_consulta = $request->tipo_consulta;
            $cita->motivo_consulta = $request->motivo_consulta;
            $cita->estado = $request->estado;
            $cita->save();

            return response()->json($cita);
        } catch (\Exception $e) {
            Log::error('Error al actualizar cita: ' . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar la cita'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $cita = Cita::whereHas('mascota', function($query) use ($user) {
                $query->where('id_usuario', $user->id);
            })->findOrFail($id);
            
            $cita->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error al eliminar cita: ' . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar la cita'], 500);
        }
    }
}
