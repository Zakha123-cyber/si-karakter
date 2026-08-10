<?php

namespace App\Services\Reporting;

use App\Models\CharacterReport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class CharacterReportPdfService
{
    /**
     * Generate dan simpan PDF laporan. Mengembalikan path relatif disk local.
     */
    public function generate(CharacterReport $report): string
    {
        $report->loadMissing(['student.user', 'student.currentGroup', 'teacher']);

        $pdf = Pdf::loadView('pdf.character-report', ['report' => $report])
            ->setPaper('a4');

        $fileName = 'character-report-'.$report->id.'.pdf';
        $disk = Storage::disk('local');
        $disk->put('reports/'.$fileName, $pdf->output());

        return 'reports/'.$fileName;
    }

    /**
     * @return array{path: string, contentType: string, name: string}
     */
    public function downloadPayload(CharacterReport $report): array
    {
        $path = $report->pdf_path;

        if ($path === null || ! Storage::disk('local')->exists($path)) {
            $path = $this->generate($report);
            $report->update(['pdf_path' => $path]);
        }

        $studentName = $report->student?->user?->name ?: 'santri';
        $safeName = preg_replace('/[^\w.\- ]+/u', '_', $studentName) ?: 'santri';
        $fileName = "laporan-karakter-{$safeName}-{$report->period_start}.pdf";

        return [
            'path' => Storage::disk('local')->path($path),
            'contentType' => 'application/pdf',
            'name' => $fileName,
        ];
    }
}
