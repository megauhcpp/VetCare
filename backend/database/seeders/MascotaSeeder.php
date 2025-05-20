<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mascota;

class MascotaSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario 1 no tiene mascotas

        // Usuario 2 tiene las dos primeras mascotas
        Mascota::create([
            'id_usuario' => 2,
            'nombre' => 'Luna',
            'especie' => 'Perro',
            'raza' => 'Labrador',
            'fecha_nacimiento' => '2020-05-15',
            'sexo' => 'Hembra',
            'notas' => 'Mascota muy activa'
        ]);

        Mascota::create([
            'id_usuario' => 2,
            'nombre' => 'Rocky',
            'especie' => 'Perro',
            'raza' => 'Pastor Alemán',
            'fecha_nacimiento' => '2019-03-20',
            'sexo' => 'Macho',
            'notas' => 'Mascota tranquila'
        ]);

        // Usuario 3 tiene la última mascota
        Mascota::create([
            'id_usuario' => 3,
            'nombre' => 'Milo',
            'especie' => 'Gato',
            'raza' => 'Siamés',
            'fecha_nacimiento' => '2021-08-10',
            'sexo' => 'Macho',
            'notas' => 'Mascota juguetona'
        ]);
    }
} 