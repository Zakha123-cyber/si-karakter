import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BookOpenCheck,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Filter,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Sparkles,
    Tag,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
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

type CharacterIndicator = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    category: string;
    is_warning_indicator: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedIndicators = {
    data: CharacterIndicator[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type CategoryOption = {
    value: string;
    label: string;
};

type Props = {
    indicators: PaginatedIndicators;
    filters: {
        search: string;
        category: string;
        is_warning_indicator: string;
    };
    categories: (CategoryOption | string)[];
};

const categoryTints = [
    'bg-emerald-50 text-emerald-700',
    'bg-sky-50 text-sky-700',
    'bg-amber-50 text-amber-700',
    'bg-violet-50 text-violet-700',
    'bg-rose-50 text-rose-700',
    'bg-teal-50 text-teal-700',
];

function statusBadgeClasses(isActive: boolean): string {
    return isActive
        ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
        : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-50';
}

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

export default function TeacherCharacterIndicatorsIndex({
    indicators,
    filters,
    categories = [],
}: Props) {
    const { props } = usePage<{
        auth: Auth;
        flash?: { status?: string };
    }>();
    const firstName = props.auth.user?.name
        ? props.auth.user.name.split(' ')[0]
        : 'Ustadz';

    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [isWarningFilter, setIsWarningFilter] = useState(
        filters.is_warning_indicator || '',
    );

    const [editingIndicator, setEditingIndicator] =
        useState<CharacterIndicator | null>(null);

    const categoryList: CategoryOption[] = categories.map((cat) =>
        typeof cat === 'string' ? { value: cat, label: cat } : cat,
    );

    const defaultCategory = categoryList[0]?.value || 'moral_reasoning';

    const createForm = useForm({
        code: '',
        name: '',
        description: '',
        category: defaultCategory,
        is_warning_indicator: false,
        is_active: true,
    });

    const editForm = useForm({
        code: '',
        name: '',
        description: '',
        category: defaultCategory,
        is_warning_indicator: false,
        is_active: true,
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/teacher/character-indicators',
            { search, category, is_warning_indicator: isWarningFilter },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setCategory('');
        setIsWarningFilter('');

        router.get(
            '/teacher/character-indicators',
            {},
            { preserveState: true },
        );
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan indikator baru...');

        createForm.post('/teacher/character-indicators', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Indikator karakter berhasil dibuat.', {
                    id: toastId,
                });
                createForm.reset();
            },
            onError: () => {
                toast.error(
                    'Indikator belum bisa dibuat. Periksa kembali form.',
                    { id: toastId },
                );
            },
        });
    };

    const startEdit = (indicator: CharacterIndicator) => {
        setEditingIndicator(indicator);
        editForm.setData({
            code: indicator.code,
            name: indicator.name,
            description: indicator.description || '',
            category: indicator.category,
            is_warning_indicator: indicator.is_warning_indicator,
            is_active: indicator.is_active,
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingIndicator(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();

        if (!editingIndicator) {
            return;
        }

        const toastId = toast.loading('Menyimpan perubahan indikator...');

        editForm.put(`/teacher/character-indicators/${editingIndicator.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Indikator berhasil diperbarui.', {
                    id: toastId,
                });
                cancelEdit();
            },
            onError: () => {
                toast.error(
                    'Indikator belum bisa diperbarui. Periksa kembali form.',
                    { id: toastId },
                );
            },
        });
    };

    const toggleStatus = (indicator: CharacterIndicator) => {
        router.patch(
            `/teacher/character-indicators/${indicator.id}/status`,
            { is_active: !indicator.is_active },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        !indicator.is_active
                            ? 'Indikator berhasil diaktifkan.'
                            : 'Indikator berhasil dinonaktifkan.',
                    );
                },
                onError: () => {
                    toast.error('Status indikator gagal diperbarui.');
                },
            },
        );
    };

    const deleteIndicator = (indicator: CharacterIndicator) => {
        toast.warning(`Hapus indikator "${indicator.name}"?`, {
            description:
                'Tindakan ini akan menghapus indikator karakter secara permanen.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(
                        `/teacher/character-indicators/${indicator.id}`,
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success('Indikator berhasil dihapus.');
                            },
                            onError: () => {
                                toast.error('Gagal menghapus indikator.');
                            },
                        },
                    );
                },
            },
            cancel: {
                label: 'Batal',
                onClick: () => undefined,
            },
            duration: 10000,
        });
    };

    const getCategoryLabel = (val: string) => {
        const found = categoryList.find((c) => c.value === val);

        return found ? found.label : val;
    };

    const getCategoryTint = (val: string) => {
        const index = categoryList.findIndex((c) => c.value === val);

        return categoryTints[(index < 0 ? 0 : index) % categoryTints.length];
    };

    const activeCount = indicators.data.filter(
        (indicator) => indicator.is_active,
    ).length;
    const warningCount = indicators.data.filter(
        (indicator) => indicator.is_warning_indicator,
    ).length;

    return (
        <>
            <Head title="Manajemen Indikator Karakter" />

            <div className="min-h-full space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
                    <svg
                        className="pointer-events-none absolute top-6 right-8 h-48 w-48 text-white opacity-10"
                        viewBox="0 0 200 200"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M100 22l28 14v32l-28 22-28-22V36l28-14zM100 40l-12 6v26l12 9 12-9V46l-12-6zM36 78l20 8v34c0 18 12 34 44 46 32-12 44-28 44-46V86l20-8v34c0 26-16 46-56 62l-8 3-8-3c-40-16-56-36-56-62V78z" />
                    </svg>

                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                                <Sparkles className="size-4 text-emerald-200" />
                                <span>Kurikulum Karakter Ustadz</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Assalamu'alaikum, {firstName} 🛡️
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                Susun indikator perilaku yang dipakai untuk
                                observasi harian, penilaian, dan penanda
                                pendampingan (warning flag) santri.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <HeroPill
                                icon={<Tag className="size-5" />}
                                value={`${indicators.total}`}
                                label="Total Indikator"
                            />
                            <HeroPill
                                icon={<CheckCircle2 className="size-5" />}
                                value={`${activeCount}`}
                                label="Aktif"
                            />
                            <HeroPill
                                icon={<AlertTriangle className="size-5" />}
                                value={`${warningCount}`}
                                label="Warning Flag"
                            />
                        </div>
                    </div>
                </section>

                {props.flash?.status && (
                    <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 shadow-sm">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<BookOpenCheck className="size-5" />}
                        value={`${indicators.total}`}
                        label="Total Indikator"
                        description="Semua indikator karakter yang tersimpan"
                        tone="emerald"
                    />
                    <SummaryCard
                        icon={<CheckCircle2 className="size-5" />}
                        value={`${activeCount}`}
                        label="Aktif"
                        description="Indikator yang siap dipakai di observasi"
                        tone="sky"
                    />
                    <SummaryCard
                        icon={<AlertTriangle className="size-5" />}
                        value={`${warningCount}`}
                        label="Warning Flag"
                        description="Penanda indikator risiko di halaman ini"
                        tone="rose"
                    />
                    <SummaryCard
                        icon={<Sparkles className="size-5" />}
                        value={`${categories.length}`}
                        label="Kategori Evaluasi"
                        description="Kelompok besar perkembangan karakter"
                        tone="amber"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <main className="min-w-0 space-y-6">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                        📋
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-800">
                                            Daftar Indikator
                                        </h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            {indicators.from ?? 0}-
                                            {indicators.to ?? 0} dari{' '}
                                            {indicators.total} indikator
                                        </p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                                    <Filter className="size-4" />
                                    Kelola indikator
                                </div>
                            </div>

                            <form
                                onSubmit={submitFilters}
                                className="mb-5 grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3 lg:grid-cols-6"
                            >
                                <div className="relative lg:col-span-2">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                                    <Input
                                        className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari kode, nama, deskripsi"
                                    />
                                </div>
                                <select
                                    className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(event.target.value)
                                    }
                                >
                                    <option value="">Semua Kategori</option>
                                    {categoryList.map((cat) => (
                                        <option
                                            key={cat.value}
                                            value={cat.value}
                                        >
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={isWarningFilter}
                                    onChange={(event) =>
                                        setIsWarningFilter(event.target.value)
                                    }
                                >
                                    <option value="">Semua Tipe</option>
                                    <option value="0">Normal</option>
                                    <option value="1">Warning Flag</option>
                                </select>
                                <div className="flex gap-2 lg:col-span-2">
                                    <Button
                                        type="submit"
                                        className="flex-1 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                                    >
                                        <Search className="mr-1.5 size-3.5" />
                                        Filter
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={resetFilters}
                                        className="rounded-2xl text-xs font-bold text-slate-500 hover:bg-white"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>

                            {indicators.data.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <div className="space-y-3">
                                    {indicators.data.map((indicator) => (
                                        <IndicatorCard
                                            key={indicator.id}
                                            indicator={indicator}
                                            categoryLabel={getCategoryLabel(
                                                indicator.category,
                                            )}
                                            categoryTint={getCategoryTint(
                                                indicator.category,
                                            )}
                                            onEdit={() => startEdit(indicator)}
                                            onToggle={() =>
                                                toggleStatus(indicator)
                                            }
                                            onDelete={() =>
                                                deleteIndicator(indicator)
                                            }
                                        />
                                    ))}
                                </div>
                            )}

                            {indicators.links.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {indicators.links.map((link, index) => (
                                        <Button
                                            key={`${link.label}-${index}`}
                                            type="button"
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            disabled={!link.url}
                                            className={
                                                link.active
                                                    ? 'rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700'
                                                    : 'rounded-2xl border-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                            }
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(
                                                        link.url,
                                                        {},
                                                        {
                                                            preserveState: true,
                                                        },
                                                    );
                                                }
                                            }}
                                        >
                                            <PaginationLabel
                                                label={link.label}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>

                    <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                                    <Plus className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-800">
                                        Tambah Indikator
                                    </h2>
                                    <p className="text-xs font-medium text-slate-400">
                                        Buat indikator untuk observasi &
                                        asesmen.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={submitCreate}
                                className="mt-5 grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="code"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Kode Indikator
                                    </Label>
                                    <Input
                                        id="code"
                                        className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200"
                                        value={createForm.data.code}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'code',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: honesty"
                                    />
                                    <InputError
                                        message={createForm.errors.code}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Nama Indikator
                                    </Label>
                                    <Input
                                        id="name"
                                        className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200"
                                        value={createForm.data.name}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Kejujuran"
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="category"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Kategori Indikator
                                    </Label>
                                    <select
                                        id="category"
                                        className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                        value={createForm.data.category}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'category',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        {categoryList.map((cat) => (
                                            <option
                                                key={cat.value}
                                                value={cat.value}
                                            >
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={createForm.errors.category}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="description"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Deskripsi
                                    </Label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        className="rounded-[22px] border border-slate-100 bg-slate-50 p-3 text-sm shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                        value={createForm.data.description}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Penjelasan kriteria indikator..."
                                    />
                                    <InputError
                                        message={createForm.errors.description}
                                    />
                                </div>

                                <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <Checkbox
                                            checked={
                                                createForm.data
                                                    .is_warning_indicator
                                            }
                                            onCheckedChange={(checked) =>
                                                createForm.setData(
                                                    'is_warning_indicator',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <span className="text-xs leading-snug font-bold text-slate-700">
                                            Penanda Warning (Indikator Risiko)
                                        </span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <Checkbox
                                            checked={createForm.data.is_active}
                                            onCheckedChange={(checked) =>
                                                createForm.setData(
                                                    'is_active',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <span className="text-xs font-bold text-slate-700">
                                            Aktif
                                        </span>
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="rounded-2xl bg-emerald-600 py-5 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-700"
                                >
                                    Simpan Indikator
                                </Button>
                            </form>

                            <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-700">
                                <p className="font-extrabold">Tips penamaan</p>
                                <p className="mt-1 font-medium">
                                    Gunakan kode singkat berbahasa Inggris dan
                                    nama yang mudah dipahami, misalnya “honesty
                                    — Kejujuran”.
                                </p>
                            </div>
                        </section>

                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-700">
                                <Sparkles className="size-5 text-amber-500" />
                                Panduan Indikator
                            </h2>
                            <div className="space-y-3">
                                <GuideItem
                                    emoji="🌱"
                                    title="Kode Bermakna"
                                    description="Pakai kode yang konsisten agar mudah dirujuk lintas halaman observasi."
                                />
                                <GuideItem
                                    emoji="📌"
                                    title="Warning Flag untuk Risiko"
                                    description="Tandai indikator yang perlu pendampingan bila polanya negatif berulang."
                                />
                                <GuideItem
                                    emoji="🔁"
                                    title="Indikator Aktif"
                                    description="Indikator nonaktif tetap tersimpan, namun tidak muncul di checklist observasi."
                                />
                            </div>
                        </section>

                        <section className="rounded-[28px] bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-[0_8px_30px_rgba(15,23,42,0.15)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur-sm">
                                    🕌
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Prinsip Halaman Ini
                                    </p>
                                    <p className="text-sm font-extrabold text-white">
                                        Ukur perilaku, bukan melabeli
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-slate-300">
                                Indikator membantu kita melihat kebiasaan yang
                                perlu ditumbuhkan, bukan untuk menghakimi
                                karakter santri.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>

            <Sheet
                open={editingIndicator !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        cancelEdit();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                            <Pencil className="size-6" />
                        </div>
                        <SheetTitle className="text-xl font-extrabold text-slate-800">
                            Edit Indikator Karakter
                        </SheetTitle>
                        <SheetDescription className="text-slate-500">
                            {editingIndicator
                                ? `${editingIndicator.name} (${editingIndicator.code})`
                                : 'Perbarui data indikator.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submitEdit} className="mt-6 grid gap-5">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="edit_code"
                                className="text-xs font-extrabold text-slate-600"
                            >
                                Kode Indikator
                            </Label>
                            <Input
                                id="edit_code"
                                className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200"
                                value={editForm.data.code}
                                onChange={(event) =>
                                    editForm.setData('code', event.target.value)
                                }
                            />
                            <InputError message={editForm.errors.code} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="edit_name"
                                className="text-xs font-extrabold text-slate-600"
                            >
                                Nama Indikator
                            </Label>
                            <Input
                                id="edit_name"
                                className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200"
                                value={editForm.data.name}
                                onChange={(event) =>
                                    editForm.setData('name', event.target.value)
                                }
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="edit_category"
                                className="text-xs font-extrabold text-slate-600"
                            >
                                Kategori Indikator
                            </Label>
                            <select
                                id="edit_category"
                                className="h-11 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={editForm.data.category}
                                onChange={(event) =>
                                    editForm.setData(
                                        'category',
                                        event.target.value,
                                    )
                                }
                            >
                                {categoryList.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={editForm.errors.category} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="edit_description"
                                className="text-xs font-extrabold text-slate-600"
                            >
                                Deskripsi
                            </Label>
                            <textarea
                                id="edit_description"
                                rows={3}
                                className="rounded-[22px] border border-slate-100 bg-white p-3 text-sm shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={editForm.data.description}
                                onChange={(event) =>
                                    editForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={editForm.errors.description} />
                        </div>

                        <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <label className="flex cursor-pointer items-center gap-3">
                                <Checkbox
                                    checked={editForm.data.is_warning_indicator}
                                    onCheckedChange={(checked) =>
                                        editForm.setData(
                                            'is_warning_indicator',
                                            checked === true,
                                        )
                                    }
                                />
                                <span className="text-xs leading-snug font-bold text-slate-700">
                                    Penanda Warning (Indikator Risiko)
                                </span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-3">
                                <Checkbox
                                    checked={editForm.data.is_active}
                                    onCheckedChange={(checked) =>
                                        editForm.setData(
                                            'is_active',
                                            checked === true,
                                        )
                                    }
                                />
                                <span className="text-xs font-bold text-slate-700">
                                    Aktif
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEdit}
                                className="rounded-2xl border-slate-200 text-slate-600"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}

function HeroPill({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md transition-transform hover:scale-105">
            <span className="text-emerald-100">{icon}</span>
            <div>
                <div className="text-sm leading-none font-extrabold">
                    {value}
                </div>
                <div className="text-[10px] font-semibold text-emerald-100">
                    {label}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({
    icon,
    value,
    label,
    description,
    tone,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
    description: string;
    tone: 'rose' | 'amber' | 'emerald' | 'sky';
}) {
    const toneMap = {
        rose: {
            wrapper: 'from-rose-50 to-orange-50 text-rose-700',
            icon: 'bg-rose-100 text-rose-700',
        },
        amber: {
            wrapper: 'from-amber-50 to-yellow-50 text-amber-700',
            icon: 'bg-amber-100 text-amber-700',
        },
        emerald: {
            wrapper: 'from-emerald-50 to-teal-50 text-emerald-700',
            icon: 'bg-emerald-100 text-emerald-700',
        },
        sky: {
            wrapper: 'from-sky-50 to-blue-50 text-sky-700',
            icon: 'bg-sky-100 text-sky-700',
        },
    };

    const toneClass = toneMap[tone];

    return (
        <div
            className={`rounded-[24px] bg-gradient-to-br p-4 shadow-[0_8px_30px_rgba(16,58,58,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-lg ${toneClass.wrapper}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass.icon}`}
                >
                    {icon}
                </div>
                <div>
                    <div className="text-2xl font-extrabold">{value}</div>
                    <div className="text-xs font-extrabold">{label}</div>
                </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed font-medium text-slate-500">
                {description}
            </p>
        </div>
    );
}

function IndicatorCard({
    indicator,
    categoryLabel,
    categoryTint,
    onEdit,
    onToggle,
    onDelete,
}: {
    indicator: CharacterIndicator;
    categoryLabel: string;
    categoryTint: string;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
}) {
    return (
        <article className="group rounded-[24px] border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-extrabold text-white shadow-sm transition-transform group-hover:scale-105">
                        {indicator.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-slate-800">
                                {indicator.name}
                            </h3>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-500">
                                {indicator.code}
                            </span>
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${categoryTint}`}
                            >
                                {categoryLabel}
                            </span>
                        </div>
                        {indicator.description && (
                            <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-relaxed font-medium text-slate-500">
                                {indicator.description}
                            </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                            {indicator.is_warning_indicator ? (
                                <Badge className="border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-50">
                                    <AlertTriangle className="mr-1 size-3" />
                                    Warning Flag
                                </Badge>
                            ) : (
                                <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                    <CheckCircle2 className="mr-1 size-3" />
                                    Normal
                                </Badge>
                            )}
                            <Badge
                                className={statusBadgeClasses(
                                    indicator.is_active,
                                )}
                            >
                                {indicator.is_active ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onEdit}
                        className="rounded-2xl border-slate-200 bg-white text-xs font-extrabold text-slate-600 hover:bg-slate-50"
                    >
                        <Pencil className="size-3.5" />
                        Edit
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onToggle}
                        className={
                            indicator.is_active
                                ? 'rounded-2xl border-slate-200 bg-white text-xs font-extrabold text-slate-600 hover:bg-slate-50'
                                : 'rounded-2xl border-emerald-100 bg-white text-xs font-extrabold text-emerald-700 hover:bg-emerald-50'
                        }
                    >
                        <ShieldCheck className="size-3.5" />
                        {indicator.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onDelete}
                        className="rounded-2xl border-rose-100 bg-white text-xs font-extrabold text-rose-600 hover:bg-rose-50"
                    >
                        <Trash2 className="size-3.5" />
                        Hapus
                    </Button>
                </div>
            </div>

            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                <MetaItem
                    icon={<Tag className="size-4" />}
                    label="Kategori"
                    value={categoryLabel}
                />
                <MetaItem
                    icon={
                        indicator.is_warning_indicator ? (
                            <AlertTriangle className="size-4" />
                        ) : (
                            <CheckCircle2 className="size-4" />
                        )
                    }
                    label="Tipe"
                    value={
                        indicator.is_warning_indicator
                            ? 'Warning Flag'
                            : 'Normal'
                    }
                />
                <MetaItem
                    icon={<ShieldCheck className="size-4" />}
                    label="Status"
                    value={indicator.is_active ? 'Aktif' : 'Nonaktif'}
                />
            </div>
        </article>
    );
}

function MetaItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs shadow-sm">
            <span className="text-emerald-600">{icon}</span>
            <div className="min-w-0">
                <p className="font-bold text-slate-400">{label}</p>
                <p className="truncate font-extrabold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}

function GuideItem({
    emoji,
    title,
    description,
}: {
    emoji: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-teal-50/70 p-3.5">
            <span className="text-xl">{emoji}</span>
            <div className="text-xs">
                <p className="font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 leading-snug text-slate-600">
                    {description}
                </p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                🌱
            </div>
            <h4 className="mt-3 text-base font-extrabold text-slate-800">
                Belum ada indikator karakter
            </h4>
            <p className="mt-1 max-w-sm text-xs leading-relaxed font-medium text-slate-500">
                Buat indikator pertama melalui panel “Tambah Indikator”, lalu
                gunakan di checklist observasi harian.
            </p>
        </div>
    );
}
