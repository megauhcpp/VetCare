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
        Schema::table('citas', function (Blueprint $table) {
            // Primero eliminamos las restricciones de clave foránea existentes
            $table->dropForeign(['id_veterinario']);
            
            // Renombramos las columnas
            $table->renameColumn('id_veterinario', 'id_usuario');
            $table->renameColumn('observaciones', 'motivo_consulta');
            
            // Agregamos la nueva restricción de clave foránea
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            // Eliminamos la restricción de clave foránea
            $table->dropForeign(['id_usuario']);
            
            // Revertimos los nombres de las columnas
            $table->renameColumn('id_usuario', 'id_veterinario');
            $table->renameColumn('motivo_consulta', 'observaciones');
            
            // Restauramos la restricción de clave foránea original
            $table->foreign('id_veterinario')->references('id_usuario')->on('usuarios');
        });
    }
};
