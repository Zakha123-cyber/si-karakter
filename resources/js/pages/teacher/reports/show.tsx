import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Download,
    FileText,
    Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ReportStudent = {
    id: number | null;
    name: string | null;
    student_code: string | null;
    group_name: string | null;
};

type CharacterReport = {
    id: number;
    student: ReportStudent;
    period_start: string;
    period_end: string;
    status: string;
    test_summary: {
        score: number | null;
        validated_answers: number;
        total_answers: number;
    } | null;
    observation_summary: {
        score: number | null;
        counted_items: number;
        total_items: number;
    } | null;
    ai_generated_narrative: string | null;
    final_narrative: string | null;
    recommendation: string | null;
    teacher: {
        id: number | null;
        name: string | null;
    } | null;
    published_at: string | null;
    published_at_label: string | null;
    created_at: string | null;
    created_at_label: string | null;
    has_pdf: boolean;
};

type SummaryState = {
    test_complete: boolean;
    observation_complete: boolean;
    complete: boolean;
};

type Props = {
    report: CharacterReport;
    summary: SummaryState;
};

function statusLabel(value: string): string {
    const map: Record<string, string> = {
        draft: 'Draft',
        reviewed: 'Direview',
        published: 'Terbit',
    };

    return map[value] ?? value;
}

function statusClasses(value: string): string {
    switch (value) {
        case 'draft':
            return 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-50';
        case 'reviewed':
            return 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50';
        case 'published':
            return 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50';
        default:
            return 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-50';
    }
}

