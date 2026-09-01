<?php

return [

    /*
    |--------------------------------------------------------------------------
    | TTS Enabled
    |--------------------------------------------------------------------------
    |
    | Set to false when the server does not host a TTS provider. The student
    | frontend will then use the browser's built-in speech synthesis fallback.
    |
    */

    'enabled' => filter_var(env('TTS_ENABLED', true), FILTER_VALIDATE_BOOL),

    /*
    |--------------------------------------------------------------------------
    | Text-to-Speech Provider
    |--------------------------------------------------------------------------
    |
    | Menentukan provider TTS yang dipakai. Nilai yang didukung:
    |   - 'mms'  : layanan FastAPI yang menjalankan facebook/mms-tts-ind.
    |
    */

    'provider' => env('TTS_PROVIDER') ?: 'mms',

    'mms' => [
        'base_url' => env('TTS_BASE_URL') ?: 'http://127.0.0.1:8001',
        'model' => env('TTS_MODEL') ?: 'facebook/mms-tts-ind',
        'timeout' => (int) (env('TTS_TIMEOUT') ?: 60),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache
    |--------------------------------------------------------------------------
    |
    | Audio hasil sintesis di-cache agar satu cerita tidak disintesis berulang.
    | File disimpan di disk 'local' (private) karena hanya diakses via route
    | yang dilindungi autentikasi, bukan lewat folder public.
    |
    */

    'cache_disk' => env('TTS_CACHE_DISK', 'local'),
    'cache_path' => env('TTS_CACHE_PATH', 'tts/stories'),

];
