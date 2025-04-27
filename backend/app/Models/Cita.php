<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cita extends Model
{
    use HasFactory;

    protected $table = 'citas';
    protected $primaryKey = 'id_cita';
    public $timestamps = true;

    protected $fillable = [
        'id_mascota',
        'id_veterinario',
        'motivo_consulta',
        'fecha_hora',
        'estado',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
    ];

    public function mascota()
    {
        return $this->belongsTo(Mascota::class, 'id_mascota');
    }

    public function veterinario()
    {
        return $this->belongsTo(Usuario::class, 'id_veterinario');
    }

    public function tratamientos()
    {
        return $this->hasMany(Tratamiento::class, 'id_cita');
    }
}
