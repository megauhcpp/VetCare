<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tratamiento extends Model
{
    use HasFactory;

    protected $table = 'tratamientos';
    protected $primaryKey = 'id_tratamiento';
    public $timestamps = true;

    protected $fillable = [
        'id_cita',
        'descripcion',
        'fecha_realizacion',
        'observaciones',
    ];

    protected $casts = [
        'fecha_realizacion' => 'date',
    ];

    public function cita()
    {
        return $this->belongsTo(Cita::class, 'id_cita');
    }
}