export default function TeacherReportShow({ report, summary }: Props) {
    const form = useForm({
        final_narrative: report.final_narrative ?? '',
        recommendation: report.recommendation ?? '',
    });

    const canEdit = report.status === 'draft';

    const useAiDraft = () => {
        if (report.ai_generated_narrative) {
            form.setData('final_narrative', report.ai_generated_narrative);
            toast.success('Draft AI disalin ke narasi final.');
        }
    };

    const saveNarrative = (event: FormEvent) => {
        event.preventDefault();

        const toastId = toast.loading('Menyimpan narasi laporan...');

        form.put(`/teacher/reports/${report.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Narasi laporan berhasil disimpan.', {
                    id: toastId,
                });
            },
            onError: () => {
                toast.error('Narasi laporan belum berhasil disimpan.', {
                    id: toastId,
                });
            },
        });
    };

    const runNarrative = () => {
        const toastId = toast.loading('Membuat draft narasi AI...');

        router.post(
            `/teacher/reports/${report.id}/generate-narrative`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Draft narasi AI berhasil dibuat.', {
                        id: toastId,
                    });
                },
                onError: () => {
                    toast.error('Draft narasi AI gagal dibuat.', {
                        id: toastId,
                    });
                },
            },
        );
    };

    const reviewReport = (event: FormEvent) => {
        event.preventDefault();

        const toastId = toast.loading('Mengonfirmasi laporan...');

        router.post(
            `/teacher/reports/${report.id}/review`,
            {
                final_narrative: form.data.final_narrative,
                recommendation: form.data.recommendation,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Laporan berhasil dikonfirmasi ustadz.', {
                        id: toastId,
                    });
                },
                onError: () => {
                    toast.error('Laporan belum bisa dikonfirmasi.', {
                        id: toastId,
                    });
                },
            },
        );
    };

    const publishReport = () => {
        const toastId = toast.loading('Menerbitkan laporan...');

        router.post(
            `/teacher/reports/${report.id}/publish`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Laporan berhasil diterbitkan.', {
                        id: toastId,
                    });
                },
                onError: () => {
                    toast.error('Laporan belum bisa diterbitkan.', {
                        id: toastId,
                    });
                },
            },
        );
    };

    return (
        <>
            <Head title={`Laporan - ${report.student.name ?? 'Santri'}`} />

            <div className="min-h-full space-y-6 pb-8">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.get('/teacher/reports')}
                    className="rounded-2xl text-xs font-bold text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Daftar Laporan
                </Button>

                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-extrabold text-white">
                                    {report.student.name ?? 'Santri'}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={`border-white/30 bg-white/15 text-white ${statusClasses(report.status)}`}
                                >
                                    {statusLabel(report.status)}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm font-medium text-emerald-50/90">
                                {report.period_start} s.d. {report.period_end}
                                {' · '}
                                {report.student.group_name ?? 'Tanpa kelompok'}
                            </p>
                        </div>

                        {report.has_pdf && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.get(
                                        `/teacher/reports/${report.id}/pdf`,
                                    )
                                }
                                className="rounded-2xl border-white/30 bg-white text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                            >
                                <Download className="size-4" />
                                Unduh PDF
                            </Button>
                        )}
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-[24px] bg-sky-50 p-4">
                            <p className="text-[11px] font-bold tracking-wide text-sky-600 uppercase">
                                Rekap Tes
                            </p>
                            <p className="mt-1 text-2xl font-extrabold text-sky-700">
                                {report.test_summary?.score !== null &&
                                report.test_summary?.score !== undefined
                                    ? `${report.test_summary.score}%`
                                    : '—'}
                            </p>
                            <p className="mt-1 text-[11px] font-medium text-sky-600/80">
                                {summary.test_complete
                                    ? `${report.test_summary?.validated_answers ?? 0} jawaban tervalidasi`
                                    : 'Belum ada jawaban tervalidasi'}
                            </p>
                        </div>
                        <div className="rounded-[24px] bg-white/15 p-4 ring-1 ring-white/20">
                            <p className="text-[11px] font-bold tracking-wide text-emerald-50 uppercase">
                                Rekap Observasi
                            </p>
                            <p className="mt-1 text-2xl font-extrabold text-white">
                                {report.observation_summary?.score !== null &&
                                report.observation_summary?.score !== undefined
                                    ? `${report.observation_summary.score}%`
                                    : '—'}
                            </p>
                            <p className="mt-1 text-[11px] font-medium text-emerald-50/80">
                                {summary.observation_complete
                                    ? `${report.observation_summary?.counted_items ?? 0} catatan terhitung`
                                    : 'Belum ada catatan observasi'}
                            </p>
                        </div>
                        <div className="rounded-[24px] bg-emerald-50 p-4">
                            <p className="text-[11px] font-bold tracking-wide text-emerald-600 uppercase">
                                Status Rekap
                            </p>
                            <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                                {summary.complete ? 'Lengkap' : 'Sebagian'}
                            </p>
                            <p className="mt-1 text-[11px] font-medium text-emerald-600/80">
                                {summary.complete
                                    ? 'Tes dan observasi sudah lengkap'
                                    : 'Lengkapi tes atau observasi periode ini'}
                            </p>
                        </div>
                    </div>
                </section>

                <form
                    onSubmit={canEdit ? saveNarrative : undefined}
                    className="space-y-6"
                >
                    <section className="rounded-[32px] bg-white p-6 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-8">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                    ✍️
                                </span>
                                <div>
                                    <h2 className="text-lg font-extrabold text-slate-800">
                                        Narasi Karakter
                                    </h2>
                                    <p className="text-xs font-medium text-slate-400">
                                        Tulis atau sesuaikan narasi laporan
                                        sebelum dikonfirmasi.
                                    </p>
                                </div>
                            </div>

                            {canEdit && (
                                <div className="flex gap-2">
                                    {report.ai_generated_narrative && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={useAiDraft}
                                            className="rounded-2xl border-slate-100 text-xs font-bold text-slate-600"
                                        >
                                            <Sparkles className="size-3.5" />
                                            Pakai Draft AI
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={runNarrative}
                                        className="rounded-2xl border-slate-100 text-xs font-bold text-slate-600"
                                    >
                                        <Sparkles className="size-3.5" />
                                        Buat Draft AI
                                    </Button>
                                </div>
                            )}
                        </div>

                        {report.ai_generated_narrative && (
                            <div className="mb-5 rounded-[20px] border border-violet-100 bg-violet-50/60 p-4">
                                <p className="mb-1 text-[11px] font-bold tracking-wide text-violet-600 uppercase">
                                    Draft Narasi AI
                                </p>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-violet-800">
                                    {report.ai_generated_narrative}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="final_narrative">
                                    Narasi Final
                                </Label>
                                <textarea
                                    id="final_narrative"
                                    rows={8}
                                    disabled={!canEdit}
                                    value={form.data.final_narrative}
                                    onChange={(event) =>
                                        form.setData(
                                            'final_narrative',
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                                <InputError
                                    message={form.errors.final_narrative}
                                    className="mt-1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="recommendation">
                                    Rekomendasi
                                </Label>
                                <textarea
                                    id="recommendation"
                                    rows={3}
                                    disabled={!canEdit}
                                    value={form.data.recommendation}
                                    onChange={(event) =>
                                        form.setData(
                                            'recommendation',
                                            event.target.value,
                                        )
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500"
                                />
                                <InputError
                                    message={form.errors.recommendation}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-2">
                            {canEdit && (
                                <>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="rounded-2xl bg-slate-700 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
                                    >
                                        <FileText className="size-3.5" />
                                        Simpan Narasi
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={reviewReport}
                                        disabled={form.processing}
                                        className="rounded-2xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                                    >
                                        <CheckCircle2 className="size-3.5" />
                                        Konfirmasi Ustadz
                                    </Button>
                                </>
                            )}

                            {report.status === 'reviewed' && (
                                <Button
                                    type="button"
                                    onClick={publishReport}
                                    className="rounded-2xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                                >
                                    <CheckCircle2 className="size-3.5" />
                                    Terbitkan Laporan
                                </Button>
                            )}

                            {report.status === 'published' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.get(
                                            `/teacher/reports/${report.id}/pdf`,
                                        )
                                    }
                                    className="rounded-2xl border-slate-100 text-xs font-bold text-slate-600"
                                >
                                    <Download className="size-3.5" />
                                    Unduh PDF
                                </Button>
                            )}
                        </div>
                    </section>
                </form>
            </div>
        </>
    );
}
