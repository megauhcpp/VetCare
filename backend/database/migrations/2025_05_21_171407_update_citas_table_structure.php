<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            // Intentamos eliminar la restricción de clave foránea si existe
            try {
                $table->dropForeign(['id_veterinario']);
            } catch (\Exception $e) {
                // Si falla, asumimos que la restricción no existe y continuamos
            }
            
            // Renombramos las columnas
            $table->renameColumn('id_veterinario', 'id_usuario');
            $table->renameColumn('observaciones', 'motivo_consulta');
            
            // Hacemos que motivo_consulta sea requerido
            $table->text('motivo_consulta')->nullable(false)->change();
            
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
            // Intentamos eliminar la restricción de clave foránea si existe
            try {
                $table->dropForeign(['id_usuario']);
            } catch (\Exception $e) {
                // Si falla, asumimos que la restricción no existe y continuamos
            }
            
            // Revertimos los nombres de las columnas
            $table->renameColumn('id_usuario', 'id_veterinario');
            $table->renameColumn('motivo_consulta', 'observaciones');
            
            // Hacemos que observaciones sea nullable
            $table->text('observaciones')->nullable()->change();
            
            // Restauramos la restricción de clave foránea original
            $table->foreign('id_veterinario')->references('id_usuario')->on('usuarios');
        });
    }
};
