<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Controlador de Usuarios
 * 
 * Este controlador maneja todas las operaciones relacionadas con los usuarios del sistema,
 * incluyendo la gestión de administradores, veterinarios y clientes.
 */
class UsuarioController extends Controller
{
    /**
     * Muestra un listado de todos los usuarios.
     * 
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Muestra el formulario para crear un nuevo usuario.
     * 
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Almacena un nuevo usuario en la base de datos.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Muestra la información detallada de un usuario específico.
     * 
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Muestra el formulario para editar un usuario existente.
     * 
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Actualiza la información de un usuario en la base de datos.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Elimina un usuario de la base de datos.
     * 
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(string $id)
    {
        //
    }
}
