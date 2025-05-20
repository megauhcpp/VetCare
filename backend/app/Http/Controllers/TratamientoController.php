<?php

namespace App\Http\Controllers;

use App\Models\Tratamiento;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TratamientoController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->query('userId');
        
        if ($userId && $userId !== 'undefined') {
            $tratamientos = Tratamiento::whereHas('cita', function($query) use ($userId) {
                $query->where('id_veterinario', $userId)
                    ->orWhereHas('mascota', function($q) use ($userId) {
                        $q->where('id_usuario', $userId);
                    });
            })->get();
        } else {
            $tratamientos = Tratamiento::whereHas('cita', function($query) {
                $query->where('id_veterinario', Auth::user()->id_usuario)
                    ->orWhereHas('mascota', function($q) {
                        $q->where('id_usuario', Auth::user()->id_usuario);
                    });
            })->get();
        }
        
        return response()->json($tratamientos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cita' => 'required|exists:citas,id_cita',
            'nombre' => 'required|string',
            'descripcion' => 'required|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date',
            'estado' => 'required|string'
        ]);

        // Verificar que la cita pertenece al usuario o es su veterinario
        $cita = Cita::where('id_cita', $request->id_cita)
            ->where(function($query) {
                $query->where('id_veterinario', Auth::user()->id_usuario)
                    ->orWhereHas('mascota', function($q) {
                        $q->where('id_usuario', Auth::user()->id_usuario);
                    });
            })
            ->firstOrFail();

        $tratamiento = new Tratamiento();
        $tratamiento->id_cita = $request->id_cita;
        $tratamiento->nombre = $request->nombre;
        $tratamiento->descripcion = $request->descripcion;
        $tratamiento->fecha_inicio = $request->fecha_inicio;
        $tratamiento->fecha_fin = $request->fecha_fin;
        $tratamiento->estado = $request->estado;
        $tratamiento->save();

        return response()->json($tratamiento, 201);
    }

    public function show($id)
    {
        $tratamiento = Tratamiento::where('id_tratamiento', $id)
            ->whereHas('cita', function($query) {
                $query->where('id_veterinario', Auth::user()->id_usuario)
                    ->orWhereHas('mascota', function($q) {
                        $q->where('id_usuario', Auth::user()->id_usuario);
                    });
            })
            ->firstOrFail();
        
        return response()->json($tratamiento);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string',
            'descripcion' => 'required|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date',
            'estado' => 'required|string'
        ]);

        $tratamiento = Tratamiento::where('id_tratamiento', $id)
            ->whereHas('cita', function($query) {
                $query->where('id_veterinario', Auth::user()->id_usuario)
                    ->orWhereHas('mascota', function($q) {
                        $q->where('id_usuario', Auth::user()->id_usuario);
                    });
            })
            ->firstOrFail();

        $tratamiento->update($request->all());

        return response()->json($tratamiento);
    }

    public function destroy($id)
    {
        $tratamiento = Tratamiento::where('id_tratamiento', $id)
            ->whereHas('cita', function($query) {
                $query->where('id_veterinario', Auth::user()->id_usuario)
                    ->orWhereHas('mascota', function($q) {
                        $q->where('id_usuario', Auth::user()->id_usuario);
                    });
            })
            ->firstOrFail();
        
        $tratamiento->delete();

        return response()->json(null, 204);
    }
} 