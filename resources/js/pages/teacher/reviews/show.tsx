import AppLayout from '@/layouts/app-layout';
import { AudioPlayer } from '@/components/audio-player';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    AudioLines,
    Award,
    Bot,
    CheckCircle2,
    Clock,
    Edit3,
    FileText,
    HelpCircle,
    Mic,
    Save,
    ShieldAlert,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

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
        edited_text: review.transcription?.edited_text || review.transcription?.original_text || review.final_transcript || '',
    });

    const handleSaveTranscript = (e: React.FormEvent) => {
        e.preventDefault();
        putTranscript(`/teacher/reviews/${review.id}/transcript`, {
            onSuccess: () => setIsEditingTranscript(false),
        });
    };

    const [actionTab, setActionTab] = useState<'approve' | 'override'>('approve');

    const approveForm = useForm({
        teacher_note: review.validation.teacher_note || '',
    });

    const overrideForm = useForm({
        final_moral_level: review.validation.final_moral_level || review.ai_assessment?.moral_level || 'Tahap 3: Orientasi Anak Manis',
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

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Validasi & Review',
            href: '/teacher/reviews',
        },
        {
            title: `Detail Review #${review.id}`,
            href: `/teacher/reviews/${review.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Review - ${review.student.name}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Back Button & Title Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/teacher/reviews"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                    Detail Review Jawaban Santri
                                </h1>
                                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    #{review.id}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {review.test_package.title} — Submitted: {review.submitted_at || 'Terbaru'}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                        {review.validation.status === 'approved' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Status: Disetujui (Approved)
                            </span>
                        )}
                        {review.validation.status === 'overridden' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                <ShieldAlert className="h-4 w-4" />
                                Status: Dioverride
                            </span>
                        )}
                        {review.validation.status === 'pending_review' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                <Clock className="h-4 w-4" />
                                Status: Belum Direview
                            </span>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column (2/3): Question Context, Answers & Audio */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Student Card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {review.student.name}
                                    </h3>
                                    <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-slate-500">
                                        <span>Kode: {review.student.student_code}</span>
                                        <span>•</span>
                                        <span>Kelompok: {review.group.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Moral Case Context */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                                <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                                    Konteks Kasus Moral: {review.moral_case.title}
                                </h3>
                            </div>

                            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 md:text-sm">
                                {review.moral_case.story}
                            </div>

                            {/* Options */}
                            <div className="mt-4">
                                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Pilihan Jawaban Santri:
                                </h4>
                                <div className="mt-2 space-y-2">
                                    {review.moral_case.options.map((opt) => {
                                        const isSelected = review.selected_option?.id === opt.id;
                                        return (
                                            <div
                                                key={opt.id}
                                                className={`rounded-lg border p-3 text-xs md:text-sm ${
                                                    isSelected
                                                        ? 'border-emerald-500 bg-emerald-50/75 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-medium'
                                                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                                                }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold">{opt.label}.</span>
                                                    <span>{opt.text}</span>
                                                    {isSelected && (
                                                        <span className="ml-auto rounded bg-emerald-600 px-2 py-0.5 text-[10px] text-white">
                                                            Dipilih Santri
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Audio & Speech Transcript */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                                <Mic className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                                    Rekaman Suara & Transkripsi (STT)
                                </h3>
                            </div>

                            {/* Audio Player */}
                            {review.audio ? (
                                <div className="mt-4">
                                    <AudioPlayer
                                        src={`/teacher/reviews/${review.id}/audio`}
                                        originalName={review.audio.original_name}
                                        durationSeconds={review.audio.duration_seconds}
                                    />
                                </div>
                            ) : (
                                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800">
                                    Tidak ada rekaman audio file untuk jawaban ini.
                                </div>
                            )}

                            {/* Transkripsi Asli STT */}
                            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span>Tampilan Transkripsi Asli STT</span>
                                    </div>

                                    {review.transcription ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                Provider: {review.transcription.provider} ({review.transcription.model})
                                            </span>
                                            {review.transcription.confidence && (
                                                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                    Confidence: {(review.transcription.confidence * 100).toFixed(1)}%
                                                </span>
                                            )}
                                            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                                Status: {review.transcription.status}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                            Teks Jawaban Terketik
                                        </span>
                                    )}
                                </div>

                                {/* Original Transcript Text Box */}
                                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                            Teks Transkripsi Asli:
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {(review.transcription?.original_text || review.final_transcript) && (
                                                <button
                                                    onClick={() => {
                                                        const text = review.transcription?.original_text || review.final_transcript;
                                                        if (text) {
                                                            navigator.clipboard.writeText(text);
                                                            alert('Teks transkripsi berhasil disalin!');
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300"
                                                >
                                                    Salin Teks
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                                                className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                                            >
                                                <Edit3 className="h-3 w-3" />
                                                {isEditingTranscript ? 'Batal Edit' : 'Edit Transkripsi'}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 md:text-sm">
                                        {review.transcription?.original_text || review.final_transcript || (
                                            <span className="italic text-slate-400">Belum ada transkripsi teks asli.</span>
                                        )}
                                    </p>
                                </div>

                                {/* Form Edit Transkripsi Inline */}
                                {isEditingTranscript && (
                                    <form onSubmit={handleSaveTranscript} className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/30">
                                        <div className="flex items-center justify-between border-b border-indigo-100 pb-2 dark:border-indigo-900/40">
                                            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                                                Edit / Perbaiki Teks Transkripsi
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingTranscript(false)}
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <p className="mt-1 text-[11px] text-slate-500">
                                            Perbaiki kata atau kalimat yang salah dikonversi oleh Speech-To-Text sebelum dikonfirmasi oleh Ustadz.
                                        </p>

                                        <textarea
                                            rows={3}
                                            value={transcriptData.edited_text}
                                            onChange={(e) => setTranscriptData('edited_text', e.target.value)}
                                            placeholder="Tuliskan teks transkripsi perbaikan di sini..."
                                            className="mt-2 w-full rounded-lg border border-indigo-200 bg-white p-3 text-xs text-slate-800 shadow-inner outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-indigo-800 dark:bg-slate-900 dark:text-slate-200 md:text-sm"
                                        />
                                        {transcriptErrors.edited_text && (
                                            <p className="mt-1 text-[11px] text-red-500">{transcriptErrors.edited_text}</p>
                                        )}

                                        <div className="mt-3 flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingTranscript(false)}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSavingTranscript}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                <Save className="h-3.5 w-3.5" />
                                                {isSavingTranscript ? 'Menyimpan...' : 'Simpan Perbaikan'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* If edited transcript exists */}
                                {review.transcription?.edited_text && !isEditingTranscript && (
                                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                                                Teks Hasil Perbaikan/Revisi Ustadz:
                                            </span>
                                            <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                                                Telah Direvisi
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-200 md:text-sm">
                                            {review.transcription.edited_text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (1/3): AI Assessment Recommendation Panel */}
                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 shadow-sm dark:border-teal-900 dark:bg-teal-950/20">
                            <div className="flex items-center justify-between border-b border-teal-200 pb-3 dark:border-teal-900">
                                <div className="flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                    <h3 className="font-bold text-teal-950 dark:text-teal-100">
                                        Rekomendasi AI Assessment
                                    </h3>
                                </div>
                                {review.ai_assessment && (
                                    <span className="rounded bg-teal-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                                        {review.ai_assessment.provider} ({review.ai_assessment.model})
                                    </span>
                                )}
                            </div>

                            {review.ai_assessment ? (
                                <div className="mt-4 flex flex-col gap-4">
                                    {/* Level Recommendation */}
                                    <div>
                                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                            Rekomendasi Tingkat Moral (Kohlberg):
                                        </span>
                                        <div className="mt-1 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 p-3.5 text-center shadow-md shadow-teal-600/20">
                                            <span className="text-xs font-medium text-teal-100 block">Tingkat Penilaian LLM</span>
                                            <span className="mt-0.5 block text-sm font-extrabold text-white">
                                                {review.ai_assessment.moral_level}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Confidence Score Bar */}
                                    <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
                                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <span>Tingkat Keyakinan (Confidence)</span>
                                            <span className="text-teal-600 dark:text-teal-400">
                                                {(review.ai_assessment.confidence * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-teal-500 transition-all duration-500"
                                                style={{ width: `${Math.min(100, Math.max(0, review.ai_assessment.confidence * 100))}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Reasoning Summary */}
                                    <div>
                                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            Ringkasan Penalaran AI:
                                        </span>
                                        <p className="mt-1 rounded-lg bg-white p-3 text-xs leading-relaxed text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                                            {review.ai_assessment.reasoning_summary}
                                        </p>
                                    </div>

                                    {/* Suggested Intervention */}
                                    {review.ai_assessment.suggested_intervention && (
                                        <div>
                                            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                                                Saran Intervensi Pedagogis:
                                            </span>
                                            <p className="mt-1 rounded-lg border border-emerald-200 bg-emerald-100/60 p-3 text-xs text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                                                {review.ai_assessment.suggested_intervention}
                                            </p>
                                        </div>
                                    )}

                                    {/* Warning Signals */}
                                    {review.ai_assessment.warning_signals && review.ai_assessment.warning_signals.length > 0 && (
                                        <div>
                                            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                                                Sinyal Peringatan / Warning Signals:
                                            </span>
                                            <div className="mt-1 flex flex-wrap gap-1.5">
                                                {review.ai_assessment.warning_signals.map((signal, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                                                    >
                                                        <ShieldAlert className="h-3 w-3 text-amber-600" />
                                                        {typeof signal === 'string' ? signal : JSON.stringify(signal)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Character Indicators Evaluated */}
                                    {review.ai_assessment.indicators && review.ai_assessment.indicators.length > 0 && (
                                        <div>
                                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                Skor Indikator Karakter Teridentifikasi:
                                            </span>
                                            <div className="mt-1 space-y-1">
                                                {review.ai_assessment.indicators.map((ind: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between rounded bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300"
                                                    >
                                                        <span>{ind.indicator_name || `Indikator #${ind.indicator_id}`}</span>
                                                        <span className="font-bold text-teal-600 dark:text-teal-400">
                                                            Skor: {ind.score}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Toggle Raw JSON Response */}
                                    <div className="border-t border-teal-200/60 pt-3 dark:border-teal-900/40">
                                        <button
                                            onClick={() => setShowRawResponseJson(!showRawResponseJson)}
                                            className="text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400"
                                        >
                                            {showRawResponseJson ? 'Sembunyikan Raw JSON AI' : 'Lihat Raw JSON AI Response'}
                                        </button>
                                        {showRawResponseJson && (
                                            <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-950 p-3 text-[10px] font-mono text-emerald-400">
                                                {JSON.stringify(review.ai_assessment, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 p-4 text-center text-xs text-slate-500">
                                    Belum ada hasil penilaian AI.
                                </div>
                            )}
                        </div>

                        {/* Form Validasi Ustadz (Approve & Override) */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                Validasi & Keputusan Ustadz
                            </h4>

                            {/* Existing Validation Decision Status */}
                            {review.validation.decision && (
                                <div className={`mt-3 rounded-lg p-3 text-xs ${
                                    review.validation.decision === 'approved'
                                        ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'
                                        : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900'
                                }`}>
                                    <div className="flex items-center justify-between font-bold">
                                        <span>Keputusan Validasi: {review.validation.decision === 'approved' ? 'Disetujui' : 'Dioverride'}</span>
                                        <span className="text-[10px] opacity-75">{review.validation.validated_at || ''}</span>
                                    </div>
                                    <p className="mt-1 font-semibold">
                                        Level Akhir: {review.validation.final_moral_level}
                                    </p>
                                    {review.validation.override_reason && (
                                        <p className="mt-1 text-[11px] italic">
                                            Alasan Override: &quot;{review.validation.override_reason}&quot;
                                        </p>
                                    )}
                                    {review.validation.teacher_note && (
                                        <p className="mt-1 text-[11px]">
                                            Catatan: &quot;{review.validation.teacher_note}&quot;
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Action Tabs */}
                            <div className="mt-4 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                                <button
                                    onClick={() => setActionTab('approve')}
                                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                                        actionTab === 'approve'
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Setujui (Approve)
                                </button>
                                <button
                                    onClick={() => setActionTab('override')}
                                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                                        actionTab === 'override'
                                            ? 'bg-amber-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Ubah Nilai (Override)
                                </button>
                            </div>

                            {/* Approve Form */}
                            {actionTab === 'approve' && (
                                <form onSubmit={handleApproveSubmit} className="mt-4 flex flex-col gap-3">
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Menyetujui rekomendasi AI level <span className="font-bold text-emerald-600">{review.ai_assessment?.moral_level || review.selected_option?.internal_value || 'Tahap 3'}</span> sebagai hasil akhir santri.
                                    </p>

                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            Catatan Ustadz (Opsional):
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={approveForm.data.teacher_note}
                                            onChange={(e) => approveForm.setData('teacher_note', e.target.value)}
                                            placeholder="Tambahkan catatan hasil pengamatan..."
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={approveForm.processing}
                                        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        {approveForm.processing ? 'Menyimpan...' : 'Setujui Rekomendasi AI'}
                                    </button>
                                </form>
                            )}

                            {/* Override Form */}
                            {actionTab === 'override' && (
                                <form onSubmit={handleOverrideSubmit} className="mt-4 flex flex-col gap-3">
                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            Pilih Tingkat Moral Akhir (Kohlberg):
                                        </label>
                                        <select
                                            value={overrideForm.data.final_moral_level}
                                            onChange={(e) => overrideForm.setData('final_moral_level', e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        >
                                            <option value="Tahap 1: Kepatuhan dan Hukuman">Tahap 1: Kepatuhan dan Hukuman</option>
                                            <option value="Tahap 2: Individualisme dan Pertukaran">Tahap 2: Individualisme dan Pertukaran</option>
                                            <option value="Tahap 3: Orientasi Anak Manis">Tahap 3: Orientasi Anak Manis</option>
                                            <option value="Tahap 4: Menjaga Ketertiban Sosial">Tahap 4: Menjaga Ketertiban Sosial</option>
                                            <option value="Tahap 5: Kontrak Sosial dan Hak Individu">Tahap 5: Kontrak Sosial dan Hak Individu</option>
                                            <option value="Tahap 6: Prinsip Etika Universal">Tahap 6: Prinsip Etika Universal</option>
                                        </select>
                                        {overrideForm.errors.final_moral_level && (
                                            <p className="mt-1 text-[11px] text-red-500">{overrideForm.errors.final_moral_level}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                                            Alasan Override (Wajib Diisi): <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={overrideForm.data.override_reason}
                                            onChange={(e) => overrideForm.setData('override_reason', e.target.value)}
                                            placeholder="Jelaskan alasan Anda mengubah hasil penilaian AI (misal: berdasarkan observasi harian atau jawaban lisan santri)..."
                                            className="mt-1 w-full rounded-lg border border-amber-300 bg-amber-50/50 p-2.5 text-xs text-amber-950 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
                                        />
                                        {overrideForm.errors.override_reason && (
                                            <p className="mt-1 text-[11px] font-medium text-red-500">{overrideForm.errors.override_reason}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            Catatan Tambahan (Opsional):
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={overrideForm.data.teacher_note}
                                            onChange={(e) => overrideForm.setData('teacher_note', e.target.value)}
                                            placeholder="Tambahkan catatan pendampingan..."
                                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={overrideForm.processing}
                                        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition hover:bg-amber-700 disabled:opacity-50"
                                    >
                                        <ShieldAlert className="h-4 w-4" />
                                        {overrideForm.processing ? 'Menyimpan...' : 'Simpan Override Penilaian'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Audit Perubahan & Timeline Visual */}
                        {review.audit_trail && review.audit_trail.length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        Audit Perubahan & Riwayat Pemrosesan
                                    </h4>
                                </div>

                                <div className="mt-4 space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                                    {review.audit_trail.map((item, idx) => (
                                        <div key={idx} className="relative flex gap-3 pl-8">
                                            <div className="absolute left-1 top-1 h-5 w-5 rounded-full border-2 border-white bg-indigo-600 shadow-sm dark:border-slate-900" />
                                            <div className="flex flex-col">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        {item.event}
                                                    </span>
                                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                        {item.actor}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {item.timestamp}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
