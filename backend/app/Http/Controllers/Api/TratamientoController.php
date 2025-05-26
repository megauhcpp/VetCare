<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tratamiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Cita;
use Illuminate\Support\Facades\DB;

class TratamientoController extends Controller
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

            Log::info('Fetching treatments for user:', ['user_id' => $user->id_usuario, 'role' => $user->rol]);

            // Si es admin o veterinario, obtener todos los tratamientos
            if ($user->rol === 'admin' || $user->rol === 'veterinario') {
                $tratamientos = Tratamiento::with([
                    'cita' => function($query) {
                        $query->select('id_cita', 'id_mascota', 'id_usuario', 'fecha_hora', 'tipo_consulta', 'motivo_consulta', 'estado');
                    },
                    'cita.mascota' => function($query) {
                        $query->select('id_mascota', 'id_usuario', 'nombre', 'especie', 'raza', 'fecha_nacimiento', 'sexo', 'notas');
                    },
                    'cita.mascota.usuario' => function($query) {
                        $query->select('id_usuario', 'nombre', 'apellido', 'email');
                    },
                    'cita.veterinario' => function($query) {
                        $query->select('id_usuario', 'nombre', 'apellido', 'email');
                    }
                ])->get();
            } else {
                // Si es cliente, obtener solo sus tratamientos
                $tratamientos = Tratamiento::whereHas('cita.mascota', function($query) use ($user) {
                    $query->where('id_usuario', $user->id_usuario);
                })
                ->with([
                    'cita' => function($query) {
                        $query->select('id_cita', 'id_mascota', 'id_usuario', 'fecha_hora', 'tipo_consulta', 'motivo_consulta', 'estado');
                    },
                    'cita.mascota' => function($query) {
                        $query->select('id_mascota', 'id_usuario', 'nombre', 'especie', 'raza', 'fecha_nacimiento', 'sexo', 'notas');
                    },
                    'cita.mascota.usuario' => function($query) {
                        $query->select('id_usuario', 'nombre', 'apellido', 'email');
                    },
                    'cita.veterinario' => function($query) {
                        $query->select('id_usuario', 'nombre', 'apellido', 'email');
                    }
                ])
                ->get();
            }

            Log::info('Found treatments:', ['count' => $tratamientos->count()]);

            $formattedTreatments = $tratamientos->map(function ($tratamiento) {
                return [
                    'id_tratamiento' => $tratamiento->id_tratamiento,
                    'nombre' => $tratamiento->nombre,
                    'descripcion' => $tratamiento->descripcion,
                    'precio' => $tratamiento->precio,
                    'fecha_inicio' => $tratamiento->fecha_inicio,
                    'fecha_fin' => $tratamiento->fecha_fin,
                    'estado' => $tratamiento->estado,
                    'cita' => [
                        'id_cita' => $tratamiento->cita->id_cita,
                        'fecha_hora' => $tratamiento->cita->fecha_hora,
                        'tipo_consulta' => $tratamiento->cita->tipo_consulta,
                        'motivo_consulta' => $tratamiento->cita->motivo_consulta,
                        'estado' => $tratamiento->cita->estado,
                        'mascota' => [
                            'id_mascota' => $tratamiento->cita->mascota->id_mascota,
                            'nombre' => $tratamiento->cita->mascota->nombre,
                            'especie' => $tratamiento->cita->mascota->especie,
                            'raza' => $tratamiento->cita->mascota->raza,
                            'fecha_nacimiento' => $tratamiento->cita->mascota->fecha_nacimiento,
                            'sexo' => $tratamiento->cita->mascota->sexo,
                            'notas' => $tratamiento->cita->mascota->notas,
                            'usuario' => [
                                'id_usuario' => $tratamiento->cita->mascota->usuario->id_usuario,
                                'nombre' => $tratamiento->cita->mascota->usuario->nombre,
                                'apellido' => $tratamiento->cita->mascota->usuario->apellido,
                                'email' => $tratamiento->cita->mascota->usuario->email
                            ]
                        ],
                        'veterinario' => [
                            'id_usuario' => $tratamiento->cita->veterinario->id_usuario,
                            'nombre' => $tratamiento->cita->veterinario->nombre,
                            'apellido' => $tratamiento->cita->veterinario->apellido,
                            'email' => $tratamiento->cita->veterinario->email
                        ]
                    ]
                ];
            });

            Log::info('Formatted treatments:', ['count' => $formattedTreatments->count()]);

            return response()->json([
                'status' => 'success',
                'data' => $formattedTreatments
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener tratamientos:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener los tratamientos',
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
            ->whereHas('mascota', function($query) {
                $query->where('id_usuario', Auth::user()->id_usuario);
            })
            ->firstOrFail();

        $tratamiento = Tratamiento::create($request->all());
        $tratamiento->load(['cita.mascota', 'cita.veterinario']);

        return response()->json($tratamiento, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tratamiento $tratamiento)
    {
        // Verificar que el tratamiento pertenece al usuario
        if ($tratamiento->cita->mascota->id_usuario !== Auth::user()->id_usuario) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $tratamiento->load(['cita.mascota', 'cita.veterinario']);
        return response()->json($tratamiento);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tratamiento $tratamiento)
    {
        // Verificar que el tratamiento pertenece al usuario
        if ($tratamiento->cita->mascota->id_usuario !== Auth::user()->id_usuario) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'nombre' => 'sometimes|required|string',
            'descripcion' => 'sometimes|required|string',
            'precio' => 'sometimes|required|numeric|min:0',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'sometimes|required|date|after_or_equal:fecha_inicio',
            'estado' => 'sometimes|required|string|in:pendiente,en_progreso,completado,cancelado'
        ]);

        $tratamiento->update($request->all());
        $tratamiento->load(['cita.mascota', 'cita.veterinario']);

        return response()->json($tratamiento);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tratamiento $tratamiento)
    {
        // Verificar que el tratamiento pertenece al usuario
        if ($tratamiento->cita->mascota->id_usuario !== Auth::user()->id_usuario) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $tratamiento->delete();
        return response()->json(null, 204);
    }

    /**
     * Update the status of a treatment.
     */
    public function updateEstado(Request $request, $id)
    {
        try {
            Log::info('Iniciando actualización de estado de tratamiento', [
                'tratamiento_id' => $id,
                'request_data' => $request->all()
            ]);

            $user = Auth::user();
            
            if (!$user) {
                Log::warning('Intento de actualización sin usuario autenticado');
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            Log::info('Usuario autenticado', [
                'user_id' => $user->id_usuario,
                'role' => $user->rol
            ]);

            // Solo permitir a admin y veterinario cambiar el estado
            if ($user->rol !== 'admin' && $user->rol !== 'veterinario') {
                Log::warning('Intento de actualización por usuario no autorizado', [
                    'user_id' => $user->id_usuario,
                    'role' => $user->rol
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Solo los administradores y veterinarios pueden cambiar el estado de los tratamientos'
                ], 403);
            }

            $request->validate([
                'estado' => 'required|string|in:pendiente,en_progreso,completado,cancelado'
            ]);

            // Buscar el tratamiento
            $tratamiento = Tratamiento::find($id);
            if (!$tratamiento) {
                Log::error('Tratamiento no encontrado', ['id' => $id]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tratamiento no encontrado'
                ], 404);
            }

            Log::info('Validación exitosa, actualizando estado', [
                'old_state' => $tratamiento->estado,
                'new_state' => $request->estado
            ]);

            // Actualizar directamente usando Query Builder
            DB::table('tratamientos')
                ->where('id_tratamiento', $id)
                ->update(['estado' => $request->estado]);

            // Recargar el tratamiento con sus relaciones
            $tratamiento = Tratamiento::with(['cita.mascota', 'cita.veterinario'])
                ->find($id);

            Log::info('Estado actualizado exitosamente', [
                'tratamiento_id' => $id,
                'new_state' => $tratamiento->estado
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $tratamiento
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación al actualizar estado', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al actualizar estado del tratamiento', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'tratamiento_id' => $id ?? null,
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar el estado del tratamiento',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
