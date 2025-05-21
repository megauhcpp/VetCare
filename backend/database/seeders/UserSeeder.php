<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Crear usuario administrador
        Usuario::create([
            'nombre' => 'Administrador',
            'apellido' => 'Sistema',
            'email' => 'admin@vetcare.com',
            'password' => Hash::make('admin123'),
            'rol' => 'admin'
        ]);

        // Crear usuario veterinario
        Usuario::create([
            'nombre' => 'Veterinario',
            'apellido' => 'Principal',
            'email' => 'veterinario@vetcare.com',
            'password' => Hash::make('veterinario123'),
            'rol' => 'veterinario'
        ]);
    }
} 