<?php

namespace Database\Seeders;

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
        DB::table('tratamientos')->insert([
            [
                'id_cita' => 1,
                'descripcion' => 'Vacuna contra panleucopenia, calicivirus y rinotraqueitis',
                'fecha_realizacion' => '2025-05-01',
                'observaciones' => 'El paciente respondió bien al tratamiento',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_cita' => 2,
                'descripcion' => 'Tratamiento contra parásitos internos',
                'fecha_realizacion' => '2025-05-02',
                'observaciones' => 'Se recomienda repetir el tratamiento en 3 meses',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_cita' => 3,
                'descripcion' => 'Limpieza profesional de dientes y encías',
                'fecha_realizacion' => '2025-05-03',
                'observaciones' => 'Se recomienda cepillado dental diario',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
