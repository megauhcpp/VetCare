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
        Schema::create('citas', function (Blueprint $table) {
            $table->id('id_cita');
            $table->foreignId('id_mascota')->constrained('mascotas', 'id_mascota');
            $table->foreignId('id_veterinario')->constrained('usuarios', 'id_usuario');
            $table->dateTime('fecha_hora');
            $table->string('tipo_consulta');
            $table->text('observaciones')->nullable();
            $table->string('estado');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
