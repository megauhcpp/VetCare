<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    protected $allowedOrigins = [
        'https://vetcareclinica.com',
        'http://localhost:3000'
    ];

    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');

        if (in_array($origin, $this->allowedOrigins)) {
            $response = $next($request);
            
            // Handle preflight requests
            if ($request->isMethod('OPTIONS')) {
                $response = response()->json();
            }

            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400'); // 24 hours

            return $response;
        }

        return $next($request);
    }
} 