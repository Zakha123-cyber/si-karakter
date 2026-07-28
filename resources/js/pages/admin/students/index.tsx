import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Users } from 'lucide-react';
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

type Student = {
    id: number;
    user_id: number;
    student_code: string;
    name: string;
    username: string;
    birth_date: string | null;
    gender: string | null;
    current_group_id: number | null;
    current_group: string | null;
    enrollment_date: string | null;
    status: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedStudents = {
    data: Student[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    students: PaginatedStudents;
    filters: {
        search: string;
        group_id: number | null;
        status: string;
    };
    groups: { id: number; name: string }[];
    statuses: string[];
};

const statusLabels: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    graduated: 'Lulus',
    transferred: 'Pindah',
};

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    graduated: 'bg-blue-100 text-blue-700',
    transferred: 'bg-yellow-100 text-yellow-700',
};

export default function AdminStudentsIndex({
    students,
    filters,
    groups,
    statuses,
}: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search || '');
    const [groupFilter, setGroupFilter] = useState(String(filters.group_id || ''));
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const createForm = useForm({
        name: '',
        username: '',
        password: '',
        password_confirmation: '',
        student_code: '',
        birth_date: '',
        gender: '',
        current_group_id: '',
        enrollment_date: '',
        status: 'active',
    });

    const editForm = useForm({
        name: '',
        username: '',
        student_code: '',
        birth_date: '',
        gender: '',
        current_group_id: '',
        enrollment_date: '',
        status: 'active',
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/students', {
            search,
            group_id: groupFilter || '',
            status: statusFilter,
        }, { preserveState: true, replace: true });
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan santri baru...');

        createForm.post('/admin/students', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Santri berhasil dibuat.', { id: toastId });
                createForm.reset();
                createForm.setData('status', 'active');
            },
            onError: () => {
                toast.error('Santri belum bisa dibuat. Periksa kembali form.', { id: toastId });
            },
        });
    };

    const startEdit = (student: Student) => {
        setEditingStudent(student);
        editForm.setData({
            name: student.name,
            username: student.username,
            student_code: student.student_code,
            birth_date: student.birth_date ? student.birth_date.substring(0, 10) : '',
            gender: student.gender || '',
            current_group_id: String(student.current_group_id || ''),
            enrollment_date: student.enrollment_date ? student.enrollment_date.substring(0, 10) : '',
            status: student.status,
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingStudent(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();
        if (!editingStudent) return;

        const toastId = toast.loading('Menyimpan perubahan santri...');

        editForm.put(`/admin/students/${editingStudent.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Santri berhasil diperbarui.', { id: toastId });
                cancelEdit();
            },
            onError: () => {
                toast.error('Santri belum bisa diperbarui. Periksa kembali form.', { id: toastId });
            },
        });
    };

    const viewStudent = (student: Student) => {
        router.get(`/admin/students/${student.id}`);
    };

    return (
        <>
            <Head title="Manajemen Santri" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">Santri</h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Kelola data santri, pendaftaran, dan penempatan kelompok.
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
                                <CardTitle className="text-base">Tambah Santri</CardTitle>
                            </div>
                            <CardDescription>
                                Daftarkan santri baru ke sistem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitCreate} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-name">Nama Lengkap</Label>
                                    <Input
                                        id="create-name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-username">Username</Label>
                                    <Input
                                        id="create-username"
                                        value={createForm.data.username}
                                        onChange={(e) => createForm.setData('username', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.username} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-password">Password</Label>
                                    <Input
                                        id="create-password"
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-password-confirm">Konfirmasi Password</Label>
                                    <Input
                                        id="create-password-confirm"
                                        type="password"
                                        value={createForm.data.password_confirmation}
                                        onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.password_confirmation} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-student-code">Kode Santri</Label>
                                    <Input
                                        id="create-student-code"
                                        value={createForm.data.student_code}
                                        onChange={(e) => createForm.setData('student_code', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.student_code} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-gender">Jenis Kelamin</Label>
                                    <Select
                                        value={createForm.data.gender}
                                        onValueChange={(v) => createForm.setData('gender', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Tidak diisi</SelectItem>
                                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={createForm.errors.gender} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-group">Kelompok</Label>
                                    <Select
                                        value={createForm.data.current_group_id}
                                        onValueChange={(v) => createForm.setData('current_group_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kelompok" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Tidak ada</SelectItem>
                                            {groups.map((g) => (
                                                <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={createForm.errors.current_group_id} />
                                </div>
                                <Button type="submit" className="w-full">
                                    <Plus className="mr-2 size-4" />
                                    Simpan Santri
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <form onSubmit={submitFilters} className="flex flex-wrap gap-2">
                            <Input
                                placeholder="Cari santri..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            <Select value={groupFilter} onValueChange={setGroupFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Semua Kelompok" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Kelompok</SelectItem>
                                    {groups.map((g) => (
                                        <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Status</SelectItem>
                                    {statuses.map((s) => (
                                        <SelectItem key={s} value={s}>{statusLabels[s] || s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary">
                                <Search className="mr-2 size-4" />
                                Cari
                            </Button>
                        </form>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Daftar Santri</CardTitle>
                                <CardDescription>
                                    {students.total} santri ditemukan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="px-4 py-3 font-medium">Kode</th>
                                                <th className="px-4 py-3 font-medium">Nama</th>
                                                <th className="px-4 py-3 font-medium">Username</th>
                                                <th className="px-4 py-3 font-medium">Kelompok</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.data.map((student) => (
                                                <tr key={student.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-mono text-xs">{student.student_code}</td>
                                                    <td className="px-4 py-3 font-medium">{student.name}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{student.username}</td>
                                                    <td className="px-4 py-3">{student.current_group || <span className="text-muted-foreground">-</span>}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge className={statusColors[student.status] || ''}>
                                                            {statusLabels[student.status] || student.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => viewStudent(student)}
                                                            >
                                                                <Eye className="size-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => startEdit(student)}
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {students.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                        Belum ada santri.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {students.links && students.links.length > 3 && (
                            <div className="flex justify-center gap-1">
                                {students.links.map((link, i) => (
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

            <Sheet open={!!editingStudent} onOpenChange={(open) => !open && cancelEdit()}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Edit Santri</SheetTitle>
                        <SheetDescription>Perbarui data santri.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitEdit} className="mt-6 grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nama Lengkap</Label>
                            <Input id="edit-name" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-username">Username</Label>
                            <Input id="edit-username" value={editForm.data.username} onChange={(e) => editForm.setData('username', e.target.value)} />
                            <InputError message={editForm.errors.username} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-student-code">Kode Santri</Label>
                            <Input id="edit-student-code" value={editForm.data.student_code} onChange={(e) => editForm.setData('student_code', e.target.value)} />
                            <InputError message={editForm.errors.student_code} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-gender">Jenis Kelamin</Label>
                            <Select value={editForm.data.gender} onValueChange={(v) => editForm.setData('gender', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tidak diisi</SelectItem>
                                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={editForm.errors.gender} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-group">Kelompok</Label>
                            <Select value={editForm.data.current_group_id} onValueChange={(v) => editForm.setData('current_group_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kelompok" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tidak ada</SelectItem>
                                    {groups.map((g) => (
                                        <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={editForm.errors.current_group_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select value={editForm.data.status} onValueChange={(v) => editForm.setData('status', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s) => (
                                        <SelectItem key={s} value={s}>{statusLabels[s] || s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={editForm.errors.status} />
                        </div>
                        <Button type="submit" className="w-full">Simpan Perubahan</Button>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}
