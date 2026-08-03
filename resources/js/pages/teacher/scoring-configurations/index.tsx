import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Scale, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
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

        editForm.put(
            `/teacher/scoring-configurations/${editingConfig.id}`,
            {
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
            },
        );
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
                                toast.success(
                                    'Konfigurasi berhasil dihapus.',
                                );
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

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Konfigurasi Bobot
                        </h1>
                        <Badge variant="secondary">Ustadz</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Atur bobot penilaian antara tes moral dan observasi
                        harian untuk perhitungan skor karakter santri.
                    </p>
                </div>

                {props.flash?.status && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Card className="h-fit rounded-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Plus className="size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    Tambah Konfigurasi
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Buat konfigurasi bobot penilaian baru.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitCreate}
                                className="grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Konfigurasi</Label>
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
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="test_weight">
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
                                        />
                                        <InputError
                                            message={
                                                createForm.errors.test_weight
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="observation_weight">
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
                                        <Label htmlFor="effective_from">
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
                                        />
                                        <InputError
                                            message={
                                                createForm.errors
                                                    .effective_from
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="effective_until">
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
                                >
                                    Simpan Konfigurasi
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex min-w-0 flex-col gap-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Scale className="size-5 text-muted-foreground" />
                                    <CardTitle className="text-base">
                                        Daftar Konfigurasi Bobot
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    {configurations.from ?? 0}-
                                    {configurations.to ?? 0} dari{' '}
                                    {configurations.total} konfigurasi
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <form
                                    onSubmit={submitFilters}
                                    className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
                                >
                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari nama konfigurasi"
                                    />
                                    <Button type="submit" variant="outline">
                                        Filter
                                    </Button>
                                </form>

                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-muted/50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">
                                                    Nama
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Bobot Tes
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Bobot Observasi
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Periode
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {configurations.data.length ===
                                            0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="px-4 py-8 text-center text-muted-foreground"
                                                    >
                                                        Belum ada konfigurasi
                                                        bobot.
                                                    </td>
                                                </tr>
                                            ) : (
                                                configurations.data.map(
                                                    (config) => (
                                                        <tr
                                                            key={config.id}
                                                            className="border-t"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium">
                                                                    {
                                                                        config.name
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {
                                                                    config.test_weight
                                                                }
                                                                %
                                                            </td>
                                                            <td className="px-4 py-3">
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
                                                                >
                                                                    {config.is_active
                                                                        ? 'Aktif'
                                                                        : 'Tidak Aktif'}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                                <div>
                                                                    {config.effective_from}
                                                                </div>
                                                                {config.effective_until && (
                                                                    <div>
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
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            startEdit(
                                                                                config,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            deleteConfiguration(
                                                                                config,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="size-4" />
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

                                <div className="flex flex-wrap gap-2">
                                    {configurations.links.map((link, idx) => (
                                        <Button
                                            key={`${idx}-${link.label}`}
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
                                                    router.visit(link.url, {
                                                        preserveScroll: true,
                                                    });
                                                }
                                            }}
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
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
                            <Label htmlFor="edit_name">
                                Nama Konfigurasi
                            </Label>
                            <Input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(event) =>
                                    editForm.setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
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
                                />
                                <InputError
                                    message={
                                        editForm.errors.observation_weight
                                    }
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
