import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardCheck,
    Filter,
    RefreshCw,
    Search,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
            return 'bg-rose-100 text-rose-700 hover:bg-rose-100';
        case 'reviewed':
            return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
        case 'resolved':
            return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
        default:
            return 'bg-muted text-muted-foreground hover:bg-muted';
    }
}

function severityClasses(value: string): string {
    switch (value) {
        case 'high':
            return 'bg-red-100 text-red-700 hover:bg-red-100';
        case 'medium':
            return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
        case 'low':
            return 'bg-sky-100 text-sky-700 hover:bg-sky-100';
        default:
            return 'bg-muted text-muted-foreground hover:bg-muted';
    }
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
        router.get('/teacher/warnings', {}, { preserveState: true });
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

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Pendampingan Santri
                        </h1>
                        <Badge variant="secondary">
                            {role === 'admin' ? 'Admin' : 'Ustadz'}
                        </Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Pantau catatan early warning dengan bahasa pendampingan,
                        bukan label negatif. Catatan ini hanya untuk admin dan
                        ustadz.
                    </p>
                </div>

                {props.flash?.status && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<ShieldAlert className="size-5" />}
                        value={summary.open}
                        label="Butuh Pendampingan"
                        tone="rose"
                    />
                    <SummaryCard
                        icon={<ClipboardCheck className="size-5" />}
                        value={summary.reviewed}
                        label="Sudah Ditinjau"
                        tone="amber"
                    />
                    <SummaryCard
                        icon={<CheckCircle2 className="size-5" />}
                        value={summary.resolved}
                        label="Selesai"
                        tone="emerald"
                    />
                    <SummaryCard
                        icon={<Sparkles className="size-5" />}
                        value={summary.total}
                        label="Total Catatan"
                        tone="sky"
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Card className="h-fit rounded-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <RefreshCw className="size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    Evaluasi Rule
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Jalankan rule aktif untuk membuat catatan
                                pendampingan baru jika ada pola yang sesuai.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="generate_student">
                                    Santri Opsional
                                </Label>
                                <select
                                    id="generate_student"
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    value={studentFilter}
                                    onChange={(event) => {
                                        setStudentFilter(event.target.value);
                                        generateForm.setData(
                                            'student_id',
                                            event.target.value,
                                        );
                                    }}
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

                            <div className="grid gap-2">
                                <Button
                                    type="button"
                                    onClick={() => generateWarnings(false)}
                                >
                                    Generate Semua Santri
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!studentFilter}
                                    onClick={() => generateWarnings(true)}
                                >
                                    Generate Santri Terpilih
                                </Button>
                            </div>

                            <div className="rounded-md bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-700">
                                Rule aktif: {rules.length}. Hasil hanya tampil
                                untuk pihak berwenang dan memakai bahasa
                                “membutuhkan pendampingan”.
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Filter className="size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    Daftar Catatan Pendampingan
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {warnings.from ?? 0}-{warnings.to ?? 0} dari{' '}
                                {warnings.total} catatan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <form
                                onSubmit={submitFilters}
                                className="grid gap-3 lg:grid-cols-6"
                            >
                                <div className="relative lg:col-span-2">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari santri atau catatan"
                                    />
                                </div>
                                <select
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    value={studentFilter}
                                    onChange={(event) =>
                                        setStudentFilter(event.target.value)
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
                                    <Button type="submit" variant="outline">
                                        Filter
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={resetFilters}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>

                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full min-w-[940px] text-sm">
                                    <thead className="bg-muted/50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">
                                                Santri
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Catatan
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Prioritas
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Terdeteksi
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warnings.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-8 text-center text-muted-foreground"
                                                >
                                                    Belum ada catatan
                                                    pendampingan.
                                                </td>
                                            </tr>
                                        ) : (
                                            warnings.data.map((warning) => (
                                                <tr
                                                    key={warning.id}
                                                    className="border-t"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">
                                                            {
                                                                warning.student
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {
                                                                warning.student
                                                                    .group_name
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">
                                                            {warning.title}
                                                        </div>
                                                        <p className="mt-1 line-clamp-2 max-w-xl text-xs text-muted-foreground">
                                                            {
                                                                warning.description
                                                            }
                                                        </p>
                                                        <div className="mt-1 text-[11px] text-muted-foreground">
                                                            Rule:{' '}
                                                            {warning.rule.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            className={severityClasses(
                                                                warning.severity,
                                                            )}
                                                        >
                                                            {severityLabel(
                                                                warning.severity,
                                                            )}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            className={statusClasses(
                                                                warning.status,
                                                            )}
                                                        >
                                                            {statusLabel(
                                                                warning.status,
                                                            )}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {warning.detected_at_label ??
                                                            '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            {warning.can_review && (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        openAction(
                                                                            warning,
                                                                            'review',
                                                                        )
                                                                    }
                                                                >
                                                                    Tinjau
                                                                </Button>
                                                            )}
                                                            {warning.can_resolve && (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openAction(
                                                                            warning,
                                                                            'resolve',
                                                                        )
                                                                    }
                                                                >
                                                                    Selesaikan
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {warnings.links.length > 0 && (
                                <div className="flex flex-wrap gap-2">
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
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(
                                                        link.url,
                                                        {},
                                                        { preserveState: true },
                                                    );
                                                }
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Sheet open={selectedWarning !== null} onOpenChange={closeAction}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>
                            {actionMode === 'review'
                                ? 'Tinjau Catatan Pendampingan'
                                : 'Selesaikan Catatan Pendampingan'}
                        </SheetTitle>
                        <SheetDescription>
                            Gunakan bahasa tindak lanjut yang positif dan
                            berorientasi pendampingan.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedWarning && (
                        <form
                            onSubmit={submitAction}
                            className="mt-6 grid gap-5"
                        >
                            <div className="rounded-md border bg-muted/30 p-4 text-sm">
                                <div className="font-semibold">
                                    {selectedWarning.title}
                                </div>
                                <p className="mt-2 text-muted-foreground">
                                    {selectedWarning.description}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
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
                                <Label htmlFor="resolution_note">
                                    Catatan Tindak Lanjut
                                    {actionMode === 'resolve' ? ' *' : ''}
                                </Label>
                                <textarea
                                    id="resolution_note"
                                    rows={5}
                                    className="rounded-md border border-input bg-background p-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={actionForm.processing}
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

function SummaryCard({
    icon,
    value,
    label,
    tone,
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    tone: 'rose' | 'amber' | 'emerald' | 'sky';
}) {
    const toneMap = {
        rose: 'bg-rose-50 text-rose-700',
        amber: 'bg-amber-50 text-amber-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        sky: 'bg-sky-50 text-sky-700',
    };

    return (
        <Card className="rounded-lg">
            <CardContent className="flex items-center gap-3 p-4">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneMap[tone]}`}
                >
                    {icon}
                </div>
                <div>
                    <div className="text-2xl font-semibold">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                </div>
            </CardContent>
        </Card>
    );
}
