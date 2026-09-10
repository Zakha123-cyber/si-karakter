import { Head, router, useForm } from '@inertiajs/react';
import {
    Archive,
    Boxes,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileStack,
    Filter,
    Pencil,
    Plus,
    Search,
    Send,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { FormEvent, ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { dashboard } from '@/routes';

type TestPackageStatus = 'draft' | 'published' | 'closed';

type SelectOption = {
    id: number;
    name?: string;
    title?: string;
};

type PackageRelation = {
    id: number;
    name?: string;
    title?: string;
    sort_order?: number;
};

type TestPackageRow = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    start_at: string | null;
    end_at: string | null;
    attempt_limit: number;
    status: TestPackageStatus;
    groups_count: number;
    cases_count: number;
    group_ids: number[];
    case_ids: number[];
    groups: PackageRelation[];
    cases: PackageRelation[];
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedPackages = {
    data: TestPackageRow[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    packages: PaginatedPackages;
    filters: {
        search: string;
        status: string;
    };
    statuses: TestPackageStatus[];
    groups: SelectOption[];
    moralCases: SelectOption[];
};

export default function TeacherTestPackagesIndex({
    packages,
    filters,
    statuses,
    groups,
    moralCases,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [editingPackage, setEditingPackage] = useState<TestPackageRow | null>(
        null,
    );
    const [isPackageSheetOpen, setIsPackageSheetOpen] = useState(false);
    const [groupPackage, setGroupPackage] = useState<TestPackageRow | null>(
        null,
    );
    const [casePackage, setCasePackage] = useState<TestPackageRow | null>(null);
    const [groupIds, setGroupIds] = useState<number[]>([]);
    const [caseIds, setCaseIds] = useState<number[]>([]);

    const packageForm = useForm({
        title: '',
        description: '',
        start_at: '',
        end_at: '',
        attempt_limit: 1,
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/teacher/test-packages',
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    const openCreate = () => {
        setEditingPackage(null);
        packageForm.reset();
        packageForm.clearErrors();
        setIsPackageSheetOpen(true);
    };

    const openEdit = (testPackage: TestPackageRow) => {
        setEditingPackage(testPackage);
        packageForm.setData({
            title: testPackage.title,
            description: testPackage.description ?? '',
            start_at: toLocalDateTime(testPackage.start_at),
            end_at: toLocalDateTime(testPackage.end_at),
            attempt_limit: testPackage.attempt_limit,
        });
        packageForm.clearErrors();
        setIsPackageSheetOpen(true);
    };

    const closePackageSheet = () => {
        setIsPackageSheetOpen(false);
        setEditingPackage(null);
        packageForm.reset();
        packageForm.clearErrors();
    };

    const submitPackage = (event: FormEvent) => {
        event.preventDefault();

        const toastId = toast.loading(
            editingPackage
                ? 'Menyimpan perubahan paket...'
                : 'Membuat paket tes...',
        );

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    editingPackage
                        ? 'Paket tes berhasil diperbarui.'
                        : 'Paket tes berhasil dibuat.',
                    { id: toastId },
                );
                closePackageSheet();
            },
            onError: (errors: Record<string, string>) => {
                toast.error(firstError(errors), { id: toastId });
            },
        };

        if (editingPackage) {
            packageForm.put(
                `/teacher/test-packages/${editingPackage.id}`,
                options,
            );

            return;
        }

        packageForm.post('/teacher/test-packages', options);
    };

    const openGroups = (testPackage: TestPackageRow) => {
        setGroupPackage(testPackage);
        setGroupIds(testPackage.group_ids);
    };

    const submitGroups = (event: FormEvent) => {
        event.preventDefault();

        if (!groupPackage) {
            return;
        }

        const toastId = toast.loading('Menyimpan target kelompok...');

        router.post(
            `/teacher/test-packages/${groupPackage.id}/groups`,
            { group_ids: groupIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Target kelompok berhasil diperbarui.', {
                        id: toastId,
                    });
                    setGroupPackage(null);
                    setGroupIds([]);
                },
                onError: (errors) => {
                    toast.error(firstError(errors), { id: toastId });
                },
            },
        );
    };

    const openCases = (testPackage: TestPackageRow) => {
        setCasePackage(testPackage);
        setCaseIds(testPackage.case_ids);
    };

    const submitCases = (event: FormEvent) => {
        event.preventDefault();

        if (!casePackage) {
            return;
        }

        const toastId = toast.loading('Menyimpan daftar kasus...');

        router.post(
            `/teacher/test-packages/${casePackage.id}/cases`,
            { case_ids: caseIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Daftar kasus berhasil diperbarui.', {
                        id: toastId,
                    });
                    setCasePackage(null);
                    setCaseIds([]);
                },
                onError: (errors) => {
                    toast.error(firstError(errors), { id: toastId });
                },
            },
        );
    };

    const publishPackage = (testPackage: TestPackageRow) => {
        toast.warning(`Publikasikan ${testPackage.title}?`, {
            description:
                'Paket yang dipublikasi akan tampil sebagai paket aktif sesuai periode dan target kelompok.',
            action: {
                label: 'Publikasikan',
                onClick: () => {
                    router.post(
                        `/teacher/test-packages/${testPackage.id}/publish`,
                        {},
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                toast.success('Paket berhasil dipublikasikan.'),
                            onError: (errors) =>
                                toast.error(firstError(errors)),
                        },
                    );
                },
            },
            cancel: {
                label: 'Batal',
                onClick: () => undefined,
            },
            duration: 10000,
        });
    };

    const closePackage = (testPackage: TestPackageRow) => {
        toast.warning(`Tutup ${testPackage.title}?`, {
            description: 'Paket yang ditutup tidak dapat dikerjakan santri.',
            action: {
                label: 'Tutup',
                onClick: () => {
                    router.post(
                        `/teacher/test-packages/${testPackage.id}/close`,
                        {},
                        {
                            preserveScroll: true,
                            onSuccess: () => toast.success('Paket ditutup.'),
                            onError: (errors) =>
                                toast.error(firstError(errors)),
                        },
                    );
                },
            },
            cancel: {
                label: 'Batal',
                onClick: () => undefined,
            },
            duration: 10000,
        });
    };

    const deletePackage = (testPackage: TestPackageRow) => {
        toast.warning(`Hapus ${testPackage.title}?`, {
            description: 'Hanya paket draft yang dapat dihapus.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(`/teacher/test-packages/${testPackage.id}`, {
                        preserveScroll: true,
                        onSuccess: () => toast.success('Paket tes dihapus.'),
                        onError: (errors) => toast.error(firstError(errors)),
                    });
                },
            },
            cancel: {
                label: 'Batal',
                onClick: () => undefined,
            },
            duration: 10000,
        });
    };

    return (
        <>
            <Head title="Paket Tes" />

            <div className="min-h-full space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-emerald-100">
                                <FileStack className="size-4" />
                                <span className="text-xs font-bold tracking-wider uppercase">
                                    Paket Tes Moral
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Kelola Paket Tes
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/90">
                                Kelola paket dilema moral, periode aktif, target
                                kelompok, dan daftar kasus yang akan dikerjakan
                                santri.
                            </p>
                        </div>

                        <Button
                            type="button"
                            onClick={openCreate}
                            className="rounded-2xl bg-white text-emerald-700 shadow-lg hover:bg-emerald-50"
                        >
                            <Plus className="size-4" />
                            Tambah Paket
                        </Button>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard
                        icon={<FileStack className="size-5" />}
                        label="Total Paket"
                        value={packages.total}
                        color="emerald"
                    />
                    <SummaryCard
                        icon={<Send className="size-5" />}
                        label="Published"
                        value={
                            packages.data.filter(
                                (testPackage) =>
                                    testPackage.status === 'published',
                            ).length
                        }
                        color="blue"
                    />
                    <SummaryCard
                        icon={<Archive className="size-5" />}
                        label="Closed"
                        value={
                            packages.data.filter(
                                (testPackage) =>
                                    testPackage.status === 'closed',
                            ).length
                        }
                        color="amber"
                    />
                </div>

                <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                📦
                            </span>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800">
                                    Daftar Paket
                                </h2>
                                <p className="text-xs font-medium text-slate-400">
                                    Menampilkan {packages.from ?? 0}-
                                    {packages.to ?? 0} dari {packages.total}{' '}
                                    paket tes
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                            <Filter className="size-4" />
                            Filter paket
                        </div>
                    </div>

                    <form
                        onSubmit={submitFilters}
                        className="mb-5 grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
                    >
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari judul atau deskripsi paket..."
                                className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200"
                            />
                        </div>
                        <select
                            className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                        >
                            <option value="">Semua status</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {statusLabel(status)}
                                </option>
                            ))}
                        </select>
                        <Button
                            type="submit"
                            className="h-10 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                        >
                            <Filter className="mr-2 size-4" />
                            Filter
                        </Button>
                    </form>

                    <div className="[scrollbar-color:rgb(148_163_184)_transparent] overflow-x-auto overscroll-x-contain rounded-[24px] border border-slate-100 bg-white [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
                        <table className="w-full min-w-[920px] text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Paket</th>
                                    <th className="px-6 py-4">Periode</th>
                                    <th className="px-6 py-4">Isi</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.data.map((testPackage) => (
                                    <tr
                                        key={testPackage.id}
                                        className="border-t border-slate-100 transition-colors hover:bg-emerald-50/30"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800 transition-colors hover:text-emerald-600">
                                                {testPackage.title}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                {testPackage.description ||
                                                    testPackage.slug}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600">
                                            <div>
                                                <span className="font-medium text-slate-400">
                                                    Mulai:
                                                </span>{' '}
                                                {formatDateTime(
                                                    testPackage.start_at,
                                                )}
                                            </div>
                                            <div className="mt-0.5">
                                                <span className="font-medium text-slate-400">
                                                    Selesai:
                                                </span>{' '}
                                                {formatDateTime(
                                                    testPackage.end_at,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                                    {testPackage.groups_count}{' '}
                                                    kelompok
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                                                    {testPackage.cases_count}{' '}
                                                    kasus
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                                                    {testPackage.attempt_limit}{' '}
                                                    percobaan
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderStatusBadge(
                                                testPackage.status,
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap justify-end gap-1.5">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEdit(testPackage)
                                                    }
                                                    disabled={
                                                        testPackage.status ===
                                                        'closed'
                                                    }
                                                    className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Pencil className="size-3.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() =>
                                                        openGroups(testPackage)
                                                    }
                                                    disabled={
                                                        testPackage.status ===
                                                        'closed'
                                                    }
                                                    className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    <Users className="size-3.5" />
                                                    Kelompok
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() =>
                                                        openCases(testPackage)
                                                    }
                                                    disabled={
                                                        testPackage.status ===
                                                        'closed'
                                                    }
                                                    className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-sm hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
                                                >
                                                    <Boxes className="size-3.5" />
                                                    Kasus
                                                </Button>
                                                {testPackage.status ===
                                                'published' ? (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            closePackage(
                                                                testPackage,
                                                            )
                                                        }
                                                        className="h-8 rounded-xl bg-amber-600 px-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
                                                    >
                                                        <Archive className="size-3.5" />
                                                        Close
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            publishPackage(
                                                                testPackage,
                                                            )
                                                        }
                                                        disabled={
                                                            testPackage.status ===
                                                            'closed'
                                                        }
                                                        className="h-8 rounded-xl bg-emerald-600 px-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                                                    >
                                                        <Send className="size-3.5" />
                                                        Publish
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() =>
                                                        deletePackage(
                                                            testPackage,
                                                        )
                                                    }
                                                    disabled={
                                                        testPackage.status !==
                                                        'draft'
                                                    }
                                                    className="h-8 rounded-xl border border-rose-100 bg-white px-2.5 text-xs font-bold text-rose-600 shadow-sm hover:border-rose-200 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {packages.data.length === 0 && (
                        <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center text-sm text-slate-500">
                            Belum ada paket tes untuk filter ini.
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                        <div className="text-xs font-medium text-slate-500">
                            Total {packages.total} paket tes
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {packages.links.map((link) => (
                                <Button
                                    key={`${link.label}-${link.url}`}
                                    type="button"
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) {
                                            router.visit(link.url, {
                                                preserveScroll: true,
                                            });
                                        }
                                    }}
                                    className={
                                        link.active
                                            ? 'h-8 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700'
                                            : 'h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50'
                                    }
                                >
                                    <PaginationLabel label={link.label} />
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <Sheet
                open={isPackageSheetOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closePackageSheet();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader className="border-b border-slate-100 px-4 pb-4">
                        <div className="flex items-center gap-2 pr-8">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <ClipboardList className="size-4" />
                            </div>
                            <SheetTitle className="text-lg font-extrabold text-slate-800">
                                {editingPackage
                                    ? 'Edit Paket Tes'
                                    : 'Tambah Paket Tes'}
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-sm text-slate-500">
                            Atur judul, periode aktif, dan batas percobaan.
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitPackage}
                        className="grid gap-5 px-4 py-5"
                    >
                        <div className="grid gap-2">
                            <Label
                                htmlFor="title"
                                className="text-sm font-medium text-slate-700"
                            >
                                Judul Paket
                            </Label>
                            <Input
                                id="title"
                                value={packageForm.data.title}
                                onChange={(event) =>
                                    packageForm.setData(
                                        'title',
                                        event.target.value,
                                    )
                                }
                                placeholder="Contoh: Asesmen Karakter Semester 1"
                                className="h-10 rounded-2xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                            />
                            <InputError message={packageForm.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="description"
                                className="text-sm font-medium text-slate-700"
                            >
                                Deskripsi
                            </Label>
                            <textarea
                                id="description"
                                placeholder="Tambahkan deskripsi singkat paket tes..."
                                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={packageForm.data.description}
                                onChange={(event) =>
                                    packageForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={packageForm.errors.description}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="start_at"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Mulai
                                </Label>
                                <Input
                                    id="start_at"
                                    type="datetime-local"
                                    value={packageForm.data.start_at}
                                    onChange={(event) =>
                                        packageForm.setData(
                                            'start_at',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-2xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus-visible:ring-emerald-200"
                                />
                                <InputError
                                    message={packageForm.errors.start_at}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="end_at"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Selesai
                                </Label>
                                <Input
                                    id="end_at"
                                    type="datetime-local"
                                    value={packageForm.data.end_at}
                                    onChange={(event) =>
                                        packageForm.setData(
                                            'end_at',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-2xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus-visible:ring-emerald-200"
                                />
                                <InputError
                                    message={packageForm.errors.end_at}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="attempt_limit"
                                className="text-sm font-medium text-slate-700"
                            >
                                Jumlah Percobaan
                            </Label>
                            <Input
                                id="attempt_limit"
                                type="number"
                                min={1}
                                max={99}
                                value={packageForm.data.attempt_limit}
                                onChange={(event) =>
                                    packageForm.setData(
                                        'attempt_limit',
                                        Number(event.target.value),
                                    )
                                }
                                className="h-10 rounded-2xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus-visible:ring-emerald-200"
                            />
                            <InputError
                                message={packageForm.errors.attempt_limit}
                            />
                        </div>

                        <div className="flex gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="submit"
                                disabled={packageForm.processing}
                                className="h-10 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                            >
                                {editingPackage
                                    ? 'Simpan Perubahan'
                                    : 'Simpan Paket'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closePackageSheet}
                                className="h-10 rounded-2xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={groupPackage !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setGroupPackage(null);
                        setGroupIds([]);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-lg">
                    <SheetHeader className="border-b border-slate-100 px-4 pb-4">
                        <div className="flex items-center gap-2 pr-8">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Users className="size-4" />
                            </div>
                            <SheetTitle className="text-lg font-extrabold text-slate-800">
                                Target Kelompok
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-sm text-slate-500">
                            {groupPackage
                                ? groupPackage.title
                                : 'Pilih kelompok target paket.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitGroups}
                        className="grid gap-5 px-4 py-5"
                    >
                        {groups.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-sm text-slate-500">
                                Belum ada kelompok aktif.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {groups.map((group) => (
                                    <label
                                        key={group.id}
                                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                                    >
                                        <Checkbox
                                            checked={groupIds.includes(
                                                group.id,
                                            )}
                                            onCheckedChange={(checked) =>
                                                setGroupIds((current) =>
                                                    toggleId(
                                                        current,
                                                        group.id,
                                                        checked === true,
                                                    ),
                                                )
                                            }
                                        />
                                        <span>{group.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="submit"
                                className="h-10 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                            >
                                Simpan Target
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setGroupPackage(null);
                                    setGroupIds([]);
                                }}
                                className="h-10 rounded-2xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={casePackage !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setCasePackage(null);
                        setCaseIds([]);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-lg">
                    <SheetHeader className="border-b border-slate-100 px-4 pb-4">
                        <div className="flex items-center gap-2 pr-8">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Boxes className="size-4" />
                            </div>
                            <SheetTitle className="text-lg font-extrabold text-slate-800">
                                Kasus Dalam Paket
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-sm text-slate-500">
                            {casePackage
                                ? casePackage.title
                                : 'Pilih kasus moral untuk paket ini.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitCases}
                        className="grid gap-5 px-4 py-5"
                    >
                        {moralCases.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-sm text-slate-500">
                                Belum ada kasus aktif.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {moralCases.map((moralCase) => (
                                    <label
                                        key={moralCase.id}
                                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                                    >
                                        <Checkbox
                                            checked={caseIds.includes(
                                                moralCase.id,
                                            )}
                                            onCheckedChange={(checked) =>
                                                setCaseIds((current) =>
                                                    toggleId(
                                                        current,
                                                        moralCase.id,
                                                        checked === true,
                                                    ),
                                                )
                                            }
                                        />
                                        <span>{moralCase.title}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {caseIds.length > 0 && (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                                Urutan kasus mengikuti urutan saat dipilih.
                            </div>
                        )}

                        <div className="flex gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="submit"
                                className="h-10 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                            >
                                Simpan Kasus
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCasePackage(null);
                                    setCaseIds([]);
                                }}
                                className="h-10 rounded-2xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}

TeacherTestPackagesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Paket Tes',
            href: '/teacher/test-packages',
        },
    ],
};

function SummaryCard({
    icon,
    label,
    value,
    color = 'emerald',
}: {
    icon: ReactNode;
    label: string;
    value: number;
    color?: 'emerald' | 'blue' | 'amber';
}) {
    const colorMap = {
        emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        blue: 'border-blue-100 bg-blue-50 text-blue-700',
        amber: 'border-amber-100 bg-amber-50 text-amber-700',
    };

    return (
        <Card className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${colorMap[color]}`}
                >
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                        {label}
                    </div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-800">
                        {value}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function statusLabel(status: TestPackageStatus) {
    return {
        draft: 'Draft',
        published: 'Published',
        closed: 'Closed',
    }[status];
}

function renderStatusBadge(status: TestPackageStatus) {
    if (status === 'published') {
        return (
            <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                Published
            </span>
        );
    }

    if (status === 'draft') {
        return (
            <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                Draft
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            Closed
        </span>
    );
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

function toLocalDateTime(value: string | null) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    return local.toISOString().slice(0, 16);
}

function toggleId(current: number[], id: number, checked: boolean) {
    if (checked) {
        return current.includes(id) ? current : [...current, id];
    }

    return current.filter((currentId) => currentId !== id);
}

function firstError(errors: Partial<Record<string, string>>) {
    return Object.values(errors)[0] ?? 'Action belum bisa diproses.';
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
