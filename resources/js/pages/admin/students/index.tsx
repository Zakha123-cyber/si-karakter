import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Filter,
    GraduationCap,
    Pencil,
    Plus,
    Search,
    Users,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-red-100 text-red-700',
    graduated: 'bg-sky-100 text-sky-700',
    transferred: 'bg-amber-100 text-amber-700',
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

    const resetFilters = () => {
        setSearch('');
        setGroupFilter('');
        setStatusFilter('');
        router.get('/admin/students', {}, { preserveState: true });
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
                            toast.success('Santri dihapus.', {
                                id: toastId,
                            }),
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

            <div className="min-h-full space-y-6 pb-8">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
                    <svg className="pointer-events-none absolute top-6 right-8 h-48 w-48 text-white opacity-10" viewBox="0 0 200 200" fill="currentColor" aria-hidden="true">
                        <path d="M100 22l28 14v32l-28 22-28-22V36l28-14zM100 40l-12 6v26l12 9 12-9V46l-12-6z" />
                    </svg>
                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                                <GraduationCap className="size-4 text-emerald-200" />
                                <span>Kelola Data Santri</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Data Santri 🎓
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                Daftar dan kelola data santri untuk asesmen, observasi, dan pendampingan karakter.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md transition-transform hover:scale-105">
                                <Users className="size-5 text-emerald-100" />
                                <div>
                                    <div className="text-sm leading-none font-extrabold">{students.total}</div>
                                    <div className="text-[10px] font-semibold text-emerald-100">Total Santri</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {props.flash?.status && (
                    <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 shadow-sm">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Create Form Card */}
                    <section className="h-fit rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                                <Plus className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-800">Tambah Santri</h2>
                                <p className="text-xs font-medium text-slate-400">Buat data santri baru.</p>
                            </div>
                        </div>
                        <form
                            onSubmit={submitCreate}
                            className="grid gap-4"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="user_id" className="text-xs font-extrabold text-slate-600">Akun Santri</Label>
                                <select
                                    id="user_id"
                                    className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
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
                                <Label htmlFor="student_code" className="text-xs font-extrabold text-slate-600">
                                    Kode Santri (NIS)
                                </Label>
                                <Input
                                    id="student_code"
                                    className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200"
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
                                <Label htmlFor="gender" className="text-xs font-extrabold text-slate-600">
                                    Jenis Kelamin
                                </Label>
                                <select
                                    id="gender"
                                    className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
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
                                <Label htmlFor="birth_date" className="text-xs font-extrabold text-slate-600">
                                    Tanggal Lahir
                                </Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200"
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
                            <Button type="submit" disabled={createForm.processing} className="rounded-2xl bg-emerald-600 py-5 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-700">
                                Simpan
                            </Button>
                        </form>
                    </section>

                    {/* List Card */}
                    <main className="min-w-0 space-y-6">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">📋</span>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-800">Daftar Santri</h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            {students.from ?? 0}–{students.to ?? 0} dari {students.total} santri
                                        </p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                                    <Filter className="size-4" />
                                    Kelola santri
                                </div>
                            </div>

                            <form onSubmit={submitFilters} className="mb-5 flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                                    <Input className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari santri..." />
                                </div>
                                <select className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
                                    <option value="">Semua kelompok</option>
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                                <select className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="">Semua status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                    <option value="graduated">Lulus</option>
                                    <option value="transferred">Pindah</option>
                                </select>
                                <Button type="submit" className="rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"><Search className="mr-1.5 size-3.5" /> Filter</Button>
                                <Button type="button" variant="ghost" onClick={resetFilters} className="rounded-2xl text-xs font-bold text-slate-500 hover:bg-white">Reset</Button>
                            </form>

                            <div className="overflow-x-auto rounded-[24px] border border-slate-100">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                Nama Santri
                                            </th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                NIS
                                            </th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                Kelompok
                                            </th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
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
                                                className="border-t border-slate-100 transition-colors hover:bg-emerald-50/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-xs font-bold text-white">
                                                            {student.user
                                                                ?.name.charAt(
                                                                    0,
                                                                )
                                                                .toUpperCase() ?? '?'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-slate-800">
                                                                {student.user
                                                                    ?.name ?? '-'}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                @
                                                                {
                                                                    student.user
                                                                        ?.username
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono font-bold text-slate-700">
                                                    {student.student_code}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-500">
                                                    {student.current_group
                                                        ?.name ?? '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                            statusColors[
                                                                student
                                                                    .status
                                                            ] ??
                                                            'bg-slate-100 text-slate-600'
                                                        }`}
                                                    >
                                                        {statusLabel[
                                                            student.status
                                                        ] ?? student.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button type="button" size="sm" variant="outline" onClick={() => startEdit(student)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => toggleStatus(student)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                                                            {student.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => deleteStudent(student)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-5 flex flex-wrap gap-2">
                                {students.links.map((link) => (
                                    <Button
                                        key={`${link.label}-${link.url}`}
                                        type="button"
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        className={link.active ? 'rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700' : 'rounded-2xl border-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url, {}, { preserveState: true });
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
                        </section>
                    </main>
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
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <Pencil className="size-5 text-slate-400" />
                            <SheetTitle className="text-xl font-extrabold text-slate-800">
                                Edit Santri
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-slate-500">
                            {editingStudent?.user?.name} (
                            {editingStudent?.student_code})
                        </SheetDescription>
                    </SheetHeader>
                    <form
                        onSubmit={submitEdit}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="edit_student_code" className="text-xs font-extrabold text-slate-600">
                                Kode Santri (NIS)
                            </Label>
                            <Input
                                id="edit_student_code"
                                className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200"
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
                            <Label htmlFor="edit_gender" className="text-xs font-extrabold text-slate-600">Jenis Kelamin</Label>
                            <select
                                id="edit_gender"
                                className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
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
                            <Label htmlFor="edit_birth_date" className="text-xs font-extrabold text-slate-600">
                                Tanggal Lahir
                            </Label>
                            <Input
                                id="edit_birth_date"
                                type="date"
                                className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200"
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
                            <Label htmlFor="edit_status" className="text-xs font-extrabold text-slate-600">Status</Label>
                            <select
                                id="edit_status"
                                className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
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
                                className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                                >
                                Simpan Perubahan
                            </Button>
                            <Button type="button" variant="outline" onClick={cancelEdit} className="rounded-2xl border-slate-200 text-slate-600">Batal</Button>
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
