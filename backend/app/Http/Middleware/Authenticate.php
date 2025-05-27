<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return mixed
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    public function handle($request, array $guards)
    {
        try {
            return parent::handle($request, $guards);
        } catch (\Illuminate\Auth\AuthenticationException $e) {
            if ($request->is('api/*') || $request->expectsJson()) {
                throw new \Illuminate\Auth\AuthenticationException(
                    'No autenticado.', $guards, $this->redirectTo($request)
                );
            }
            throw $e;
        }
    }

    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo(Request $request): ?string
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            return null;
        }
        return '/login';
    }

    /**
     * Handle an unauthenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return void
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    protected function unauthenticated($request, array $guards)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            abort(response()->json([
                'message' => 'No autenticado.',
                'status' => 'error'
            ], 401));
        }

        parent::unauthenticated($request, $guards);
    }
} 