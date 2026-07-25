import { Head, router, useForm } from '@inertiajs/react';
import {
    BookOpenCheck,
    ChevronLeft,
    ChevronRight,
    FileAudio,
    ImageUp,
    ListChecks,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
    ToggleLeft,
    Trash2,
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

type CharacterIndicator = {
    id: number;
    code: string;
    name: string;
    category: string;
    is_warning_indicator: boolean;
};

type MoralCaseIndicator = Pick<
    CharacterIndicator,
    'id' | 'code' | 'name' | 'category'
> & {
    weight: number;
};

type MoralCaseOption = {
    id: number;
    label: string;
    text: string;
    internal_value: string | null;
    sort_order: number;
    is_active: boolean;
};

type MoralCaseRow = {
    id: number;
    title: string;
    story: string;
    sort_order: number;
    is_active: boolean;
    image_path: string | null;
    audio_path: string | null;
    options_count: number;
    indicators_count: number;
    test_packages_count: number;
    options: MoralCaseOption[];
    indicators: MoralCaseIndicator[];
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedCases = {
    data: MoralCaseRow[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    moralCases: PaginatedCases;
    filters: {
        search: string;
        active: string;
    };
    characterIndicators: CharacterIndicator[];
};

export default function TeacherMoralCasesIndex({
    moralCases,
    filters,
    characterIndicators,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [active, setActive] = useState(filters.active);
    const [editingCase, setEditingCase] = useState<MoralCaseRow | null>(null);
    const [isCaseSheetOpen, setIsCaseSheetOpen] = useState(false);
    const [optionCase, setOptionCase] = useState<MoralCaseRow | null>(null);
    const [editingOption, setEditingOption] = useState<MoralCaseOption | null>(
        null,
    );
    const [indicatorCase, setIndicatorCase] = useState<MoralCaseRow | null>(
        null,
    );
    const [indicatorWeights, setIndicatorWeights] = useState<
        Record<number, string>
    >({});
    const [mediaCase, setMediaCase] = useState<MoralCaseRow | null>(null);

    const caseForm = useForm({
        title: '',
        story: '',
        sort_order: 0,
        is_active: true,
    });

    const optionForm = useForm({
        label: '',
        text: '',
        internal_value: '',
        sort_order: 0,
        is_active: true,
    });

    const mediaForm = useForm<{
        type: 'image' | 'audio';
        media: File | null;
    }>({
        type: 'image',
        media: null,
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/teacher/moral-cases',
            { search, active },
            { preserveState: true, replace: true },
        );
    };

    const openCreate = () => {
        setEditingCase(null);
        caseForm.reset();
        caseForm.clearErrors();
        setIsCaseSheetOpen(true);
    };

    const openEdit = (moralCase: MoralCaseRow) => {
        setEditingCase(moralCase);
        caseForm.setData({
            title: moralCase.title,
            story: moralCase.story,
            sort_order: moralCase.sort_order,
            is_active: moralCase.is_active,
        });
        caseForm.clearErrors();
        setIsCaseSheetOpen(true);
    };

    const closeCaseSheet = () => {
        setEditingCase(null);
        setIsCaseSheetOpen(false);
        caseForm.reset();
        caseForm.clearErrors();
    };

    const submitCase = (event: FormEvent) => {
        event.preventDefault();

        const toastId = toast.loading(
            editingCase ? 'Menyimpan kasus...' : 'Membuat kasus moral...',
        );
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    editingCase
                        ? 'Kasus moral berhasil diperbarui.'
                        : 'Kasus moral berhasil dibuat.',
                    { id: toastId },
                );
                closeCaseSheet();
            },
            onError: (errors: Partial<Record<string, string>>) => {
                toast.error(firstError(errors), { id: toastId });
            },
        };

        if (editingCase) {
            caseForm.put(`/teacher/moral-cases/${editingCase.id}`, options);

            return;
        }

        caseForm.post('/teacher/moral-cases', options);
    };

    const deleteCase = (moralCase: MoralCaseRow) => {
        toast.warning(`Hapus kasus ${moralCase.title}?`, {
            description:
                'Kasus yang sudah dipakai paket tes tidak dapat dihapus.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(`/teacher/moral-cases/${moralCase.id}`, {
                        preserveScroll: true,
                        onSuccess: () => toast.success('Kasus moral dihapus.'),
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

    const openOptions = (moralCase: MoralCaseRow) => {
        setOptionCase(moralCase);
        setEditingOption(null);
        optionForm.reset();
        optionForm.clearErrors();
    };

    const startCreateOption = () => {
        setEditingOption(null);
        optionForm.setData({
            label: '',
            text: '',
            internal_value: '',
            sort_order: optionCase?.options.length ?? 0,
            is_active: true,
        });
        optionForm.clearErrors();
    };

    const startEditOption = (option: MoralCaseOption) => {
        setEditingOption(option);
        optionForm.setData({
            label: option.label,
            text: option.text,
            internal_value: option.internal_value ?? '',
            sort_order: option.sort_order,
            is_active: option.is_active,
        });
        optionForm.clearErrors();
    };

    const submitOption = (event: FormEvent) => {
        event.preventDefault();

        if (!optionCase) {
            return;
        }

        const toastId = toast.loading(
            editingOption ? 'Menyimpan pilihan...' : 'Membuat pilihan...',
        );
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    editingOption
                        ? 'Pilihan berhasil diperbarui.'
                        : 'Pilihan berhasil dibuat.',
                    { id: toastId },
                );
                setEditingOption(null);
                optionForm.reset();
            },
            onError: (errors: Partial<Record<string, string>>) => {
                toast.error(firstError(errors), { id: toastId });
            },
        };

        if (editingOption) {
            optionForm.put(
                `/teacher/moral-cases/${optionCase.id}/options/${editingOption.id}`,
                options,
            );

            return;
        }

        optionForm.post(
            `/teacher/moral-cases/${optionCase.id}/options`,
            options,
        );
    };

    const deleteOption = (option: MoralCaseOption) => {
        if (!optionCase) {
            return;
        }

        toast.warning(`Hapus pilihan ${option.label}?`, {
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(
                        `/teacher/moral-cases/${optionCase.id}/options/${option.id}`,
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                toast.success('Pilihan berhasil dihapus.'),
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

    const openIndicators = (moralCase: MoralCaseRow) => {
        setIndicatorCase(moralCase);
        setIndicatorWeights(
            Object.fromEntries(
                moralCase.indicators.map((indicator) => [
                    indicator.id,
                    String(indicator.weight),
                ]),
            ),
        );
    };

    const submitIndicators = (event: FormEvent) => {
        event.preventDefault();

        if (!indicatorCase) {
            return;
        }

        const indicators = Object.entries(indicatorWeights).map(
            ([id, weight]) => ({
                id: Number(id),
                weight: Number(weight || 1),
            }),
        );
        const toastId = toast.loading('Menyimpan indikator kasus...');

        router.post(
            `/teacher/moral-cases/${indicatorCase.id}/indicators`,
            { indicators },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Indikator kasus berhasil diperbarui.', {
                        id: toastId,
                    });
                    setIndicatorCase(null);
                    setIndicatorWeights({});
                },
                onError: (errors) => {
                    toast.error(firstError(errors), { id: toastId });
                },
            },
        );
    };

    const openMedia = (moralCase: MoralCaseRow) => {
        setMediaCase(moralCase);
        mediaForm.setData({
            type: 'image',
            media: null,
        });
        mediaForm.clearErrors();
    };

    const submitMedia = (event: FormEvent) => {
        event.preventDefault();

        if (!mediaCase) {
            return;
        }

        const toastId = toast.loading('Mengupload media kasus...');

        mediaForm.post(`/teacher/moral-cases/${mediaCase.id}/media`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Media kasus berhasil diupload.', {
                    id: toastId,
                });
                setMediaCase(null);
                mediaForm.reset();
            },
            onError: (errors) => {
                toast.error(firstError(errors), { id: toastId });
            },
        });
    };

    return (
        <>
            <Head title="Kasus Moral" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-normal">
                                Kasus Moral
                            </h1>
                            <Badge variant="secondary">Ustadz</Badge>
                        </div>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Kelola cerita dilema, pilihan jawaban, indikator
                            karakter, dan media pendukung untuk paket tes.
                        </p>
                    </div>

                    <Button type="button" onClick={openCreate}>
                        <Plus className="size-4" />
                        Tambah Kasus
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard
                        icon={<BookOpenCheck className="size-5" />}
                        label="Total Kasus"
                        value={moralCases.total}
                    />
                    <SummaryCard
                        icon={<ToggleLeft className="size-5" />}
                        label="Aktif"
                        value={
                            moralCases.data.filter((item) => item.is_active)
                                .length
                        }
                    />
                    <SummaryCard
                        icon={<ListChecks className="size-5" />}
                        label="Pilihan"
                        value={moralCases.data.reduce(
                            (total, item) => total + item.options_count,
                            0,
                        )}
                    />
                    <SummaryCard
                        icon={<SlidersHorizontal className="size-5" />}
                        label="Indikator"
                        value={moralCases.data.reduce(
                            (total, item) => total + item.indicators_count,
                            0,
                        )}
                    />
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Search className="size-5 text-muted-foreground" />
                            <CardTitle className="text-base">
                                Daftar Kasus
                            </CardTitle>
                        </div>
                        <CardDescription>
                            {moralCases.from ?? 0}-{moralCases.to ?? 0} dari{' '}
                            {moralCases.total} kasus moral
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
                                placeholder="Cari judul atau cerita"
                            />
                            <select
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={active}
                                onChange={(event) =>
                                    setActive(event.target.value)
                                }
                            >
                                <option value="">Semua status</option>
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </select>
                            <Button type="submit" variant="outline">
                                Filter
                            </Button>
                        </form>

                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Kasus
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Konten
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Media
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
                                    {moralCases.data.map((moralCase) => (
                                        <tr
                                            key={moralCase.id}
                                            className="border-t"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {moralCase.title}
                                                </div>
                                                <div className="line-clamp-2 max-w-xl text-muted-foreground">
                                                    {moralCase.story}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline">
                                                        Urutan{' '}
                                                        {moralCase.sort_order}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {
                                                            moralCase.options_count
                                                        }{' '}
                                                        pilihan
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {
                                                            moralCase.indicators_count
                                                        }{' '}
                                                        indikator
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <MediaBadge
                                                        active={
                                                            moralCase.image_path !==
                                                            null
                                                        }
                                                        label="Gambar"
                                                    />
                                                    <MediaBadge
                                                        active={
                                                            moralCase.audio_path !==
                                                            null
                                                        }
                                                        label="Audio"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        moralCase.is_active
                                                            ? 'secondary'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {moralCase.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openEdit(moralCase)
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
                                                            openOptions(
                                                                moralCase,
                                                            )
                                                        }
                                                    >
                                                        <ListChecks className="size-4" />
                                                        Pilihan
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openIndicators(
                                                                moralCase,
                                                            )
                                                        }
                                                    >
                                                        <SlidersHorizontal className="size-4" />
                                                        Indikator
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openMedia(moralCase)
                                                        }
                                                    >
                                                        <ImageUp className="size-4" />
                                                        Media
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            deleteCase(
                                                                moralCase,
                                                            )
                                                        }
                                                        disabled={
                                                            moralCase.test_packages_count >
                                                            0
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

                        {moralCases.data.length === 0 && (
                            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                                Belum ada kasus moral untuk filter ini.
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {moralCases.links.map((link) => (
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
                open={isCaseSheetOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeCaseSheet();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <BookOpenCheck className="size-5 text-muted-foreground" />
                            <SheetTitle>
                                {editingCase
                                    ? 'Edit Kasus Moral'
                                    : 'Tambah Kasus Moral'}
                            </SheetTitle>
                        </div>
                        <SheetDescription>
                            Tulis cerita dilema dan urutan tampil kasus.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submitCase} className="grid gap-4 px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input
                                id="title"
                                value={caseForm.data.title}
                                onChange={(event) =>
                                    caseForm.setData(
                                        'title',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={caseForm.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="story">Cerita</Label>
                            <textarea
                                id="story"
                                className="min-h-48 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={caseForm.data.story}
                                onChange={(event) =>
                                    caseForm.setData(
                                        'story',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={caseForm.errors.story} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Urutan</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min={0}
                                    max={9999}
                                    value={caseForm.data.sort_order}
                                    onFocus={(event) =>
                                        event.currentTarget.select()
                                    }
                                    onChange={(event) =>
                                        caseForm.setData(
                                            'sort_order',
                                            Number(event.target.value),
                                        )
                                    }
                                />
                                <InputError
                                    message={caseForm.errors.sort_order}
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-7">
                                <Checkbox
                                    id="is_active"
                                    checked={caseForm.data.is_active}
                                    onCheckedChange={(checked) =>
                                        caseForm.setData(
                                            'is_active',
                                            checked === true,
                                        )
                                    }
                                />
                                <Label htmlFor="is_active">Kasus aktif</Label>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="submit"
                                disabled={caseForm.processing}
                            >
                                {editingCase
                                    ? 'Simpan Perubahan'
                                    : 'Simpan Kasus'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeCaseSheet}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={optionCase !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setOptionCase(null);
                        setEditingOption(null);
                        optionForm.reset();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <ListChecks className="size-5 text-muted-foreground" />
                            <SheetTitle>Pilihan Dinamis</SheetTitle>
                        </div>
                        <SheetDescription>
                            {optionCase
                                ? optionCase.title
                                : 'Kelola pilihan jawaban kasus.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="grid gap-5 px-4 pb-4">
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={startCreateOption}
                            >
                                <Plus className="size-4" />
                                Tambah Pilihan
                            </Button>
                        </div>

                        <div className="grid gap-3">
                            {optionCase?.options.map((option) => (
                                <div
                                    key={option.id}
                                    className="rounded-md border p-3"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {option.label}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        option.is_active
                                                            ? 'secondary'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {option.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </Badge>
                                            </div>
                                            <p className="mt-2 text-sm">
                                                {option.text}
                                            </p>
                                            {option.internal_value && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Internal:{' '}
                                                    {option.internal_value}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    startEditOption(option)
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
                                                    deleteOption(option)
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                                Hapus
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {optionCase?.options.length === 0 && (
                            <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
                                Belum ada pilihan untuk kasus ini.
                            </div>
                        )}

                        <form
                            onSubmit={submitOption}
                            className="grid gap-4 rounded-md border p-4"
                        >
                            <div className="font-medium">
                                {editingOption
                                    ? 'Edit Pilihan'
                                    : 'Form Pilihan'}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                                <div className="grid gap-2">
                                    <Label htmlFor="option_label">Label</Label>
                                    <Input
                                        id="option_label"
                                        value={optionForm.data.label}
                                        onChange={(event) =>
                                            optionForm.setData(
                                                'label',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="A, B, Sikap 1"
                                    />
                                    <InputError
                                        message={optionForm.errors.label}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="internal_value">
                                        Label Internal
                                    </Label>
                                    <Input
                                        id="internal_value"
                                        value={optionForm.data.internal_value}
                                        onChange={(event) =>
                                            optionForm.setData(
                                                'internal_value',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Opsional"
                                    />
                                    <InputError
                                        message={
                                            optionForm.errors.internal_value
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="option_text">Teks Pilihan</Label>
                                <textarea
                                    id="option_text"
                                    className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    value={optionForm.data.text}
                                    onChange={(event) =>
                                        optionForm.setData(
                                            'text',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={optionForm.errors.text} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="option_sort_order">
                                        Urutan
                                    </Label>
                                    <Input
                                        id="option_sort_order"
                                        type="number"
                                        min={0}
                                        max={9999}
                                        value={optionForm.data.sort_order}
                                        onFocus={(event) =>
                                            event.currentTarget.select()
                                        }
                                        onChange={(event) =>
                                            optionForm.setData(
                                                'sort_order',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={optionForm.errors.sort_order}
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-7">
                                    <Checkbox
                                        id="option_is_active"
                                        checked={optionForm.data.is_active}
                                        onCheckedChange={(checked) =>
                                            optionForm.setData(
                                                'is_active',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label htmlFor="option_is_active">
                                        Pilihan aktif
                                    </Label>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={optionForm.processing}
                                >
                                    {editingOption
                                        ? 'Simpan Pilihan'
                                        : 'Tambah Pilihan'}
                                </Button>
                                {editingOption && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={startCreateOption}
                                    >
                                        Batal Edit
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet
                open={indicatorCase !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setIndicatorCase(null);
                        setIndicatorWeights({});
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <SlidersHorizontal className="size-5 text-muted-foreground" />
                            <SheetTitle>Indikator Kasus</SheetTitle>
                        </div>
                        <SheetDescription>
                            {indicatorCase
                                ? indicatorCase.title
                                : 'Pilih indikator karakter dan bobotnya.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitIndicators}
                        className="grid gap-4 px-4 pb-4"
                    >
                        {characterIndicators.length === 0 ? (
                            <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
                                Belum ada indikator aktif.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {characterIndicators.map((indicator) => {
                                    const checked =
                                        indicatorWeights[indicator.id] !==
                                        undefined;

                                    return (
                                        <div
                                            key={indicator.id}
                                            className="grid gap-3 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_110px]"
                                        >
                                            <label className="flex items-start gap-3 text-sm">
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(
                                                        nextChecked,
                                                    ) =>
                                                        setIndicatorWeights(
                                                            (current) =>
                                                                toggleIndicator(
                                                                    current,
                                                                    indicator.id,
                                                                    nextChecked ===
                                                                        true,
                                                                ),
                                                        )
                                                    }
                                                />
                                                <span>
                                                    <span className="block font-medium">
                                                        {indicator.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {indicator.category} -{' '}
                                                        {indicator.code}
                                                    </span>
                                                </span>
                                            </label>
                                            <Input
                                                type="number"
                                                min="0.01"
                                                max="99.99"
                                                step="0.01"
                                                disabled={!checked}
                                                value={
                                                    indicatorWeights[
                                                        indicator.id
                                                    ] ?? ''
                                                }
                                                onChange={(event) =>
                                                    setIndicatorWeights(
                                                        (current) => ({
                                                            ...current,
                                                            [indicator.id]:
                                                                event.target
                                                                    .value,
                                                        }),
                                                    )
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button type="submit">Simpan Indikator</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIndicatorCase(null);
                                    setIndicatorWeights({});
                                }}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={mediaCase !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setMediaCase(null);
                        mediaForm.reset();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <ImageUp className="size-5 text-muted-foreground" />
                            <SheetTitle>Upload Media</SheetTitle>
                        </div>
                        <SheetDescription>
                            {mediaCase
                                ? mediaCase.title
                                : 'Upload gambar atau audio kasus.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submitMedia} className="grid gap-4 px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="media_type">Jenis Media</Label>
                            <select
                                id="media_type"
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={mediaForm.data.type}
                                onChange={(event) =>
                                    mediaForm.setData(
                                        'type',
                                        event.target.value as 'image' | 'audio',
                                    )
                                }
                            >
                                <option value="image">Gambar</option>
                                <option value="audio">Audio</option>
                            </select>
                            <InputError message={mediaForm.errors.type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="media">File</Label>
                            <Input
                                id="media"
                                type="file"
                                accept={
                                    mediaForm.data.type === 'audio'
                                        ? 'audio/*'
                                        : 'image/png,image/jpeg,image/webp'
                                }
                                onChange={(event) =>
                                    mediaForm.setData(
                                        'media',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <InputError message={mediaForm.errors.media} />
                            <p className="text-xs text-muted-foreground">
                                Gambar maksimal 5 MB. Audio maksimal 10 MB.
                                File disimpan di storage private.
                            </p>
                        </div>

                        {mediaCase && (
                            <div className="grid gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                                <div>
                                    Gambar:{' '}
                                    {mediaCase.image_path
                                        ? mediaCase.image_path
                                        : '-'}
                                </div>
                                <div>
                                    Audio:{' '}
                                    {mediaCase.audio_path
                                        ? mediaCase.audio_path
                                        : '-'}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="submit"
                                disabled={mediaForm.processing}
                            >
                                {mediaForm.data.type === 'audio' ? (
                                    <FileAudio className="size-4" />
                                ) : (
                                    <ImageUp className="size-4" />
                                )}
                                Upload
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setMediaCase(null);
                                    mediaForm.reset();
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

TeacherMoralCasesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Kasus Moral',
            href: '/teacher/moral-cases',
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

function MediaBadge({ active, label }: { active: boolean; label: string }) {
    return (
        <Badge variant={active ? 'secondary' : 'outline'}>
            {label}: {active ? 'Ada' : 'Kosong'}
        </Badge>
    );
}

function toggleIndicator(
    current: Record<number, string>,
    id: number,
    checked: boolean,
) {
    if (checked) {
        return {
            ...current,
            [id]: current[id] ?? '1',
        };
    }

    const next = { ...current };
    delete next[id];

    return next;
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
