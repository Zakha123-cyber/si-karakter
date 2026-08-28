<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $student = Student::query()
            ->with('currentGroup:id,name')
            ->where('user_id', $request->user()->id)
            ->first();

        return Inertia::render('student/settings', [
            'student' => [
                'name' => $request->user()->name,
                'username' => $request->user()->username,
                'group' => $student?->currentGroup?->name,
                'student_code' => $student?->student_code,
                'pin_enabled' => $request->user()->pin_enabled,
            ],
            'password_rules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }
}
