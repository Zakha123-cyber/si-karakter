<?php

use App\Providers\AiServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\SpeechServiceProvider;
use App\Providers\TtsServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    AiServiceProvider::class,
    SpeechServiceProvider::class,
    TtsServiceProvider::class,
];
