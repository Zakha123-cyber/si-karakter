<?php

namespace App\Providers;

use App\Services\AI\FakeMoralAssessmentService;
use App\Services\AI\FakeReportNarrativeService;
use App\Services\AI\GoogleGeminiReportNarrativeService;
use App\Services\AI\GoogleGeminiService;
use App\Services\AI\MoralAssessmentService;
use App\Services\AI\ReportNarrativeService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AiServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MoralAssessmentService::class, function () {
            $provider = config('ai.provider', 'google_gemini');

            return match ($provider) {
                'google_gemini' => new GoogleGeminiService(
                    apiKey: config('ai.google_gemini.api_key', ''),
                    model: config('ai.google_gemini.model', 'gemini-2.0-flash'),
                    baseUrl: config('ai.google_gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'),
                    promptVersion: config('ai.prompt_version', 'moral-classifier-v1'),
                    systemPrompt: $this->loadSystemPrompt(config('ai.prompt_file'), 'Anda membantu ustadz mengklasifikasikan kualitas penalaran moral anak usia 6-10 tahun. Klasifikasikan alasan, bukan hanya pilihan tindakan. Gunakan hanya kategori: pre_conventional, conventional, post_conventional. Jangan melakukan diagnosis psikologis. Jangan memberikan label permanen. Gunakan bahasa netral. Hasil adalah rekomendasi yang harus dikonfirmasi ustadz. Kembalikan JSON sesuai schema.'),
                    jsonSchema: config('ai.json_schema', []),
                    timeout: (int) config('ai.timeout', 60),
                ),
                'fake' => new FakeMoralAssessmentService,
                default => throw new \InvalidArgumentException("Unsupported AI provider: [{$provider}]"),
            };
        });

        $this->app->bind(ReportNarrativeService::class, function () {
            $provider = config('ai.report_narrative.provider', 'google_gemini');

            return match ($provider) {
                'google_gemini' => new GoogleGeminiReportNarrativeService(
                    apiKey: config('ai.google_gemini.api_key', ''),
                    model: config('ai.google_gemini.model', 'gemini-2.0-flash'),
                    baseUrl: config('ai.google_gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'),
                    promptVersion: config('ai.report_narrative.prompt_version', 'report-narrative-v1'),
                    systemPrompt: $this->loadSystemPrompt(config('ai.report_narrative.prompt_file'), 'report-narrative-v1'),
                    jsonSchema: config('ai.report_narrative.json_schema', []),
                    timeout: (int) config('ai.timeout', 60),
                ),
                'fake' => new FakeReportNarrativeService,
                default => throw new \InvalidArgumentException("Unsupported report narrative provider: [{$provider}]"),
            };
        });
    }

    private function loadSystemPrompt(?string $path, string $fallback): string
    {
        if ($path === null || ! file_exists($path)) {
            Log::warning('AiServiceProvider: prompt file not found, using default prompt.', ['path' => $path]);

            return $fallback;
        }

        $content = file_get_contents($path);

        if ($content === false) {
            Log::error('AiServiceProvider: failed to read prompt file.', ['path' => $path]);

            throw new \RuntimeException("Failed to read AI prompt file at: {$path}");
        }

        return $content;
    }
}
