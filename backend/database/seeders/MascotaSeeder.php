<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MascotaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('mascotas')->insert([
            [
                'nombre' => 'Max',
                'especie' => 'Perro',
                'raza' => 'Labrador',
                'fecha_nacimiento' => '2022-01-01',
                'id_usuario' => 3, // Carlos López
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Luna',
                'especie' => 'Gato',
                'raza' => 'Siamés',
                'fecha_nacimiento' => '2023-02-15',
                'id_usuario' => 3, // Carlos López
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Rocky',
                'especie' => 'Perro',
                'raza' => 'Bulldog',
                'fecha_nacimiento' => '2020-06-30',
                'id_usuario' => 3, // Carlos López
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
} 