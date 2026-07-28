import { Head, router, useForm, usePage } from '@inertiajs/react';
import { GraduationCap, Pencil, Plus, Trash2, UserX, UserPlus } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type Group = {
    id: number;
    name: string;
    description: string | null;
    academic_year_id: number;
    academic_year: { id: number; name: string } | null;
    teacher_id: number | null;
    teacher: { id: number; name: string } | null;
    is_active: boolean;
    students_count: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedGroups = {
    data: Group[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    groups: PaginatedGroups;
    filters: {
        search: string;
        academic_year_id: number | null;
    };
    academic_years: { id: number; name: string }[];
    teachers: { id: number; name: string }[];
};

export default function AdminGroupsIndex({
    groups,
    filters,
    academic_years,
    teachers,
}: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search || '');

    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [assignStudentId, setAssignStudentId] = useState('');
    const [assigningGroup, setAssigningGroup] = useState<Group | null>(null);

    const createForm = useForm({
        academic_year_id: String(academic_years[0]?.id || ''),
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

    const assignForm = useForm({
        student_id: '',
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/groups', { search }, { preserveState: true, replace: true });
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan kelompok baru...');

        createForm.post('/admin/groups', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kelompok berhasil dibuat.', { id: toastId });
                createForm.reset();
                createForm.setData('academic_year_id', String(academic_years[0]?.id || ''));
            },
            onError: () => {
                toast.error('Kelompok belum bisa dibuat. Periksa kembali form.', { id: toastId });
            },
        });
    };

    const startEdit = (group: Group) => {
        setEditingGroup(group);
        editForm.setData({
            academic_year_id: String(group.academic_year_id),
            name: group.name,
            description: group.description || '',
            teacher_id: String(group.teacher_id || ''),
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

        const toastId = toast.loading('Menyimpan perubahan kelompok...');

        editForm.put(`/admin/groups/${editingGroup.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kelompok berhasil diperbarui.', { id: toastId });
                cancelEdit();
            },
            onError: () => {
                toast.error('Kelompok belum bisa diperbarui. Periksa kembali form.', { id: toastId });
            },
        });
    };

    const deleteGroup = (group: Group) => {
        toast.warning(`Hapus kelompok "${group.name}"?`, {
            description: 'Tindakan ini akan menghapus kelompok secara permanen.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(`/admin/groups/${group.id}`, {
                        preserveScroll: true,
                        onSuccess: () => toast.success('Kelompok berhasil dihapus.'),
                        onError: () => toast.error('Gagal menghapus kelompok.'),
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

    const startAssign = (group: Group) => {
        setAssigningGroup(group);
        setAssignStudentId('');
        assignForm.reset();
        assignForm.clearErrors();
    };

    const cancelAssign = () => {
        setAssigningGroup(null);
        setAssignStudentId('');
        assignForm.reset();
    };

    const submitAssign = (event: FormEvent) => {
        event.preventDefault();
        if (!assigningGroup) return;

        const toastId = toast.loading('Menambahkan santri ke kelompok...');

        assignForm.post(`/admin/groups/${assigningGroup.id}/students`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Santri berhasil ditambahkan ke kelompok.', { id: toastId });
                cancelAssign();
            },
            onError: () => {
                toast.error('Gagal menambahkan santri.', { id: toastId });
            },
        });
    };

    const removeStudent = (groupId: number, studentId: number, studentName: string) => {
        toast.warning(`Keluarkan santri "${studentName}" dari kelompok?`, {
            action: {
                label: 'Keluarkan',
                onClick: () => {
                    router.delete(`/admin/groups/${groupId}/students/${studentId}`, {
                        preserveScroll: true,
                        onSuccess: () => toast.success('Santri berhasil dikeluarkan.'),
                        onError: () => toast.error('Gagal mengeluarkan santri.'),
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
            <Head title="Manajemen Kelompok" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">Kelompok</h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Kelola kelompok/kelas, tentukan ustadz pendamping, dan atur santri dalam kelompok.
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
                            <CardDescription>
                                Buat kelompok/kelas baru.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitCreate} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-academic-year">Tahun Ajaran</Label>
                                    <Select
                                        value={createForm.data.academic_year_id}
                                        onValueChange={(v) => createForm.setData('academic_year_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tahun ajaran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academic_years.map((ay) => (
                                                <SelectItem key={ay.id} value={String(ay.id)}>{ay.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={createForm.errors.academic_year_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create-name">Nama Kelompok</Label>
                                    <Input
                                        id="create-name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contoh: Kelas 1A"
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create-description">Deskripsi (opsional)</Label>
                                    <Input
                                        id="create-description"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.description} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="create-teacher">Ustadz Pendamping (opsional)</Label>
                                    <Select
                                        value={createForm.data.teacher_id}
                                        onValueChange={(v) => createForm.setData('teacher_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih ustadz" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Tidak ada</SelectItem>
                                            {teachers.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={createForm.errors.teacher_id} />
                                </div>

                                <Button type="submit" className="w-full">
                                    <Plus className="mr-2 size-4" />
                                    Simpan Kelompok
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <form onSubmit={submitFilters} className="flex gap-2">
                            <Input
                                placeholder="Cari kelompok..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            <Button type="submit" variant="secondary">Cari</Button>
                        </form>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Daftar Kelompok</CardTitle>
                                <CardDescription>
                                    {groups.total} kelompok ditemukan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="px-4 py-3 font-medium">Nama</th>
                                                <th className="px-4 py-3 font-medium">Tahun Ajaran</th>
                                                <th className="px-4 py-3 font-medium">Ustadz</th>
                                                <th className="px-4 py-3 font-medium">Santri</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groups.data.map((group) => (
                                                <tr key={group.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">{group.name}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {group.academic_year?.name || '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {group.teacher?.name || (
                                                            <span className="text-muted-foreground">Belum ditentukan</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">{group.students_count} santri</td>
                                                    <td className="px-4 py-3">
                                                        {group.is_active ? (
                                                            <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Tidak Aktif</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => startAssign(group)}
                                                            >
                                                                <UserPlus className="mr-1 size-3" />
                                                                Assign
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => startEdit(group)}
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-destructive"
                                                                onClick={() => deleteGroup(group)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {groups.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                        Belum ada kelompok.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {groups.links && groups.links.length > 3 && (
                            <div className="flex justify-center gap-1">
                                {groups.links.map((link, i) => (
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

            <Sheet open={!!editingGroup} onOpenChange={(open) => !open && cancelEdit()}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Edit Kelompok</SheetTitle>
                        <SheetDescription>Perbarui informasi kelompok.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitEdit} className="mt-6 grid gap-4">
                        <div className="grid gap-2">
                            <Label>Tahun Ajaran</Label>
                            <Select
                                value={editForm.data.academic_year_id}
                                onValueChange={(v) => editForm.setData('academic_year_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {academic_years.map((ay) => (
                                        <SelectItem key={ay.id} value={String(ay.id)}>{ay.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={editForm.errors.academic_year_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nama Kelompok</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                            />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Deskripsi</Label>
                            <Input
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                            />
                            <InputError message={editForm.errors.description} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Ustadz Pendamping</Label>
                            <Select
                                value={editForm.data.teacher_id}
                                onValueChange={(v) => editForm.setData('teacher_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tidak ada</SelectItem>
                                    {teachers.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={editForm.errors.teacher_id} />
                        </div>
                        <Button type="submit" className="w-full">Simpan Perubahan</Button>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet open={!!assigningGroup} onOpenChange={(open) => !open && cancelAssign()}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Tambah Santri ke Kelompok</SheetTitle>
                        <SheetDescription>
                            Masukkan ID santri untuk menambahkan ke kelompok {assigningGroup?.name}.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitAssign} className="mt-6 grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="assign-student">ID Santri</Label>
                            <Input
                                id="assign-student"
                                value={assignForm.data.student_id}
                                onChange={(e) => assignForm.setData('student_id', e.target.value)}
                                placeholder="Masukkan ID santri"
                                type="number"
                            />
                            <InputError message={assignForm.errors.student_id} />
                        </div>
                        <Button type="submit" className="w-full">
                            <UserPlus className="mr-2 size-4" />
                            Tambahkan Santri
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}
