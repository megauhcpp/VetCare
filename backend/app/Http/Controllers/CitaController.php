<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\Mascota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CitaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $userId = $request->query('userId');
        
        if ($userId && $userId !== 'undefined') {
            $citas = Cita::where('id_veterinario', $userId)
                ->orWhereHas('mascota', function($query) use ($userId) {
                    $query->where('id_usuario', $userId);
                })
                ->with(['mascota', 'tratamientos'])
                ->get();
        } else {
            $citas = Cita::where('id_veterinario', Auth::user()->id_usuario)
                ->orWhereHas('mascota', function($query) {
                    $query->where('id_usuario', Auth::user()->id_usuario);
                })
                ->with(['mascota', 'tratamientos'])
                ->get();
        }
        
        return response()->json($citas);
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
        $request->validate([
            'id_mascota' => 'required|exists:mascotas,id_mascota',
            'fecha_hora' => 'required|date',
            'tipo_consulta' => 'required|string',
            'observaciones' => 'nullable|string',
            'estado' => 'required|string'
        ]);

        // Verificar que la mascota pertenece al usuario
        $mascota = Mascota::where('id_usuario', Auth::user()->id_usuario)
            ->where('id_mascota', $request->id_mascota)
            ->firstOrFail();

        $cita = new Cita();
        $cita->id_mascota = $request->id_mascota;
        $cita->id_veterinario = Auth::user()->id_usuario;
        $cita->fecha_hora = $request->fecha_hora;
        $cita->tipo_consulta = $request->tipo_consulta;
        $cita->observaciones = $request->observaciones;
        $cita->estado = $request->estado;
        $cita->save();

        return response()->json($cita, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $cita = Cita::where('id_cita', $id)
            ->where(function($query) {
                $query->where('id_veterinario', Auth::user()->id_usuario)
                    ->orWhereHas('mascota', function($q) {
                        $q->where('id_usuario', Auth::user()->id_usuario);
                    });
            })
            ->with(['mascota', 'tratamientos'])
            ->firstOrFail();
        
        return response()->json($cita);
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
        $request->validate([
            'fecha_hora' => 'required|date',
            'tipo_consulta' => 'required|string',
            'observaciones' => 'nullable|string',
            'estado' => 'required|string'
        ]);

        $cita = Cita::where('id_cita', $id)
            ->where(function($query) {
                $query->where('id_veterinario', Auth::user()->id_usuario)
                    ->orWhereHas('mascota', function($q) {
                        $q->where('id_usuario', Auth::user()->id_usuario);
                    });
            })
            ->firstOrFail();

        $cita->update($request->all());

        return response()->json($cita);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $cita = Cita::where('id_cita', $id)
            ->where(function($query) {
                $query->where('id_veterinario', Auth::user()->id_usuario)
                    ->orWhereHas('mascota', function($q) {
                        $q->where('id_usuario', Auth::user()->id_usuario);
                    });
            })
            ->firstOrFail();
        
        $cita->delete();

        return response()->json(null, 204);
    }
}
