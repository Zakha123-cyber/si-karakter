import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    AudioLines,
    Bot,
    CheckCircle2,
    Clock,
    Edit3,
    FileText,
    HelpCircle,
    MessageSquareText,
    Save,
    ShieldAlert,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
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

interface ReviewDetailProps {
    review: {
        id: number;
        test_attempt_id: number;
        answer_status: string;
        submitted_at: string | null;
        student: {
            id: number;
            name: string;
            student_code: string;
            gender: string;
            username?: string;
        };
        group: {
            id: number;
            name: string;
        };
        test_package: {
            id: number;
            title: string;
            description: string | null;
        };
        moral_case: {
            id: number;
            title: string;
            story: string;
            options: Array<{
                id: number;
                label: string;
                text: string;
                internal_value: string;
            }>;
        };
        selected_option: {
            id: number;
            label: string;
            text: string;
            internal_value: string;
        } | null;
        typed_reason: string | null;
        final_transcript: string | null;
        audio: {
            id: number;
            file_path: string;
            original_name: string;
            duration_seconds: number | null;
            url: string;
        } | null;
        transcription: {
            id: number;
            provider: string;
            model: string;
            original_text: string | null;
            edited_text: string | null;
            confidence: number | null;
            status: string;
            processed_at: string | null;
        } | null;
        ai_assessment: {
            id: number;
            provider: string;
            model: string;
            moral_level: string;
            confidence: number;
            reasoning_summary: string;
            suggested_intervention: string | null;
            warning_signals: any[];
            indicators: Array<{
                indicator_id: number;
                indicator_name: string;
                score: number;
            }>;
            status: string;
            processed_at: string | null;
        } | null;
        validation: {
            status: string;
            id: number | null;
            decision: string | null;
            final_moral_level: string | null;
            final_indicators: any[];
            teacher_note: string | null;
            override_reason: string | null;
            teacher_name?: string | null;
            validated_at: string | null;
        };
        audit_trail?: Array<{
            event: string;
            timestamp: string;
            actor: string;
            description: string;
        }>;
    };
}

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

