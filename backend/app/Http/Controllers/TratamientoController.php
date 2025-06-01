<?php

namespace App\Http\Controllers;

use App\Models\Tratamiento;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Controlador de Tratamientos
 * 
 * Este controlador maneja todas las operaciones relacionadas con los tratamientos médicos del sistema,
 * incluyendo su creación, actualización, eliminación y consulta.
 * Los tratamientos están asociados a citas y pueden ser gestionados por veterinarios y clientes.
 */
class TratamientoController extends Controller
{
    /**
     * Muestra un listado de tratamientos.
     * Si se proporciona un userId, muestra los tratamientos de ese usuario.
     * Si no, muestra los tratamientos del usuario autenticado.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $userId = $request->query('userId');
        
        if ($userId && $userId !== 'undefined') {
            $tratamientos = Tratamiento::whereHas('cita.mascota', function($query) use ($userId) {
                $query->where('id_usuario', $userId);
            })->with(['cita.mascota', 'cita.veterinario'])->get();
        } else {
            $tratamientos = Tratamiento::whereHas('cita.mascota', function($query) {
                $query->where('id_usuario', Auth::user()->id_usuario);
            })->with(['cita.mascota', 'cita.veterinario'])->get();
        }
        
        return response()->json($tratamientos);
    }

    /**
     * Almacena un nuevo tratamiento en la base de datos.
     * Verifica que la cita pertenezca al usuario o sea su veterinario.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_cita' => 'required|exists:citas,id_cita',
            'nombre' => 'required|string',
            'descripcion' => 'required|string',
            'precio' => 'required|numeric|min:0',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'estado' => 'required|string|in:pendiente,en_progreso,completado,cancelado'
        ]);

        // Verificar que la cita pertenece al usuario o es su veterinario
        $cita = Cita::where('id_cita', $request->id_cita)
            ->where(function($query) {
                $query->where('id_usuario', Auth::user()->id_usuario)
                    ->orWhereHas('mascota', function($q) {
                        $q->where('id_usuario', Auth::user()->id_usuario);
                    });
            })
            ->firstOrFail();

        $tratamiento = Tratamiento::create($request->all());

        return response()->json($tratamiento, 201);
    }

    /**
     * Muestra la información detallada de un tratamiento específico.
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $tratamiento = Tratamiento::where('id_tratamiento', $id)
            ->whereHas('cita.mascota', function($query) {
                $query->where('id_usuario', Auth::user()->id_usuario);
            })
            ->firstOrFail();
        
        return response()->json($tratamiento);
    }

    /**
     * Actualiza la información de un tratamiento en la base de datos.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string',
            'descripcion' => 'required|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'estado' => 'required|string|in:pendiente,en_progreso,completado,cancelado'
        ]);

        $tratamiento = Tratamiento::where('id_tratamiento', $id)
            ->whereHas('cita.mascota', function($query) {
                $query->where('id_usuario', Auth::user()->id_usuario);
            })
            ->firstOrFail();

        $tratamiento->update($request->all());

        return response()->json($tratamiento);
    }

    /**
     * Elimina un tratamiento de la base de datos.
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $tratamiento = Tratamiento::where('id_tratamiento', $id)
            ->whereHas('cita.mascota', function($query) {
                $query->where('id_usuario', Auth::user()->id_usuario);
            })
            ->firstOrFail();
        
        $tratamiento->delete();

        return response()->json(null, 204);
    }

    /**
     * Actualiza el estado de un tratamiento.
     * Los estados posibles son: pendiente, en_progreso, completado, cancelado.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateEstado(Request $request, $id)
    {
        $request->validate([
            'estado' => 'required|string|in:pendiente,en_progreso,completado,cancelado'
        ]);

        $tratamiento = Tratamiento::where('id_tratamiento', $id)
            ->whereHas('cita.mascota', function($query) {
                $query->where('id_usuario', Auth::user()->id_usuario);
            })
            ->firstOrFail();

        $tratamiento->estado = $request->estado;
        $tratamiento->save();

        return response()->json($tratamiento);
    }
} 