<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('usuarios')->insert([
            [
                'nombre' => 'Juan',
                'apellido' => 'Pérez',
                'email' => 'juan@example.com',
                'password' => Hash::make('password123'),
                'rol' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'María',
                'apellido' => 'García',
                'email' => 'maria@example.com',
                'password' => Hash::make('password123'),
                'rol' => 'veterinario',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Carlos',
                'apellido' => 'López',
                'email' => 'carlos@example.com',
                'password' => Hash::make('password123'),
                'rol' => 'cliente',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
