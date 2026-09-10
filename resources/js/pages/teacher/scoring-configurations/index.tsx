import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    ChevronLeft,
    ChevronRight,
    Filter,
    Pencil,
    Percent,
    Plus,
    Scale,
    Search,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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

type ScoringConfiguration = {
    id: number;
    name: string;
    test_weight: string;
    observation_weight: string;
    is_active: boolean;
    effective_from: string;
    effective_until: string | null;
    created_by: number | null;
    creator?: { id: number; name: string } | null;
    created_at?: string;
    updated_at?: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedConfigurations = {
    data: ScoringConfiguration[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    configurations: PaginatedConfigurations;
    filters: {
        search: string;
    };
};

export default function TeacherScoringConfigurationsIndex({
    configurations,
    filters,
}: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search || '');

    const [editingConfig, setEditingConfig] =
        useState<ScoringConfiguration | null>(null);

    const createForm = useForm({
        name: '',
        test_weight: '60',
        observation_weight: '40',
        is_active: true,
        effective_from: new Date().toISOString().split('T')[0],
        effective_until: '',
    });

    const editForm = useForm({
        name: '',
        test_weight: '60',
        observation_weight: '40',
        is_active: true,
        effective_from: new Date().toISOString().split('T')[0],
        effective_until: '',
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/teacher/scoring-configurations',
            { search },
            { preserveState: true, replace: true },
        );
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan konfigurasi baru...');

        createForm.post('/teacher/scoring-configurations', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Konfigurasi bobot berhasil dibuat.', {
                    id: toastId,
                });
                createForm.reset();
            },
            onError: () => {
                toast.error(
                    'Konfigurasi belum bisa dibuat. Periksa kembali form.',
                    { id: toastId },
                );
            },
        });
    };

    const startEdit = (config: ScoringConfiguration) => {
        setEditingConfig(config);
        editForm.setData({
            name: config.name,
            test_weight: config.test_weight.toString(),
            observation_weight: config.observation_weight.toString(),
            is_active: config.is_active,
            effective_from: config.effective_from,
            effective_until: config.effective_until || '',
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingConfig(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();

        if (!editingConfig) {
            return;
        }

        const toastId = toast.loading('Menyimpan perubahan konfigurasi...');

        editForm.put(`/teacher/scoring-configurations/${editingConfig.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Konfigurasi berhasil diperbarui.', {
                    id: toastId,
                });
                cancelEdit();
            },
            onError: () => {
                toast.error(
                    'Konfigurasi belum bisa diperbarui. Periksa kembali form.',
                    { id: toastId },
                );
            },
        });
    };

    const deleteConfiguration = (config: ScoringConfiguration) => {
        toast.warning(`Hapus konfigurasi "${config.name}"?`, {
            description:
                'Tindakan ini akan menghapus konfigurasi bobot secara permanen.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(
                        `/teacher/scoring-configurations/${config.id}`,
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success('Konfigurasi berhasil dihapus.');
                            },
                            onError: () => {
                                toast.error('Gagal menghapus konfigurasi.');
                            },
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

    return (
        <>
            <Head title="Konfigurasi Bobot Penilaian" />

            <div className="min-h-full space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-emerald-100">
                                <Scale className="size-4" />
                                <span className="text-xs font-bold tracking-wider uppercase">
                                    Konfigurasi Bobot
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Penilaian Karakter
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/90">
                                Atur bobot penilaian antara tes moral dan
                                observasi harian untuk perhitungan skor karakter
                                santri.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur-sm">
                            <ShieldCheck className="size-4" />
                            Role Ustadz
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard
                        icon={<Percent className="size-5" />}
                        label="Total Bobot"
                        value={configurations.total}
                        color="emerald"
                    />
                    <SummaryCard
                        icon={<ShieldCheck className="size-5" />}
                        label="Aktif"
                        value={
                            configurations.data.filter((item) => item.is_active)
                                .length
                        }
                        color="blue"
                    />
                    <SummaryCard
                        icon={<CalendarClock className="size-5" />}
                        label="Periode"
                        value={
                            configurations.data.filter(
                                (item) => item.effective_until,
                            ).length
                        }
                        color="amber"
                    />
                </div>

                {props.flash?.status && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Card className="h-fit overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <CardHeader className="border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Plus className="size-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-base font-extrabold text-slate-800">
                                        Tambah Konfigurasi
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-500">
                                        Buat konfigurasi bobot penilaian baru.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5">
                            <form
                                onSubmit={submitCreate}
                                className="grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Nama Konfigurasi
                                    </Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Bobot Default 2026"
                                        className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="test_weight"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Bobot Tes (%)
                                        </Label>
                                        <Input
                                            id="test_weight"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={createForm.data.test_weight}
                                            onChange={(event) =>
                                                createForm.setData(
                                                    'test_weight',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                        />
                                        <InputError
                                            message={
                                                createForm.errors.test_weight
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="observation_weight"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Bobot Observasi (%)
                                        </Label>
                                        <Input
                                            id="observation_weight"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={
                                                createForm.data
                                                    .observation_weight
                                            }
                                            onChange={(event) =>
                                                createForm.setData(
                                                    'observation_weight',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                        />
                                        <InputError
                                            message={
                                                createForm.errors
                                                    .observation_weight
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="effective_from"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Tanggal Mulai
                                        </Label>
                                        <Input
                                            id="effective_from"
                                            type="date"
                                            value={
                                                createForm.data.effective_from
                                            }
                                            onChange={(event) =>
                                                createForm.setData(
                                                    'effective_from',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                        />
                                        <InputError
                                            message={
                                                createForm.errors.effective_from
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="effective_until"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Tanggal Akhir
                                        </Label>
                                        <Input
                                            id="effective_until"
                                            type="date"
                                            value={
                                                createForm.data.effective_until
                                            }
                                            onChange={(event) =>
                                                createForm.setData(
                                                    'effective_until',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                        />
                                        <InputError
                                            message={
                                                createForm.errors
                                                    .effective_until
                                            }
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="h-10 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                                >
                                    Simpan Konfigurasi
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex min-w-0 flex-col gap-4">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                        ⚖️
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-800">
                                            Daftar Konfigurasi Bobot
                                        </h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            {configurations.from ?? 0}-
                                            {configurations.to ?? 0} dari{' '}
                                            {configurations.total} konfigurasi
                                        </p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                                    <Filter className="size-4" />
                                    Filter bobot
                                </div>
                            </div>

                            <form
                                onSubmit={submitFilters}
                                className="mb-5 grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3 md:grid-cols-[minmax(0,1fr)_auto]"
                            >
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari nama konfigurasi"
                                        className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="h-10 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                                >
                                    <Filter className="mr-2 size-4" />
                                    Filter
                                </Button>
                            </form>

                            <div className="[scrollbar-color:rgb(148_163_184)_transparent] overflow-x-auto rounded-[24px] border border-slate-100 bg-white [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="border-b border-slate-100 bg-slate-50 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-4">Nama</th>
                                            <th className="px-4 py-4">
                                                Bobot Tes
                                            </th>
                                            <th className="px-4 py-4">
                                                Bobot Observasi
                                            </th>
                                            <th className="px-4 py-4">
                                                Status
                                            </th>
                                            <th className="px-4 py-4">
                                                Periode
                                            </th>
                                            <th className="px-4 py-4 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {configurations.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-8 text-center text-sm text-slate-500"
                                                >
                                                    Belum ada konfigurasi bobot.
                                                </td>
                                            </tr>
                                        ) : (
                                            configurations.data.map(
                                                (config) => (
                                                    <tr
                                                        key={config.id}
                                                        className="border-t border-slate-100 transition-colors hover:bg-emerald-50/30"
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="font-semibold text-slate-800">
                                                                {config.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-slate-600">
                                                            {config.test_weight}
                                                            %
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-slate-600">
                                                            {
                                                                config.observation_weight
                                                            }
                                                            %
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge
                                                                variant={
                                                                    config.is_active
                                                                        ? 'secondary'
                                                                        : 'outline'
                                                                }
                                                                className={
                                                                    config.is_active
                                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                        : 'border-slate-200 bg-slate-100 text-slate-600'
                                                                }
                                                            >
                                                                {config.is_active
                                                                    ? 'Aktif'
                                                                    : 'Tidak Aktif'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-slate-500">
                                                            <div>
                                                                {
                                                                    config.effective_from
                                                                }
                                                            </div>
                                                            {config.effective_until && (
                                                                <div className="mt-0.5">
                                                                    s.d.{' '}
                                                                    {
                                                                        config.effective_until
                                                                    }
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        startEdit(
                                                                            config,
                                                                        )
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
                                                                        deleteConfiguration(
                                                                            config,
                                                                        )
                                                                    }
                                                                    className="h-8 rounded-xl border border-rose-100 bg-white px-2.5 text-xs font-bold text-rose-600 shadow-sm hover:border-rose-200 hover:bg-rose-50"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-1.5">
                                {configurations.links.map((link, idx) => (
                                    <Button
                                        key={`${idx}-${link.label}`}
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
                        </section>
                    </div>
                </div>
            </div>

            <Sheet
                open={editingConfig !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        cancelEdit();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <Pencil className="size-5 text-muted-foreground" />
                            <SheetTitle>Edit Konfigurasi Bobot</SheetTitle>
                        </div>
                        <SheetDescription>
                            {editingConfig
                                ? editingConfig.name
                                : 'Perbarui data konfigurasi.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitEdit}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Nama Konfigurasi</Label>
                            <Input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(event) =>
                                    editForm.setData('name', event.target.value)
                                }
                                className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_test_weight">
                                    Bobot Tes (%)
                                </Label>
                                <Input
                                    id="edit_test_weight"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={editForm.data.test_weight}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'test_weight',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                />
                                <InputError
                                    message={editForm.errors.test_weight}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_observation_weight">
                                    Bobot Observasi (%)
                                </Label>
                                <Input
                                    id="edit_observation_weight"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={editForm.data.observation_weight}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'observation_weight',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                />
                                <InputError
                                    message={editForm.errors.observation_weight}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_effective_from">
                                    Tanggal Mulai
                                </Label>
                                <Input
                                    id="edit_effective_from"
                                    type="date"
                                    value={editForm.data.effective_from}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'effective_from',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                />
                                <InputError
                                    message={editForm.errors.effective_from}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_effective_until">
                                    Tanggal Akhir
                                </Label>
                                <Input
                                    id="edit_effective_until"
                                    type="date"
                                    value={editForm.data.effective_until}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'effective_until',
                                            event.target.value,
                                        )
                                    }
                                    className="h-10 rounded-2xl border-slate-200 bg-slate-50 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                />
                                <InputError
                                    message={editForm.errors.effective_until}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Simpan Perubahan
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEdit}
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

function SummaryCard({
    icon,
    label,
    value,
    color = 'emerald',
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color?: 'emerald' | 'blue' | 'purple' | 'amber';
}) {
    const colorMap = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
    };

    return (
        <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(16,58,58,0.06)]">
            <div className="flex items-center gap-4 p-5">
                <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${colorMap[color]}`}
                >
                    {icon}
                </div>
                <div>
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        {label}
                    </div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-800">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
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
