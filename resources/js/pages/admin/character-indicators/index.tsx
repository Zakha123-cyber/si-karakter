import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Pencil,
    Plus,
    ShieldCheck,
    Tag,
    Trash2,
} from 'lucide-react';
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

type CharacterIndicator = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    category: string;
    is_warning_indicator: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedIndicators = {
    data: CharacterIndicator[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    indicators: PaginatedIndicators;
    filters: {
        search: string;
        category: string;
        is_warning_indicator: string;
    };
    categories: string[];
};

export default function AdminCharacterIndicatorsIndex({
    indicators,
    filters,
    categories,
}: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [isWarningFilter, setIsWarningFilter] = useState(
        filters.is_warning_indicator || '',
    );

    const [editingIndicator, setEditingIndicator] =
        useState<CharacterIndicator | null>(null);

    const createForm = useForm({
        code: '',
        name: '',
        description: '',
        category: 'moral_reasoning',
        is_warning_indicator: false,
        is_active: true,
    });

    const editForm = useForm({
        code: '',
        name: '',
        description: '',
        category: 'moral_reasoning',
        is_warning_indicator: false,
        is_active: true,
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/admin/character-indicators',
            { search, category, is_warning_indicator: isWarningFilter },
            { preserveState: true, replace: true },
        );
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan indikator baru...');

        createForm.post('/admin/character-indicators', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Indikator karakter berhasil dibuat.', {
                    id: toastId,
                });
                createForm.reset();
            },
            onError: () => {
                toast.error(
                    'Indikator belum bisa dibuat. Periksa kembali form.',
                    { id: toastId },
                );
            },
        });
    };

    const startEdit = (indicator: CharacterIndicator) => {
        setEditingIndicator(indicator);
        editForm.setData({
            code: indicator.code,
            name: indicator.name,
            description: indicator.description || '',
            category: indicator.category,
            is_warning_indicator: indicator.is_warning_indicator,
            is_active: indicator.is_active,
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingIndicator(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();

        if (!editingIndicator) {
            return;
        }

        const toastId = toast.loading('Menyimpan perubahan indikator...');

        editForm.put(
            `/admin/character-indicators/${editingIndicator.id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Indikator berhasil diperbarui.', {
                        id: toastId,
                    });
                    cancelEdit();
                },
                onError: () => {
                    toast.error(
                        'Indikator belum bisa diperbarui. Periksa kembali form.',
                        { id: toastId },
                    );
                },
            },
        );
    };

    const toggleStatus = (indicator: CharacterIndicator) => {
        router.patch(
            `/admin/character-indicators/${indicator.id}/status`,
            { is_active: !indicator.is_active },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        !indicator.is_active
                            ? 'Indikator berhasil diaktifkan.'
                            : 'Indikator berhasil dinonaktifkan.',
                    );
                },
                onError: () => {
                    toast.error('Status indikator gagal diperbarui.');
                },
            },
        );
    };

    const deleteIndicator = (indicator: CharacterIndicator) => {
        toast.warning(`Hapus indikator "${indicator.name}"?`, {
            description:
                'Tindakan ini akan menghapus indikator karakter secara permanen.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(
                        `/admin/character-indicators/${indicator.id}`,
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success('Indikator berhasil dihapus.');
                            },
                            onError: () => {
                                toast.error('Gagal menghapus indikator.');
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
            <Head title="Manajemen Indikator Karakter" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Indikator Karakter
                        </h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Kelola daftar indikator perkembangan karakter santri,
                        kategori evaluasi, serta penanda indikator peringatan (warning flag).
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
                                    Tambah Indikator
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Buat indikator karakter baru untuk observasi & asesmen.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitCreate}
                                className="grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Kode Indikator</Label>
                                    <Input
                                        id="code"
                                        value={createForm.data.code}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'code',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: honesty"
                                    />
                                    <InputError
                                        message={createForm.errors.code}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Indikator</Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Kejujuran"
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Input
                                        id="category"
                                        value={createForm.data.category}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'category',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: moral_reasoning, social, responsibility"
                                    />
                                    <InputError
                                        message={createForm.errors.category}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        className="rounded-md border border-input bg-background p-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={createForm.data.description}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Penjelasan kriteria indikator..."
                                    />
                                    <InputError
                                        message={createForm.errors.description}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="is_warning_indicator"
                                        checked={
                                            createForm.data.is_warning_indicator
                                        }
                                        onCheckedChange={(checked) =>
                                            createForm.setData(
                                                'is_warning_indicator',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label htmlFor="is_warning_indicator">
                                        Penanda Warning (Indikator Risiko)
                                    </Label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="is_active"
                                        checked={createForm.data.is_active}
                                        onCheckedChange={(checked) =>
                                            createForm.setData(
                                                'is_active',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label htmlFor="is_active">Aktif</Label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                >
                                    Simpan Indikator
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex min-w-0 flex-col gap-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Tag className="size-5 text-muted-foreground" />
                                    <CardTitle className="text-base">
                                        Daftar Indikator
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    {indicators.from ?? 0}-{indicators.to ?? 0} dari{' '}
                                    {indicators.total} indikator
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <form
                                    onSubmit={submitFilters}
                                    className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px_auto]"
                                >
                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari kode, nama, deskripsi"
                                    />
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={category}
                                        onChange={(event) =>
                                            setCategory(event.target.value)
                                        }
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={isWarningFilter}
                                        onChange={(event) =>
                                            setIsWarningFilter(
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Semua Tipe</option>
                                        <option value="0">Normal</option>
                                        <option value="1">Warning Flag</option>
                                    </select>
                                    <Button type="submit" variant="outline">
                                        Filter
                                    </Button>
                                </form>

                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-muted/50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">
                                                    Kode & Nama
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Kategori
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Tipe Warning
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {indicators.data.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-8 text-center text-muted-foreground"
                                                    >
                                                        Belum ada indikator karakter.
                                                    </td>
                                                </tr>
                                            ) : (
                                                indicators.data.map(
                                                    (indicator) => (
                                                        <tr
                                                            key={indicator.id}
                                                            className="border-t"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium">
                                                                    {indicator.name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    <code>
                                                                        {indicator.code}
                                                                    </code>
                                                                </div>
                                                                {indicator.description && (
                                                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                                        {indicator.description}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge variant="outline">
                                                                    {indicator.category}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {indicator.is_warning_indicator ? (
                                                                    <Badge
                                                                        variant="destructive"
                                                                        className="flex w-fit items-center gap-1"
                                                                    >
                                                                        <AlertTriangle className="size-3" />
                                                                        Warning
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="flex w-fit items-center gap-1"
                                                                    >
                                                                        <CheckCircle2 className="size-3 text-emerald-600" />
                                                                        Normal
                                                                    </Badge>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge
                                                                    variant={
                                                                        indicator.is_active
                                                                            ? 'secondary'
                                                                            : 'outline'
                                                                    }
                                                                >
                                                                    {indicator.is_active
                                                                        ? 'Aktif'
                                                                        : 'Nonaktif'}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            startEdit(
                                                                                indicator,
                                                                            )
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
                                                                            toggleStatus(
                                                                                indicator,
                                                                            )
                                                                        }
                                                                    >
                                                                        <ShieldCheck className="size-4" />
                                                                        {indicator.is_active
                                                                            ? 'Nonaktifkan'
                                                                            : 'Aktifkan'}
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            deleteIndicator(
                                                                                indicator,
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
                                    {indicators.links.map((link, idx) => (
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
                open={editingIndicator !== null}
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
                            <SheetTitle>Edit Indikator Karakter</SheetTitle>
                        </div>
                        <SheetDescription>
                            {editingIndicator
                                ? `${editingIndicator.name} (${editingIndicator.code})`
                                : 'Perbarui data indikator.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitEdit}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="edit_code">Kode Indikator</Label>
                            <Input
                                id="edit_code"
                                value={editForm.data.code}
                                onChange={(event) =>
                                    editForm.setData('code', event.target.value)
                                }
                            />
                            <InputError message={editForm.errors.code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Nama Indikator</Label>
                            <Input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(event) =>
                                    editForm.setData('name', event.target.value)
                                }
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_category">Kategori</Label>
                            <Input
                                id="edit_category"
                                value={editForm.data.category}
                                onChange={(event) =>
                                    editForm.setData(
                                        'category',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={editForm.errors.category} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_description">Deskripsi</Label>
                            <textarea
                                id="edit_description"
                                rows={3}
                                className="rounded-md border border-input bg-background p-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={editForm.data.description}
                                onChange={(event) =>
                                    editForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={editForm.errors.description}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="edit_is_warning_indicator"
                                checked={editForm.data.is_warning_indicator}
                                onCheckedChange={(checked) =>
                                    editForm.setData(
                                        'is_warning_indicator',
                                        checked === true,
                                    )
                                }
                            />
                            <Label htmlFor="edit_is_warning_indicator">
                                Penanda Warning (Indikator Risiko)
                            </Label>
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="edit_is_active"
                                checked={editForm.data.is_active}
                                onCheckedChange={(checked) =>
                                    editForm.setData(
                                        'is_active',
                                        checked === true,
                                    )
                                }
                            />
                            <Label htmlFor="edit_is_active">Aktif</Label>
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
