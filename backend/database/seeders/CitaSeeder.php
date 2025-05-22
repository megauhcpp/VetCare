<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cita;
use Carbon\Carbon;

class CitaSeeder extends Seeder
{
    public function run(): void
    {
        // Cita para Luna (mascota 1)
        Cita::create([
            'id_mascota' => 1,
            'id_usuario' => 2, // veterinario
            'fecha_hora' => Carbon::now()->addDays(2),
            'tipo_consulta' => 'Revisión general',
            'motivo_consulta' => 'Chequeo anual',
            'estado' => 'pendiente'
        ]);

        // Cita para Rocky (mascota 2)
        Cita::create([
            'id_mascota' => 2,
            'id_usuario' => 2, // veterinario
            'fecha_hora' => Carbon::now()->addDays(5),
            'tipo_consulta' => 'Vacunación',
            'motivo_consulta' => 'Vacuna anual',
            'estado' => 'confirmada'
        ]);

        // Cita para Milo (mascota 3)
        Cita::create([
            'id_mascota' => 3,
            'id_usuario' => 2, // veterinario
            'fecha_hora' => Carbon::now()->addDays(7),
            'tipo_consulta' => 'Urgencia',
            'motivo_consulta' => 'Problemas digestivos',
            'estado' => 'pendiente'
        ]);
    }
} 