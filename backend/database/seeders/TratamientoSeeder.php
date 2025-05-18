<?php

namespace Database\Seeders;

use App\Models\Cita;
use App\Models\Tratamiento;
use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TratamientoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener el veterinario (Juan Pérez)
        $veterinario = Usuario::where('email', 'juan.perez@vetcare.com')->first();
        
        // Obtener las citas
        $citas = Cita::all();

        // Crear tratamientos
        Tratamiento::create([
            'descripcion' => 'Vacunación contra panleucopenia, calicivirus y rinotraqueitis',
            'fecha_realizacion' => now()->format('Y-m-d'),
            'observaciones' => 'Paciente respondió bien a la vacunación.',
            'id_cita' => $citas[1]->id_cita,
        ]);

        Tratamiento::create([
            'descripcion' => 'Plan de alimentación y ejercicio para control de peso',
            'fecha_realizacion' => now()->addDays(1)->format('Y-m-d'),
            'observaciones' => 'Se recomienda seguimiento mensual.',
            'id_cita' => $citas[2]->id_cita,
        ]);

        Tratamiento::create([
            'descripcion' => 'Tratamiento antiparasitario interno y externo',
            'fecha_realizacion' => now()->addDays(2)->format('Y-m-d'),
            'observaciones' => 'Sin reacciones adversas.',
            'id_cita' => $citas[0]->id_cita,
        ]);
    }
}
