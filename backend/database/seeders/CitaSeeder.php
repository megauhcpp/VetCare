<?php

namespace Database\Seeders;

use App\Models\Cita;
use App\Models\Mascota;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class CitaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener el veterinario (Juan Pérez)
        $veterinario = Usuario::where('email', 'juan.perez@vetcare.com')->first();
        
        // Obtener las mascotas
        $mascotas = Mascota::all();

        // Crear citas
        Cita::create([
            'fecha_hora' => now()->addDays(1)->setTime(10, 0),
            'motivo_consulta' => 'Consulta general',
            'estado' => 'pendiente',
            'id_mascota' => $mascotas[0]->id_mascota,
            'id_veterinario' => $veterinario->id_usuario,
        ]);

        Cita::create([
            'fecha_hora' => now()->addDays(2)->setTime(15, 30),
            'motivo_consulta' => 'Vacunación anual',
            'estado' => 'confirmada',
            'id_mascota' => $mascotas[1]->id_mascota,
            'id_veterinario' => $veterinario->id_usuario,
        ]);

        Cita::create([
            'fecha_hora' => now()->addDays(3)->setTime(11, 15),
            'motivo_consulta' => 'Control de peso',
            'estado' => 'completada',
            'id_mascota' => $mascotas[2]->id_mascota,
            'id_veterinario' => $veterinario->id_usuario,
        ]);
    }
}
