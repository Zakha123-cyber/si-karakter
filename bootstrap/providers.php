<?php

use App\Providers\AppServiceProvider;
use App\Providers\AiServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\SpeechServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    AiServiceProvider::class,
    SpeechServiceProvider::class,
];
