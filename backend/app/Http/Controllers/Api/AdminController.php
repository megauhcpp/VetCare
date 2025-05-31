<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Models\Mascota;
use App\Models\Cita;
use App\Models\Tratamiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // User Management
    public function getUsers()
    {
        $users = Usuario::all();
        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'password' => 'required|string|min:8',
            'rol' => 'required|string|in:cliente,veterinario,admin',
        ]);

        $user = Usuario::create([
            'nombre' => $request->nombre,
            'apellido' => $request->apellido,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rol' => $request->rol,
        ]);

        return response()->json($user, 201);
    }

    public function updateUser(Request $request, $user)
    {
        $usuario = Usuario::findOrFail($user);

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'apellido' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:usuarios,email,' . $usuario->id_usuario . ',id_usuario',
            'password' => 'sometimes|required|string|min:8',
            'rol' => 'sometimes|required|string|in:cliente,veterinario,admin',
        ]);

        if ($request->has('password')) {
            $request->merge(['password' => Hash::make($request->password)]);
        }

        $usuario->update($request->all());
        return response()->json($usuario);
    }

    public function deleteUser($user)
    {
        try {
            DB::beginTransaction();
            
            $usuario = Usuario::findOrFail($user);
            
            // Eliminar tratamientos de las citas de sus mascotas
            foreach ($usuario->mascotas as $mascota) {
                // Eliminar tratamientos de las citas de la mascota
                Tratamiento::whereHas('cita', function($query) use ($mascota) {
                    $query->where('id_mascota', $mascota->id_mascota);
                })->delete();
                
                // Eliminar citas de la mascota
                Cita::where('id_mascota', $mascota->id_mascota)->delete();
                
                // Eliminar la mascota
                $mascota->delete();
            }

            // Eliminar citas donde el usuario es veterinario
            if ($usuario->rol === 'veterinario') {
                // Eliminar tratamientos de las citas donde es veterinario
                Tratamiento::whereHas('cita', function($query) use ($usuario) {
                    $query->where('id_usuario', $usuario->id_usuario);
                })->delete();
                
                // Eliminar citas donde es veterinario
                Cita::where('id_usuario', $usuario->id_usuario)->delete();
            }

            // Eliminar el usuario
            $usuario->delete();
            
            DB::commit();
            
            return response()->json([
                'message' => 'Usuario y sus datos relacionados eliminados correctamente'
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al eliminar usuario:', [
                'error' => $e->getMessage(),
                'user_id' => $user
            ]);
            
            return response()->json([
                'message' => 'Error al eliminar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Pet Management
    public function getPets()
    {
        $pets = Mascota::with('usuario')->get();
        return response()->json($pets);
    }

    public function createPet(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'especie' => 'required|string|max:255',
            'raza' => 'required|string|max:255',
            'fecha_nacimiento' => 'required|date',
            'sexo' => 'required|string|max:10',
            'notas' => 'nullable|string',
            'id_usuario' => 'required|exists:usuarios,id_usuario'
        ]);

        $mascota = Mascota::create([
            'nombre' => $request->nombre,
            'especie' => $request->especie,
            'raza' => $request->raza,
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'sexo' => $request->sexo,
            'notas' => $request->notas,
            'id_usuario' => $request->id_usuario
        ]);

        return response()->json($mascota, 201);
    }

    public function updatePet(Request $request, $pet)
    {
        $mascota = Mascota::findOrFail($pet);

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'especie' => 'sometimes|required|string|max:255',
            'raza' => 'sometimes|required|string|max:255',
            'fecha_nacimiento' => 'sometimes|required|date',
            'sexo' => 'sometimes|required|string|max:10',
            'notas' => 'nullable|string',
            'id_usuario' => 'sometimes|required|exists:usuarios,id_usuario'
        ]);

        $mascota->update($request->all());
        return response()->json($mascota);
    }

    public function deletePet($pet)
    {
        $mascota = Mascota::findOrFail($pet);
        $mascota->delete();
        return response()->json(null, 204);
    }

    // Treatment Management
    public function getTreatments()
    {
        $treatments = Tratamiento::with(['cita.mascota', 'cita.veterinario'])->get();
        return response()->json($treatments);
    }

    public function createTreatment(Request $request)
    {
        $request->validate([
            'descripcion' => 'required|string',
            'cita_id' => 'required|exists:citas,id_cita',
        ]);

        $treatment = Tratamiento::create($request->all());
        return response()->json($treatment, 201);
    }

    public function updateTreatment(Request $request, $treatment)
    {
        $tratamiento = Tratamiento::findOrFail($treatment);

        $request->validate([
            'descripcion' => 'sometimes|required|string',
            'cita_id' => 'sometimes|required|exists:citas,id_cita',
        ]);

        $tratamiento->update($request->all());
        return response()->json($tratamiento);
    }

    public function deleteTreatment($treatment)
    {
        $tratamiento = Tratamiento::findOrFail($treatment);
        $tratamiento->delete();
        return response()->json(null, 204);
    }

    // Appointment Management
    public function getAppointments()
    {
        $appointments = Cita::with(['mascota.usuario', 'veterinario', 'tratamientos'])->get();
        return response()->json($appointments);
    }

    public function createAppointment(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i',
            'motivo' => 'required|string',
            'estado' => 'required|string|in:pendiente,confirmada,cancelada,completada',
            'mascota_id' => 'required|exists:mascotas,id_mascota',
            'veterinario_id' => 'required|exists:usuarios,id_usuario',
        ]);

        $appointment = Cita::create($request->all());
        return response()->json($appointment, 201);
    }

    public function updateAppointment(Request $request, $appointment)
    {
        $cita = Cita::findOrFail($appointment);

        $request->validate([
            'fecha' => 'sometimes|required|date',
            'hora' => 'sometimes|required|date_format:H:i',
            'motivo' => 'sometimes|required|string',
            'estado' => 'sometimes|required|string|in:pendiente,confirmada,cancelada,completada',
            'mascota_id' => 'sometimes|required|exists:mascotas,id_mascota',
            'veterinario_id' => 'sometimes|required|exists:usuarios,id_usuario',
        ]);

        $cita->update($request->all());
        return response()->json($cita);
    }

    public function deleteAppointment($appointment)
    {
        $cita = Cita::findOrFail($appointment);
        $cita->delete();
        return response()->json(null, 204);
    }
} 