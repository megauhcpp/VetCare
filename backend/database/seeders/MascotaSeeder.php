<?php

namespace Database\Seeders;

use App\Models\Mascota;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class MascotaSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener el cliente (María García)
        $cliente = Usuario::where('email', 'maria.garcia@vetcare.com')->first();

        // Crear mascotas para el cliente
        Mascota::create([
            'nombre' => 'Max',
            'especie' => 'Perro',
            'raza' => 'Labrador',
            'edad' => 3,
            'peso' => 25.5,
            'id_usuario' => $cliente->id_usuario,
        ]);

        Mascota::create([
            'nombre' => 'Luna',
            'especie' => 'Gato',
            'raza' => 'Siamés',
            'edad' => 2,
            'peso' => 4.2,
            'id_usuario' => $cliente->id_usuario,
        ]);

        Mascota::create([
            'nombre' => 'Rocky',
            'especie' => 'Perro',
            'raza' => 'Bulldog',
            'edad' => 5,
            'peso' => 18.0,
            'id_usuario' => $cliente->id_usuario,
        ]);
    }
} 