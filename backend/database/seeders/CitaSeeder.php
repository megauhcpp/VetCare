<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('citas')->insert([
            [
                'id_mascota' => 1, // Max
                'id_veterinario' => 2, // María García
                'motivo_consulta' => 'Consulta general',
                'fecha_hora' => '2025-05-01 10:00:00',
                'estado' => 'pendiente',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_mascota' => 2, // Luna
                'id_veterinario' => 2, // María García
                'motivo_consulta' => 'Vacunación anual',
                'fecha_hora' => '2025-05-02 15:30:00',
                'estado' => 'confirmada',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_mascota' => 3, // Rocky
                'id_veterinario' => 2, // María García
                'motivo_consulta' => 'Control postoperatorio',
                'fecha_hora' => '2025-05-03 11:00:00',
                'estado' => 'completada',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
