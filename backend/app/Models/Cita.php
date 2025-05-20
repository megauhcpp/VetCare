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
        'fecha_hora',
        'tipo_consulta',
        'observaciones',
        'estado'
    ];

    protected $casts = [
        'fecha_hora' => 'datetime'
    ];

    public function mascota()
    {
        return $this->belongsTo(Mascota::class, 'id_mascota', 'id_mascota');
    }

    public function veterinario()
    {
        return $this->belongsTo(Usuario::class, 'id_veterinario', 'id_usuario');
    }

    public function tratamientos()
    {
        return $this->hasMany(Tratamiento::class, 'id_cita', 'id_cita');
    }
}
