<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Mascota
 * 
 * Este modelo representa a las mascotas registradas en el sistema.
 * Cada mascota pertenece a un usuario (cliente) y puede tener múltiples citas.
 */
class Mascota extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'mascotas';

    /**
     * Clave primaria de la tabla
     */
    protected $primaryKey = 'id_mascota';

    /**
     * Indica si el modelo debe tener timestamps
     */
    public $timestamps = true;

    /**
     * Atributos que pueden ser asignados masivamente
     */
    protected $fillable = [
        'id_mascota',
        'id_usuario',
        'nombre',
        'especie',
        'raza',
        'fecha_nacimiento',
        'sexo',
        'notas'
    ];

    /**
     * Conversiones de tipos para los atributos
     */
    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    /**
     * Relación con el usuario propietario
     * Una mascota pertenece a un usuario
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relación con las citas de la mascota
     * Una mascota puede tener muchas citas
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function citas()
    {
        return $this->hasMany(Cita::class, 'id_mascota', 'id_mascota');
    }
}
