<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\Mascota;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Controlador de Citas
 * 
 * Este controlador maneja todas las operaciones relacionadas con las citas médicas del sistema,
 * incluyendo su creación, actualización, eliminación y consulta.
 * Las citas están asociadas a mascotas y veterinarios.
 */
class CitaController extends Controller
{
    /**
     * Muestra un listado de todas las citas de las mascotas del usuario autenticado.
     * 
     * @return \Illuminate\Http\JsonResponse
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
     * Muestra el formulario para crear una nueva cita.
     * 
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Almacena una nueva cita en la base de datos.
     * Verifica que la mascota pertenezca al usuario y asigna un veterinario disponible.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
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
     * Muestra la información detallada de una cita específica.
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
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
     * Muestra el formulario para editar una cita existente.
     * 
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Actualiza la información de una cita en la base de datos.
     * Verifica que la mascota pertenezca al usuario antes de actualizar.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
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
     * Elimina una cita de la base de datos.
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
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
