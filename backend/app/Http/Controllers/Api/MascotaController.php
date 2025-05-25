<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mascota;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MascotaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            Log::info('Fetching pets for user:', ['user_id' => $user->id_usuario, 'role' => $user->rol]);

            // Si es admin o veterinario, obtener todas las mascotas
            if ($user->rol === 'admin' || $user->rol === 'veterinario') {
                $mascotas = Mascota::with(['usuario' => function($query) {
                    $query->select('id_usuario', 'nombre', 'apellido', 'email');
                }])->get();
            } else {
                // Si es cliente, obtener solo sus mascotas
                $mascotas = Mascota::where('id_usuario', $user->id_usuario)
                    ->with(['usuario' => function($query) {
                        $query->select('id_usuario', 'nombre', 'apellido', 'email');
                    }])
                    ->get();
            }

            Log::info('Found pets:', ['count' => $mascotas->count()]);

            $formattedPets = $mascotas->map(function ($mascota) {
                return [
                    'id_mascota' => $mascota->id_mascota,
                    'nombre' => $mascota->nombre,
                    'especie' => $mascota->especie,
                    'raza' => $mascota->raza,
                    'fecha_nacimiento' => $mascota->fecha_nacimiento,
                    'sexo' => $mascota->sexo,
                    'notas' => $mascota->notas,
                    'usuario' => [
                        'id_usuario' => $mascota->usuario->id_usuario,
                        'nombre' => $mascota->usuario->nombre,
                        'apellido' => $mascota->usuario->apellido,
                        'email' => $mascota->usuario->email
                    ]
                ];
            });

            Log::info('Formatted pets:', ['count' => $formattedPets->count()]);

            return response()->json([
                'status' => 'success',
                'data' => $formattedPets
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener mascotas:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener las mascotas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'especie' => 'required|string|max:255',
            'raza' => 'required|string|max:255',
            'fecha_nacimiento' => 'required|date',
            'sexo' => 'required|string|max:10',
            'notas' => 'nullable|string'
        ]);

        $user = Auth::user();
        
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
    }

    /**
     * Display the specified resource.
     */
    public function show(Mascota $mascota)
    {
        $user = Auth::user();
        
        if ($user->rol !== 'admin' && $mascota->id_usuario !== $user->id_usuario) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        
        $mascota->load('usuario', 'citas.tratamientos');
        return response()->json($mascota);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Mascota $mascota)
    {
        $user = Auth::user();
        
        if ($user->rol !== 'admin' && $mascota->id_usuario !== $user->id_usuario) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'especie' => 'sometimes|required|string|max:255',
            'raza' => 'sometimes|required|string|max:255',
            'fecha_nacimiento' => 'sometimes|required|date',
            'sexo' => 'sometimes|required|string|max:10',
            'notas' => 'nullable|string'
        ]);

        $mascota->update($request->all());

        return response()->json($mascota);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Mascota $mascota)
    {
        $user = Auth::user();
        
        if ($user->rol !== 'admin' && $mascota->id_usuario !== $user->id_usuario) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $mascota->delete();
        return response()->json(null, 204);
    }

    // Métodos adicionales

    // Obtener mascotas por especie
    public function getByEspecie(Request $request)
    {
        $request->validate([
            'especie' => 'required|string',
        ]);

        $mascotas = Mascota::where('especie', $request->especie)
            ->with('usuario')
            ->get();

        return response()->json($mascotas);
    }

    // Obtener mascotas por raza
    public function getByRaza(Request $request)
    {
        $request->validate([
            'raza' => 'required|string',
        ]);

        $mascotas = Mascota::where('raza', $request->raza)
            ->with('usuario')
            ->get();

        return response()->json($mascotas);
    }

    // Obtener el historial médico completo de una mascota
    public function getHistorialMedico(Mascota $mascota)
    {
        $historial = $mascota->citas()
            ->with(['veterinario:id_usuario,nombre,apellido', 'tratamientos'])
            ->orderBy('fecha_hora', 'desc')
            ->get();

        return response()->json($historial);
    }

    // Obtener próximas citas de una mascota
    public function getProximasCitas(Mascota $mascota)
    {
        $citas = $mascota->citas()
            ->where('fecha_hora', '>', now())
            ->where('estado', '!=', 'cancelada')
            ->with('veterinario:id_usuario,nombre,apellido')
            ->orderBy('fecha_hora', 'asc')
            ->get();

        return response()->json($citas);
    }

    // Buscar mascotas por nombre
    public function buscarPorNombre(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|min:2',
        ]);

        $mascotas = Mascota::where('nombre', 'like', '%' . $request->nombre . '%')
            ->with('usuario')
            ->get();

        return response()->json($mascotas);
    }
}
