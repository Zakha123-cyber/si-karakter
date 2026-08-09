import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Filter,
    HeartHandshake,
    RefreshCw,
    Search,
    ShieldAlert,
    Sparkles,
    UserRoundCheck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
import type { FormEvent } from 'react';
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

type WarningRule = {
    id: number;
    name: string;
    description: string | null;
    rule_type: string;
    severity: string;
};

type StudentWarning = {
    id: number;
    title: string;
    description: string;
    severity: string;
    status: string;
    source_type: string;
    source_id: number | null;
    detected_at: string | null;
    detected_at_label: string | null;
    reviewed_at: string | null;
    reviewed_at_label: string | null;
    resolution_note: string | null;
    student: {
        id: number | null;
        name: string | null;
        student_code: string | null;
        group_name: string | null;
    };
    rule: {
        id: number | null;
        name: string | null;
        description: string | null;
        rule_type: string | null;
    };
    reviewer: {
        id: number | null;
        name: string | null;
    };
    can_review: boolean;
    can_resolve: boolean;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedWarnings = {
    data: StudentWarning[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Summary = {
    total: number;
    open: number;
    reviewed: number;
    resolved: number;
};

type Props = {
    warnings: PaginatedWarnings;
    summary: Summary;
    filters: {
        search: string;
        status: string;
        severity: string;
        student_id: number | null;
    };
    students: StudentOption[];
    rules: WarningRule[];
    statuses: Option[];
    severities: Option[];
};

function statusLabel(value: string): string {
    const map: Record<string, string> = {
        open: 'Terbuka',
        reviewed: 'Sudah Ditinjau',
        resolved: 'Selesai',
    };

    return map[value] ?? value;
}

function severityLabel(value: string): string {
    const map: Record<string, string> = {
        low: 'Ringan',
        medium: 'Sedang',
        high: 'Prioritas Tinggi',
    };

    return map[value] ?? value;
}

function statusClasses(value: string): string {
    switch (value) {
        case 'open':
            return 'border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-50';
        case 'reviewed':
            return 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50';
        case 'resolved':
            return 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50';
        default:
            return 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-50';
    }
}

function severityClasses(value: string): string {
    switch (value) {
        case 'high':
            return 'border-red-100 bg-red-50 text-red-700 hover:bg-red-50';
        case 'medium':
            return 'border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-50';
        case 'low':
            return 'border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-50';
        default:
            return 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-50';
    }
}

function roleLabel(role: string): string {
    return (
        {
            admin: 'Admin',
            teacher: 'Ustadz',
            student: 'Santri',
        }[role] ?? role
    );
}

function studentInitial(name?: string | null): string {
    return name?.trim().charAt(0)?.toUpperCase() || 'S';
}

function PaginationLabel({ label }: { label: string }) {
    if (
        label === '&laquo; Previous' ||
        label === 'pagination.previous' ||
        label.toLowerCase().includes('previous')
    ) {
        return (
            <>
                <ChevronLeft className="size-4" />
                <span className="sr-only">Sebelumnya</span>
            </>
        );
    }

    if (
        label === 'Next &raquo;' ||
        label === 'pagination.next' ||
        label.toLowerCase().includes('next')
    ) {
        return (
            <>
                <ChevronRight className="size-4" />
                <span className="sr-only">Berikutnya</span>
            </>
        );
    }

    return <span>{label}</span>;
}

export default function TeacherWarningsIndex({
    warnings,
    summary,
    filters,
    students,
    rules,
    statuses,
    severities,
}: Props) {
    const { props } = usePage<{
        auth: Auth;
        flash?: { status?: string };
    }>();
    const role = props.auth.user?.role ?? 'teacher';
    const roleTitle = roleLabel(role);
    const firstName = props.auth.user?.name
        ? props.auth.user.name.split(' ')[0]
        : roleTitle;

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [severityFilter, setSeverityFilter] = useState(
        filters.severity || '',
    );
    const [studentFilter, setStudentFilter] = useState(
        filters.student_id ? String(filters.student_id) : '',
    );
    const [selectedWarning, setSelectedWarning] =
        useState<StudentWarning | null>(null);
    const [actionMode, setActionMode] = useState<'review' | 'resolve' | null>(
        null,
    );

    const generateForm = useForm({
        student_id: studentFilter,
    });
    const actionForm = useForm({
        resolution_note: '',
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/teacher/warnings',
            {
                search,
                status: statusFilter,
                severity: severityFilter,
                student_id: studentFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setSeverityFilter('');
        setStudentFilter('');
        generateForm.setData('student_id', '');

        router.get('/teacher/warnings', {}, { preserveState: true });
    };

    const updateStudentFilter = (value: string) => {
        setStudentFilter(value);
        generateForm.setData('student_id', value);
    };

    const generateWarnings = (forSelectedStudent: boolean) => {
        const toastId = toast.loading('Mengevaluasi aturan pendampingan...');

        router.post(
            '/teacher/warnings/generate',
            { student_id: forSelectedStudent ? studentFilter : '' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Evaluasi pendampingan selesai.', {
                        id: toastId,
                    });
                },
                onError: () => {
                    toast.error('Evaluasi pendampingan belum berhasil.', {
                        id: toastId,
                    });
                },
            },
        );
    };

    const openAction = (
        warning: StudentWarning,
        mode: 'review' | 'resolve',
    ) => {
        setSelectedWarning(warning);
        setActionMode(mode);
        actionForm.setData('resolution_note', '');
        actionForm.clearErrors();
    };

    const closeAction = () => {
        setSelectedWarning(null);
        setActionMode(null);
        actionForm.reset();
        actionForm.clearErrors();
    };

    const submitAction = (event: FormEvent) => {
        event.preventDefault();

        if (!selectedWarning || !actionMode) {
            return;
        }

        const label = actionMode === 'review' ? 'meninjau' : 'menyelesaikan';
        const toastId = toast.loading(`Sedang ${label} catatan...`);
        const endpoint = `/teacher/warnings/${selectedWarning.id}/${actionMode}`;

        actionForm.post(endpoint, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Catatan pendampingan berhasil diperbarui.', {
                    id: toastId,
                });
                closeAction();
            },
            onError: () => {
                toast.error('Catatan belum bisa diperbarui.', { id: toastId });
            },
        });
    };

    return (
        <>
            <Head title="Pendampingan Santri" />

            <div className="min-h-full space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
                    <svg
                        className="pointer-events-none absolute top-6 right-8 h-48 w-48 text-white opacity-10"
                        viewBox="0 0 200 200"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M100 20l24 36H76l24-36zM94 62v28h12V62H94zM62 70l12 24h18L80 70H62zM138 70l-12 24h-18l12-24h18zM58 102h84v12H58zM76 122h48v42H76z" />
                    </svg>

                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                                <HeartHandshake className="size-4 text-emerald-200" />
                                <span>Ruang Pendampingan {roleTitle}</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Assalamu'alaikum, {firstName} 🌸
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                Pantau sinyal awal dari observasi harian dengan
                                bahasa yang lembut, rahasia, dan berorientasi
                                penguatan karakter santri.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <HeroPill
                                icon={<ShieldAlert className="size-5" />}
                                value={`${summary.open}`}
                                label="Butuh Pendampingan"
                            />
                            <HeroPill
                                icon={<ClipboardCheck className="size-5" />}
                                value={`${summary.reviewed}`}
                                label="Sudah Ditinjau"
                            />
                            <HeroPill
                                icon={<Sparkles className="size-5" />}
                                value={`${rules.length}`}
                                label="Rule Aktif"
                            />
                        </div>
                    </div>
                </section>

                {props.flash?.status && (
                    <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 shadow-sm">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<ShieldAlert className="size-5" />}
                        value={summary.open}
                        label="Butuh Pendampingan"
                        description="Catatan baru yang perlu ditinjau"
                        tone="rose"
                    />
                    <SummaryCard
                        icon={<ClipboardCheck className="size-5" />}
                        value={summary.reviewed}
                        label="Sudah Ditinjau"
                        description="Sedang dalam pemantauan ustadz"
                        tone="amber"
                    />
                    <SummaryCard
                        icon={<CheckCircle2 className="size-5" />}
                        value={summary.resolved}
                        label="Selesai"
                        description="Telah diberi tindak lanjut"
                        tone="emerald"
                    />
                    <SummaryCard
                        icon={<Sparkles className="size-5" />}
                        value={summary.total}
                        label="Total Catatan"
                        description="Riwayat pendampingan santri"
                        tone="sky"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <main className="min-w-0 space-y-6">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                        🔎
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-800">
                                            Daftar Catatan Pendampingan
                                        </h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            {warnings.from ?? 0}-
                                            {warnings.to ?? 0} dari{' '}
                                            {warnings.total} catatan
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
                                <div className="relative lg:col-span-2">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                                    <Input
                                        className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari nama santri atau catatan"
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
                                        <option
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={severityFilter}
                                    onChange={(event) =>
                                        setSeverityFilter(event.target.value)
                                    }
                                >
                                    <option value="">Semua Prioritas</option>
                                    {severities.map((severity) => (
                                        <option
                                            key={severity.value}
                                            value={severity.value}
                                        >
                                            {severity.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={studentFilter}
                                    onChange={(event) =>
                                        updateStudentFilter(event.target.value)
                                    }
                                >
                                    <option value="">Semua Santri</option>
                                    {students.map((student) => (
                                        <option
                                            key={student.id}
                                            value={student.id}
                                        >
                                            {student.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
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

                            {warnings.data.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <div className="space-y-3">
                                    {warnings.data.map((warning) => (
                                        <WarningCard
                                            key={warning.id}
                                            warning={warning}
                                            onReview={() =>
                                                openAction(warning, 'review')
                                            }
                                            onResolve={() =>
                                                openAction(warning, 'resolve')
                                            }
                                        />
                                    ))}
                                </div>
                            )}

                            {warnings.links.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {warnings.links.map((link, index) => (
                                        <Button
                                            key={`${link.label}-${index}`}
                                            type="button"
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            disabled={!link.url}
                                            className={
                                                link.active
                                                    ? 'rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700'
                                                    : 'rounded-2xl border-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                            }
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(
                                                        link.url,
                                                        {},
                                                        { preserveState: true },
                                                    );
                                                }
                                            }}
                                        >
                                            <PaginationLabel
                                                label={link.label}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>

                    <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                                    <RefreshCw className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-800">
                                        Evaluasi Rule
                                    </h2>
                                    <p className="text-xs font-medium text-slate-400">
                                        Jalankan ulang deteksi dari observasi
                                        harian.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="generate_student"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Santri Opsional
                                    </Label>
                                    <select
                                        id="generate_student"
                                        className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                        value={studentFilter}
                                        onChange={(event) =>
                                            updateStudentFilter(
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Semua santri</option>
                                        {students.map((student) => (
                                            <option
                                                key={student.id}
                                                value={student.id}
                                            >
                                                {student.name} (
                                                {student.student_code})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={generateForm.errors.student_id}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => generateWarnings(false)}
                                    className="rounded-2xl bg-emerald-600 py-5 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-700"
                                >
                                    Generate Semua Santri
                                    <ChevronRight className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!studentFilter}
                                    onClick={() => generateWarnings(true)}
                                    className="rounded-2xl border-emerald-100 py-5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-50"
                                >
                                    Generate Santri Terpilih
                                </Button>
                            </div>

                            <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-700">
                                <p className="font-extrabold">
                                    {rules.length} rule aktif
                                </p>
                                <p className="mt-1 font-medium">
                                    Hasil hanya tampil untuk pihak berwenang dan
                                    memakai bahasa “membutuhkan pendampingan”.
                                </p>
                            </div>
                        </section>

                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-700">
                                <Sparkles className="size-5 text-amber-500" />
                                Panduan Pendampingan
                            </h2>
                            <div className="space-y-3">
                                <GuideItem
                                    emoji="🌱"
                                    title="Gunakan Bahasa Penguatan"
                                    description="Tulis tindak lanjut dengan fokus pada kebiasaan baik yang ingin ditumbuhkan."
                                />
                                <GuideItem
                                    emoji="🤝"
                                    title="Jaga Kerahasiaan Santri"
                                    description="Catatan ini hanya untuk ustadz dan admin agar santri tidak merasa diberi label."
                                />
                                <GuideItem
                                    emoji="📝"
                                    title="Berbasis Observasi"
                                    description="Warning muncul dari pola observasi negatif yang berulang pada indikator pendampingan."
                                />
                            </div>
                        </section>

                        <section className="rounded-[28px] bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-[0_8px_30px_rgba(15,23,42,0.15)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur-sm">
                                    🕌
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Prinsip Halaman Ini
                                    </p>
                                    <p className="text-sm font-extrabold text-white">
                                        Pendampingan, bukan pelabelan
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-slate-300">
                                Gunakan catatan ini sebagai sinyal awal untuk
                                mendekati santri dengan empati, bukan sebagai
                                kesimpulan akhir tentang karakter mereka.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>

            <Sheet open={selectedWarning !== null} onOpenChange={closeAction}>
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                            <HeartHandshake className="size-6" />
                        </div>
                        <SheetTitle className="text-xl font-extrabold text-slate-800">
                            {actionMode === 'review'
                                ? 'Tinjau Catatan Pendampingan'
                                : 'Selesaikan Catatan Pendampingan'}
                        </SheetTitle>
                        <SheetDescription className="text-slate-500">
                            Gunakan bahasa tindak lanjut yang positif dan
                            berorientasi pendampingan.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedWarning && (
                        <form
                            onSubmit={submitAction}
                            className="mt-6 grid gap-5"
                        >
                            <div className="rounded-[24px] border border-emerald-100 bg-white p-4 text-sm shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-base font-extrabold text-emerald-700">
                                        {studentInitial(
                                            selectedWarning.student.name,
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-extrabold text-slate-800">
                                            {selectedWarning.title}
                                        </div>
                                        <p className="mt-2 leading-relaxed text-slate-500">
                                            {selectedWarning.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        className={severityClasses(
                                            selectedWarning.severity,
                                        )}
                                    >
                                        {severityLabel(
                                            selectedWarning.severity,
                                        )}
                                    </Badge>
                                    <Badge
                                        className={statusClasses(
                                            selectedWarning.status,
                                        )}
                                    >
                                        {statusLabel(selectedWarning.status)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="resolution_note"
                                    className="text-xs font-extrabold text-slate-600"
                                >
                                    Catatan Tindak Lanjut
                                    {actionMode === 'resolve' ? ' *' : ''}
                                </Label>
                                <textarea
                                    id="resolution_note"
                                    rows={5}
                                    className="rounded-[22px] border border-slate-100 bg-white p-3 text-sm shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={actionForm.data.resolution_note}
                                    onChange={(event) =>
                                        actionForm.setData(
                                            'resolution_note',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: sudah dibahas dengan santri dan akan diberi pendampingan kejujuran selama pekan ini."
                                />
                                <InputError
                                    message={actionForm.errors.resolution_note}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeAction}
                                    className="rounded-2xl border-slate-200 text-slate-600"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={actionForm.processing}
                                    className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                                >
                                    {actionMode === 'review'
                                        ? 'Tandai Ditinjau'
                                        : 'Selesaikan'}
                                </Button>
                            </div>
                        </form>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

function HeroPill({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md transition-transform hover:scale-105">
            <span className="text-emerald-100">{icon}</span>
            <div>
                <div className="text-sm leading-none font-extrabold">
                    {value}
                </div>
                <div className="text-[10px] font-semibold text-emerald-100">
                    {label}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({
    icon,
    value,
    label,
    description,
    tone,
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    description: string;
    tone: 'rose' | 'amber' | 'emerald' | 'sky';
}) {
    const toneMap = {
        rose: {
            wrapper: 'from-rose-50 to-orange-50 text-rose-700',
            icon: 'bg-rose-100 text-rose-700',
        },
        amber: {
            wrapper: 'from-amber-50 to-yellow-50 text-amber-700',
            icon: 'bg-amber-100 text-amber-700',
        },
        emerald: {
            wrapper: 'from-emerald-50 to-teal-50 text-emerald-700',
            icon: 'bg-emerald-100 text-emerald-700',
        },
        sky: {
            wrapper: 'from-sky-50 to-blue-50 text-sky-700',
            icon: 'bg-sky-100 text-sky-700',
        },
    };

    const toneClass = toneMap[tone];

    return (
        <div
            className={`rounded-[24px] bg-gradient-to-br p-4 shadow-[0_8px_30px_rgba(16,58,58,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-lg ${toneClass.wrapper}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass.icon}`}
                >
                    {icon}
                </div>
                <div>
                    <div className="text-2xl font-extrabold">{value}</div>
                    <div className="text-xs font-extrabold">{label}</div>
                </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed font-medium text-slate-500">
                {description}
            </p>
        </div>
    );
}

function WarningCard({
    warning,
    onReview,
    onResolve,
}: {
    warning: StudentWarning;
    onReview: () => void;
    onResolve: () => void;
}) {
    return (
        <article className="group rounded-[24px] border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-extrabold text-white shadow-sm transition-transform group-hover:scale-105">
                        {studentInitial(warning.student.name)}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-slate-800">
                                {warning.student.name ?? 'Santri'}
                            </h3>
                            {warning.student.group_name && (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                    {warning.student.group_name}
                                </span>
                            )}
                            {warning.student.student_code && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                                    {warning.student.student_code}
                                </span>
                            )}
                        </div>

                        <h4 className="mt-2 text-sm font-extrabold text-slate-700">
                            {warning.title}
                        </h4>
                        <p className="mt-1 max-w-3xl text-xs leading-relaxed font-medium text-slate-500">
                            {warning.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge
                                className={severityClasses(warning.severity)}
                            >
                                {severityLabel(warning.severity)}
                            </Badge>
                            <Badge className={statusClasses(warning.status)}>
                                {statusLabel(warning.status)}
                            </Badge>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                                <CalendarClock className="size-3.5" />
                                {warning.detected_at_label ?? 'Belum ada waktu'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                    {warning.can_review && (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={onReview}
                            className="rounded-2xl border-amber-100 bg-white text-xs font-extrabold text-amber-700 hover:bg-amber-50"
                        >
                            Tinjau
                        </Button>
                    )}
                    {warning.can_resolve && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={onResolve}
                            className="rounded-2xl bg-emerald-600 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                        >
                            Selesaikan
                        </Button>
                    )}
                </div>
            </div>

            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                <MetaItem
                    icon={<UserRoundCheck className="size-4" />}
                    label="Reviewer"
                    value={warning.reviewer.name ?? 'Belum ditinjau'}
                />
                <MetaItem
                    icon={<ClipboardCheck className="size-4" />}
                    label="Rule"
                    value={warning.rule.name ?? 'Rule pendampingan'}
                />
                <MetaItem
                    icon={<CheckCircle2 className="size-4" />}
                    label="Tindak lanjut"
                    value={warning.reviewed_at_label ?? 'Menunggu catatan'}
                />
            </div>
        </article>
    );
}

function MetaItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs shadow-sm">
            <span className="text-emerald-600">{icon}</span>
            <div className="min-w-0">
                <p className="font-bold text-slate-400">{label}</p>
                <p className="truncate font-extrabold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}

function GuideItem({
    emoji,
    title,
    description,
}: {
    emoji: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-teal-50/70 p-3.5">
            <span className="text-xl">{emoji}</span>
            <div className="text-xs">
                <p className="font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 leading-snug text-slate-600">
                    {description}
                </p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                🎉
            </div>
            <h4 className="mt-3 text-base font-extrabold text-slate-800">
                Belum ada catatan pendampingan
            </h4>
            <p className="mt-1 max-w-sm text-xs leading-relaxed font-medium text-slate-500">
                Jika ada pola observasi yang membutuhkan perhatian, catatan akan
                muncul di sini setelah evaluasi rule dijalankan.
            </p>
        </div>
    );
}
