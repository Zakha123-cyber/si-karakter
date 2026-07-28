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

type GroupRow = {
    id: number;
    name: string;
    description: string | null;
    academic_year_id: number;
    teacher_id: number | null;
    is_active: boolean;
    students_count: number;
    academic_year: { id: number; name: string } | null;
    teacher: { id: number; name: string } | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedData = {
    data: GroupRow[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    groups: PaginatedData;
    academic_years: { id: number; name: string }[];
    teachers: { id: number; name: string }[];
    filters: {
        search: string;
        academic_year_id: number;
    };
};

export default function AdminGroupsIndex({ groups, academic_years, teachers, filters }: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search);
    const [academicYearFilter, setAcademicYearFilter] = useState(String(filters.academic_year_id || ''));
    const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
    const [assignGroup, setAssignGroup] = useState<GroupRow | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<string>('');

    const createForm = useForm({
        academic_year_id: '',
        name: '',
        description: '',
        teacher_id: '',
        is_active: true,
    });

    const editForm = useForm({
        academic_year_id: '',
        name: '',
        description: '',
        teacher_id: '',
        is_active: true,
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/groups', { search, academic_year_id: academicYearFilter }, { preserveState: true, replace: true });
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan kelompok...');
        createForm.post('/admin/groups', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kelompok berhasil dibuat.', { id: toastId });
                createForm.reset();
            },
            onError: () => toast.error('Periksa kembali form.', { id: toastId }),
        });
    };

    const startEdit = (group: GroupRow) => {
        setEditingGroup(group);
        editForm.setData({
            academic_year_id: String(group.academic_year_id),
            name: group.name,
            description: group.description ?? '',
            teacher_id: String(group.teacher_id ?? ''),
            is_active: group.is_active,
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingGroup(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();
        if (!editingGroup) return;
        const toastId = toast.loading('Menyimpan perubahan...');
        editForm.put(`/admin/groups/${editingGroup.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kelompok berhasil diperbarui.', { id: toastId });
                cancelEdit();
            },
            onError: () => toast.error('Periksa kembali form.', { id: toastId }),
        });
    };

    const deleteGroup = (group: GroupRow) => {
        toast.warning(`Hapus ${group.name}?`, {
            description: 'Kelompok dengan santri tidak dapat dihapus.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    const toastId = toast.loading('Menghapus...');
                    router.delete(`/admin/groups/${group.id}`, {
                        preserveScroll: true,
                        onSuccess: () => toast.success('Kelompok dihapus.', { id: toastId }),
                        onError: () => toast.error('Gagal menghapus.', { id: toastId }),
                    });
                },
            },
            cancel: { label: 'Batal', onClick: () => undefined },
            duration: 10000,
        });
    };

    const submitAssign = (event: FormEvent) => {
        event.preventDefault();
        if (!assignGroup) return;
        const studentIds = selectedStudents.split(',').map(s => s.trim()).filter(Boolean).map(Number);
        if (studentIds.length === 0) return;
        const toastId = toast.loading('Menambahkan santri...');
        router.post(`/admin/groups/${assignGroup.id}/students`, { student_ids: studentIds }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Santri ditambahkan.', { id: toastId });
                setAssignGroup(null);
                setSelectedStudents('');
            },
            onError: () => toast.error('Gagal menambahkan.', { id: toastId }),
        });
    };

    return (
        <>
            <Head title="Kelompok" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">Kelompok</h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Kelola kelompok/kelas santri dan penempatan ustadz pendamping.
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
                                <CardTitle className="text-base">Tambah Kelompok</CardTitle>
                            </div>
                            <CardDescription>Buat kelompok baru.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitCreate} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input id="name" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} />
                                    <InputError message={createForm.errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="academic_year_id">Tahun Ajaran</Label>
                                    <select id="academic_year_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={createForm.data.academic_year_id} onChange={(e) => createForm.setData('academic_year_id', e.target.value)}>
                                        <option value="">Pilih tahun ajaran</option>
                                        {academic_years.map((ay) => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                                    </select>
                                    <InputError message={createForm.errors.academic_year_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="teacher_id">Ustadz Pendamping</Label>
                                    <select id="teacher_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={createForm.data.teacher_id} onChange={(e) => createForm.setData('teacher_id', e.target.value)}>
                                        <option value="">Pilih ustadz</option>
                                        {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <InputError message={createForm.errors.teacher_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Input id="description" value={createForm.data.description} onChange={(e) => createForm.setData('description', e.target.value)} />
                                </div>
                                <Button type="submit" disabled={createForm.processing}>Simpan</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex min-w-0 flex-col gap-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="text-base">Daftar Kelompok</CardTitle>
                                <CardDescription>{groups.from ?? 0}-{groups.to ?? 0} dari {groups.total}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <form onSubmit={submitFilters} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto]">
                                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama kelompok" />
                                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)}>
                                        <option value="">Semua tahun ajaran</option>
                                        {academic_years.map((ay) => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                                    </select>
                                    <Button type="submit" variant="outline">Filter</Button>
                                </form>

                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-muted/50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Nama</th>
                                                <th className="px-4 py-3 font-medium">Tahun Ajaran</th>
                                                <th className="px-4 py-3 font-medium">Ustadz</th>
                                                <th className="px-4 py-3 font-medium">Santri</th>
                                                <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groups.data.map((group) => (
                                                <tr key={group.id} className="border-t">
                                                    <td className="px-4 py-3 font-medium">{group.name}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{group.academic_year?.name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{group.teacher?.name ?? '-'}</td>
                                                    <td className="px-4 py-3">{group.students_count}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Button type="button" size="sm" variant="outline" onClick={() => { setAssignGroup(group); setSelectedStudents(''); }}>
                                                                + Santri
                                                            </Button>
                                                            <Button type="button" size="sm" variant="outline" onClick={() => startEdit(group)}>
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                            <Button type="button" size="sm" variant="outline" onClick={() => deleteGroup(group)}>
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
                                    {groups.links.map((link) => (
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

            <Sheet open={editingGroup !== null} onOpenChange={(open) => { if (!open) cancelEdit(); }}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Edit Kelompok</SheetTitle>
                        <SheetDescription>{editingGroup?.name}</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitEdit} className="grid gap-4 px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Nama</Label>
                            <Input id="edit_name" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_academic_year_id">Tahun Ajaran</Label>
                            <select id="edit_academic_year_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={editForm.data.academic_year_id} onChange={(e) => editForm.setData('academic_year_id', e.target.value)}>
                                <option value="">Pilih</option>
                                {academic_years.map((ay) => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
                            </select>
                            <InputError message={editForm.errors.academic_year_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_teacher_id">Ustadz</Label>
                            <select id="edit_teacher_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={editForm.data.teacher_id} onChange={(e) => editForm.setData('teacher_id', e.target.value)}>
                                <option value="">Pilih</option>
                                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <InputError message={editForm.errors.teacher_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_description">Deskripsi</Label>
                            <Input id="edit_description" value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={editForm.processing}>Simpan</Button>
                            <Button type="button" variant="outline" onClick={cancelEdit}>Batal</Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet open={assignGroup !== null} onOpenChange={(open) => { if (!open) { setAssignGroup(null); setSelectedStudents(''); } }}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Tambah Santri ke Kelompok</SheetTitle>
                        <SheetDescription>{assignGroup?.name}</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitAssign} className="grid gap-4 px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="student_ids">ID Santri (pisahkan dengan koma)</Label>
                            <Input id="student_ids" value={selectedStudents} onChange={(e) => setSelectedStudents(e.target.value)} placeholder="1, 2, 3" />
                            <p className="text-xs text-muted-foreground">Masukkan ID santri yang akan ditambahkan, pisahkan dengan koma.</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit">Tambahkan</Button>
                            <Button type="button" variant="outline" onClick={() => { setAssignGroup(null); setSelectedStudents(''); }}>Batal</Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}

AdminGroupsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Kelompok', href: '/admin/groups' },
    ],
};
