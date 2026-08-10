<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Karakter Santri</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #1f2937;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #059669;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #065f46;
        }
        .header p {
            margin: 4px 0 0;
            color: #6b7280;
        }
        .meta {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .meta td {
            padding: 3px 0;
        }
        .meta .label {
            width: 160px;
            color: #6b7280;
        }
        h2 {
            font-size: 13px;
            color: #065f46;
            border-left: 4px solid #059669;
            padding-left: 8px;
            margin-top: 20px;
        }
        table.data {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        table.data th, table.data td {
            border: 1px solid #d1d5db;
            padding: 6px 8px;
            text-align: left;
        }
        table.data th {
            background: #ecfdf5;
        }
        .score-box {
            display: inline-block;
            border: 1px solid #059669;
            border-radius: 4px;
            padding: 2px 8px;
            font-weight: bold;
            color: #065f46;
        }
        .narrative {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 30px;
            text-align: right;
            color: #6b7280;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Perkembangan Karakter Santri</h1>
        <p>Sistem Informasi Karakter Terpadu Santri (SI-KARAKTER)</p>
    </div>

    <table class="meta">
        <tr>
            <td class="label">Nama Santri</td>
            <td><strong>{{ $report->student?->user?->name ?? '-' }}</strong></td>
        </tr>
        <tr>
            <td class="label">Kode Santri</td>
            <td>{{ $report->student?->student_code ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Kelompok</td>
            <td>{{ $report->student?->currentGroup?->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Periode</td>
            <td>{{ $report->period_start->format('d-m-Y') }} s.d. {{ $report->period_end->format('d-m-Y') }}</td>
        </tr>
        <tr>
            <td class="label">Ustadz</td>
            <td>{{ $report->teacher?->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Status</td>
            <td>{{ strtoupper($report->status) }}</td>
        </tr>
        <tr>
            <td class="label">Diterbitkan</td>
            <td>{{ $report->published_at?->format('d-m-Y H:i') ?? '-' }}</td>
        </tr>
    </table>

    <h2>Rekap Tes Moral</h2>
    @php($test = $report->test_summary_json)
    <p>
        Skor tes: <span class="score-box">{{ $test['score'] ?? '-' }}</span>
        &nbsp;·&nbsp; Jawaban tervalidasi: {{ $test['validated_answers'] ?? 0 }} dari {{ $test['total_answers'] ?? 0 }}
    </p>
    @if (! empty($test['details']))
        <table class="data">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Kasus</th>
                    <th>Level</th>
                    <th>Skor</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($test['details'] as $index => $detail)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $detail['moral_case_id'] ?? '-' }}</td>
                        <td>{{ $detail['final_moral_level'] ?? '-' }}</td>
                        <td>{{ $detail['score'] ?? '-' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <h2>Rekap Observasi</h2>
    @php($observation = $report->observation_summary_json)
    <p>
        Skor observasi: <span class="score-box">{{ $observation['score'] ?? '-' }}</span>
        &nbsp;·&nbsp; Item dinilai: {{ $observation['counted_items'] ?? 0 }} dari {{ $observation['total_items'] ?? 0 }}
    </p>

    <h2>Narasi Perkembangan</h2>
    <div class="narrative">{{ $report->final_narrative ?: '-' }}</div>

    <h2>Rekomendasi</h2>
    <div class="narrative">{{ $report->recommendation ?: '-' }}</div>

    <div class="footer">
        Dicetak pada {{ now()->format('d-m-Y H:i') }} · SI-KARAKTER
    </div>
</body>
</html>
