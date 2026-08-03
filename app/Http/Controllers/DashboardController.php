<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        if ($request->user()?->role === UserRole::Student) {
            abort(redirect()->route('student.dashboard'));
        }

        return Inertia::render('dashboard');
    }
}