<?php

namespace App\Http\Controllers;

use App\Models\Mascota;
use App\Models\Tratamiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Controlador de Mascotas
 * 
 * Este controlador maneja todas las operaciones relacionadas con las mascotas del sistema,
 * incluyendo su creación, actualización, eliminación y consulta.
 * Todas las operaciones requieren autenticación mediante Sanctum.
 */
class MascotaController extends Controller
{
    /**
     * Constructor del controlador
     * Aplica el middleware de autenticación a todas las rutas
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Muestra un listado de todas las mascotas del usuario autenticado.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $mascotas = Mascota::where('id_usuario', $user->id_usuario)->get();
            return response()->json($mascotas);
        } catch (\Exception $e) {
            Log::error('Error al obtener mascotas:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al obtener las mascotas'], 500);
        }
    }

    /**
     * Muestra el formulario para crear una nueva mascota.
     * 
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Almacena una nueva mascota en la base de datos.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255',
                'especie' => 'required|string|max:255',
                'raza' => 'required|string|max:255',
                'fecha_nacimiento' => 'required|date',
                'sexo' => 'required|string|max:10',
                'notas' => 'nullable|string'
            ]);

            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Obtener el último ID de mascota
            $ultimaMascota = Mascota::orderBy('id_mascota', 'desc')->first();
            $nuevoId = $ultimaMascota ? $ultimaMascota->id_mascota + 1 : 1;

            $mascota = new Mascota();
            $mascota->id_mascota = $nuevoId;
            $mascota->id_usuario = $user->id_usuario;
            $mascota->nombre = $request->nombre;
            $mascota->especie = $request->especie;
            $mascota->raza = $request->raza;
            $mascota->fecha_nacimiento = $request->fecha_nacimiento;
            $mascota->sexo = $request->sexo;
            $mascota->notas = $request->notas;
            $mascota->save();

            return response()->json($mascota, 201);
        } catch (\Exception $e) {
            Log::error('Error al crear mascota:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al crear la mascota'], 500);
        }
    }

    /**
     * Muestra la información detallada de una mascota específica.
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $mascota = Mascota::where('id_usuario', $user->id_usuario)
                ->where('id_mascota', $id)
                ->first();

            if (!$mascota) {
                return response()->json(['error' => 'Mascota no encontrada'], 404);
            }
            
            return response()->json($mascota);
        } catch (\Exception $e) {
            Log::error('Error al mostrar mascota:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al obtener la mascota'], 500);
        }
    }

    /**
     * Muestra el formulario para editar una mascota existente.
     * 
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Actualiza la información de una mascota en la base de datos.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255',
                'especie' => 'required|string|max:255',
                'raza' => 'required|string|max:255',
                'fecha_nacimiento' => 'required|date',
                'sexo' => 'required|string|max:10',
                'notas' => 'nullable|string'
            ]);

            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $mascota = Mascota::where('id_usuario', $user->id_usuario)
                ->where('id_mascota', $id)
                ->first();

            if (!$mascota) {
                return response()->json(['error' => 'Mascota no encontrada'], 404);
            }

            $mascota->update([
                'nombre' => $request->nombre,
                'especie' => $request->especie,
                'raza' => $request->raza,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'sexo' => $request->sexo,
                'notas' => $request->notas
            ]);

            return response()->json($mascota);
        } catch (\Exception $e) {
            Log::error('Error al actualizar mascota:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al actualizar la mascota'], 500);
        }
    }

    /**
     * Elimina una mascota de la base de datos.
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $mascota = Mascota::where('id_usuario', $user->id_usuario)
                ->where('id_mascota', $id)
                ->first();

            if (!$mascota) {
                return response()->json(['error' => 'Mascota no encontrada'], 404);
            }

            $mascota->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error al eliminar mascota:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al eliminar la mascota'], 500);
        }
    }
}
