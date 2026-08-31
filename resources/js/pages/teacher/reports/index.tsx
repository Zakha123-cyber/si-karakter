import { Head, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    FileText,
    Filter,
    Plus,
    RefreshCw,
    Search,
    Sparkles,
} from 'lucide-react';
import React, { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type StudentOption = {
    id: number;
    name: string | null;
    student_code: string | null;
    group_name: string | null;
};

type Option = {
    value: string;
    label: string;
};

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

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedReports = {
    data: CharacterReport[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    reports: PaginatedReports;
    filters: {
        search: string;
        status: string;
    };
    students: StudentOption[];
    statuses: Option[];
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

function scoreBadge(value: number | null, suffix: string): string {
    if (value === null) {
        return `Belum ada ${suffix}`;
    }

    return `${value}% ${suffix}`;
}

function PaginationLabel({ label }: { label: string }) {
    if (label === '&laquo; Previous' || label.toLowerCase().includes('previous')) {
        return (
            <>
                <ChevronLeft className="size-4" />
                <span className="sr-only">Sebelumnya</span>
            </>
        );
    }

    if (label === 'Next &raquo;' || label.toLowerCase().includes('next')) {
        return (
            <>
                <ChevronRight className="size-4" />
                <span className="sr-only">Berikutnya</span>
            </>
        );
    }

    return <span>{label}</span>;
}

export default function TeacherReportsIndex({
    reports,
    filters,
    students,
    statuses,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [generateOpen, setGenerateOpen] = useState(false);

    const generateForm = useForm({
        student_id: '',
        period_start: '',
        period_end: '',
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/teacher/reports',
            {
                search,
                status: statusFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');

        router.get('/teacher/reports', {}, { preserveState: true });
    };

    const openGenerate = () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        generateForm.setData({
            student_id: '',
            period_start: formatDate(start),
            period_end: formatDate(end),
        });
        generateForm.clearErrors();
        setGenerateOpen(true);
    };

    const formatDate = (date: Date): string => {
        return date.toISOString().slice(0, 10);
    };

    const submitGenerate = (event: FormEvent) => {
        event.preventDefault();

        const toastId = toast.loading('Membuat draft laporan...');

        generateForm.post('/teacher/reports/generate', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Draft laporan berhasil dibuat.', { id: toastId });
                setGenerateOpen(false);
            },
            onError: () => {
                toast.error('Draft laporan belum berhasil dibuat.', {
                    id: toastId,
                });
            },
        });
    };

    const runNarrative = (report: CharacterReport) => {
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
                    toast.error('Draft narasi AI gagal dibuat.', { id: toastId });
                },
            },
        );
    };

    const publishReport = (report: CharacterReport) => {
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
                    toast.error('Laporan belum bisa diterbitkan.', { id: toastId });
                },
            },
        );
    };

    return (
        <>
            <Head title="Laporan Karakter" />

            <div className="min-h-full space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-emerald-100">
                                <FileText className="size-4" />
                                <span className="text-xs font-bold tracking-wider uppercase">
                                    Laporan Karakter
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Rekap Laporan Karakter Santri
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/90">
                                Buat draft laporan, lengkapi narasi, konfirmasi
                                sebagai ustadz, lalu terbitkan beserta PDF-nya.
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={openGenerate}
                            className="rounded-2xl bg-white text-emerald-700 shadow-lg hover:bg-emerald-50"
                        >
                            <Plus className="size-4" />
                            Buat Laporan
                        </Button>
                    </div>
                </section>

                <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                📋
                            </span>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800">
                                    Daftar Laporan
                                </h2>
                                <p className="text-xs font-medium text-slate-400">
                                    {reports.from ?? 0}-{reports.to ?? 0} dari{' '}
                                    {reports.total} laporan
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                            <Filter className="size-4" />
                            Filter ramah ustadz
                        </div>
                    </div>

                    <form
                        onSubmit={submitFilters}
                        className="mb-5 grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3 lg:grid-cols-6"
                    >
                        <div className="relative lg:col-span-3">
                            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                            <Input
                                className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari nama santri"
                            />
                        </div>
                        <select
                            className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="">Semua Status</option>
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2 lg:col-span-2">
                            <Button
                                type="submit"
                                className="flex-1 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                            >
                                Filter
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={resetFilters}
                                className="rounded-2xl text-xs font-bold text-slate-500 hover:bg-white"
                            >
                                Reset
                            </Button>
                        </div>
                    </form>

                    {reports.data.length === 0 ? (
                        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                                📄
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-700">
                                Belum ada laporan
                            </h3>
                            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                                Klik "Buat Laporan" untuk membuat draft laporan
                                karakter pertama santri Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.data.map((report) => (
                                <article
                                    key={report.id}
                                    className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-emerald-100 hover:shadow-md sm:p-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-extrabold text-slate-800">
                                                    {report.student.name ??
                                                        'Santri'}
                                                </h3>
                                                {report.student.student_code && (
                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                                        {report.student.student_code}
                                                    </span>
                                                )}
                                                {report.student.group_name && (
                                                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600">
                                                        {report.student.group_name}
                                                    </span>
                                                )}
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        statusClasses(
                                                            report.status,
                                                        )
                                                    }
                                                >
                                                    {statusLabel(report.status)}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 text-xs font-medium text-slate-400">
                                                {report.period_start} s.d.{' '}
                                                {report.period_end}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                                                <span className="rounded-xl bg-sky-50 px-2.5 py-1 text-sky-700">
                                                    Tes:{' '}
                                                    {scoreBadge(
                                                        report.test_summary
                                                            ?.score ?? null,
                                                        'tes',
                                                    )}
                                                </span>
                                                <span className="rounded-xl bg-violet-50 px-2.5 py-1 text-violet-700">
                                                    Observasi:{' '}
                                                    {scoreBadge(
                                                        report
                                                            .observation_summary
                                                            ?.score ?? null,
                                                        'observasi',
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {report.status === 'draft' && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        runNarrative(report)
                                                    }
                                                    className="h-9 rounded-2xl border-slate-100 text-xs font-bold text-slate-600"
                                                >
                                                    <Sparkles className="size-3.5" />
                                                    Draft Narasi AI
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    router.get(
                                                        `/teacher/reports/${report.id}`,
                                                    )
                                                }
                                                className="h-9 rounded-2xl border-slate-100 text-xs font-bold text-slate-600"
                                            >
                                                <FileText className="size-3.5" />
                                                Detail
                                            </Button>
                                            {report.status === 'reviewed' && (
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        publishReport(report)
                                                    }
                                                    className="h-9 rounded-2xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                                                >
                                                    <RefreshCw className="size-3.5" />
                                                    Terbitkan
                                                </Button>
                                            )}
                                            {(report.has_pdf ||
                                                report.status === 'published') && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.get(
                                                            `/teacher/reports/${report.id}/pdf`,
                                                        )
                                                    }
                                                    className="h-9 rounded-2xl border-slate-100 text-xs font-bold text-slate-600"
                                                >
                                                    <Download className="size-3.5" />
                                                    PDF
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {reports.links.length > 3 && (
                        <nav className="mt-6 flex flex-wrap justify-center gap-1.5">
                            {reports.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url ?? '#'}
                                    onClick={(event) => {
                                        if (link.url === null) {
                                            event.preventDefault();

                                            return;
                                        }
                                    }}
                                    className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold ${
                                        link.active
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-white text-slate-500 ring-1 ring-slate-100 hover:bg-emerald-50'
                                    }`}
                                >
                                    <PaginationLabel label={link.label} />
                                </a>
                            ))}
                        </nav>
                    )}
                </section>
            </div>

            <Sheet open={generateOpen} onOpenChange={setGenerateOpen}>
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-md">
                    <SheetHeader className="border-b border-slate-100 px-4 pb-4">
                        <div className="flex items-center gap-2 pr-8">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <FileText className="size-4" />
                            </div>
                            <SheetTitle className="text-lg font-extrabold text-slate-800">
                                Buat Laporan Karakter
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-sm text-slate-500">
                            Pilih santri dan rentang periode untuk membuat
                            draft laporan.
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitGenerate}
                        className="grid gap-5 px-4 py-5"
                    >
                        <div className="space-y-2">
                            <Label
                                htmlFor="student_id"
                                className="text-sm font-medium text-slate-700"
                            >
                                Santri
                            </Label>
                            <select
                                id="student_id"
                                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={generateForm.data.student_id}
                                onChange={(event) =>
                                    generateForm.setData(
                                        'student_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Pilih santri...</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name}
                                        {student.group_name
                                            ? ` (${student.group_name})`
                                            : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={generateForm.errors.student_id}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="period_start"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Periode Mulai
                                </Label>
                                <Input
                                    id="period_start"
                                    type="date"
                                    value={generateForm.data.period_start}
                                    onChange={(event) =>
                                        generateForm.setData(
                                            'period_start',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-2xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus-visible:ring-emerald-200"
                                />
                                <InputError
                                    message={
                                        generateForm.errors.period_start
                                    }
                                    className="mt-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="period_end"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Periode Selesai
                                </Label>
                                <Input
                                    id="period_end"
                                    type="date"
                                    value={generateForm.data.period_end}
                                    onChange={(event) =>
                                        generateForm.setData(
                                            'period_end',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-2xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus-visible:ring-emerald-200"
                                />
                                <InputError
                                    message={generateForm.errors.period_end}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <InputError
                            message={generateForm.errors.student_id}
                            className="mt-1"
                        />

                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setGenerateOpen(false)}
                                className="h-10 rounded-2xl px-4 text-xs font-bold text-slate-500 hover:bg-slate-100"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={generateForm.processing}
                                className="h-10 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                            >
                                Buat Draft
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}
