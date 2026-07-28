import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
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

type StudentOpt = {
    id: number;
    student_code: string;
    user: { id: number; name: string } | null;
    current_group_id: number | null;
    current_group: { id: number; name: string; academic_year_id: number } | null;
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

type AcademicYearOpt = { id: number; name: string; is_active: boolean };

type Props = {
    groups: PaginatedData;
    academic_years: AcademicYearOpt[];
    teachers: { id: number; name: string }[];
    students: StudentOpt[];
    filters: {
        search: string;
        academic_year_id: number;
    };
};

function StudentCheckboxList({
    students,
    selectedIds,
    onChange,
    showOnlyUnassigned,
}: {
    students: StudentOpt[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    showOnlyUnassigned?: boolean;
}) {
    const [q, setQ] = useState('');

    const filtered = students.filter((s) => {
        if (showOnlyUnassigned && s.current_group_id) return false;
        if (!s.user) return false;
        return (
            !q ||
            s.user.name.toLowerCase().includes(q.toLowerCase()) ||
            s.student_code.toLowerCase().includes(q.toLowerCase())
        );
    });

    const toggle = (id: number) => {
        onChange(
            selectedIds.includes(id)
                ? selectedIds.filter((i) => i !== id)
                : [...selectedIds, id],
        );
    };

    return (
        <div className="grid gap-2">
            <Label>Pilih Santri untuk Kelompok Ini</Label>
            <div className="relative">
                <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    placeholder="Cari santri..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                {q && (
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setQ('')}>
                        <X className="size-4" />
                    </button>
                )}
            </div>
            <div className="max-h-48 overflow-y-auto rounded-md border p-1">
                {filtered.length === 0 ? (
                    <p className="p-2 text-xs text-muted-foreground">Tidak ada santri</p>
                ) : (
                    filtered.map((s) => (
                        <label
                            key={s.id}
                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                        >
                            <input
                                type="checkbox"
                                className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={selectedIds.includes(s.id)}
                                onChange={() => toggle(s.id)}
                            />
                            <span>{s.user!.name}</span>
                            <span className="text-xs text-muted-foreground">({s.student_code})</span>
                            {s.current_group && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                    {s.current_group.name}
                                </Badge>
                            )}
                        </label>
                    ))
                )}
            </div>
        </div>
    );
}

