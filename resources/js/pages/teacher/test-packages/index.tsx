import { Head, router, useForm } from '@inertiajs/react';
import {
    Archive,
    Boxes,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileStack,
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
import { Badge } from '@/components/ui/badge';
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
    const [editingPackage, setEditingPackage] =
        useState<TestPackageRow | null>(null);
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
                            onError: (errors) => toast.error(firstError(errors)),
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
                            onError: (errors) => toast.error(firstError(errors)),
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

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-normal">
                                Paket Tes
                            </h1>
                            <Badge variant="secondary">Phase 4</Badge>
                        </div>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Kelola paket dilema moral, periode aktif, target
                            kelompok, dan daftar kasus yang akan dikerjakan
                            santri.
                        </p>
                    </div>

                    <Button type="button" onClick={openCreate}>
                        <Plus className="size-4" />
                        Tambah Paket
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard
                        icon={<FileStack className="size-5" />}
                        label="Total Paket"
                        value={packages.total}
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
                    />
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Search className="size-5 text-muted-foreground" />
                            <CardTitle className="text-base">
                                Daftar Paket
                            </CardTitle>
                        </div>
                        <CardDescription>
                            {packages.from ?? 0}-{packages.to ?? 0} dari{' '}
                            {packages.total} paket tes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <form
                            onSubmit={submitFilters}
                            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
                        >
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari judul atau deskripsi"
                            />
                            <select
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            >
                                <option value="">Semua status</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {statusLabel(status)}
                                    </option>
                                ))}
                            </select>
                            <Button type="submit" variant="outline">
                                Filter
                            </Button>
                        </form>

                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[920px] text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Paket
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Periode
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Isi
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {packages.data.map((testPackage) => (
                                        <tr
                                            key={testPackage.id}
                                            className="border-t"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {testPackage.title}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {testPackage.description ||
                                                        testPackage.slug}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <div>
                                                    Mulai:{' '}
                                                    {formatDateTime(
                                                        testPackage.start_at,
                                                    )}
                                                </div>
                                                <div>
                                                    Selesai:{' '}
                                                    {formatDateTime(
                                                        testPackage.end_at,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline">
                                                        {testPackage.groups_count}{' '}
                                                        kelompok
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {testPackage.cases_count}{' '}
                                                        kasus
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {testPackage.attempt_limit}{' '}
                                                        percobaan
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={statusVariant(
                                                        testPackage.status,
                                                    )}
                                                >
                                                    {statusLabel(
                                                        testPackage.status,
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openEdit(
                                                                testPackage,
                                                            )
                                                        }
                                                        disabled={
                                                            testPackage.status ===
                                                            'closed'
                                                        }
                                                    >
                                                        <Pencil className="size-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openGroups(
                                                                testPackage,
                                                            )
                                                        }
                                                        disabled={
                                                            testPackage.status ===
                                                            'closed'
                                                        }
                                                    >
                                                        <Users className="size-4" />
                                                        Kelompok
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openCases(
                                                                testPackage,
                                                            )
                                                        }
                                                        disabled={
                                                            testPackage.status ===
                                                            'closed'
                                                        }
                                                    >
                                                        <Boxes className="size-4" />
                                                        Kasus
                                                    </Button>
                                                    {testPackage.status ===
                                                    'published' ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                closePackage(
                                                                    testPackage,
                                                                )
                                                            }
                                                        >
                                                            <Archive className="size-4" />
                                                            Close
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                publishPackage(
                                                                    testPackage,
                                                                )
                                                            }
                                                            disabled={
                                                                testPackage.status ===
                                                                'closed'
                                                            }
                                                        >
                                                            <Send className="size-4" />
                                                            Publish
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            deletePackage(
                                                                testPackage,
                                                            )
                                                        }
                                                        disabled={
                                                            testPackage.status !==
                                                            'draft'
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
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
                            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                                Belum ada paket tes untuk filter ini.
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {packages.links.map((link) => (
                                <Button
                                    key={`${link.label}-${link.url}`}
                                    type="button"
                                    size="sm"
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) {
                                            router.visit(link.url, {
                                                preserveScroll: true,
                                            });
                                        }
                                    }}
                                >
                                    <PaginationLabel label={link.label} />
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Sheet
                open={isPackageSheetOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closePackageSheet();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <ClipboardList className="size-5 text-muted-foreground" />
                            <SheetTitle>
                                {editingPackage
                                    ? 'Edit Paket Tes'
                                    : 'Tambah Paket Tes'}
                            </SheetTitle>
                        </div>
                        <SheetDescription>
                            Atur judul, periode aktif, dan batas percobaan.
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitPackage}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input
                                id="title"
                                value={packageForm.data.title}
                                onChange={(event) =>
                                    packageForm.setData(
                                        'title',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={packageForm.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                <Label htmlFor="start_at">Mulai</Label>
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
                                />
                                <InputError
                                    message={packageForm.errors.start_at}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_at">Selesai</Label>
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
                                />
                                <InputError
                                    message={packageForm.errors.end_at}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="attempt_limit">
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
                            />
                            <InputError
                                message={packageForm.errors.attempt_limit}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="submit"
                                disabled={packageForm.processing}
                            >
                                {editingPackage
                                    ? 'Simpan Perubahan'
                                    : 'Simpan Paket'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closePackageSheet}
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
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <Users className="size-5 text-muted-foreground" />
                            <SheetTitle>Target Kelompok</SheetTitle>
                        </div>
                        <SheetDescription>
                            {groupPackage
                                ? groupPackage.title
                                : 'Pilih kelompok target paket.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitGroups}
                        className="grid gap-4 px-4 pb-4"
                    >
                        {groups.length === 0 ? (
                            <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
                                Belum ada kelompok aktif.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {groups.map((group) => (
                                    <label
                                        key={group.id}
                                        className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
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

                        <div className="flex gap-2 pt-2">
                            <Button type="submit">Simpan Target</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setGroupPackage(null);
                                    setGroupIds([]);
                                }}
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
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <Boxes className="size-5 text-muted-foreground" />
                            <SheetTitle>Kasus Dalam Paket</SheetTitle>
                        </div>
                        <SheetDescription>
                            {casePackage
                                ? casePackage.title
                                : 'Pilih kasus moral untuk paket ini.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitCases}
                        className="grid gap-4 px-4 pb-4"
                    >
                        {moralCases.length === 0 ? (
                            <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
                                Belum ada kasus aktif.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {moralCases.map((moralCase) => (
                                    <label
                                        key={moralCase.id}
                                        className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
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
                            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                                Urutan kasus mengikuti urutan saat dipilih.
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button type="submit">Simpan Kasus</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCasePackage(null);
                                    setCaseIds([]);
                                }}
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
}: {
    icon: ReactNode;
    label: string;
    value: number;
}) {
    return (
        <Card className="rounded-lg">
            <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    {icon}
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">
                        {label}
                    </div>
                    <div className="text-xl font-semibold">{value}</div>
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

function statusVariant(status: TestPackageStatus): 'destructive' | 'secondary' | 'outline' {
    if (status === 'closed') {
        return 'destructive';
    }

    if (status === 'published') {
        return 'secondary';
    }

    return 'outline';
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
