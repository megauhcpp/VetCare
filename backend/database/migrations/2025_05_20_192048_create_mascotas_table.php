<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mascotas', function (Blueprint $table) {
            $table->id('id_mascota');
            $table->foreignId('id_usuario')->constrained('usuarios', 'id_usuario');
            $table->string('nombre');
            $table->string('especie');
            $table->string('raza');
            $table->date('fecha_nacimiento');
            $table->string('sexo');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mascotas');
    }
};