export default function AdminGroupsIndex({ groups, academic_years, teachers, students, filters }: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search);
    const [academicYearFilter, setAcademicYearFilter] = useState(String(filters.academic_year_id || ''));
    const [editingGroup, setEditingGroup] = useState<GroupRow | null>(null);
    const [viewGroup, setViewGroup] = useState<GroupRow | null>(null);
    const [assignGroup, setAssignGroup] = useState<GroupRow | null>(null);

    const createForm = useForm({
        academic_year_id: '',
        name: '',
        description: '',
        teacher_id: '',
        is_active: true,
        student_ids: [] as number[],
    });

    const editForm = useForm({
        academic_year_id: '',
        name: '',
        description: '',
        teacher_id: '',
        is_active: true,
        student_ids: [] as number[],
    });

    const assignForm = useForm({
        student_ids: [] as number[],
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
        const groupStudentIds = students
            .filter((s) => s.current_group_id === group.id)
            .map((s) => s.id);
        editForm.setData({
            academic_year_id: String(group.academic_year_id),
            name: group.name,
            description: group.description ?? '',
            teacher_id: String(group.teacher_id ?? ''),
            is_active: group.is_active,
            student_ids: groupStudentIds,
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

    const startAssign = (group: GroupRow) => {
        setAssignGroup(group);
        const groupStudentIds = students
            .filter((s) => s.current_group_id === group.id)
            .map((s) => s.id);
        assignForm.setData({ student_ids: groupStudentIds });
        assignForm.clearErrors();
    };

    const cancelAssign = () => {
        setAssignGroup(null);
        assignForm.reset();
    };

    const submitAssign = (event: FormEvent) => {
        event.preventDefault();
        if (!assignGroup) return;
        const toastId = toast.loading('Menyimpan...');
        assignForm.post(`/admin/groups/${assignGroup.id}/students`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Santri diperbarui.', { id: toastId });
                cancelAssign();
            },
            onError: () => toast.error('Periksa kembali.', { id: toastId }),
        });
    };

    const startView = (group: GroupRow) => setViewGroup(group);
    const cancelView = () => setViewGroup(null);

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
                        Buat kelompok dan atur penempatan santri di dalamnya.
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
                                    <Label htmlFor="name">Nama Kelompok</Label>
                                    <Input id="name" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} placeholder="Misal: Kelas 1A, Kelas 1B" />
                                    <InputError message={createForm.errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="academic_year_id">Tahun Ajaran</Label>
                                    <select id="academic_year_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={createForm.data.academic_year_id} onChange={(e) => createForm.setData('academic_year_id', e.target.value)}>
                                        <option value="">Pilih tahun ajaran</option>
                                        {academic_years.map((ay) => <option key={ay.id} value={ay.id}>{ay.name}{ay.is_active ? ' (Aktif)' : ''}</option>)}
                                    </select>
                                    <InputError message={createForm.errors.academic_year_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="teacher_id">Ustadz Pendamping</Label>
                                    <select id="teacher_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={createForm.data.teacher_id} onChange={(e) => createForm.setData('teacher_id', e.target.value)}>
                                        <option value="">Pilih ustadz pendamping</option>
                                        {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <InputError message={createForm.errors.teacher_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Deskripsi Kelompok</Label>
                                    <Input id="description" value={createForm.data.description} onChange={(e) => createForm.setData('description', e.target.value)} />
                                </div>
                                <StudentCheckboxList
                                    students={students}
                                    selectedIds={createForm.data.student_ids}
                                    onChange={(ids) => createForm.setData('student_ids', ids)}
                                    showOnlyUnassigned
                                />
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
                                        {academic_years.map((ay) => <option key={ay.id} value={ay.id}>{ay.name}{ay.is_active ? ' (Aktif)' : ''}</option>)}
                                    </select>
                                    <Button type="submit" variant="outline">Filter</Button>
                                </form>

                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-muted/50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Nama Kelompok</th>
                                                <th className="px-4 py-3 font-medium">Tahun Ajaran</th>
                                                <th className="px-4 py-3 font-medium">Ustadz Pendamping</th>
                                                <th className="px-4 py-3 font-medium">Jumlah Santri</th>
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
                                                            <Button type="button" size="sm" variant="outline" onClick={() => startView(group)}>
                                                                <Eye className="size-4" />
                                                            </Button>
                                                            <Button type="button" size="sm" variant="outline" onClick={() => startAssign(group)}>
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

            <Sheet open={viewGroup !== null} onOpenChange={(open) => { if (!open) cancelView(); }}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Santri di {viewGroup?.name}</SheetTitle>
                        <SheetDescription>
                            {students.filter((s) => s.current_group_id === viewGroup?.id).length} santri terdaftar
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-2 px-4 pb-4">
                        {students
                            .filter((s) => s.current_group_id === viewGroup?.id)
                            .map((s) => (
                                <div key={s.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                        {s.user?.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate">{s.user?.name}</div>
                                        <div className="text-xs text-muted-foreground">{s.student_code}</div>
                                    </div>
                                    <Badge variant={s.current_group_id === viewGroup?.id ? 'secondary' : 'outline'}>
                                        {s.current_group_id === viewGroup?.id ? 'Aktif' : '-'}
                                    </Badge>
                                </div>
                            ))}
                        {students.filter((s) => s.current_group_id === viewGroup?.id).length === 0 && (
                            <p className="text-sm text-muted-foreground py-4 text-center">Belum ada santri di kelompok ini.</p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet open={editingGroup !== null} onOpenChange={(open) => { if (!open) cancelEdit(); }}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Edit Kelompok</SheetTitle>
                        <SheetDescription>{editingGroup?.name}</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitEdit} className="grid gap-4 px-4 pb-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name">Nama Kelompok</Label>
                            <Input id="edit_name" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_academic_year_id">Tahun Ajaran</Label>
                            <select id="edit_academic_year_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={editForm.data.academic_year_id} onChange={(e) => editForm.setData('academic_year_id', e.target.value)}>
                                <option value="">Pilih</option>
                                {academic_years.map((ay) => <option key={ay.id} value={ay.id}>{ay.name}{ay.is_active ? ' (Aktif)' : ''}</option>)}
                            </select>
                            <InputError message={editForm.errors.academic_year_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_teacher_id">Ustadz</Label>
                            <select id="edit_teacher_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={editForm.data.teacher_id} onChange={(e) => editForm.setData('teacher_id', e.target.value)}>
                                <option value="">Pilih ustadz pendamping</option>
                                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <InputError message={editForm.errors.teacher_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_description">Deskripsi Kelompok</Label>
                            <Input id="edit_description" value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} />
                        </div>
                        <StudentCheckboxList
                            students={students}
                            selectedIds={editForm.data.student_ids}
                            onChange={(ids) => editForm.setData('student_ids', ids)}
                        />
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={editForm.processing}>Simpan</Button>
                            <Button type="button" variant="outline" onClick={cancelEdit}>Batal</Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet open={assignGroup !== null} onOpenChange={(open) => { if (!open) cancelAssign(); }}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Atur Santri</SheetTitle>
                        <SheetDescription>{assignGroup?.name}</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitAssign} className="grid gap-4 px-4 pb-4">
                        <StudentCheckboxList
                            students={students}
                            selectedIds={assignForm.data.student_ids}
                            onChange={(ids) => assignForm.setData('student_ids', ids)}
                        />
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={assignForm.processing}>Simpan</Button>
                            <Button type="button" variant="outline" onClick={cancelAssign}>Batal</Button>
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
