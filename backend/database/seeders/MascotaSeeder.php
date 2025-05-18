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
            'fecha_nacimiento' => now()->subYears(3),
            'id_usuario' => $cliente->id_usuario,
        ]);

        Mascota::create([
            'nombre' => 'Luna',
            'especie' => 'Gato',
            'raza' => 'Siamés',
            'fecha_nacimiento' => now()->subYears(2),
            'id_usuario' => $cliente->id_usuario,
        ]);

        Mascota::create([
            'nombre' => 'Rocky',
            'especie' => 'Perro',
            'raza' => 'Bulldog',
            'fecha_nacimiento' => now()->subYears(5),
            'id_usuario' => $cliente->id_usuario,
        ]);
    }
} 