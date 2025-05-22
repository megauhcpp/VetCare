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
            // Primero eliminamos la columna id_veterinario si existe
            if (Schema::hasColumn('citas', 'id_veterinario')) {
                $table->dropForeign(['id_veterinario']);
                $table->dropColumn('id_veterinario');
            }
            
            // Luego agregamos la nueva columna id_usuario si no existe
            if (!Schema::hasColumn('citas', 'id_usuario')) {
                $table->foreignId('id_usuario')->after('id_mascota')->constrained('usuarios', 'id_usuario');
            }
            
            // Renombramos la columna observaciones a motivo_consulta si existe
            if (Schema::hasColumn('citas', 'observaciones')) {
                $table->renameColumn('observaciones', 'motivo_consulta');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            // Eliminamos la columna id_usuario si existe
            if (Schema::hasColumn('citas', 'id_usuario')) {
                $table->dropForeign(['id_usuario']);
                $table->dropColumn('id_usuario');
            }
            
            // Agregamos la columna id_veterinario si no existe
            if (!Schema::hasColumn('citas', 'id_veterinario')) {
                $table->foreignId('id_veterinario')->after('id_mascota')->constrained('usuarios', 'id_usuario');
            }
            
            // Renombramos la columna motivo_consulta a observaciones si existe
            if (Schema::hasColumn('citas', 'motivo_consulta')) {
                $table->renameColumn('motivo_consulta', 'observaciones');
            }
        });
    }
};
