import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Filter,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    filters: { search: string };
};

function PaginationLabel({ label }: { label: string }) {
    if (
        label === '&laquo; Previous' ||
        label === 'pagination.previous' ||
        label.toLowerCase().includes('previous')
    ) {
        return (
            <>
                <ChevronLeft className="size-4" />
                <span className="sr-only">Sebelumnya</span>
            </>
        );
    }

    if (
        label === 'Next &raquo;' ||
        label === 'pagination.next' ||
        label.toLowerCase().includes('next')
    ) {
        return (
            <>
                <ChevronRight className="size-4" />
                <span className="sr-only">Berikutnya</span>
            </>
        );
    }

    return <span>{label}</span>;
}

export default function AdminAcademicYearsIndex({
    academic_years,
    filters,
}: Props) {
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
        router.get(
            '/admin/academic-years',
            { search },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        router.get('/admin/academic-years', {}, { preserveState: true });
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
        router.patch(
            `/admin/academic-years/${year.id}/activate`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Tahun ajaran diaktifkan.', { id: toastId }),
                onError: () => toast.error('Gagal mengaktifkan.', { id: toastId }),
            },
        );
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
                        onError: (errors) => {
                            const msg = errors?.error ?? errors?.message ?? 'Gagal menghapus.';
                            toast.error(Array.isArray(msg) ? msg[0] : msg, { id: toastId });
                        },
                    });
                },
            },
            cancel: { label: 'Batal', onClick: () => undefined },
            duration: 10000,
        });
    };

    const activeCount = academic_years.data.filter((y) => y.is_active).length;

    return (
        <>
            <Head title="Tahun Ajaran" />

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
                                <CalendarDays className="size-4 text-emerald-200" />
                                <span>Kelola Periode Akademik</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Tahun Ajaran 📅
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                Kelola tahun ajaran untuk pengelompokan santri dan kegiatan akademik.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md transition-transform hover:scale-105">
                                <CalendarDays className="size-5 text-emerald-100" />
                                <div>
                                    <div className="text-sm leading-none font-extrabold">{academic_years.total}</div>
                                    <div className="text-[10px] font-semibold text-emerald-100">Total</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md transition-transform hover:scale-105">
                                <CheckCircle2 className="size-5 text-emerald-100" />
                                <div>
                                    <div className="text-sm leading-none font-extrabold">{activeCount}</div>
                                    <div className="text-[10px] font-semibold text-emerald-100">Aktif</div>
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
                    {/* Main List */}
                    <main className="min-w-0 space-y-6">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">📋</span>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-800">Daftar Tahun Ajaran</h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            {academic_years.from ?? 0}–{academic_years.to ?? 0} dari {academic_years.total} tahun ajaran
                                        </p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                                    <Filter className="size-4" />
                                    Kelola tahun ajaran
                                </div>
                            </div>

                            {/* Filter Bar */}
                            <form onSubmit={submitFilters} className="mb-5 flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                                    <Input
                                        className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari tahun ajaran..."
                                    />
                                </div>
                                <Button type="submit" className="rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700">
                                    <Search className="mr-1.5 size-3.5" />
                                    Filter
                                </Button>
                                <Button type="button" variant="ghost" onClick={resetFilters} className="rounded-2xl text-xs font-bold text-slate-500 hover:bg-white">
                                    Reset
                                </Button>
                            </form>

                            {/* Table */}
                            <div className="overflow-x-auto rounded-[24px] border border-slate-100">
                                <table className="w-full min-w-[660px] text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Nama Tahun Ajaran</th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Periode</th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Status</th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Kelompok</th>
                                            <th className="px-4 py-3 text-right text-xs font-extrabold text-slate-600">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {academic_years.data.map((year) => (
                                            <tr key={year.id} className="border-t border-slate-100 transition-colors hover:bg-emerald-50/30">
                                                <td className="px-4 py-3">
                                                    <span className="font-extrabold text-slate-800">{year.name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{year.start_date} – {year.end_date}</td>
                                                <td className="px-4 py-3">
                                                    <Badge className={year.is_active ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-600'}>
                                                        {year.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-700">{year.groups_count}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button type="button" size="sm" variant="outline" onClick={() => startEdit(year)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                                                            <Pencil className="size-4" /> Edit
                                                        </Button>
                                                        {!year.is_active && (
                                                            <Button type="button" size="sm" variant="outline" onClick={() => activateYear(year)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                                                                Aktifkan
                                                            </Button>
                                                        )}
                                                        <Button type="button" size="sm" variant="outline" onClick={() => deleteYear(year)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">
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
                            {academic_years.links.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {academic_years.links.map((link) => (
                                        <Button
                                            key={`${link.label}-${link.url}`}
                                            type="button"
                                            size="sm"
                                            variant={link.active ? 'default' : 'outline'}
                                            disabled={!link.url}
                                            className={link.active ? 'rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700' : 'rounded-2xl border-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}
                                            onClick={() => { if (link.url) router.get(link.url, {}, { preserveState: true }); }}
                                        >
                                            <PaginationLabel label={link.label} />
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>

                    {/* Sidebar - Create Form */}
                    <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                                    <Plus className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-800">Tambah Tahun Ajaran</h2>
                                    <p className="text-xs font-medium text-slate-400">Buat tahun ajaran baru.</p>
                                </div>
                            </div>

                            <form onSubmit={submitCreate} className="mt-5 grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-xs font-extrabold text-slate-600">Nama Tahun Ajaran</Label>
                                    <Input id="name" className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} placeholder="Misal: 2026/2027" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date" className="text-xs font-extrabold text-slate-600">Tanggal Mulai</Label>
                                    <Input id="start_date" type="date" className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200" value={createForm.data.start_date} onChange={(e) => createForm.setData('start_date', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_date" className="text-xs font-extrabold text-slate-600">Tanggal Selesai</Label>
                                    <Input id="end_date" type="date" className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200" value={createForm.data.end_date} onChange={(e) => createForm.setData('end_date', e.target.value)} />
                                    <InputError message={createForm.errors.end_date} />
                                </div>
                                <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <Checkbox checked={createForm.data.is_active} onCheckedChange={(c) => createForm.setData('is_active', c === true)} />
                                        <span className="text-xs font-bold text-slate-700">Aktifkan sekarang</span>
                                    </label>
                                </div>
                                <Button type="submit" disabled={createForm.processing} className="rounded-2xl bg-emerald-600 py-5 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-700">
                                    Simpan
                                </Button>
                            </form>
                        </section>

                        <section className="rounded-[28px] bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-[0_8px_30px_rgba(15,23,42,0.15)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur-sm">🕌</div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400">Prinsip Halaman Ini</p>
                                    <p className="text-sm font-extrabold text-white">Atur periode dengan cermat</p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-slate-300">
                                Tahun ajaran yang benar memastikan penempatan santri dan kelompok berjalan sesuai jadwal.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>

            {/* Edit Sheet */}
            <Sheet open={editingYear !== null} onOpenChange={(o) => { if (!o) cancelEdit(); }}>
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                            <Pencil className="size-6" />
                        </div>
                        <SheetTitle className="text-xl font-extrabold text-slate-800">Edit Tahun Ajaran</SheetTitle>
                        <SheetDescription className="text-slate-500">{editingYear?.name}</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={submitEdit} className="mt-6 grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name" className="text-xs font-extrabold text-slate-600">Nama Tahun Ajaran</Label>
                            <Input id="edit_name" className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} placeholder="Misal: 2026/2027" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_start_date" className="text-xs font-extrabold text-slate-600">Tanggal Mulai</Label>
                            <Input id="edit_start_date" type="date" className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200" value={editForm.data.start_date} onChange={(e) => editForm.setData('start_date', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_end_date" className="text-xs font-extrabold text-slate-600">Tanggal Selesai</Label>
                            <Input id="edit_end_date" type="date" className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200" value={editForm.data.end_date} onChange={(e) => editForm.setData('end_date', e.target.value)} />
                            <InputError message={editForm.errors.end_date} />
                        </div>
                        <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <label className="flex cursor-pointer items-center gap-3">
                                <Checkbox checked={editForm.data.is_active} onCheckedChange={(c) => editForm.setData('is_active', c === true)} />
                                <span className="text-xs font-bold text-slate-700">Aktif</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={cancelEdit} className="rounded-2xl border-slate-200 text-slate-600">Batal</Button>
                            <Button type="submit" disabled={editForm.processing} className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-700">Simpan Perubahan</Button>
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
