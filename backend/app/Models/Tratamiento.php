<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Tratamiento
 * 
 * Este modelo representa los tratamientos médicos prescritos en las citas.
 * Cada tratamiento está asociado a una cita y, a través de ella, a una mascota.
 */
class Tratamiento extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos
     */
    protected $table = 'tratamientos';

    /**
     * Clave primaria de la tabla
     */
    protected $primaryKey = 'id_tratamiento';

    /**
     * Indica si el modelo debe tener timestamps
     */
    public $timestamps = true;

    /**
     * Atributos que pueden ser asignados masivamente
     */
    protected $fillable = [
        'id_cita',
        'nombre',
        'descripcion',
        'precio',
        'fecha_inicio',
        'fecha_fin',
        'estado'
    ];

    /**
     * Conversiones de tipos para los atributos
     */
    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'precio' => 'decimal:2'
    ];

    /**
     * Relación con la cita asociada
     * Un tratamiento pertenece a una cita
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cita()
    {
        return $this->belongsTo(Cita::class, 'id_cita', 'id_cita');
    }

    /**
     * Relación con la mascota a través de la cita
     * Un tratamiento está asociado a una mascota a través de su cita
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough
     */
    public function mascota()
    {
        return $this->hasOneThrough(Mascota::class, Cita::class, 'id_cita', 'id_mascota', 'id_cita', 'id_mascota');
    }
}
