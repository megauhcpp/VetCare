<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\MascotaController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\TratamientoController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Usuarios
    Route::apiResource('usuarios', UsuarioController::class);
    Route::get('/veterinarios', [UsuarioController::class, 'getVeterinarios']);
    Route::get('/clientes', [UsuarioController::class, 'getClientes']);
    Route::get('/usuarios/{usuario}/mascotas', [UsuarioController::class, 'getMascotas']);
    Route::get('/usuarios/{usuario}/citas', [UsuarioController::class, 'getCitasVeterinario']);
    Route::post('/usuarios/{usuario}/cambiar-password', [UsuarioController::class, 'cambiarPassword']);
    
    // Mascotas
    Route::apiResource('mascotas', MascotaController::class);
    Route::get('/mascotas/especie/{especie}', [MascotaController::class, 'getByEspecie']);
    Route::get('/mascotas/raza/{raza}', [MascotaController::class, 'getByRaza']);
    Route::get('/mascotas/{mascota}/historial', [MascotaController::class, 'getHistorialMedico']);
    Route::get('/mascotas/{mascota}/proximas-citas', [MascotaController::class, 'getProximasCitas']);
    Route::get('/mascotas/buscar/{nombre}', [MascotaController::class, 'buscarPorNombre']);
    
    // Citas
    Route::apiResource('citas', CitaController::class);
    Route::get('/citas/estado/{estado}', [CitaController::class, 'getByEstado']);
    Route::get('/citas/fecha/{fecha}', [CitaController::class, 'getByFecha']);
    Route::get('/citas/hoy', [CitaController::class, 'getCitasHoy']);
    Route::post('/citas/{cita}/estado', [CitaController::class, 'cambiarEstado']);
    Route::get('/citas/disponibilidad', [CitaController::class, 'getDisponibilidadVeterinario']);
    
    // Tratamientos
    Route::apiResource('tratamientos', TratamientoController::class);
}); 