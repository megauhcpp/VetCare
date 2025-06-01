<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\MascotaController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\TratamientoController;
use App\Http\Controllers\Api\AdminController;

/**
 * Rutas de la API de VetCare
 * Este archivo define todas las rutas de la API, incluyendo autenticación,
 * gestión de usuarios, mascotas, citas y tratamientos.
 */

// Rutas públicas - No requieren autenticación
Route::post('/register', [AuthController::class, 'register']); // Registro de nuevos usuarios
Route::post('/login', [AuthController::class, 'login']); // Inicio de sesión

// Rutas protegidas - Requieren autenticación mediante Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Rutas de autenticación y gestión de usuario
    Route::post('/logout', [AuthController::class, 'logout']); // Cierre de sesión
    Route::get('/user', [AuthController::class, 'user']); // Obtener datos del usuario actual
    Route::post('/user', [AuthController::class, 'updateUser']); // Actualizar datos del usuario
    Route::post('/user/change-password', [AuthController::class, 'changePassword']); // Cambiar contraseña
    
    // Rutas de gestión de usuarios
    Route::apiResource('usuarios', UsuarioController::class); // CRUD completo de usuarios
    Route::get('/veterinarios', [UsuarioController::class, 'getVeterinarios']); // Listar veterinarios
    Route::get('/clientes', [UsuarioController::class, 'getClientes']); // Listar clientes
    Route::get('/usuarios/{usuario}/mascotas', [UsuarioController::class, 'getMascotas']); // Mascotas de un usuario
    Route::get('/usuarios/{usuario}/citas', [UsuarioController::class, 'getCitasVeterinario']); // Citas de un veterinario
    Route::post('/usuarios/{usuario}/cambiar-password', [UsuarioController::class, 'cambiarPassword']); // Cambiar contraseña de usuario
    
    // Rutas de gestión de mascotas (Español)
    Route::apiResource('mascotas', MascotaController::class); // CRUD completo de mascotas
    Route::get('/mascotas/especie/{especie}', [MascotaController::class, 'getByEspecie']); // Filtrar por especie
    Route::get('/mascotas/raza/{raza}', [MascotaController::class, 'getByRaza']); // Filtrar por raza
    Route::get('/mascotas/{mascota}/historial', [MascotaController::class, 'getHistorialMedico']); // Historial médico
    Route::get('/mascotas/{mascota}/proximas-citas', [MascotaController::class, 'getProximasCitas']); // Próximas citas
    Route::get('/mascotas/buscar/{nombre}', [MascotaController::class, 'buscarPorNombre']); // Búsqueda por nombre
    
    // Rutas de gestión de mascotas (English)
    Route::get('/pets', [MascotaController::class, 'index']); // Listar mascotas
    Route::post('/pets', [MascotaController::class, 'store']); // Crear mascota
    Route::get('/pets/{id}', [MascotaController::class, 'show']); // Ver mascota
    Route::put('/pets/{id}', [MascotaController::class, 'update']); // Actualizar mascota
    Route::delete('/pets/{mascota}', [MascotaController::class, 'destroy']); // Eliminar mascota
    
    // Rutas de gestión de citas (Español)
    Route::apiResource('citas', CitaController::class); // CRUD completo de citas
    Route::get('/citas/estado/{estado}', [CitaController::class, 'getByEstado']); // Filtrar por estado
    Route::get('/citas/fecha/{fecha}', [CitaController::class, 'getByFecha']); // Filtrar por fecha
    Route::get('/citas/hoy', [CitaController::class, 'getCitasHoy']); // Citas del día
    Route::post('/citas/{cita}/estado', [CitaController::class, 'cambiarEstado']); // Cambiar estado
    Route::get('/citas/disponibilidad', [CitaController::class, 'getDisponibilidadVeterinario']); // Verificar disponibilidad
    
    // Rutas de gestión de citas (English)
    Route::get('/appointments', [CitaController::class, 'index']); // Listar citas
    Route::post('/appointments', [CitaController::class, 'store']); // Crear cita
    Route::get('/appointments/{cita}', [CitaController::class, 'show']); // Ver cita
    Route::put('/appointments/{cita}', [CitaController::class, 'update']); // Actualizar cita
    Route::delete('/appointments/{cita}', [CitaController::class, 'destroy']); // Eliminar cita
    
    // Rutas de gestión de tratamientos (Español)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/tratamientos', [TratamientoController::class, 'index']); // Listar tratamientos
        Route::post('/tratamientos', [TratamientoController::class, 'store']); // Crear tratamiento
        Route::get('/tratamientos/{tratamiento}', [TratamientoController::class, 'show']); // Ver tratamiento
        Route::put('/tratamientos/{tratamiento}', [TratamientoController::class, 'update']); // Actualizar tratamiento
        Route::delete('/tratamientos/{tratamiento}', [TratamientoController::class, 'destroy']); // Eliminar tratamiento
        Route::put('/tratamientos/{tratamiento}/estado', [TratamientoController::class, 'updateEstado']); // Cambiar estado
    });
    
    // Rutas de gestión de tratamientos (English)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/treatments', [TratamientoController::class, 'index']); // Listar tratamientos
        Route::post('/treatments', [TratamientoController::class, 'store']); // Crear tratamiento
        Route::get('/treatments/{id}', [TratamientoController::class, 'show']); // Ver tratamiento
        Route::put('/treatments/{id}', [TratamientoController::class, 'update']); // Actualizar tratamiento
        Route::delete('/treatments/{id}', [TratamientoController::class, 'destroy']); // Eliminar tratamiento
        Route::put('/treatments/{id}/status', [TratamientoController::class, 'updateEstado']); // Cambiar estado
    });
    
    // Rutas de administración
    // Gestión de usuarios
    Route::get('/admin/users', [AdminController::class, 'getUsers']); // Listar usuarios
    Route::post('/admin/users', [AdminController::class, 'createUser']); // Crear usuario
    Route::put('/admin/users/{user}', [AdminController::class, 'updateUser']); // Actualizar usuario
    Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']); // Eliminar usuario
    
    // Gestión de mascotas
    Route::get('/admin/pets', [AdminController::class, 'getPets']); // Listar mascotas
    Route::post('/admin/pets', [AdminController::class, 'createPet']); // Crear mascota
    Route::put('/admin/pets/{pet}', [AdminController::class, 'updatePet']); // Actualizar mascota
    Route::delete('/admin/pets/{pet}', [AdminController::class, 'deletePet']); // Eliminar mascota
    
    // Gestión de tratamientos
    Route::get('/admin/treatments', [AdminController::class, 'getTreatments']); // Listar tratamientos
    Route::post('/admin/treatments', [AdminController::class, 'createTreatment']); // Crear tratamiento
    Route::put('/admin/treatments/{treatment}', [AdminController::class, 'updateTreatment']); // Actualizar tratamiento
    Route::delete('/admin/treatments/{treatment}', [AdminController::class, 'deleteTreatment']); // Eliminar tratamiento
    
    // Gestión de citas
    Route::get('/admin/appointments', [AdminController::class, 'getAppointments']); // Listar citas
    Route::post('/admin/appointments', [AdminController::class, 'createAppointment']); // Crear cita
    Route::put('/admin/appointments/{appointment}', [AdminController::class, 'updateAppointment']); // Actualizar cita
    Route::delete('/admin/appointments/{appointment}', [AdminController::class, 'deleteAppointment']); // Eliminar cita
}); 