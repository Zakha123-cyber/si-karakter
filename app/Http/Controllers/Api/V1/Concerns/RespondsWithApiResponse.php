<?php

namespace App\Http\Controllers\Api\V1\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait RespondsWithApiResponse
{
    /**
     * @param  array<string, mixed>|object|null  $data
     */
    protected function success(string $message, mixed $data = [], int $code = 200): JsonResponse
    {
        if ($data instanceof ResourceCollection) {
            $data = $data->response()->getData(true);
        } elseif ($data instanceof JsonResource) {
            $data = $data->resolve();
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * @param  array<string, mixed>  $errors
     */
    protected function error(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}
