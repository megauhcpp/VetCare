<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modelo Usuario
 * 
 * Este modelo representa a los usuarios del sistema (administradores, veterinarios y clientes).
 * Extiende de Authenticatable para manejar la autenticación y utiliza traits para API tokens,
 * notificaciones y factory.
 */
class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'usuarios';

    /**
     * Clave primaria de la tabla
     */
    protected $primaryKey = 'id_usuario';

    /**
     * Indica si el modelo debe tener timestamps
     */
    public $timestamps = true;

    /**
     * Atributos que pueden ser asignados masivamente
     */
    protected $fillable = [
        'nombre',
        'apellido',
        'email',
        'password',
        'rol',
    ];

    /**
     * Atributos que deben ser ocultados en las respuestas JSON
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Conversiones de tipos para los atributos
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relación con las mascotas del usuario
     * Un usuario puede tener muchas mascotas
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function mascotas()
    {
        return $this->hasMany(Mascota::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relación con las citas donde el usuario es veterinario
     * Un veterinario puede tener muchas citas asignadas
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function citasComoVeterinario()
    {
        return $this->hasMany(Cita::class, 'id_usuario', 'id_usuario');
    }
}
