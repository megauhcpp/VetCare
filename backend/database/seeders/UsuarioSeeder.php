<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear un administrador
        Usuario::create([
            'nombre' => 'Admin',
            'apellido' => 'Sistema',
            'email' => 'admin@vetcare.com',
            'password' => Hash::make('password123'),
            'rol' => 'admin',
        ]);

        // Crear un cliente
        Usuario::create([
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'email' => 'juan.perez@vetcare.com',
            'password' => Hash::make('password123'),
            'rol' => 'cliente',
        ]);

        // Crear un cliente
        Usuario::create([
            'nombre' => 'María',
            'apellido' => 'García',
            'email' => 'maria.garcia@vetcare.com',
            'password' => Hash::make('password123'),
            'rol' => 'cliente',
        ]);
    }
}
