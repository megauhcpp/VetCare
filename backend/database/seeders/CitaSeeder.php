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
            'fecha' => now()->addDays(1)->format('Y-m-d'),
            'hora' => '10:00',
            'motivo' => 'Consulta general',
            'estado' => 'pendiente',
            'id_mascota' => $mascotas[0]->id_mascota,
            'id_veterinario' => $veterinario->id_usuario,
        ]);

        Cita::create([
            'fecha' => now()->addDays(2)->format('Y-m-d'),
            'hora' => '15:30',
            'motivo' => 'Vacunación anual',
            'estado' => 'confirmada',
            'id_mascota' => $mascotas[1]->id_mascota,
            'id_veterinario' => $veterinario->id_usuario,
        ]);

        Cita::create([
            'fecha' => now()->addDays(3)->format('Y-m-d'),
            'hora' => '11:15',
            'motivo' => 'Control de peso',
            'estado' => 'completada',
            'id_mascota' => $mascotas[2]->id_mascota,
            'id_veterinario' => $veterinario->id_usuario,
        ]);
    }
}
