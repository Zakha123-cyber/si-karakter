import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { dashboard } from '@/routes';

type StudentRow = {
    id: number;
    user_id: number;
    student_code: string;
    birth_date: string | null;
    gender: string | null;
    current_group_id: number | null;
    status: string;
    user: { id: number; name: string; username: string } | null;
    current_group: { id: number; name: string } | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedData = {
    data: StudentRow[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    students: PaginatedData;
    groups: { id: number; name: string }[];
    users: { id: number; name: string; username: string }[];
    filters: {
        search: string;
        current_group_id: number;
        status: string;
    };
};

const statusLabel: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Nonaktif',
    graduated: 'Lulus',
    transferred: 'Pindah',
};

const statusVariant: Record<
    string,
    'secondary' | 'outline' | 'destructive' | 'default'
> = {
    active: 'secondary',
    inactive: 'destructive',
    graduated: 'default',
    transferred: 'outline',
};

export default function AdminStudentsIndex({
    students,
    groups,
    users,
    filters,
}: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search);
    const [groupFilter, setGroupFilter] = useState(
        String(filters.current_group_id || ''),
    );
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [editingStudent, setEditingStudent] = useState<StudentRow | null>(
        null,
    );

    const createForm = useForm({
        user_id: '',
        student_code: '',
        birth_date: '',
        gender: '',
        status: 'active',
    });

    const editForm = useForm({
        student_code: '',
        birth_date: '',
        gender: '',
        status: 'active',
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            '/admin/students',
            { search, current_group_id: groupFilter, status: statusFilter },
            { preserveState: true, replace: true },
        );
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan santri...');
        createForm.post('/admin/students', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Santri berhasil dibuat.', { id: toastId });
                createForm.reset();
            },
            onError: () =>
                toast.error('Periksa kembali form.', { id: toastId }),
        });
    };

    const startEdit = (student: StudentRow) => {
        setEditingStudent(student);
        editForm.setData({
            student_code: student.student_code,
            birth_date: student.birth_date ?? '',
            gender: student.gender ?? '',
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

        if (!editingStudent) {
            return;
        }

        const toastId = toast.loading('Menyimpan perubahan...');
        editForm.put(`/admin/students/${editingStudent.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Santri berhasil diperbarui.', { id: toastId });
                cancelEdit();
            },
            onError: () =>
                toast.error('Periksa kembali form.', { id: toastId }),
        });
    };

    const toggleStatus = (student: StudentRow) => {
        const newStatus = student.status === 'active' ? 'inactive' : 'active';
        const toastId = toast.loading('Mengubah status...');
        router.patch(
            `/admin/students/${student.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Status diperbarui.', { id: toastId }),
                onError: () =>
                    toast.error('Gagal memperbarui status.', { id: toastId }),
            },
        );
    };

    const deleteStudent = (student: StudentRow) => {
        toast.warning(`Hapus ${student.user?.name}?`, {
            description: 'Data santri dan riwayat kelompok akan dihapus.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    const toastId = toast.loading('Menghapus...');
                    router.delete(`/admin/students/${student.id}`, {
                        preserveScroll: true,
                        onSuccess: () =>
                            toast.success('Santri dihapus.', { id: toastId }),
                        onError: (errors) => {
                            const msg =
                                errors?.error ??
                                errors?.message ??
                                'Gagal menghapus.';
                            toast.error(Array.isArray(msg) ? msg[0] : msg, {
                                id: toastId,
                            });
                        },
                    });
                },
            },
            cancel: { label: 'Batal', onClick: () => undefined },
            duration: 10000,
        });
    };

    return (
        <>
            <Head title="Santri" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Santri
                        </h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Daftar dan kelola data santri.
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
                                    Tambah Santri
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Buat data santri baru.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitCreate}
                                className="grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="user_id">Akun Santri</Label>
                                    <select
                                        id="user_id"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={createForm.data.user_id}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'user_id',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Pilih akun santri
                                        </option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} (@{u.username})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={createForm.errors.user_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="student_code">
                                        Kode Santri (NIS)
                                    </Label>
                                    <Input
                                        id="student_code"
                                        value={createForm.data.student_code}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'student_code',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Masukkan NIS santri"
                                    />
                                    <InputError
                                        message={createForm.errors.student_code}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="gender">
                                        Jenis Kelamin
                                    </Label>
                                    <select
                                        id="gender"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={createForm.data.gender}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'gender',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Pilih jenis kelamin
                                        </option>
                                        <option value="male">Laki-laki</option>
                                        <option value="female">
                                            Perempuan
                                        </option>
                                    </select>
                                    <InputError
                                        message={createForm.errors.gender}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="birth_date">
                                        Tanggal Lahir
                                    </Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={createForm.data.birth_date}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'birth_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={createForm.errors.birth_date}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                >
                                    Simpan
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex min-w-0 flex-col gap-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Daftar Santri
                                </CardTitle>
                                <CardDescription>
                                    {students.from ?? 0}-{students.to ?? 0} dari{' '}
                                    {students.total}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <form
                                    onSubmit={submitFilters}
                                    className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_150px_auto]"
                                >
                                    <Input
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Cari santri..."
                                    />
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={groupFilter}
                                        onChange={(e) =>
                                            setGroupFilter(e.target.value)
                                        }
                                    >
                                        <option value="">Semua kelompok</option>
                                        {groups.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                    >
                                        <option value="">Semua status</option>
                                        <option value="active">Aktif</option>
                                        <option value="inactive">
                                            Nonaktif
                                        </option>
                                        <option value="graduated">Lulus</option>
                                        <option value="transferred">
                                            Pindah
                                        </option>
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
                                                    Nama Santri
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    NIS
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Kelompok
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
                                            {students.data.map((student) => (
                                                <tr
                                                    key={student.id}
                                                    className="border-t"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">
                                                            {student.user
                                                                ?.name ?? '-'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            @
                                                            {
                                                                student.user
                                                                    ?.username
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-medium">
                                                        {student.student_code}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {student.current_group
                                                            ?.name ?? '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={
                                                                statusVariant[
                                                                    student
                                                                        .status
                                                                ] ?? 'outline'
                                                            }
                                                        >
                                                            {statusLabel[
                                                                student.status
                                                            ] ?? student.status}
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
                                                                        student,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    toggleStatus(
                                                                        student,
                                                                    )
                                                                }
                                                            >
                                                                {student.status ===
                                                                'active'
                                                                    ? 'Nonaktifkan'
                                                                    : 'Aktifkan'}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    deleteStudent(
                                                                        student,
                                                                    )
                                                                }
                                                            >
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
                                    {students.links.map((link) => (
                                        <Button
                                            key={`${link.label}-${link.url}`}
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
                                            {link.label ===
                                                '&laquo; Previous' ||
                                            link.label
                                                .toLowerCase()
                                                .includes('previous') ? (
                                                <>
                                                    <ChevronLeft className="size-4" />
                                                    <span className="sr-only">
                                                        Sebelumnya
                                                    </span>
                                                </>
                                            ) : link.label === 'Next &raquo;' ||
                                              link.label
                                                  .toLowerCase()
                                                  .includes('next') ? (
                                                <>
                                                    <ChevronRight className="size-4" />
                                                    <span className="sr-only">
                                                        Berikutnya
                                                    </span>
                                                </>
                                            ) : (
                                                <span>{link.label}</span>
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Sheet
                open={editingStudent !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        cancelEdit();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Edit Santri</SheetTitle>
                        <SheetDescription>
                            {editingStudent?.user?.name} (
                            {editingStudent?.student_code})
                        </SheetDescription>
                    </SheetHeader>
                    <form
                        onSubmit={submitEdit}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="edit_student_code">
                                Kode Santri (NIS)
                            </Label>
                            <Input
                                id="edit_student_code"
                                value={editForm.data.student_code}
                                onChange={(e) =>
                                    editForm.setData(
                                        'student_code',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={editForm.errors.student_code}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_gender">Jenis Kelamin</Label>
                            <select
                                id="edit_gender"
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={editForm.data.gender}
                                onChange={(e) =>
                                    editForm.setData('gender', e.target.value)
                                }
                            >
                                <option value="">Pilih jenis kelamin</option>
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                            </select>
                            <InputError message={editForm.errors.gender} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_birth_date">
                                Tanggal Lahir
                            </Label>
                            <Input
                                id="edit_birth_date"
                                type="date"
                                value={editForm.data.birth_date}
                                onChange={(e) =>
                                    editForm.setData(
                                        'birth_date',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError message={editForm.errors.birth_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_status">Status</Label>
                            <select
                                id="edit_status"
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={editForm.data.status}
                                onChange={(e) =>
                                    editForm.setData('status', e.target.value)
                                }
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                                <option value="graduated">Lulus</option>
                                <option value="transferred">Pindah</option>
                            </select>
                            <InputError message={editForm.errors.status} />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Simpan
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

AdminStudentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Santri', href: '/admin/students' },
    ],
};
