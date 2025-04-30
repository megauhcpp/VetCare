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
            'nombre' => 'Vacunación Triple Felina',
            'descripcion' => 'Vacunación contra panleucopenia, calicivirus y rinotraqueitis',
            'fecha_inicio' => now()->format('Y-m-d'),
            'fecha_fin' => now()->addMonths(1)->format('Y-m-d'),
            'id_cita' => $citas[1]->id_cita,
            'id_veterinario' => $veterinario->id_usuario,
        ]);

        Tratamiento::create([
            'nombre' => 'Control de Peso',
            'descripcion' => 'Plan de alimentación y ejercicio para control de peso',
            'fecha_inicio' => now()->format('Y-m-d'),
            'fecha_fin' => now()->addMonths(3)->format('Y-m-d'),
            'id_cita' => $citas[2]->id_cita,
            'id_veterinario' => $veterinario->id_usuario,
        ]);

        Tratamiento::create([
            'nombre' => 'Desparasitación',
            'descripcion' => 'Tratamiento antiparasitario interno y externo',
            'fecha_inicio' => now()->format('Y-m-d'),
            'fecha_fin' => now()->addMonths(6)->format('Y-m-d'),
            'id_cita' => $citas[0]->id_cita,
            'id_veterinario' => $veterinario->id_usuario,
        ]);
    }
}
