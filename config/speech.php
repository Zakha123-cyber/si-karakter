<?php

return [

    'provider' => env('STT_PROVIDER', 'groq'),

    'groq' => [
        'api_key' => env('STT_API_KEY'),
        'model' => env('STT_MODEL', 'whisper-large-v3-turbo'),
        'base_url' => env('STT_BASE_URL', 'https://api.groq.com/openai/v1'),
        'language' => env('STT_LANGUAGE', 'id'),
    ],

    'timeout' => env('STT_TIMEOUT', 120),

    'retry' => [
        'tries' => env('STT_RETRY_TIMES', 3),
        'backoff_seconds' => [30, 60, 120],
    ],

    'max_audio_size_mb' => env('MAX_AUDIO_SIZE_MB', 20),
    'max_audio_duration_seconds' => env('MAX_AUDIO_DURATION_SECONDS', 180),

];
