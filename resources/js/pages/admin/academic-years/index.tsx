import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, Pencil, Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
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

type AcademicYear = {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    groups_count: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedAcademicYears = {
    data: AcademicYear[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    academic_years: PaginatedAcademicYears;
    filters: {
        search: string;
    };
};

export default function AdminAcademicYearsIndex({
    academic_years,
    filters,
}: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search || '');

    const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

    const createForm = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false,
    });

    const editForm = useForm({
        name: '',
        start_date: '',
        end_date: '',
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/academic-years', { search }, { preserveState: true, replace: true });
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan tahun ajaran baru...');

        createForm.post('/admin/academic-years', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tahun ajaran berhasil dibuat.', { id: toastId });
                createForm.reset();
            },
            onError: () => {
                toast.error('Tahun ajaran belum bisa dibuat. Periksa kembali form.', { id: toastId });
            },
        });
    };

    const startEdit = (year: AcademicYear) => {
        setEditingYear(year);
        editForm.setData({
            name: year.name,
            start_date: year.start_date ? year.start_date.substring(0, 10) : '',
            end_date: year.end_date ? year.end_date.substring(0, 10) : '',
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingYear(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();
        if (!editingYear) return;

        const toastId = toast.loading('Menyimpan perubahan tahun ajaran...');

        editForm.put(`/admin/academic-years/${editingYear.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tahun ajaran berhasil diperbarui.', { id: toastId });
                cancelEdit();
            },
            onError: () => {
                toast.error('Tahun ajaran belum bisa diperbarui. Periksa kembali form.', { id: toastId });
            },
        });
    };

    const activateYear = (year: AcademicYear) => {
        router.patch(`/admin/academic-years/${year.id}/activate`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Tahun ajaran "${year.name}" berhasil diaktifkan.`);
            },
            onError: () => {
                toast.error('Gagal mengaktifkan tahun ajaran.');
            },
        });
    };

    const deleteYear = (year: AcademicYear) => {
        toast.warning(`Hapus tahun ajaran "${year.name}"?`, {
            description: 'Tindakan ini akan menghapus tahun ajaran secara permanen.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(`/admin/academic-years/${year.id}`, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('Tahun ajaran berhasil dihapus.');
                        },
                        onError: () => {
                            toast.error('Gagal menghapus tahun ajaran.');
                        },
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
            <Head title="Manajemen Tahun Ajaran" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">Tahun Ajaran</h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Kelola tahun ajaran, periode akademik, dan aktivasi tahun ajaran aktif.
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
                                <CardTitle className="text-base">Tambah Tahun Ajaran</CardTitle>
                            </div>
                            <CardDescription>
                                Buat tahun ajaran baru untuk periode akademik.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitCreate} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Tahun Ajaran</Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: 2026/2027"
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={createForm.data.start_date}
                                        onChange={(e) => createForm.setData('start_date', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.start_date} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">Tanggal Selesai</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={createForm.data.end_date}
                                        onChange={(e) => createForm.setData('end_date', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.end_date} />
                                </div>

                                <Button type="submit" className="w-full">
                                    <Plus className="mr-2 size-4" />
                                    Simpan Tahun Ajaran
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <form onSubmit={submitFilters} className="flex gap-2">
                            <Input
                                placeholder="Cari tahun ajaran..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            <Button type="submit" variant="secondary">Cari</Button>
                        </form>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Daftar Tahun Ajaran</CardTitle>
                                <CardDescription>
                                    {academic_years.total} tahun ajaran ditemukan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="px-4 py-3 font-medium">Nama</th>
                                                <th className="px-4 py-3 font-medium">Periode</th>
                                                <th className="px-4 py-3 font-medium">Kelompok</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {academic_years.data.map((year) => (
                                                <tr key={year.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">{year.name}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {new Date(year.start_date).toLocaleDateString('id-ID')} — {new Date(year.end_date).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3">{year.groups_count} kelompok</td>
                                                    <td className="px-4 py-3">
                                                        {year.is_active ? (
                                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktif</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Tidak Aktif</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            {!year.is_active && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => activateYear(year)}
                                                                >
                                                                    Aktifkan
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => startEdit(year)}
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-destructive"
                                                                onClick={() => deleteYear(year)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {academic_years.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                        Belum ada tahun ajaran.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {academic_years.links && academic_years.links.length > 3 && (
                            <div className="flex justify-center gap-1">
                                {academic_years.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url, {}, { preserveState: true, replace: true });
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Sheet open={!!editingYear} onOpenChange={(open) => !open && cancelEdit()}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Edit Tahun Ajaran</SheetTitle>
                        <SheetDescription>
                            Perbarui informasi tahun ajaran.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitEdit} className="mt-6 grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nama Tahun Ajaran</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                            />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-start_date">Tanggal Mulai</Label>
                            <Input
                                id="edit-start_date"
                                type="date"
                                value={editForm.data.start_date}
                                onChange={(e) => editForm.setData('start_date', e.target.value)}
                            />
                            <InputError message={editForm.errors.start_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-end_date">Tanggal Selesai</Label>
                            <Input
                                id="edit-end_date"
                                type="date"
                                value={editForm.data.end_date}
                                onChange={(e) => editForm.setData('end_date', e.target.value)}
                            />
                            <InputError message={editForm.errors.end_date} />
                        </div>
                        <Button type="submit" className="w-full">
                            Simpan Perubahan
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}
