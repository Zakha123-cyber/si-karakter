import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    AudioLines,
    Bot,
    CheckCircle2,
    Clock,
    FileText,
    HelpCircle,
    MessageSquareText,
    ShieldAlert,
    User,
} from 'lucide-react';
import { AudioPlayer } from '@/components/audio-player';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

type MoralCaseOption = {
    id: number;
    label: string;
    text: string;
    internal_value: string | null;
};

type AttemptAnswer = {
    id: number;
    answer_status: string;
    typed_reason: string | null;
    final_transcript: string | null;
    moral_case: {
        id: number;
        title: string;
        story: string;
        options: MoralCaseOption[];
    } | null;
    selected_option: MoralCaseOption | null;
    audio: {
        id: number;
        original_name: string;
        mime_type: string;
        file_size: number;
        duration_seconds: number | null;
        url: string;
    } | null;
    transcription: {
        id: number;
        provider: string;
        model: string;
        original_text: string | null;
        edited_text: string | null;
        language: string | null;
        confidence: number | null;
        status: string;
        error_message: string | null;
        processed_at: string | null;
        updated_at: string | null;
    } | null;
    ai_assessment: {
        id: number;
        provider: string;
        model: string;
        moral_level: string;
        confidence: number;
        reasoning_summary: string;
        suggested_intervention: string | null;
        warning_signals: unknown[];
        indicators: unknown[];
        status: string;
        error_message: string | null;
        processed_at: string | null;
    } | null;
    validation: {
        id: number;
        decision: string;
        final_moral_level: string;
        final_indicators: unknown[];
        teacher_note: string | null;
        override_reason: string | null;
        teacher_name: string | null;
        validated_at: string | null;
    } | null;
    created_at: string | null;
    updated_at: string | null;
};

type AttemptDetail = {
    id: number;
    attempt_number: number;
    status: string;
    started_at: string | null;
    submitted_at: string | null;
    completed_at: string | null;
    student: {
        id: number;
        name: string | null;
        username: string | null;
        student_code: string;
        gender: string | null;
        status: string;
    } | null;
    group: { id: number; name: string } | null;
    test_package: {
        id: number;
        title: string;
        description: string | null;
    } | null;
    answers: AttemptAnswer[];
    summary: {
        answers_count: number;
        audio_count: number;
        completed_transcriptions: number;
        failed_transcriptions: number;
        processing_transcriptions: number;
        validated_answers: number;
    };
};

type Props = {
    attempt: AttemptDetail;
};

const statusLabel: Record<string, string> = {
    in_progress: 'Sedang Dikerjakan',
    submitted: 'Sudah Dikirim',
    processing: 'Diproses',
    review_pending: 'Menunggu Review',
    completed: 'Selesai',
};

const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    in_progress: 'outline',
    submitted: 'secondary',
    processing: 'secondary',
    review_pending: 'default',
    completed: 'default',
};

