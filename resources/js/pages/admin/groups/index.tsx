import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    BookMarked,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Trash2,
    Users,
    X,
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
    current_group: {
        id: number;
        name: string;
        academic_year_id: number;
    } | null;
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
        if (showOnlyUnassigned && s.current_group_id) {
            return false;
        }

        if (!s.user) {
            return false;
        }

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
            <Label className="text-xs font-extrabold text-slate-600">Pilih Santri untuk Kelompok Ini</Label>
            <div className="relative">
                <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    className="h-9 w-full rounded-md border border-input bg-transparent pr-3 pl-8 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    placeholder="Cari santri..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                {q && (
                    <button
                        type="button"
                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setQ('')}
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
            <div className="max-h-48 overflow-y-auto rounded-md border p-1">
                {filtered.length === 0 ? (
                    <p className="p-2 text-xs text-muted-foreground">
                        Tidak ada santri
                    </p>
                ) : (
                    filtered.map((s) => (
                        <label
                            key={s.id}
                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                        >
                            <input
                                type="checkbox"
                                className="size-4 rounded-[4px] border border-input bg-background shadow-xs checked:border-primary checked:bg-primary checked:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                checked={selectedIds.includes(s.id)}
                                onChange={() => toggle(s.id)}
                            />
                            <span>{s.user!.name}</span>
                            <span className="text-xs text-muted-foreground">
                                ({s.student_code})
                            </span>
                            {s.current_group && (
                                <Badge
                                    variant="outline"
                                    className="ml-auto text-xs"
                                >
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

export default function AdminGroupsIndex({
    groups,
    academic_years,
    teachers,
    students,
    filters,
}: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search);
    const [academicYearFilter, setAcademicYearFilter] = useState(
        String(filters.academic_year_id || ''),
    );
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
        router.get(
            '/admin/groups',
            { search, academic_year_id: academicYearFilter },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setAcademicYearFilter('');
        router.get('/admin/groups', {}, { preserveState: true });
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
            onError: () =>
                toast.error('Periksa kembali form.', { id: toastId }),
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

        if (!editingGroup) {
            return;
        }

        const toastId = toast.loading('Menyimpan perubahan...');
        editForm.put(`/admin/groups/${editingGroup.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kelompok berhasil diperbarui.', { id: toastId });
                cancelEdit();
            },
            onError: () =>
                toast.error('Periksa kembali form.', { id: toastId }),
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
                        onSuccess: () =>
                            toast.success('Kelompok dihapus.', {
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

        if (!assignGroup) {
            return;
        }

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

            <div className="min-h-full space-y-6 pb-8">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
                    <svg className="pointer-events-none absolute top-6 right-8 h-48 w-48 text-white opacity-10" viewBox="0 0 200 200" fill="currentColor" aria-hidden="true">
                        <path d="M30 40h140c11 0 20 9 20 20v80c0 11-9 20-20 20H30c-11 0-20-9-20-20V60c0-11 9-20 20-20zm10 20v80h120V60H40z" />
                    </svg>
                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                                <BookMarked className="size-4 text-emerald-200" />
                                <span>Kelola Kelompok Belajar</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Kelompok 🏫
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                Buat kelompok dan atur penempatan santri di dalamnya.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md transition-transform hover:scale-105">
                                <BookMarked className="size-5 text-emerald-100" />
                                <div>
                                    <div className="text-sm leading-none font-extrabold">{groups.total}</div>
                                    <div className="text-[10px] font-semibold text-emerald-100">Kelompok</div>
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
                    <section className="h-fit rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                                <Plus className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-800">Tambah Kelompok</h2>
                                <p className="text-xs font-medium text-slate-400">Buat kelompok baru.</p>
                            </div>
                        </div>
                        <form
                            onSubmit={submitCreate}
                            className="grid gap-4"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-xs font-extrabold text-slate-600">Nama Kelompok</Label>
                                <Input
                                    id="name"
                                    className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200"
                                    value={createForm.data.name}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Misal: Kelas 1A, Kelas 1B"
                                />
                                <InputError
                                    message={createForm.errors.name}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="academic_year_id" className="text-xs font-extrabold text-slate-600">
                                    Tahun Ajaran
                                </Label>
                                <select
                                    id="academic_year_id"
                                    className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={createForm.data.academic_year_id}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'academic_year_id',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Pilih tahun ajaran
                                    </option>
                                    {academic_years.map((ay) => (
                                        <option key={ay.id} value={ay.id}>
                                            {ay.name}
                                            {ay.is_active ? ' (Aktif)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={
                                        createForm.errors.academic_year_id
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="teacher_id" className="text-xs font-extrabold text-slate-600">
                                    Ustadz Pendamping
                                </Label>
                                <select
                                    id="teacher_id"
                                    className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={createForm.data.teacher_id}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'teacher_id',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Pilih ustadz pendamping
                                    </option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={createForm.errors.teacher_id}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-xs font-extrabold text-slate-600">
                                    Deskripsi Kelompok
                                </Label>
                                <Input
                                    id="description"
                                    className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200"
                                    value={createForm.data.description}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <StudentCheckboxList
                                students={students}
                                selectedIds={createForm.data.student_ids}
                                onChange={(ids) =>
                                    createForm.setData('student_ids', ids)
                                }
                                showOnlyUnassigned
                            />
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
                                        <h2 className="text-lg font-extrabold text-slate-800">Daftar Kelompok</h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            {groups.from ?? 0}–{groups.to ?? 0} dari {groups.total} kelompok
                                        </p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                                    <Filter className="size-4" />
                                    Kelola kelompok
                                </div>
                            </div>

                            <form
                                onSubmit={submitFilters}
                                className="mb-5 flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                                    <Input
                                        className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari nama kelompok"
                                    />
                                </div>
                                <select
                                    className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={academicYearFilter}
                                    onChange={(e) => setAcademicYearFilter(e.target.value)}
                                >
                                    <option value="">Semua tahun ajaran</option>
                                    {academic_years.map((ay) => (
                                        <option key={ay.id} value={ay.id}>{ay.name}{ay.is_active ? ' (Aktif)' : ''}</option>
                                    ))}
                                </select>
                                <Button type="submit" className="rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700">
                                    <Search className="mr-1.5 size-3.5" /> Filter
                                </Button>
                                <Button type="button" variant="ghost" onClick={resetFilters} className="rounded-2xl text-xs font-bold text-slate-500 hover:bg-white">
                                    Reset
                                </Button>
                            </form>

                            <div className="overflow-x-auto rounded-[24px] border border-slate-100">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                Nama Kelompok
                                            </th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                Tahun Ajaran
                                            </th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                Ustadz Pendamping
                                            </th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                Jumlah Santri
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groups.data.map((group) => (
                                            <tr
                                                key={group.id}
                                                className="border-t border-slate-100 transition-colors hover:bg-emerald-50/30"
                                            >
                                                <td className="px-4 py-3 font-bold text-slate-800">
                                                    {group.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-500">
                                                    {group.academic_year
                                                        ?.name ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-500">
                                                    {group.teacher?.name ??
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                    {group.students_count}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button type="button" size="sm" variant="outline" onClick={() => startView(group)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                                                            <Eye className="size-4" />
                                                        </Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => startAssign(group)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                                                            + Santri
                                                        </Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => startEdit(group)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => deleteGroup(group)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">
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
                                {groups.links.map((link) => (
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

            {/* View Group Sheet */}
            <Sheet
                open={viewGroup !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        cancelView();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-extrabold text-slate-800">
                            Santri di {viewGroup?.name}
                        </SheetTitle>
                        <SheetDescription className="text-slate-500">
                            {
                                students.filter(
                                    (s) => s.current_group_id === viewGroup?.id,
                                ).length
                            }{' '}
                            santri terdaftar
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-2 px-4 pb-4">
                        {students
                            .filter((s) => s.current_group_id === viewGroup?.id)
                            .map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center gap-3 rounded-[20px] border border-slate-100 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-emerald-50/30"
                                >
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
                                        {s.user?.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-bold text-slate-800">
                                            {s.user?.name}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {s.student_code}
                                        </div>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                            s.current_group_id === viewGroup?.id
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {s.current_group_id === viewGroup?.id
                                            ? 'Aktif'
                                            : '-'}
                                    </span>
                                </div>
                            ))}
                        {students.filter(
                            (s) => s.current_group_id === viewGroup?.id,
                        ).length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                                    📭
                                </div>
                                <h4 className="mt-3 text-base font-extrabold text-slate-800">
                                    Belum ada santri
                                </h4>
                                <p className="mt-1 max-w-sm text-xs font-medium text-slate-400">
                                    Tambahkan santri ke kelompok ini.
                                </p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Edit Group Sheet */}
            <Sheet
                open={editingGroup !== null}
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
                                Edit Kelompok
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-slate-500">
                            {editingGroup?.name}
                        </SheetDescription>
                    </SheetHeader>
                    <form
                        onSubmit={submitEdit}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name" className="text-xs font-extrabold text-slate-600">Nama Kelompok</Label>
                            <Input
                                id="edit_name"
                                className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200"
                                value={editForm.data.name}
                                onChange={(e) =>
                                    editForm.setData('name', e.target.value)
                                }
                            />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_academic_year_id" className="text-xs font-extrabold text-slate-600">
                                Tahun Ajaran
                            </Label>
                            <select
                                id="edit_academic_year_id"
                                className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={editForm.data.academic_year_id}
                                onChange={(e) =>
                                    editForm.setData(
                                        'academic_year_id',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">Pilih</option>
                                {academic_years.map((ay) => (
                                    <option key={ay.id} value={ay.id}>
                                        {ay.name}
                                        {ay.is_active ? ' (Aktif)' : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={editForm.errors.academic_year_id}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_teacher_id" className="text-xs font-extrabold text-slate-600">Ustadz</Label>
                            <select
                                id="edit_teacher_id"
                                className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={editForm.data.teacher_id}
                                onChange={(e) =>
                                    editForm.setData(
                                        'teacher_id',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">
                                    Pilih ustadz pendamping
                                </option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={editForm.errors.teacher_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_description" className="text-xs font-extrabold text-slate-600">
                                Deskripsi Kelompok
                            </Label>
                            <Input
                                id="edit_description"
                                className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200"
                                value={editForm.data.description}
                                onChange={(e) =>
                                    editForm.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <StudentCheckboxList
                            students={students}
                            selectedIds={editForm.data.student_ids}
                            onChange={(ids) =>
                                editForm.setData('student_ids', ids)
                            }
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={cancelEdit} className="rounded-2xl border-slate-200 text-slate-600">Batal</Button>
                            <Button type="submit" disabled={editForm.processing} className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-700">Simpan Perubahan</Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Assign Students Sheet */}
            <Sheet
                open={assignGroup !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        cancelAssign();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-extrabold text-slate-800">
                            Atur Santri
                        </SheetTitle>
                        <SheetDescription className="text-slate-500">
                            {assignGroup?.name}
                        </SheetDescription>
                    </SheetHeader>
                    <form
                        onSubmit={submitAssign}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <StudentCheckboxList
                            students={students}
                            selectedIds={assignForm.data.student_ids}
                            onChange={(ids) =>
                                assignForm.setData('student_ids', ids)
                            }
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={cancelAssign} className="rounded-2xl border-slate-200 text-slate-600">Batal</Button>
                            <Button type="submit" disabled={assignForm.processing} className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-700">Simpan</Button>
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
