<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->is_active) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is inactive',
                    'errors' => [],
                ], 403);
            }

            abort(403, 'Account is inactive.');
        }

        return $next($request);
    }
}
