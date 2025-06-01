<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Cita
 * 
 * Este modelo representa las citas médicas programadas en el sistema.
 * Cada cita está asociada a una mascota, un veterinario y puede tener múltiples tratamientos.
 */
class Cita extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'citas';

    /**
     * Clave primaria de la tabla
     */
    protected $primaryKey = 'id_cita';

    /**
     * Indica si el modelo debe tener timestamps
     */
    public $timestamps = true;

    /**
     * Atributos que pueden ser asignados masivamente
     */
    protected $fillable = [
        'id_cita',
        'id_mascota',
        'id_usuario',
        'fecha_hora',
        'tipo_consulta',
        'motivo_consulta',
        'estado'
    ];

    /**
     * Conversiones de tipos para los atributos
     */
    protected $casts = [
        'fecha_hora' => 'datetime'
    ];

    /**
     * Relación con la mascota de la cita
     * Una cita pertenece a una mascota
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function mascota()
    {
        return $this->belongsTo(Mascota::class, 'id_mascota', 'id_mascota');
    }

    /**
     * Relación con el veterinario asignado
     * Una cita pertenece a un veterinario
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function veterinario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relación con los tratamientos de la cita
     * Una cita puede tener muchos tratamientos
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tratamientos()
    {
        return $this->hasMany(Tratamiento::class, 'id_cita', 'id_cita');
    }
}
