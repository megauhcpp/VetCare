<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\Usuario;
use App\Models\Mascota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CitaController extends Controller
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

            Log::info('Fetching appointments for user:', ['user_id' => $user->id_usuario, 'role' => $user->rol]);

            // Si es admin o veterinario, obtener todas las citas
            if ($user->rol === 'admin' || $user->rol === 'veterinario') {
                $citas = Cita::with([
                    'mascota' => function($query) {
                        $query->select('id_mascota', 'id_usuario', 'nombre', 'especie', 'raza', 'fecha_nacimiento', 'sexo', 'notas');
                    },
                    'mascota.usuario' => function($query) {
                        $query->select('id_usuario', 'nombre', 'apellido', 'email');
                    },
                    'veterinario' => function($query) {
                        $query->select('id_usuario', 'nombre', 'apellido', 'email');
                    },
                    'tratamientos' => function($query) {
                        $query->select('id_tratamiento', 'id_cita', 'nombre', 'descripcion', 'estado', 'fecha_inicio', 'fecha_fin');
                    }
                ])->get();
            } else {
                // Si es cliente, obtener solo sus citas
                $citas = Cita::whereHas('mascota', function($query) use ($user) {
                    $query->where('id_usuario', $user->id_usuario);
                })
                ->with([
                    'mascota' => function($query) {
                        $query->select('id_mascota', 'id_usuario', 'nombre', 'especie', 'raza', 'fecha_nacimiento', 'sexo', 'notas');
                    },
                    'mascota.usuario' => function($query) {
                        $query->select('id_usuario', 'nombre', 'apellido', 'email');
                    },
                    'veterinario' => function($query) {
                        $query->select('id_usuario', 'nombre', 'apellido', 'email');
                    },
                    'tratamientos' => function($query) {
                        $query->select('id_tratamiento', 'id_cita', 'nombre', 'descripcion', 'estado', 'fecha_inicio', 'fecha_fin');
                    }
                ])
                ->get();
            }

            Log::info('Found appointments:', ['count' => $citas->count()]);

            $formattedAppointments = $citas->map(function ($cita) {
                return [
                    'id_cita' => $cita->id_cita,
                    'fecha_hora' => $cita->fecha_hora,
                    'tipo_consulta' => $cita->tipo_consulta,
                    'motivo_consulta' => $cita->motivo_consulta,
                    'estado' => $cita->estado,
                    'mascota' => [
                        'id_mascota' => $cita->mascota->id_mascota,
                        'nombre' => $cita->mascota->nombre,
                        'especie' => $cita->mascota->especie,
                        'raza' => $cita->mascota->raza,
                        'usuario' => [
                            'id_usuario' => $cita->mascota->usuario->id_usuario,
                            'nombre' => $cita->mascota->usuario->nombre,
                            'apellido' => $cita->mascota->usuario->apellido,
                            'email' => $cita->mascota->usuario->email
                        ]
                    ],
                    'veterinario' => [
                        'id_usuario' => $cita->veterinario->id_usuario,
                        'nombre' => $cita->veterinario->nombre,
                        'apellido' => $cita->veterinario->apellido,
                        'email' => $cita->veterinario->email
                    ],
                    'tratamientos' => $cita->tratamientos->map(function ($tratamiento) {
                        return [
                            'id_tratamiento' => $tratamiento->id_tratamiento,
                            'nombre' => $tratamiento->nombre,
                            'descripcion' => $tratamiento->descripcion,
                            'estado' => $tratamiento->estado,
                            'fecha_inicio' => $tratamiento->fecha_inicio,
                            'fecha_fin' => $tratamiento->fecha_fin
                        ];
                    })
                ];
            });

            Log::info('Formatted appointments:', ['count' => $formattedAppointments->count()]);

            return response()->json([
                'status' => 'success',
                'data' => $formattedAppointments
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener citas:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener las citas',
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
            'id_mascota' => 'required|exists:mascotas,id_mascota',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'fecha_hora' => 'required|date',
            'motivo_consulta' => 'required|string',
            'tipo_consulta' => 'required|string'
        ]);

        $user = Auth::user();
        
        // Verificar permisos
        if ($user->rol === 'cliente') {
            // Verificar que la mascota pertenece al cliente
            $mascota = Mascota::findOrFail($request->id_mascota);
            if ($mascota->id_usuario !== $user->id_usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No tienes permiso para crear citas para esta mascota'
                ], 403);
            }
        }

        // Establecer estado automáticamente según el rol
        $estado = 'pendiente'; // Estado por defecto para clientes
        if ($user->rol === 'veterinario' || $user->rol === 'admin') {
            $estado = 'confirmada';
        }

        // Validar que no exista otra cita para el mismo veterinario, fecha y hora (ignorando segundos y milisegundos)
        $citaExistente = \App\Models\Cita::where('id_usuario', $request->id_usuario)
            ->where(DB::raw('DATE_FORMAT(fecha_hora, "%Y-%m-%d %H:%i")'), date('Y-m-d H:i', strtotime($request->fecha_hora)))
            ->where('estado', '!=', 'cancelada')
            ->first();

        if ($citaExistente) {
            return response()->json([
                'error' => 'El veterinario ya tiene una cita programada para esa fecha y hora'
            ], 422);
        }

        // Obtener el último ID de cita
        $ultimaCita = Cita::orderBy('id_cita', 'desc')->first();
        $nuevoId = $ultimaCita ? $ultimaCita->id_cita + 1 : 1;

        $cita = new Cita();
        $cita->id_cita = $nuevoId;
        $cita->id_mascota = $request->id_mascota;
        $cita->id_usuario = $request->id_usuario;
        $cita->fecha_hora = $request->fecha_hora;
        $cita->motivo_consulta = $request->motivo_consulta;
        $cita->tipo_consulta = $request->tipo_consulta;
        $cita->estado = $estado;
        $cita->save();

        // Cargar las relaciones para la respuesta
        $cita->load(['mascota.usuario', 'veterinario']);

        return response()->json([
            'status' => 'success',
            'message' => 'Cita creada exitosamente',
            'data' => $cita
        ], 201);
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
            'motivo_consulta' => 'sometimes|required|string',
            'fecha_hora' => 'sometimes|required|date',
            'tipo_consulta' => 'sometimes|required|string|in:consulta_general,vacunacion,cirugia,urgencia,control',
            'estado' => 'sometimes|required|string|in:pendiente,confirmada,completada,cancelada',
            'id_usuario' => 'sometimes|required|exists:usuarios,id_usuario'
        ]);

        if ($request->has('id_usuario')) {
            // Verificar que el veterinario existe y tiene el rol correcto
            $veterinario = Usuario::where('id_usuario', $request->id_usuario)
                ->where('rol', 'veterinario')
                ->first();

            if (!$veterinario) {
                return response()->json([
                    'error' => 'El veterinario seleccionado no es válido'
                ], 422);
            }
        }

        if ($request->has('fecha_hora') || $request->has('id_usuario')) {
            $fechaHora = $request->fecha_hora ?? $cita->fecha_hora;
            $idVeterinario = $request->id_usuario ?? $cita->id_usuario;

            $citaExistente = Cita::where('id_usuario', $idVeterinario)
                ->where(DB::raw('DATE_FORMAT(fecha_hora, "%Y-%m-%d %H:%i")'), date('Y-m-d H:i', strtotime($fechaHora)))
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
        
        // Cargar las relaciones con los datos necesarios
        $cita->load([
            'mascota' => function($query) {
                $query->select('id_mascota', 'id_usuario', 'nombre', 'especie', 'raza', 'fecha_nacimiento', 'sexo', 'notas');
            },
            'mascota.usuario' => function($query) {
                $query->select('id_usuario', 'nombre', 'apellido', 'email');
            },
            'veterinario' => function($query) {
                $query->select('id_usuario', 'nombre', 'apellido', 'email');
            }
        ]);

        return response()->json($cita);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cita $cita)
    {
        // Eliminar todos los tratamientos asociados a la cita
        $cita->tratamientos()->delete();
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
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'fecha' => 'required|date',
        ]);

        $citas = Cita::where('id_usuario', $request->id_usuario)
            ->whereDate('fecha_hora', $request->fecha)
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fecha_hora', 'asc')
            ->get(['fecha_hora', 'estado']);

        return response()->json($citas);
    }
}
