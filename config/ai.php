<?php

return [

    'provider' => env('AI_PROVIDER') ?: 'google_gemini',

    'google_gemini' => [
        'api_key' => env('AI_API_KEY'),
        'model' => env('AI_MODEL') ?: 'gemini-3.5-flash',
        'base_url' => env('AI_BASE_URL') ?: 'https://generativelanguage.googleapis.com/v1beta',
    ],

    'timeout' => (int) (env('AI_TIMEOUT') ?: 60),

    'retry' => [
        'tries' => (int) (env('AI_RETRY_TIMES') ?: 3),
        'backoff_seconds' => [10, 30, 60],
    ],

    'prompt_version' => env('AI_PROMPT_VERSION') ?: 'moral-classifier-v1',

    'prompt_file' => env('AI_PROMPT_FILE') ?: base_path('prompts'.DIRECTORY_SEPARATOR.'moral-classifier-v1.txt'),

    'report_narrative' => [
        'provider' => env('AI_REPORT_PROVIDER') ?: 'google_gemini',
        'prompt_version' => env('AI_REPORT_PROMPT_VERSION') ?: 'report-narrative-v1',
        'prompt_file' => env('AI_REPORT_PROMPT_FILE') ?: base_path('prompts'.DIRECTORY_SEPARATOR.'report-narrative-v1.txt'),
        'json_schema' => [
            'type' => 'object',
            'properties' => [
                'narrative' => [
                    'type' => 'string',
                ],
                'recommendation' => [
                    'type' => 'string',
                ],
            ],
            'required' => ['narrative', 'recommendation'],
        ],
    ],

    'json_schema' => [
        'type' => 'object',
        'properties' => [
            'moral_level' => [
                'type' => 'string',
                'enum' => ['pre_conventional', 'conventional', 'post_conventional'],
            ],
            'confidence' => [
                'type' => 'number',
                'minimum' => 0,
                'maximum' => 1,
            ],
            'indicators' => [
                'type' => 'array',
                'items' => [
                    'type' => 'object',
                    'properties' => [
                        'code' => ['type' => 'string'],
                        'score' => ['type' => 'number', 'minimum' => 0, 'maximum' => 1],
                    ],
                    'required' => ['code', 'score'],
                ],
            ],
            'reasoning_summary' => ['type' => 'string'],
            'warning_signals' => [
                'type' => 'array',
                'items' => ['type' => 'string'],
            ],
            'suggested_intervention' => [
                'type' => 'string',
                'nullable' => true,
            ],
        ],
        'required' => ['moral_level', 'confidence', 'indicators', 'reasoning_summary', 'warning_signals', 'suggested_intervention'],
    ],

];
