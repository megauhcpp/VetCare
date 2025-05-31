<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usuarios = Usuario::all();
        return response()->json($usuarios);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'password' => 'required|string|min:8',
            'rol' => 'required|string|in:cliente,veterinario,admin',
        ]);

        $usuario = Usuario::create([
            'nombre' => $request->nombre,
            'apellido' => $request->apellido,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rol' => $request->rol,
        ]);

        return response()->json($usuario, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Usuario $usuario)
    {
        return response()->json($usuario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Usuario $usuario)
    {
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Usuario $usuario)
    {
        $usuario->delete();
        return response()->json(null, 204);
    }

    // Métodos adicionales

    // Obtener todos los veterinarios
    public function getVeterinarios()
    {
        try {
            $veterinarios = Usuario::where('rol', 'veterinario')
                ->select('id_usuario', 'nombre', 'apellido', 'email')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $veterinarios
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener los veterinarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Obtener todos los clientes
    public function getClientes()
    {
        try {
            $clientes = Usuario::where('rol', 'cliente')
                ->select('id_usuario', 'nombre', 'apellido', 'email')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $clientes
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al obtener clientes:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener los clientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Obtener las mascotas de un usuario
    public function getMascotas(Usuario $usuario)
    {
        $mascotas = $usuario->mascotas()->with('citas')->get();
        return response()->json($mascotas);
    }

    // Obtener las citas de un veterinario
    public function getCitasVeterinario(Usuario $usuario)
    {
        if ($usuario->rol !== 'veterinario') {
            return response()->json(['error' => 'El usuario no es un veterinario'], 403);
        }

        $citas = $usuario->citasComoVeterinario()
            ->with(['mascota.usuario', 'tratamientos'])
            ->get();
        return response()->json($citas);
    }

    // Cambiar contraseña
    public function cambiarPassword(Request $request, Usuario $usuario)
    {
        $request->validate([
            'password_actual' => 'required|string',
            'password_nuevo' => 'required|string|min:8|different:password_actual',
        ]);

        if (!Hash::check($request->password_actual, $usuario->password)) {
            return response()->json(['error' => 'La contraseña actual es incorrecta'], 400);
        }

        $usuario->update([
            'password' => Hash::make($request->password_nuevo)
        ]);

        return response()->json(['message' => 'Contraseña actualizada correctamente']);
    }

    // Obtener el usuario autenticado
    public function getUser(Request $request)
    {
        return response()->json($request->user());
    }

    // Actualizar el usuario autenticado
    public function updateUser(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'apellido' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:usuarios,email,' . $user->id_usuario,
        ]);

        $user->update($request->all());

        return response()->json($user);
    }
}
