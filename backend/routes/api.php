<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\MascotaController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\TratamientoController;
use App\Http\Controllers\Api\AdminController;

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
    
    // Mascotas (Español)
    Route::apiResource('mascotas', MascotaController::class);
    Route::get('/mascotas/especie/{especie}', [MascotaController::class, 'getByEspecie']);
    Route::get('/mascotas/raza/{raza}', [MascotaController::class, 'getByRaza']);
    Route::get('/mascotas/{mascota}/historial', [MascotaController::class, 'getHistorialMedico']);
    Route::get('/mascotas/{mascota}/proximas-citas', [MascotaController::class, 'getProximasCitas']);
    Route::get('/mascotas/buscar/{nombre}', [MascotaController::class, 'buscarPorNombre']);
    
    // Pets (English)
    Route::get('/pets', [MascotaController::class, 'index']);
    Route::post('/pets', [MascotaController::class, 'store']);
    Route::get('/pets/{id}', [MascotaController::class, 'show']);
    Route::put('/pets/{id}', [MascotaController::class, 'update']);
    Route::delete('/pets/{id}', [MascotaController::class, 'destroy']);
    
    // Citas (Español)
    Route::apiResource('citas', CitaController::class);
    Route::get('/citas/estado/{estado}', [CitaController::class, 'getByEstado']);
    Route::get('/citas/fecha/{fecha}', [CitaController::class, 'getByFecha']);
    Route::get('/citas/hoy', [CitaController::class, 'getCitasHoy']);
    Route::post('/citas/{cita}/estado', [CitaController::class, 'cambiarEstado']);
    Route::get('/citas/disponibilidad', [CitaController::class, 'getDisponibilidadVeterinario']);
    
    // Appointments (English)
    Route::get('/appointments', [CitaController::class, 'index']);
    Route::post('/appointments', [CitaController::class, 'store']);
    Route::get('/appointments/{id}', [CitaController::class, 'show']);
    Route::put('/appointments/{id}', [CitaController::class, 'update']);
    Route::delete('/appointments/{id}', [CitaController::class, 'destroy']);
    
    // Tratamientos (Español)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/tratamientos', [TratamientoController::class, 'index']);
        Route::post('/tratamientos', [TratamientoController::class, 'store']);
        Route::get('/tratamientos/{id}', [TratamientoController::class, 'show']);
        Route::put('/tratamientos/{id}', [TratamientoController::class, 'update']);
        Route::delete('/tratamientos/{id}', [TratamientoController::class, 'destroy']);
        Route::put('/tratamientos/{id}/estado', [TratamientoController::class, 'updateEstado']);
    });
    
    // Treatments (English)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/treatments', [TratamientoController::class, 'index']);
        Route::post('/treatments', [TratamientoController::class, 'store']);
        Route::get('/treatments/{id}', [TratamientoController::class, 'show']);
        Route::put('/treatments/{id}', [TratamientoController::class, 'update']);
        Route::delete('/treatments/{id}', [TratamientoController::class, 'destroy']);
        Route::put('/treatments/{id}/status', [TratamientoController::class, 'updateEstado']);
    });
    
    // Admin Routes
    Route::middleware('admin')->group(function () {
        // User Management
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::post('/admin/users', [AdminController::class, 'createUser']);
        Route::put('/admin/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);
        
        // Pet Management
        Route::get('/admin/pets', [AdminController::class, 'getPets']);
        Route::post('/admin/pets', [AdminController::class, 'createPet']);
        Route::put('/admin/pets/{pet}', [AdminController::class, 'updatePet']);
        Route::delete('/admin/pets/{pet}', [AdminController::class, 'deletePet']);
        
        // Treatment Management
        Route::get('/admin/treatments', [AdminController::class, 'getTreatments']);
        Route::post('/admin/treatments', [AdminController::class, 'createTreatment']);
        Route::put('/admin/treatments/{treatment}', [AdminController::class, 'updateTreatment']);
        Route::delete('/admin/treatments/{treatment}', [AdminController::class, 'deleteTreatment']);
        
        // Appointment Management
        Route::get('/admin/appointments', [AdminController::class, 'getAppointments']);
        Route::post('/admin/appointments', [AdminController::class, 'createAppointment']);
        Route::put('/admin/appointments/{appointment}', [AdminController::class, 'updateAppointment']);
        Route::delete('/admin/appointments/{appointment}', [AdminController::class, 'deleteAppointment']);
    });
}); 