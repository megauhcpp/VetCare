<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'apellido',
        'email',
        'password',
        'rol',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function mascotas()
    {
        return $this->hasMany(Mascota::class, 'id_usuario');
    }

    public function citasComoVeterinario()
    {
        return $this->hasMany(Cita::class, 'id_veterinario');
    }
}
