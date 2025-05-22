<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Usuario administrador (id 1)
        Usuario::create([
            'nombre' => 'Administrador',
            'apellido' => 'Sistema',
            'email' => 'admin@vetcare.com',
            'password' => Hash::make('admin123'),
            'rol' => 'admin'
        ]);

        // Veterinarios (ids 2, 3, 4)
        Usuario::create([
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'email' => 'veterinario1@vetcare.com',
            'password' => Hash::make('veterinario123'),
            'rol' => 'veterinario'
        ]);

        Usuario::create([
            'nombre' => 'María',
            'apellido' => 'González',
            'email' => 'veterinario2@vetcare.com',
            'password' => Hash::make('veterinario123'),
            'rol' => 'veterinario'
        ]);

        Usuario::create([
            'nombre' => 'Carlos',
            'apellido' => 'Rodríguez',
            'email' => 'veterinario3@vetcare.com',
            'password' => Hash::make('veterinario123'),
            'rol' => 'veterinario'
        ]);

        // Usuarios normales (ids 5, 6, 7)
        Usuario::create([
            'nombre' => 'Gabriel',
            'apellido' => 'Perez',
            'email' => 'gabriel@gmail.com',
            'password' => Hash::make('cliente123'),
            'rol' => 'cliente'
        ]);

        Usuario::create([
            'nombre' => 'Joan',
            'apellido' => 'Tendero',
            'email' => 'joan@gmail.com',
            'password' => Hash::make('cliente123'),
            'rol' => 'cliente'
        ]);

        Usuario::create([
            'nombre' => 'Jesús',
            'apellido' => 'Canicio',
            'email' => 'jesus@gmail.com',
            'password' => Hash::make('cliente123'),
            'rol' => 'cliente'
        ]);
    }
} 