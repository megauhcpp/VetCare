<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tratamiento;
use Carbon\Carbon;

class TratamientoSeeder extends Seeder
{
    public function run(): void
    {
        // Tratamiento para Luna (cita 1)
        Tratamiento::create([
            'id_cita' => 1,
            'nombre' => 'Desparasitación',
            'descripcion' => 'Tratamiento antiparasitario mensual',
            'precio' => 25.00,
            'fecha_inicio' => Carbon::now(),
            'fecha_fin' => Carbon::now()->addMonth(),
            'estado' => 'pendiente'
        ]);

        // Tratamiento para Rocky (cita 2)
        Tratamiento::create([
            'id_cita' => 2,
            'nombre' => 'Vacuna Triple Felina',
            'descripcion' => 'Vacunación anual contra enfermedades felinas',
            'precio' => 45.00,
            'fecha_inicio' => Carbon::now(),
            'fecha_fin' => Carbon::now()->addYear(),
            'estado' => 'en_progreso'
        ]);

        // Tratamiento para Milo (cita 3)
        Tratamiento::create([
            'id_cita' => 3,
            'nombre' => 'Tratamiento Digestivo',
            'descripcion' => 'Medicación para problemas digestivos',
            'precio' => 35.00,
            'fecha_inicio' => Carbon::now(),
            'fecha_fin' => Carbon::now()->addDays(7),
            'estado' => 'pendiente'
        ]);
    }
} 