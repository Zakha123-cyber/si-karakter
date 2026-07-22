<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $role = $request->user()?->role?->value;

        if ($role === null || ! in_array($role, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'This action is unauthorized',
                'errors' => [],
            ], 403);
        }

        return $next($request);
    }
}
