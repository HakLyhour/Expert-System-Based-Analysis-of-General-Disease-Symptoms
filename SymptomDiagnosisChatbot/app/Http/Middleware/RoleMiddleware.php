<?php

// namespace App\Http\Middleware;

// use Closure;
// use Illuminate\Http\Request;

// class RoleMiddleware
// {
//     public function handle(Request $request, Closure $next, $role)
//     {
//         if (!$request->user() || $request->user()->role !== $role) {
//             abort(403, 'Unauthorized');
//         }
//         return $next($request);
//     }
// }




namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!Auth::check()) {
            abort(403, 'Unauthorized');
        }

        // Check if the user's role is in the allowed list
        if (!in_array(Auth::user()->role, $roles)) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