function formatDateTime(value: string | null) {
    if (!value) {
return '-';
}

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function formatPercent(value: number | null) {
    if (value === null || Number.isNaN(value)) {
return '-';
}

    return `${(value * 100).toFixed(1)}%`;
}

function transcriptionBadge(status: string | null) {
    if (status === 'completed') {
        return {
            label: 'Transkripsi selesai',
            className:
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
            icon: CheckCircle2,
        };
    }

    if (status === 'failed') {
        return {
            label: 'Transkripsi gagal',
            className:
                'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
            icon: ShieldAlert,
        };
    }

    if (status === 'processing') {
        return {
            label: 'Sedang diproses',
            className:
                'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
            icon: Clock,
        };
    }

    if (status === 'pending') {
        return {
            label: 'Menunggu antrean',
            className:
                'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
            icon: Clock,
        };
    }

    return {
        label: 'Belum ada transkrip',
        className:
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        icon: AudioLines,
    };
}

export default function AdminTestResultsShow({ attempt }: Props) {
    return (
        <>
            <Head
                title={`Detail Hasil Test - ${attempt.student?.name ?? `Attempt #${attempt.id}`}`}
            />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/admin/test-results">
                                <ArrowLeft className="size-4" />
                                <span className="sr-only">Kembali</span>
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-normal">
                                    Detail Hasil Pengerjaan Test
                                </h1>
                                <Badge variant="secondary">
                                    Attempt #{attempt.attempt_number}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {attempt.test_package?.title ?? 'Paket test'} —{' '}
                                dikirim {formatDateTime(attempt.submitted_at)}
                            </p>
                        </div>
                    </div>
                    <Badge variant={statusVariant[attempt.status] ?? 'outline'}>
                        {statusLabel[attempt.status] ?? attempt.status}
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="rounded-lg md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="size-5 text-muted-foreground" />
                                Data Santri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="font-semibold">
                                {attempt.student?.name ?? '-'}
                            </div>
                            <div className="text-muted-foreground">
                                NIS: {attempt.student?.student_code ?? '-'} •
                                Kelompok: {attempt.group?.name ?? '-'}
                            </div>
                            <div className="text-muted-foreground">
                                Username: @{attempt.student?.username ?? '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-base">Jawaban</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {attempt.summary.answers_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total jawaban tersimpan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-base">STT</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {attempt.summary.completed_transcriptions}/
                                {attempt.summary.audio_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Transkripsi berhasil / audio
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4">
                    {attempt.answers.length === 0 ? (
                        <Card className="rounded-lg">
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                Belum ada jawaban pada attempt ini.
                            </CardContent>
                        </Card>
                    ) : (
                        attempt.answers.map((answer, index) => {
                            const stt = transcriptionBadge(
                                answer.transcription?.status ?? null,
                            );
                            const SttIcon = stt.icon;

                            return (
                                <Card key={answer.id} className="rounded-lg">
                                    <CardHeader>
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <HelpCircle className="size-5 text-muted-foreground" />
                                                    Kasus {index + 1}:{' '}
                                                    {answer.moral_case?.title ??
                                                        '-'}
                                                </CardTitle>
                                                <CardDescription>
                                                    Status jawaban:{' '}
                                                    {answer.answer_status}
                                                </CardDescription>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${stt.className}`}
                                            >
                                                <SttIcon className="size-3.5" />
                                                {stt.label}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                                        <div className="space-y-5">
                                            <div className="rounded-md bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                                                {answer.moral_case?.story ??
                                                    '-'}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">
                                                    Pilihan Santri
                                                </div>
                                                {answer.moral_case?.options.map(
                                                    (option) => {
                                                        const selected =
                                                            answer
                                                                .selected_option
                                                                ?.id ===
                                                            option.id;

                                                        return (
                                                            <div
                                                                key={option.id}
                                                                className={`rounded-md border p-3 text-sm ${
                                                                    selected
                                                                        ? 'border-primary bg-primary/10 text-primary'
                                                                        : 'bg-background text-muted-foreground'
                                                                }`}
                                                            >
                                                                <div className="flex gap-2">
                                                                    <span className="font-semibold">
                                                                        {
                                                                            option.label
                                                                        }
                                                                        .
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            option.text
                                                                        }
                                                                    </span>
                                                                    {selected ? (
                                                                        <Badge className="ml-auto">
                                                                            Dipilih
                                                                        </Badge>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            <div className="rounded-md border p-4">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <MessageSquareText className="size-4 text-muted-foreground" />
                                                    Alasan Teks Santri
                                                </div>
                                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                    {answer.typed_reason || (
                                                        <span className="italic">
                                                            Tidak ada alasan
                                                            teks.
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="rounded-md border p-4">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <AudioLines className="size-4 text-muted-foreground" />
                                                    Audio Jawaban
                                                </div>
                                                <div className="mt-3">
                                                    {answer.audio ? (
                                                        <AudioPlayer
                                                            src={
                                                                answer.audio.url
                                                            }
                                                            originalName={
                                                                answer.audio
                                                                    .original_name
                                                            }
                                                            durationSeconds={
                                                                answer.audio
                                                                    .duration_seconds
                                                            }
                                                        />
                                                    ) : (
                                                        <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                                                            Tidak ada audio pada
                                                            jawaban ini.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-md border p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <FileText className="size-4 text-muted-foreground" />
                                                        Hasil Transkripsi STT
                                                    </div>
                                                    {answer.transcription ? (
                                                        <Badge variant="outline">
                                                            {
                                                                answer
                                                                    .transcription
                                                                    .provider
                                                            }{' '}
                                                            •{' '}
                                                            {
                                                                answer
                                                                    .transcription
                                                                    .model
                                                            }
                                                        </Badge>
                                                    ) : null}
                                                </div>

                                                {answer.transcription ? (
                                                    <div className="mt-3 space-y-3">
                                                        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                                                            <div>
                                                                Status:{' '}
                                                                <span className="font-semibold text-foreground">
                                                                    {
                                                                        answer
                                                                            .transcription
                                                                            .status
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div>
                                                                Confidence:{' '}
                                                                <span className="font-semibold text-foreground">
                                                                    {formatPercent(
                                                                        answer
                                                                            .transcription
                                                                            .confidence,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                Bahasa:{' '}
                                                                <span className="font-semibold text-foreground">
                                                                    {answer
                                                                        .transcription
                                                                        .language ??
                                                                        '-'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                Diproses:{' '}
                                                                <span className="font-semibold text-foreground">
                                                                    {formatDateTime(
                                                                        answer
                                                                            .transcription
                                                                            .processed_at,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {answer.transcription
                                                            .error_message ? (
                                                            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                                                                {
                                                                    answer
                                                                        .transcription
                                                                        .error_message
                                                                }
                                                            </div>
                                                        ) : null}

                                                        <div className="rounded-md bg-muted/40 p-3">
                                                            <div className="text-xs font-semibold text-muted-foreground">
                                                                Transkrip asli
                                                            </div>
                                                            <p className="mt-1 text-sm leading-6">
                                                                {answer
                                                                    .transcription
                                                                    .original_text || (
                                                                    <span className="text-muted-foreground italic">
                                                                        Belum
                                                                        ada
                                                                        teks.
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>

                                                        {answer.transcription
                                                            .edited_text ? (
                                                            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                                                                <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                                                    Transkrip
                                                                    hasil edit
                                                                    ustadz
                                                                </div>
                                                                <p className="mt-1 text-sm leading-6 text-amber-900 dark:text-amber-100">
                                                                    {
                                                                        answer
                                                                            .transcription
                                                                            .edited_text
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <p className="mt-3 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                                                        Belum ada record
                                                        transkripsi untuk audio
                                                        ini. Pastikan queue
                                                        worker berjalan atau
                                                        lakukan retry dari
                                                        halaman review ustadz.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="rounded-md border p-4">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Bot className="size-4 text-muted-foreground" />
                                                    AI Assessment & Validasi
                                                </div>
                                                <div className="mt-3 space-y-3 text-sm">
                                                    {answer.ai_assessment ? (
                                                        <div className="rounded-md bg-teal-50 p-3 text-teal-900 dark:bg-teal-950/30 dark:text-teal-100">
                                                            <div className="font-semibold">
                                                                Level
                                                                rekomendasi:{' '}
                                                                {
                                                                    answer
                                                                        .ai_assessment
                                                                        .moral_level
                                                                }
                                                            </div>
                                                            <div className="text-xs opacity-80">
                                                                Confidence:{' '}
                                                                {formatPercent(
                                                                    answer
                                                                        .ai_assessment
                                                                        .confidence,
                                                                )}
                                                            </div>
                                                            <p className="mt-2 text-xs leading-5">
                                                                {
                                                                    answer
                                                                        .ai_assessment
                                                                        .reasoning_summary
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                                                            Belum ada assessment
                                                            AI.
                                                        </p>
                                                    )}

                                                    {answer.validation ? (
                                                        <div className="rounded-md bg-emerald-50 p-3 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                                                            <div className="font-semibold">
                                                                Validasi:{' '}
                                                                {
                                                                    answer
                                                                        .validation
                                                                        .decision
                                                                }
                                                            </div>
                                                            <div className="text-xs opacity-80">
                                                                Level akhir:{' '}
                                                                {
                                                                    answer
                                                                        .validation
                                                                        .final_moral_level
                                                                }{' '}
                                                                • Ustadz:{' '}
                                                                {answer
                                                                    .validation
                                                                    .teacher_name ??
                                                                    '-'}
                                                            </div>
                                                            {answer.validation
                                                                .teacher_note ? (
                                                                <p className="mt-2 text-xs leading-5">
                                                                    Catatan:{' '}
                                                                    {
                                                                        answer
                                                                            .validation
                                                                            .teacher_note
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                                                            Belum divalidasi
                                                            ustadz.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}

AdminTestResultsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Hasil Pengerjaan Test', href: '/admin/test-results' },
        { title: 'Detail', href: '#' },
    ],
};
