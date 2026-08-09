<?php

namespace App\Http\Controllers;

use App\Enums\EducationalContentStatus;
use App\Enums\UserRole;
use App\Models\EducationalContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EducationalContentMediaController extends Controller
{
    public function __invoke(Request $request, EducationalContent $educationalContent, string $type): BinaryFileResponse
    {
        abort_unless(in_array($type, ['media', 'thumbnail'], true), 404);

        if ($educationalContent->status !== EducationalContentStatus::Published && $request->user()?->role !== UserRole::Admin) {
            abort(404);
        }

        $path = $type === 'thumbnail' ? $educationalContent->thumbnail_path : $educationalContent->media_path;
        abort_if($path === null, 404);

        $filePath = Storage::disk('public')->path($path);
        abort_unless(file_exists($filePath), 404);

        return response()->file($filePath, [
            'Content-Type' => Storage::disk('public')->mimeType($path) ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="'.basename($filePath).'"',
        ]);
    }
}
