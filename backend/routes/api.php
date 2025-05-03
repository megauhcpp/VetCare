<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\MascotaController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\TratamientoController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\TreatmentController;
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

    // User Routes
    Route::get('/user', [UserController::class, 'getUser']);
    Route::put('/user', [UserController::class, 'updateUser']);
    
    // Pet Routes
    Route::get('/pets', [PetController::class, 'index']);
    Route::post('/pets', [PetController::class, 'store']);
    Route::put('/pets/{pet}', [PetController::class, 'update']);
    Route::delete('/pets/{pet}', [PetController::class, 'destroy']);
    
    // Appointment Routes
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{appointment}', [AppointmentController::class, 'update']);
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy']);
    
    // Treatment Routes
    Route::get('/treatments', [TreatmentController::class, 'index']);
    Route::post('/treatments', [TreatmentController::class, 'store']);
    Route::put('/treatments/{treatment}', [TreatmentController::class, 'update']);
    Route::delete('/treatments/{treatment}', [TreatmentController::class, 'destroy']);
    
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