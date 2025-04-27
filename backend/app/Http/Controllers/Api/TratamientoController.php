<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tratamiento;
use Illuminate\Http\Request;

class TratamientoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tratamientos = Tratamiento::with('cita')->get();
        return response()->json($tratamientos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_cita' => 'required|exists:citas,id_cita',
            'descripcion' => 'required|string',
            'fecha_realizacion' => 'required|date',
            'observaciones' => 'required|string',
        ]);

        $tratamiento = Tratamiento::create($request->all());

        return response()->json($tratamiento, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tratamiento $tratamiento)
    {
        $tratamiento->load('cita');
        return response()->json($tratamiento);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tratamiento $tratamiento)
    {
        $request->validate([
            'id_cita' => 'sometimes|required|exists:citas,id_cita',
            'descripcion' => 'sometimes|required|string',
            'fecha_realizacion' => 'sometimes|required|date',
            'observaciones' => 'sometimes|required|string',
        ]);

        $tratamiento->update($request->all());

        return response()->json($tratamiento);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tratamiento $tratamiento)
    {
        $tratamiento->delete();
        return response()->json(null, 204);
    }
}
