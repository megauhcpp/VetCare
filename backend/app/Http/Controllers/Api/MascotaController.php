<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mascota;
use App\Models\Usuario;
use App\Models\Tratamiento;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
        try {
            Log::info('Creando nueva mascota:', [
                'request_data' => $request->all(),
                'user' => Auth::user()
            ]);

            $request->validate([
                'nombre' => 'required|string|max:255',
                'especie' => 'required|string|max:255',
                'raza' => 'required|string|max:255',
                'fecha_nacimiento' => 'required|date',
                'sexo' => 'required|string|max:10',
                'notas' => 'nullable|string',
                'id_usuario' => 'required|exists:usuarios,id_usuario'
            ]);

            $user = Auth::user();
            $usuarioSeleccionado = null;
            
            if ($user->rol === 'admin' || $user->rol === 'veterinario') {
                // Admin/vet pueden crear mascotas para cualquier usuario (cliente)
                $usuarioSeleccionado = Usuario::find($request->id_usuario);
                if (!$usuarioSeleccionado || $usuarioSeleccionado->rol !== 'cliente') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'El usuario seleccionado debe ser un cliente'
                    ], 400);
                }
                $idUsuario = $request->id_usuario;
            } else {
                // Cliente solo puede crear mascotas para sí mismo
                $idUsuario = $user->id_usuario;
            }
            
            // Obtener el último ID de mascota
            $ultimaMascota = Mascota::orderBy('id_mascota', 'desc')->first();
            $nuevoId = $ultimaMascota ? $ultimaMascota->id_mascota + 1 : 1;

            $mascota = new Mascota();
            $mascota->id_mascota = $nuevoId;
            $mascota->id_usuario = $idUsuario;
            $mascota->nombre = $request->nombre;
            $mascota->especie = $request->especie;
            $mascota->raza = $request->raza;
            $mascota->fecha_nacimiento = $request->fecha_nacimiento;
            $mascota->sexo = $request->sexo;
            $mascota->notas = $request->notas;
            $mascota->save();

            Log::info('Mascota creada exitosamente:', [
                'mascota' => $mascota,
                'usuario_asignado' => $usuarioSeleccionado ? $usuarioSeleccionado : $user
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Mascota creada exitosamente',
                'data' => $mascota
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear mascota:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al crear la mascota',
                'error' => $e->getMessage()
            ], 500);
        }
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
        $mascota->load('usuario');
        $formattedPet = [
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
        return response()->json($formattedPet);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Mascota $mascota)
    {
        $user = Auth::user();
        
        if ($user->rol !== 'admin' && $user->rol !== 'veterinario' && $mascota->id_usuario !== $user->id_usuario) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'especie' => 'sometimes|required|string|max:255',
            'raza' => 'sometimes|required|string|max:255',
            'fecha_nacimiento' => 'sometimes|required|date',
            'sexo' => 'sometimes|required|string|max:10',
            'notas' => 'nullable|string',
            'id_usuario' => 'sometimes|required|exists:usuarios,id_usuario'
        ]);

        // Si es veterinario o admin, permitir cambiar el dueño
        if ($user->rol === 'admin' || $user->rol === 'veterinario') {
            $mascota->update($request->all());
        } else {
            // Si es cliente, no permitir cambiar el dueño
            $data = $request->except('id_usuario');
            $mascota->update($data);
        }

        return response()->json($mascota);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Mascota $mascota)
    {
        $user = Auth::user();
        if (!$user) {
            \Log::warning('Intento de eliminar mascota sin autenticación', ['mascota_id' => $mascota->id_mascota]);
            return response()->json([
                'status' => 'error',
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        // Verificar permisos: solo el dueño, veterinarios o admins pueden eliminar mascotas
        if ($user->rol !== 'admin' && $user->rol !== 'veterinario' && $mascota->id_usuario !== $user->id_usuario) {
            \Log::warning('Intento de eliminar mascota sin permisos', ['user_id' => $user->id_usuario, 'mascota_id' => $mascota->id_mascota]);
            return response()->json([
                'status' => 'error',
                'message' => 'No tienes permiso para eliminar esta mascota'
            ], 403);
        }

        try {
            \DB::beginTransaction();
            \Log::info('Eliminando tratamientos y citas de la mascota', ['mascota_id' => $mascota->id_mascota]);
            // Eliminar los tratamientos relacionados con las citas de la mascota
            $tratamientosEliminados = \App\Models\Tratamiento::whereHas('cita', function($query) use ($mascota) {
                $query->where('id_mascota', $mascota->id_mascota);
            })->delete();
            // Eliminar las citas de la mascota
            $citasEliminadas = \App\Models\Cita::where('id_mascota', $mascota->id_mascota)->delete();
            \Log::info('Eliminando mascota', ['mascota_id' => $mascota->id_mascota]);
            $deleted = $mascota->delete();
            if (!$deleted) {
                \DB::rollBack();
                \Log::error('No se pudo eliminar la mascota', ['mascota_id' => $mascota->id_mascota]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'No se pudo eliminar la mascota'
                ], 500);
            }
            \DB::commit();
            \Log::info('Mascota eliminada exitosamente', ['mascota_id' => $mascota->id_mascota]);
            return response()->json([
                'status' => 'success',
                'message' => 'Mascota y sus datos relacionados eliminados correctamente',
                'data' => [
                    'tratamientos_eliminados' => $tratamientosEliminados,
                    'citas_eliminadas' => $citasEliminadas
                ]
            ], 200);
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Error al eliminar mascota y sus relaciones', [
                'error' => $e->getMessage(),
                'mascota_id' => $mascota->id_mascota,
                'usuario_id' => $user->id_usuario,
                'rol_usuario' => $user->rol
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar la mascota y sus datos relacionados',
                'error' => $e->getMessage()
            ], 500);
        }
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
