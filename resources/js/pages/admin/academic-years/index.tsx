import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { dashboard } from '@/routes';

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

type PaginatedData = {
    data: AcademicYear[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    academic_years: PaginatedData;
    filters: {
        search: string;
    };
};

export default function AdminAcademicYearsIndex({ academic_years, filters }: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search);
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
        is_active: false,
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/academic-years', { search }, { preserveState: true, replace: true });
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan tahun ajaran...');
        createForm.post('/admin/academic-years', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tahun ajaran berhasil dibuat.', { id: toastId });
                createForm.reset();
            },
            onError: () => {
                toast.error('Periksa kembali form.', { id: toastId });
            },
        });
    };

    const startEdit = (year: AcademicYear) => {
        setEditingYear(year);
        editForm.setData({
            name: year.name,
            start_date: year.start_date,
            end_date: year.end_date,
            is_active: year.is_active,
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
        const toastId = toast.loading('Menyimpan perubahan...');
        editForm.put(`/admin/academic-years/${editingYear.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tahun ajaran berhasil diperbarui.', { id: toastId });
                cancelEdit();
            },
            onError: () => {
                toast.error('Periksa kembali form.', { id: toastId });
            },
        });
    };

    const activateYear = (year: AcademicYear) => {
        if (year.is_active) return;
        const toastId = toast.loading('Mengaktifkan tahun ajaran...');
        router.patch(`/admin/academic-years/${year.id}/activate`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Tahun ajaran diaktifkan.', { id: toastId }),
            onError: () => toast.error('Gagal mengaktifkan.', { id: toastId }),
        });
    };

    const deleteYear = (year: AcademicYear) => {
        toast.warning(`Hapus ${year.name}?`, {
            description: 'Data tidak dapat dikembalikan.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    const toastId = toast.loading('Menghapus...');
                    router.delete(`/admin/academic-years/${year.id}`, {
                        preserveScroll: true,
                        onSuccess: () => toast.success('Tahun ajaran dihapus.', { id: toastId }),
                        onError: () => toast.error('Gagal menghapus.', { id: toastId }),
                    });
                },
            },
            cancel: { label: 'Batal', onClick: () => undefined },
            duration: 10000,
        });
    };

    return (
        <>
            <Head title="Tahun Ajaran" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">Tahun Ajaran</h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Kelola tahun ajaran untuk pengelompokan santri dan kegiatan akademik.
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
                            <CardDescription>Buat tahun ajaran baru.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitCreate} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input id="name" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} />
                                    <InputError message={createForm.errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                                    <Input id="start_date" type="date" value={createForm.data.start_date} onChange={(e) => createForm.setData('start_date', e.target.value)} />
                                    <InputError message={createForm.errors.start_date} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">Tanggal Selesai</Label>
                                    <Input id="end_date" type="date" value={createForm.data.end_date} onChange={(e) => createForm.setData('end_date', e.target.value)} />
                                    <InputError message={createForm.errors.end_date} />
                                </div>
                                <Button type="submit" disabled={createForm.processing}>Simpan</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex min-w-0 flex-col gap-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">Daftar Tahun Ajaran</CardTitle>
                                </div>
                                <CardDescription>{academic_years.from ?? 0}-{academic_years.to ?? 0} dari {academic_years.total}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <form onSubmit={submitFilters} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama tahun ajaran" />
                                    <Button type="submit" variant="outline">Filter</Button>
                                </form>

                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[660px] text-sm">
                                        <thead className="bg-muted/50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Nama</th>
                                                <th className="px-4 py-3 font-medium">Periode</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium">Kelompok</th>
                                                <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {academic_years.data.map((year) => (
                                                <tr key={year.id} className="border-t">
                                                    <td className="px-4 py-3 font-medium">{year.name}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {year.start_date} - {year.end_date}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={year.is_active ? 'secondary' : 'outline'}>
                                                            {year.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">{year.groups_count}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Button type="button" size="sm" variant="outline" onClick={() => startEdit(year)}>
                                                                <Pencil className="size-4" /> Edit
                                                            </Button>
                                                            {!year.is_active && (
                                                                <Button type="button" size="sm" variant="outline" onClick={() => activateYear(year)}>
                                                                    Aktifkan
                                                                </Button>
                                                            )}
                                                            <Button type="button" size="sm" variant="outline" onClick={() => deleteYear(year)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {academic_years.links.map((link) => (
                                        <Button key={`${link.label}-${link.url}`} type="button" size="sm" variant={link.active ? 'default' : 'outline'} disabled={!link.url} onClick={() => { if (link.url) router.visit(link.url, { preserveScroll: true }); }}>
                                            {link.label === '&laquo; Previous' || link.label.toLowerCase().includes('previous') ? <><ChevronLeft className="size-4" /><span className="sr-only">Sebelumnya</span></>
                                                : link.label === 'Next &raquo;' || link.label.toLowerCase().includes('next') ? <><ChevronRight className="size-4" /><span className="sr-only">Berikutnya</span></>
                                                    : <span>{link.label}</span>}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Sheet open={editingYear !== null} onOpenChange={(open) => { if (!open) cancelEdit(); }}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <Pencil className="size-5 text-muted-foreground" />
                            <SheetTitle>Edit Tahun Ajaran</SheetTitle>
                        </div>
                        <SheetDescription>{editingYear?.name}</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitEdit} className="grid gap-4 px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Nama</Label>
                            <Input id="edit_name" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_start_date">Tanggal Mulai</Label>
                            <Input id="edit_start_date" type="date" value={editForm.data.start_date} onChange={(e) => editForm.setData('start_date', e.target.value)} />
                            <InputError message={editForm.errors.start_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_end_date">Tanggal Selesai</Label>
                            <Input id="edit_end_date" type="date" value={editForm.data.end_date} onChange={(e) => editForm.setData('end_date', e.target.value)} />
                            <InputError message={editForm.errors.end_date} />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={editForm.processing}>Simpan Perubahan</Button>
                            <Button type="button" variant="outline" onClick={cancelEdit}>Batal</Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}

AdminAcademicYearsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Tahun Ajaran', href: '/admin/academic-years' },
    ],
};
