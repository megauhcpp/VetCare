<?php

namespace App\Http\Controllers;

use App\Models\Mascota;
use App\Models\Tratamiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MascotaController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $mascotas = Mascota::whereHas('usuario', function($query) use ($user) {
                $query->where('id_usuario', $user->id_usuario);
            })
            ->with(['citas', 'tratamientos'])
            ->get();
            
            return response()->json($mascotas);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener las mascotas'], 500);
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

            $mascota = new Mascota();
            $mascota->usuario()->associate($user);
            $mascota->nombre = $request->nombre;
            $mascota->especie = $request->especie;
            $mascota->raza = $request->raza;
            $mascota->fecha_nacimiento = $request->fecha_nacimiento;
            $mascota->sexo = $request->sexo;
            $mascota->notas = $request->notas;
            $mascota->save();

            return response()->json($mascota, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al crear la mascota'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $mascota = Mascota::whereHas('usuario', function($query) use ($user) {
                $query->where('id_usuario', $user->id_usuario);
            })
            ->where('id_mascota', $id)
            ->with(['citas', 'tratamientos'])
            ->firstOrFail();
            
            return response()->json($mascota);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Mascota no encontrada'], 404);
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

            $mascota = Mascota::whereHas('usuario', function($query) use ($user) {
                $query->where('id_usuario', $user->id_usuario);
            })
            ->where('id_mascota', $id)
            ->firstOrFail();

            $mascota->nombre = $request->nombre;
            $mascota->especie = $request->especie;
            $mascota->raza = $request->raza;
            $mascota->fecha_nacimiento = $request->fecha_nacimiento;
            $mascota->sexo = $request->sexo;
            $mascota->notas = $request->notas;
            $mascota->save();

            return response()->json($mascota);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al actualizar la mascota'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            $mascota = Mascota::whereHas('usuario', function($query) use ($user) {
                $query->where('id_usuario', $user->id_usuario);
            })
            ->where('id_mascota', $id)
            ->firstOrFail();
            
            $mascota->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar la mascota'], 500);
        }
    }
}
