<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mascota;

class MascotaSeeder extends Seeder
{
    public function run(): void
    {
        // Mascota para Gabriel (usuario 5)
        Mascota::create([
            'id_usuario' => 5,
            'nombre' => 'Luna',
            'especie' => 'Perro',
            'raza' => 'Labrador',
            'fecha_nacimiento' => '2020-05-15',
            'sexo' => 'Hembra',
            'notas' => 'Mascota muy activa'
        ]);

        // Mascota para Joan (usuario 6)
        Mascota::create([
            'id_usuario' => 6,
            'nombre' => 'Rocky',
            'especie' => 'Perro',
            'raza' => 'Pastor Alemán',
            'fecha_nacimiento' => '2019-03-20',
            'sexo' => 'Macho',
            'notas' => 'Mascota tranquila'
        ]);

        // Mascota para Jesús (usuario 7)
        Mascota::create([
            'id_usuario' => 7,
            'nombre' => 'Milo',
            'especie' => 'Gato',
            'raza' => 'Siamés',
            'fecha_nacimiento' => '2021-01-10',
            'sexo' => 'Macho',
            'notas' => 'Mascota juguetona'
        ]);
    }
} 