export default function ReviewDetail({ review }: ReviewDetailProps) {
    const [isEditingTranscript, setIsEditingTranscript] = useState(false);
    const [showRawResponseJson, setShowRawResponseJson] = useState(false);
    const {
        data: transcriptData,
        setData: setTranscriptData,
        put: putTranscript,
        processing: isSavingTranscript,
        errors: transcriptErrors,
    } = useForm({
        edited_text:
            review.transcription?.edited_text ||
            review.transcription?.original_text ||
            review.final_transcript ||
            '',
    });

    const handleSaveTranscript = (e: React.FormEvent) => {
        e.preventDefault();
        putTranscript(`/teacher/reviews/${review.id}/transcript`, {
            onSuccess: () => setIsEditingTranscript(false),
        });
    };

    const [actionTab, setActionTab] = useState<'approve' | 'override'>(
        'approve',
    );

    const approveForm = useForm({
        teacher_note: review.validation.teacher_note || '',
    });

    const overrideForm = useForm({
        final_moral_level:
            review.validation.final_moral_level ||
            review.ai_assessment?.moral_level ||
            'Tahap 3: Orientasi Anak Manis',
        override_reason: review.validation.override_reason || '',
        teacher_note: review.validation.teacher_note || '',
    });

    const handleApproveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        approveForm.post(`/teacher/reviews/${review.id}/approve`);
    };

    const handleOverrideSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        overrideForm.post(`/teacher/reviews/${review.id}/override`);
    };

    const stt = transcriptionBadge(review.transcription?.status ?? null);
    const SttIcon = stt.icon;

    return (
        <>
            <Head title={`Detail Review - ${review.student.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header & Back Button */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/teacher/reviews">
                                <ArrowLeft className="size-4" />
                                <span className="sr-only">Kembali</span>
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-normal">
                                    Detail Review Jawaban Santri
                                </h1>
                                <Badge variant="secondary">#{review.id}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {review.test_package.title} — dikirim{' '}
                                {formatDateTime(review.submitted_at)}
                            </p>
                        </div>
                    </div>

                    <div>
                        {review.validation.status === 'approved' && (
                            <Badge
                                variant="default"
                                className="gap-1.5 bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700"
                            >
                                <CheckCircle2 className="size-4" />
                                Status: Disetujui (Approved)
                            </Badge>
                        )}
                        {review.validation.status === 'overridden' && (
                            <Badge
                                variant="default"
                                className="gap-1.5 bg-amber-600 px-3 py-1 text-white hover:bg-amber-700"
                            >
                                <ShieldAlert className="size-4" />
                                Status: Dioverride
                            </Badge>
                        )}
                        {review.validation.status === 'pending_review' && (
                            <Badge
                                variant="secondary"
                                className="gap-1.5 px-3 py-1"
                            >
                                <Clock className="size-4" />
                                Status: Belum Direview
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Overview Cards */}
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
                                {review.student.name}
                            </div>
                            <div className="text-muted-foreground">
                                NIS: {review.student.student_code} • Kelompok:{' '}
                                {review.group.name}
                            </div>
                            <div className="text-muted-foreground">
                                Username: @
                                {review.student.username ??
                                    review.student.student_code?.toLowerCase()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-base">
                                Jawaban & Pilihan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {review.selected_option
                                    ? `Pilihan ${review.selected_option.label}`
                                    : 'Belum memilih'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Status: {review.answer_status}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="text-base">
                                STT & AI
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {review.transcription
                                    ? review.transcription.confidence
                                        ? formatPercent(
                                              review.transcription.confidence,
                                          )
                                        : '100%'
                                    : '0%'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Keyakinan transkripsi / AI
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Case & Review Card */}
                <div className="grid gap-4">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <HelpCircle className="size-5 text-muted-foreground" />
                                        Kasus Moral: {review.moral_case.title}
                                    </CardTitle>
                                    <CardDescription>
                                        Status jawaban: {review.answer_status}
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
                            {/* Left Column (1.4fr) */}
                            <div className="space-y-5">
                                <div className="rounded-md bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                                    {review.moral_case.story}
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium">
                                        Pilihan Santri
                                    </div>
                                    {review.moral_case.options.map((opt) => {
                                        const isSelected =
                                            review.selected_option?.id ===
                                            opt.id;

                                        return (
                                            <div
                                                key={opt.id}
                                                className={`rounded-md border p-3 text-sm ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'bg-background text-muted-foreground'
                                                }`}
                                            >
                                                <div className="flex gap-2">
                                                    <span className="font-semibold">
                                                        {opt.label}.
                                                    </span>
                                                    <span>{opt.text}</span>
                                                    {isSelected ? (
                                                        <Badge className="ml-auto">
                                                            Dipilih Santri
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="rounded-md border p-4">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <MessageSquareText className="size-4 text-muted-foreground" />
                                        Alasan Teks Santri
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {review.typed_reason || (
                                            <span className="italic">
                                                Tidak ada alasan teks.
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column (1fr) */}
                            <div className="space-y-5">
                                {/* Audio Jawaban */}
                                <div className="rounded-md border p-4">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <AudioLines className="size-4 text-muted-foreground" />
                                        Audio Jawaban
                                    </div>
                                    <div className="mt-3">
                                        {review.audio ? (
                                            <AudioPlayer
                                                src={`/teacher/reviews/${review.id}/audio`}
                                                originalName={
                                                    review.audio.original_name
                                                }
                                                durationSeconds={
                                                    review.audio
                                                        .duration_seconds
                                                }
                                            />
                                        ) : (
                                            <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                                                Tidak ada rekaman audio file
                                                untuk jawaban ini.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Hasil Transkripsi STT */}
                                <div className="rounded-md border p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FileText className="size-4 text-muted-foreground" />
                                            Hasil Transkripsi STT
                                        </div>
                                        {review.transcription ? (
                                            <Badge variant="outline">
                                                {review.transcription.provider}{' '}
                                                • {review.transcription.model}
                                            </Badge>
                                        ) : null}
                                    </div>

                                    {review.transcription ? (
                                        <div className="mt-3 space-y-3">
                                            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                                                <div>
                                                    Status:{' '}
                                                    <span className="font-semibold text-foreground">
                                                        {
                                                            review.transcription
                                                                .status
                                                        }
                                                    </span>
                                                </div>
                                                <div>
                                                    Confidence:{' '}
                                                    <span className="font-semibold text-foreground">
                                                        {formatPercent(
                                                            review.transcription
                                                                .confidence,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    Diproses:{' '}
                                                    <span className="font-semibold text-foreground">
                                                        {formatDateTime(
                                                            review.transcription
                                                                .processed_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-md bg-muted/40 p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs font-semibold text-muted-foreground">
                                                        Transkrip asli
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {(review.transcription
                                                            ?.original_text ||
                                                            review.final_transcript) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const text =
                                                                        review
                                                                            .transcription
                                                                            ?.original_text ||
                                                                        review.final_transcript;

                                                                    if (text) {
                                                                        navigator.clipboard.writeText(
                                                                            text,
                                                                        );
                                                                        alert(
                                                                            'Teks transkripsi berhasil disalin!',
                                                                        );
                                                                    }
                                                                }}
                                                                className="inline-flex items-center gap-1 rounded border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted"
                                                            >
                                                                Salin
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setIsEditingTranscript(
                                                                    !isEditingTranscript,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90"
                                                        >
                                                            <Edit3 className="size-3" />
                                                            {isEditingTranscript
                                                                ? 'Batal'
                                                                : 'Edit'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="mt-1 text-sm leading-6">
                                                    {review.transcription
                                                        .original_text ||
                                                        review.final_transcript || (
                                                            <span className="text-muted-foreground italic">
                                                                Belum ada teks
                                                                transkrip asli.
                                                            </span>
                                                        )}
                                                </p>
                                            </div>

                                            {isEditingTranscript && (
                                                <form
                                                    onSubmit={
                                                        handleSaveTranscript
                                                    }
                                                    className="mt-3 space-y-2 rounded-md border border-primary/40 bg-primary/5 p-3"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-primary">
                                                            Edit / Perbaiki Teks
                                                            Transkripsi
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setIsEditingTranscript(
                                                                    false,
                                                                )
                                                            }
                                                            className="text-muted-foreground hover:text-foreground"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        rows={3}
                                                        value={
                                                            transcriptData.edited_text
                                                        }
                                                        onChange={(e) =>
                                                            setTranscriptData(
                                                                'edited_text',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Tuliskan teks transkripsi perbaikan di sini..."
                                                        className="w-full rounded-md border bg-background p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                    {transcriptErrors.edited_text && (
                                                        <p className="text-[11px] text-destructive">
                                                            {
                                                                transcriptErrors.edited_text
                                                            }
                                                        </p>
                                                    )}
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setIsEditingTranscript(
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            Batal
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            disabled={
                                                                isSavingTranscript
                                                            }
                                                        >
                                                            <Save className="mr-1 size-3.5" />
                                                            {isSavingTranscript
                                                                ? 'Menyimpan...'
                                                                : 'Simpan Perbaikan'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            )}

                                            {review.transcription.edited_text &&
                                                !isEditingTranscript && (
                                                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                                                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                                            Transkrip hasil edit
                                                            ustadz
                                                        </div>
                                                        <p className="mt-1 text-sm leading-6 text-amber-900 dark:text-amber-100">
                                                            {
                                                                review
                                                                    .transcription
                                                                    .edited_text
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                        </div>
                                    ) : (
                                        <p className="mt-3 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                                            Belum ada record transkripsi untuk
                                            audio ini.
                                        </p>
                                    )}
                                </div>

                                {/* Rekomendasi AI Assessment */}
                                <div className="rounded-md border p-4">
                                    <div className="flex items-center justify-between gap-2 border-b pb-3">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Bot className="size-4 text-teal-600 dark:text-teal-400" />
                                            Rekomendasi AI Assessment
                                        </div>
                                        {review.ai_assessment && (
                                            <Badge
                                                variant="outline"
                                                className="border-teal-200 text-teal-600 dark:border-teal-900 dark:text-teal-400"
                                            >
                                                AI Assessment
                                            </Badge>
                                        )}
                                    </div>

                                    {review.ai_assessment ? (
                                        <div className="mt-3 space-y-3 text-sm">
                                            <div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Rekomendasi Tingkat Moral
                                                    (Kohlberg):
                                                </span>
                                                <div className="mt-1.5 rounded-lg bg-emerald-600 p-3 text-center text-white shadow-sm">
                                                    <span className="block text-xs opacity-90">
                                                        Tingkat Penilaian LLM
                                                    </span>
                                                    <span className="block text-base font-extrabold">
                                                        {
                                                            review.ai_assessment
                                                                .moral_level
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 rounded-md border bg-muted/20 p-3">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span>
                                                        Tingkat Keyakinan
                                                        (Confidence)
                                                    </span>
                                                    <span className="text-teal-600 dark:text-teal-400">
                                                        {formatPercent(
                                                            review.ai_assessment
                                                                .confidence,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-teal-500 transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(100, Math.max(0, review.ai_assessment.confidence * 100))}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Ringkasan Penalaran AI:
                                                </span>
                                                <p className="mt-1 rounded-md bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
                                                    {
                                                        review.ai_assessment
                                                            .reasoning_summary
                                                    }
                                                </p>
                                            </div>

                                            {review.ai_assessment
                                                .suggested_intervention && (
                                                <div>
                                                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                                        Saran Intervensi
                                                        Pedagogis:
                                                    </span>
                                                    <p className="mt-1 rounded-md border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                                                        {
                                                            review.ai_assessment
                                                                .suggested_intervention
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {review.ai_assessment
                                                .warning_signals &&
                                                review.ai_assessment
                                                    .warning_signals.length >
                                                    0 && (
                                                    <div>
                                                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                                            Sinyal Peringatan
                                                            (Warning Signals):
                                                        </span>
                                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                                            {review.ai_assessment.warning_signals.map(
                                                                (
                                                                    signal,
                                                                    idx,
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            idx
                                                                        }
                                                                        variant="outline"
                                                                        className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                                                                    >
                                                                        <ShieldAlert className="mr-1 size-3 text-amber-600" />
                                                                        {typeof signal ===
                                                                        'string'
                                                                            ? signal
                                                                            : JSON.stringify(
                                                                                  signal,
                                                                              )}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {review.ai_assessment.indicators &&
                                                review.ai_assessment.indicators
                                                    .length > 0 && (
                                                    <div>
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            Skor Indikator
                                                            Karakter
                                                            Teridentifikasi:
                                                        </span>
                                                        <div className="mt-1 space-y-1">
                                                            {review.ai_assessment.indicators.map(
                                                                (
                                                                    ind: any,
                                                                    idx: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex items-center justify-between rounded-md border bg-background px-3 py-1.5 text-xs"
                                                                    >
                                                                        <span>
                                                                            {ind.indicator_name ||
                                                                                ind.name ||
                                                                                ind.code ||
                                                                                (ind.indicator_id
                                                                                    ? `Indikator #${ind.indicator_id}`
                                                                                    : `Indikator ${idx + 1}`)}
                                                                        </span>
                                                                        <span className="font-bold text-teal-600 dark:text-teal-400">
                                                                            Skor:{' '}
                                                                            {
                                                                                ind.score
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            <div className="pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowRawResponseJson(
                                                            !showRawResponseJson,
                                                        )
                                                    }
                                                    className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
                                                >
                                                    {showRawResponseJson
                                                        ? 'Sembunyikan Raw JSON AI'
                                                        : 'Lihat Raw JSON AI Response'}
                                                </button>
                                                {showRawResponseJson && (
                                                    <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-950 p-3 font-mono text-[10px] text-emerald-400">
                                                        {JSON.stringify(
                                                            review.ai_assessment,
                                                            null,
                                                            2,
                                                        )}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-3 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                                            Belum ada rekomendasi penilaian AI.
                                        </p>
                                    )}
                                </div>

                                {/* Validasi & Keputusan Ustadz */}
                                <div className="space-y-3 rounded-md border p-4">
                                    <div className="text-sm font-medium">
                                        Validasi & Keputusan Ustadz
                                    </div>

                                    {review.validation.decision && (
                                        <div
                                            className={`rounded-md p-3 text-xs ${
                                                review.validation.decision ===
                                                'approved'
                                                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                                                    : 'border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between font-bold">
                                                <span>
                                                    Keputusan Validasi:{' '}
                                                    {review.validation
                                                        .decision === 'approved'
                                                        ? 'Disetujui'
                                                        : 'Dioverride'}
                                                </span>
                                                <span className="text-[10px] opacity-75">
                                                    {review.validation
                                                        .validated_at || ''}
                                                </span>
                                            </div>
                                            <p className="mt-1 font-semibold">
                                                Level Akhir:{' '}
                                                {
                                                    review.validation
                                                        .final_moral_level
                                                }
                                            </p>
                                            {review.validation
                                                .override_reason && (
                                                <p className="mt-1 text-[11px] italic">
                                                    Alasan Override: &quot;
                                                    {
                                                        review.validation
                                                            .override_reason
                                                    }
                                                    &quot;
                                                </p>
                                            )}
                                            {review.validation.teacher_note && (
                                                <p className="mt-1 text-[11px]">
                                                    Catatan:{' '}
                                                    {
                                                        review.validation
                                                            .teacher_note
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tabs */}
                                    <div className="flex rounded-md border bg-muted/40 p-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActionTab('approve')
                                            }
                                            className={`flex-1 rounded-sm py-1.5 text-xs font-semibold transition ${
                                                actionTab === 'approve'
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Setujui Hasil AI
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActionTab('override')
                                            }
                                            className={`flex-1 rounded-sm py-1.5 text-xs font-semibold transition ${
                                                actionTab === 'override'
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            Override Penilaian
                                        </button>
                                    </div>

                                    {/* Form Approve */}
                                    {actionTab === 'approve' && (
                                        <form
                                            onSubmit={handleApproveSubmit}
                                            className="space-y-3 pt-1"
                                        >
                                            <p className="text-xs text-muted-foreground">
                                                Menyetujui rekomendasi AI level{' '}
                                                <span className="font-bold text-emerald-600">
                                                    {review.ai_assessment
                                                        ?.moral_level ||
                                                        review.selected_option
                                                            ?.internal_value ||
                                                        'Tahap 3'}
                                                </span>{' '}
                                                sebagai hasil akhir santri.
                                            </p>

                                            <div>
                                                <label className="text-xs font-medium">
                                                    Catatan Ustadz (Opsional):
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={
                                                        approveForm.data
                                                            .teacher_note
                                                    }
                                                    onChange={(e) =>
                                                        approveForm.setData(
                                                            'teacher_note',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Tambahkan catatan hasil pengamatan..."
                                                    className="mt-1 w-full rounded-md border bg-background p-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={
                                                    approveForm.processing
                                                }
                                                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                                            >
                                                <CheckCircle2 className="mr-1.5 size-4" />
                                                {approveForm.processing
                                                    ? 'Menyimpan...'
                                                    : 'Setujui Rekomendasi AI'}
                                            </Button>
                                        </form>
                                    )}

                                    {/* Form Override */}
                                    {actionTab === 'override' && (
                                        <form
                                            onSubmit={handleOverrideSubmit}
                                            className="space-y-3 pt-1"
                                        >
                                            <div>
                                                <label className="text-xs font-medium">
                                                    Pilih Tingkat Moral Akhir
                                                    (Kohlberg):
                                                </label>
                                                <select
                                                    value={
                                                        overrideForm.data
                                                            .final_moral_level
                                                    }
                                                    onChange={(e) =>
                                                        overrideForm.setData(
                                                            'final_moral_level',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded-md border bg-background p-2 text-xs font-medium outline-none focus:ring-1 focus:ring-amber-500"
                                                >
                                                    <option value="Tahap 1: Kepatuhan dan Hukuman">
                                                        Tahap 1: Kepatuhan dan
                                                        Hukuman
                                                    </option>
                                                    <option value="Tahap 2: Individualisme dan Pertukaran">
                                                        Tahap 2: Individualisme
                                                        dan Pertukaran
                                                    </option>
                                                    <option value="Tahap 3: Orientasi Anak Manis">
                                                        Tahap 3: Orientasi Anak
                                                        Manis
                                                    </option>
                                                    <option value="Tahap 4: Menjaga Ketertiban Sosial">
                                                        Tahap 4: Menjaga
                                                        Ketertiban Sosial
                                                    </option>
                                                    <option value="Tahap 5: Kontrak Sosial dan Hak Individu">
                                                        Tahap 5: Kontrak Sosial
                                                        dan Hak Individu
                                                    </option>
                                                    <option value="Tahap 6: Prinsip Etika Universal">
                                                        Tahap 6: Prinsip Etika
                                                        Universal
                                                    </option>
                                                </select>
                                                {overrideForm.errors
                                                    .final_moral_level && (
                                                    <p className="mt-1 text-[11px] text-destructive">
                                                        {
                                                            overrideForm.errors
                                                                .final_moral_level
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                                    Alasan Override (Wajib
                                                    Diisi):{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={
                                                        overrideForm.data
                                                            .override_reason
                                                    }
                                                    onChange={(e) =>
                                                        overrideForm.setData(
                                                            'override_reason',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Jelaskan alasan Anda mengubah hasil penilaian AI..."
                                                    className="mt-1 w-full rounded-md border border-amber-300 bg-amber-50/50 p-2 text-xs outline-none focus:ring-1 focus:ring-amber-500 dark:border-amber-900 dark:bg-amber-950/20"
                                                />
                                                {overrideForm.errors
                                                    .override_reason && (
                                                    <p className="mt-1 text-[11px] text-destructive">
                                                        {
                                                            overrideForm.errors
                                                                .override_reason
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium">
                                                    Catatan Tambahan (Opsional):
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={
                                                        overrideForm.data
                                                            .teacher_note
                                                    }
                                                    onChange={(e) =>
                                                        overrideForm.setData(
                                                            'teacher_note',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Tambahkan catatan pendampingan..."
                                                    className="mt-1 w-full rounded-md border bg-background p-2 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={
                                                    overrideForm.processing
                                                }
                                                className="w-full bg-amber-600 text-white hover:bg-amber-700"
                                            >
                                                <ShieldAlert className="mr-1.5 size-4" />
                                                {overrideForm.processing
                                                    ? 'Menyimpan...'
                                                    : 'Simpan Override Penilaian'}
                                            </Button>
                                        </form>
                                    )}
                                </div>

                                {/* Audit Perubahan */}
                                {review.audit_trail &&
                                    review.audit_trail.length > 0 && (
                                        <div className="space-y-3 rounded-md border p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Clock className="size-4 text-muted-foreground" />
                                                Audit Perubahan & Riwayat
                                                Pemrosesan
                                            </div>

                                            <div className="relative mt-2 space-y-3 before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-border">
                                                {review.audit_trail.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative flex gap-3 pl-6"
                                                        >
                                                            <div className="absolute top-1 left-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
                                                            <div className="flex flex-col text-xs">
                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                    <span className="font-bold text-foreground">
                                                                        {
                                                                            item.event
                                                                        }
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="px-1 py-0 text-[10px]"
                                                                    >
                                                                        {
                                                                            item.actor
                                                                        }
                                                                    </Badge>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {
                                                                            item.timestamp
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <p className="mt-0.5 text-muted-foreground">
                                                                    {
                                                                        item.description
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
