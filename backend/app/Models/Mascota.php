<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mascota extends Model
{
    use HasFactory;

    protected $table = 'mascotas';
    protected $primaryKey = 'id_mascota';
    public $timestamps = true;

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

    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function citas()
    {
        return $this->hasMany(Cita::class, 'id_mascota', 'id_mascota');
    }
}
