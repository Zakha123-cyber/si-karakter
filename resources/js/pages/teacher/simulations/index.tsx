import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    BookOpenCheck,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Filter,
    ListChecks,
    MessageSquareText,
    Pencil,
    Plus,
    Search,
    ShieldAlert,
    Sparkles,
    Star,
    Trash2,
    UserRoundCheck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
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

type SimulationOption = {
    id: number;
    text: string;
    feedback_text: string | null;
    score: number;
    reward_points: number;
    sort_order: number;
};

type SimulationRow = {
    id: number;
    title: string;
    description: string | null;
    opening_text: string;
    status: string;
    options_count: number;
    attempts_count: number;
    creator_name: string | null;
    options: SimulationOption[];
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedSimulations = {
    data: SimulationRow[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    simulations: PaginatedSimulations;
    filters: {
        search: string;
        status: string;
    };
    statuses: string[];
};

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    published: 'Published',
    archived: 'Arsip',
};

const scenarioEmojis = ['🗣️', '💬', '🛡️'];

function statusClasses(value: string): string {
    switch (value) {
        case 'published':
            return 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50';
        case 'archived':
            return 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50';
        case 'draft':
            return 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-50';
        default:
            return 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-50';
    }
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Belum ada waktu';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
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

export default function TeacherSimulationsIndex({
    simulations,
    filters,
    statuses,
}: Props) {
    const { props } = usePage<{
        auth: Auth;
        flash?: { status?: string };
    }>();
    const firstName = props.auth.user?.name
        ? props.auth.user.name.split(' ')[0]
        : 'Ustadz';

    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [editingScenario, setEditingScenario] =
        useState<SimulationRow | null>(null);
    const [isScenarioSheetOpen, setIsScenarioSheetOpen] = useState(false);
    const [optionScenarioId, setOptionScenarioId] = useState<number | null>(
        null,
    );
    const optionScenario =
        simulations.data.find((scenario) => scenario.id === optionScenarioId) ??
        null;
    const [editingOption, setEditingOption] = useState<SimulationOption | null>(
        null,
    );

    const scenarioForm = useForm({
        title: '',
        description: '',
        opening_text: '',
        status: 'draft',
    });

    const optionForm = useForm({
        text: '',
        feedback_text: '',
        score: 0,
        reward_points: 0,
        sort_order: 0,
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/teacher/simulation-scenarios',
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');

        router.get(
            '/teacher/simulation-scenarios',
            {},
            { preserveState: true },
        );
    };

    const openCreate = () => {
        setEditingScenario(null);
        scenarioForm.reset();
        scenarioForm.clearErrors();
        setIsScenarioSheetOpen(true);
    };

    const openEdit = (scenario: SimulationRow) => {
        setEditingScenario(scenario);
        scenarioForm.setData({
            title: scenario.title,
            description: scenario.description ?? '',
            opening_text: scenario.opening_text,
            status: scenario.status,
        });
        scenarioForm.clearErrors();
        setIsScenarioSheetOpen(true);
    };

    const closeScenarioSheet = () => {
        setEditingScenario(null);
        setIsScenarioSheetOpen(false);
        scenarioForm.reset();
        scenarioForm.clearErrors();
    };

    const submitScenario = (event: FormEvent) => {
        event.preventDefault();

        const toastId = toast.loading(
            editingScenario ? 'Menyimpan skenario...' : 'Membuat skenario...',
        );
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    editingScenario
                        ? 'Skenario berhasil diperbarui.'
                        : 'Skenario berhasil dibuat.',
                    { id: toastId },
                );
                closeScenarioSheet();
            },
            onError: (errors: Partial<Record<string, string>>) => {
                toast.error(firstError(errors), { id: toastId });
            },
        };

        if (editingScenario) {
            scenarioForm.put(
                `/teacher/simulation-scenarios/${editingScenario.id}`,
                options,
            );

            return;
        }

        scenarioForm.post('/teacher/simulation-scenarios', options);
    };

    const deleteScenario = (scenario: SimulationRow) => {
        toast.warning(`Hapus skenario ${scenario.title}?`, {
            description:
                'Skenario yang sudah memiliki riwayat simulasi santri tidak dapat dihapus.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(
                        `/teacher/simulation-scenarios/${scenario.id}`,
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                toast.success('Skenario berhasil dihapus.'),
                            onError: (errors) =>
                                toast.error(firstError(errors)),
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

    const openOptions = (scenario: SimulationRow) => {
        setOptionScenarioId(scenario.id);
        setEditingOption(null);
        optionForm.reset();
        optionForm.clearErrors();
    };

    const startCreateOption = () => {
        setEditingOption(null);
        optionForm.setData({
            text: '',
            feedback_text: '',
            score: 0,
            reward_points: 0,
            sort_order: optionScenario?.options.length ?? 0,
        });
        optionForm.clearErrors();
        document
            .getElementById('option-form')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const startEditOption = (option: SimulationOption) => {
        setEditingOption(option);
        optionForm.setData({
            text: option.text,
            feedback_text: option.feedback_text ?? '',
            score: option.score,
            reward_points: option.reward_points,
            sort_order: option.sort_order,
        });
        optionForm.clearErrors();
        document
            .getElementById('option-form')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const submitOption = (event: FormEvent) => {
        event.preventDefault();

        if (!optionScenario) {
            return;
        }

        const toastId = toast.loading(
            editingOption ? 'Menyimpan respons...' : 'Membuat respons...',
        );
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    editingOption
                        ? 'Respons berhasil diperbarui.'
                        : 'Respons berhasil dibuat.',
                    { id: toastId },
                );
                setEditingOption(null);
                optionForm.reset();
            },
            onError: (errors: Partial<Record<string, string>>) => {
                toast.error(firstError(errors), { id: toastId });
            },
        };

        if (editingOption) {
            optionForm.put(
                `/teacher/simulation-scenarios/${optionScenario.id}/options/${editingOption.id}`,
                options,
            );

            return;
        }

        optionForm.post(
            `/teacher/simulation-scenarios/${optionScenario.id}/options`,
            options,
        );
    };

    const deleteOption = (option: SimulationOption) => {
        if (!optionScenario) {
            return;
        }

        toast.warning('Hapus respons?', {
            description:
                'Respons yang sudah pernah dipilih santri tidak dapat dihapus.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(
                        `/teacher/simulation-scenarios/${optionScenario.id}/options/${option.id}`,
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                toast.success('Respons berhasil dihapus.'),
                            onError: (errors) =>
                                toast.error(firstError(errors)),
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

    const totalOptions = simulations.data.reduce(
        (total, scenario) => total + scenario.options_count,
        0,
    );
    const totalAttempts = simulations.data.reduce(
        (total, scenario) => total + scenario.attempts_count,
        0,
    );
    const publishedCount = simulations.data.filter(
        (scenario) => scenario.status === 'published',
    ).length;

    return (
        <>
            <Head title="Simulasi Berani Menolak" />

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
                        <path d="M66 52h68c11 0 20 9 20 20v38c0 11-9 20-20 20h-36l-22 22v-22h-10c-11 0-20-9-20-20V72c0-11 9-20 20-20zM86 88h28v10H86zM122 88h14v10h-14zM86 114h40v10H86z" />
                    </svg>

                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                                <BookOpenCheck className="size-4 text-emerald-200" />
                                <span>Phase 14 — Simulasi Berani Menolak</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Assalamu'alaikum, {firstName} 🗣️
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                Kelola skenario percakapan, respons pilihan,
                                feedback, dan reward poin untuk melatih santri
                                menyampaikan batasan dengan tegas dan sopan.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <HeroPill
                                icon={<BookOpenCheck className="size-5" />}
                                value={`${simulations.total}`}
                                label="Total Skenario"
                            />
                            <HeroPill
                                icon={<CheckCircle2 className="size-5" />}
                                value={`${publishedCount}`}
                                label="Published"
                            />
                            <HeroPill
                                icon={<Sparkles className="size-5" />}
                                value={`${totalAttempts}`}
                                label="Percobaan"
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
                        value={simulations.total}
                        label="Total Skenario"
                        description="Semua skenario latihan yang tersimpan"
                        tone="emerald"
                    />
                    <SummaryCard
                        icon={<CheckCircle2 className="size-5" />}
                        value={publishedCount}
                        label="Published"
                        description="Skenario aktif yang tampil untuk santri"
                        tone="sky"
                    />
                    <SummaryCard
                        icon={<ListChecks className="size-5" />}
                        value={totalOptions}
                        label="Respons"
                        description="Total pilihan jawaban dari semua skenario"
                        tone="amber"
                    />
                    <SummaryCard
                        icon={<ShieldAlert className="size-5" />}
                        value={totalAttempts}
                        label="Percobaan Santri"
                        description="Total jawaban santri yang pernah dikirim"
                        tone="rose"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <main className="min-w-0 space-y-6">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                        🗣️
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-800">
                                            Daftar Skenario
                                        </h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            {simulations.from ?? 0}-
                                            {simulations.to ?? 0} dari{' '}
                                            {simulations.total} skenario
                                        </p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                                    <Filter className="size-4" />
                                    Kelola skenario
                                </div>
                            </div>

                            <form
                                onSubmit={submitFilters}
                                className="mb-5 grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3 lg:grid-cols-6"
                            >
                                <div className="relative lg:col-span-2">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                                    <Input
                                        className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm text-slate-900 shadow-sm focus-visible:ring-emerald-200"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari judul atau cerita skenario"
                                    />
                                </div>
                                <select
                                    className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100 lg:col-span-2"
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(event.target.value)
                                    }
                                >
                                    <option value="">Semua Status</option>
                                    {statuses.map((item) => (
                                        <option key={item} value={item}>
                                            {statusLabels[item] ?? item}
                                        </option>
                                    ))}
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

                            {simulations.data.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <div className="space-y-3">
                                    {simulations.data.map((scenario, index) => (
                                        <ScenarioCard
                                            key={scenario.id}
                                            scenario={scenario}
                                            emoji={
                                                scenarioEmojis[
                                                    index %
                                                        scenarioEmojis.length
                                                ]
                                            }
                                            onEdit={() => openEdit(scenario)}
                                            onOpenOptions={() =>
                                                openOptions(scenario)
                                            }
                                            onDelete={() =>
                                                deleteScenario(scenario)
                                            }
                                        />
                                    ))}
                                </div>
                            )}

                            {simulations.links.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {simulations.links.map((link, index) => (
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
                                        Skenario Baru
                                    </h2>
                                    <p className="text-xs font-medium text-slate-400">
                                        Buat situasi latihan untuk santri.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3">
                                <Button
                                    type="button"
                                    onClick={openCreate}
                                    className="rounded-2xl bg-emerald-600 py-5 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-700"
                                >
                                    Buat Skenario Baru
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>

                            <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-700">
                                <p className="font-extrabold">
                                    Tips menulis situasi
                                </p>
                                <p className="mt-1 font-medium">
                                    Gunakan momen yang dekat dengan keseharian
                                    santri agar mudah dibayangkan dan direspons.
                                </p>
                            </div>
                        </section>

                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-700">
                                <Sparkles className="size-5 text-amber-500" />
                                Panduan Menyusun Skenario
                            </h2>
                            <div className="space-y-3">
                                <GuideItem
                                    emoji="🌱"
                                    title="Situasi Dekat Keseharian"
                                    description="Tulis momen yang sering dialami santri di sekolah agar mudah dibayangkan."
                                />
                                <GuideItem
                                    emoji="🤝"
                                    title="Beragam Pilihan Respons"
                                    description="Gabungkan jawaban asertif, pasif, dan agresif sebagai bahan diskusi."
                                />
                                <GuideItem
                                    emoji="📝"
                                    title="Feedback yang Membangun"
                                    description="Evaluasi dengan kalimat yang jujur namun tetap lembut dan menghargai."
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
                                        Latihan, bukan pelabelan
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-slate-300">
                                Skor dan poin membantu santri belajar, bukan
                                untuk menilai siapa yang paling baik. Fokus pada
                                proses berlatih setiap hari.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>

            <Sheet
                open={isScenarioSheetOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeScenarioSheet();
                    }
                }}
            >
                <SheetContent className="w-full gap-0 overflow-hidden bg-[#f8fafc] p-0 sm:max-w-xl">
                    <SheetHeader className="shrink-0 border-b border-slate-100 bg-white/80 px-5 py-5 pr-14 backdrop-blur-sm">
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                            <BookOpenCheck className="size-6" />
                        </div>
                        <SheetTitle className="text-xl font-extrabold text-slate-800">
                            {editingScenario
                                ? 'Edit Skenario'
                                : 'Tambah Skenario'}
                        </SheetTitle>
                        <SheetDescription className="text-slate-500">
                            Tulis situasi cerita dan atur status tampil
                            skenario.
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        id="scenario-form"
                        onSubmit={submitScenario}
                        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5"
                    >
                        <div className="grid gap-2">
                            <Label
                                htmlFor="title"
                                className="text-xs font-extrabold text-slate-600"
                            >
                                Judul
                            </Label>
                            <Input
                                id="title"
                                className="rounded-2xl border-slate-100 bg-white text-sm text-slate-900 shadow-sm focus-visible:ring-emerald-200"
                                value={scenarioForm.data.title}
                                onChange={(event) =>
                                    scenarioForm.setData(
                                        'title',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={scenarioForm.errors.title} />
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
                                className="min-h-20 rounded-[22px] border border-slate-100 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={scenarioForm.data.description}
                                onChange={(event) =>
                                    scenarioForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={scenarioForm.errors.description}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="opening_text"
                                className="text-xs font-extrabold text-slate-600"
                            >
                                Situasi / Cerita
                            </Label>
                            <textarea
                                id="opening_text"
                                className="min-h-40 rounded-[22px] border border-slate-100 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={scenarioForm.data.opening_text}
                                onChange={(event) =>
                                    scenarioForm.setData(
                                        'opening_text',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={scenarioForm.errors.opening_text}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="status"
                                className="text-xs font-extrabold text-slate-600"
                            >
                                Status
                            </Label>
                            <select
                                id="status"
                                className="h-11 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={scenarioForm.data.status}
                                onChange={(event) =>
                                    scenarioForm.setData(
                                        'status',
                                        event.target.value,
                                    )
                                }
                            >
                                {statuses.map((item) => (
                                    <option key={item} value={item}>
                                        {statusLabels[item] ?? item}
                                    </option>
                                ))}
                            </select>
                            <InputError message={scenarioForm.errors.status} />
                        </div>
                    </form>

                    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeScenarioSheet}
                            className="rounded-2xl border-slate-200 text-slate-600"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="scenario-form"
                            disabled={scenarioForm.processing}
                            className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                        >
                            {editingScenario
                                ? 'Simpan Perubahan'
                                : 'Simpan Skenario'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet
                open={optionScenarioId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setOptionScenarioId(null);
                        setEditingOption(null);
                        optionForm.reset();
                    }
                }}
            >
                <SheetContent className="w-full gap-0 overflow-hidden bg-[#f8fafc] p-0 sm:max-w-xl">
                    <SheetHeader className="shrink-0 border-b border-slate-100 bg-white/80 px-5 py-5 pr-14 backdrop-blur-sm">
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                            <ClipboardList className="size-6" />
                        </div>
                        <SheetTitle className="text-xl font-extrabold text-slate-800">
                            Respons Skenario
                        </SheetTitle>
                        <SheetDescription className="text-slate-500">
                            {optionScenario
                                ? optionScenario.title
                                : 'Kelola respons pilihan santri.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={startCreateOption}
                                className="rounded-2xl border-emerald-100 text-xs font-extrabold text-emerald-700 hover:bg-emerald-50"
                            >
                                <Plus className="size-4" />
                                Tambah Respons
                            </Button>
                        </div>

                        {optionScenario?.options.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center text-sm font-semibold text-emerald-700">
                                Belum ada respons untuk skenario ini.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {optionScenario?.options.map((option) => (
                                    <div
                                        key={option.id}
                                        className="rounded-[24px] border border-emerald-100 bg-white p-4 text-sm shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-extrabold text-slate-800">
                                                    {option.text}
                                                </p>
                                                {option.feedback_text && (
                                                    <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-slate-500">
                                                        <MessageSquareText className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                                                        {option.feedback_text}
                                                    </p>
                                                )}
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600">
                                                        Skor {option.score}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">
                                                        <Star className="size-3" />
                                                        {option.reward_points}{' '}
                                                        poin
                                                    </span>
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                                                        Urutan{' '}
                                                        {option.sort_order}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        startEditOption(option)
                                                    }
                                                    className="rounded-2xl border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
                                                >
                                                    <Pencil className="size-3.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        deleteOption(option)
                                                    }
                                                    className="rounded-2xl border-rose-100 text-xs font-extrabold text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form
                            id="option-form"
                            onSubmit={submitOption}
                            className="grid gap-5 rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm"
                        >
                            <div className="font-extrabold text-slate-800">
                                {editingOption
                                    ? 'Edit Respons'
                                    : 'Form Respons'}
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="option_text"
                                    className="text-xs font-extrabold text-slate-600"
                                >
                                    Teks Respons
                                </Label>
                                <textarea
                                    id="option_text"
                                    className="min-h-24 rounded-[22px] border border-slate-100 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={optionForm.data.text}
                                    onChange={(event) =>
                                        optionForm.setData(
                                            'text',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={optionForm.errors.text} />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="option_feedback"
                                    className="text-xs font-extrabold text-slate-600"
                                >
                                    Feedback
                                </Label>
                                <textarea
                                    id="option_feedback"
                                    className="min-h-20 rounded-[22px] border border-slate-100 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={optionForm.data.feedback_text}
                                    onChange={(event) =>
                                        optionForm.setData(
                                            'feedback_text',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Penjelasan/evaluasi yang ditampilkan setelah santri memilih respons ini"
                                />
                                <InputError
                                    message={optionForm.errors.feedback_text}
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="option_score"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Skor
                                    </Label>
                                    <Input
                                        id="option_score"
                                        type="number"
                                        min={0}
                                        max={100}
                                        className="rounded-2xl border-slate-100 bg-white text-sm text-slate-900 shadow-sm focus-visible:ring-emerald-200"
                                        value={optionForm.data.score}
                                        onFocus={(event) =>
                                            event.currentTarget.select()
                                        }
                                        onChange={(event) =>
                                            optionForm.setData(
                                                'score',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={optionForm.errors.score}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="option_reward"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Poin Reward
                                    </Label>
                                    <Input
                                        id="option_reward"
                                        type="number"
                                        min={0}
                                        max={1000}
                                        className="rounded-2xl border-slate-100 bg-white text-sm text-slate-900 shadow-sm focus-visible:ring-emerald-200"
                                        value={optionForm.data.reward_points}
                                        onFocus={(event) =>
                                            event.currentTarget.select()
                                        }
                                        onChange={(event) =>
                                            optionForm.setData(
                                                'reward_points',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            optionForm.errors.reward_points
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="option_sort_order"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Urutan
                                    </Label>
                                    <Input
                                        id="option_sort_order"
                                        type="number"
                                        min={0}
                                        max={9999}
                                        className="rounded-2xl border-slate-100 bg-white text-sm text-slate-900 shadow-sm focus-visible:ring-emerald-200"
                                        value={optionForm.data.sort_order}
                                        onFocus={(event) =>
                                            event.currentTarget.select()
                                        }
                                        onChange={(event) =>
                                            optionForm.setData(
                                                'sort_order',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={optionForm.errors.sort_order}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setEditingOption(null);
                                optionForm.reset();
                            }}
                            className="rounded-2xl border-slate-200 text-slate-600"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="option-form"
                            disabled={optionForm.processing}
                            className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                        >
                            {editingOption
                                ? 'Simpan Perubahan'
                                : 'Simpan Respons'}
                        </Button>
                    </div>
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
    value: number;
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

function ScenarioCard({
    scenario,
    emoji,
    onEdit,
    onOpenOptions,
    onDelete,
}: {
    scenario: SimulationRow;
    emoji: string;
    onEdit: () => void;
    onOpenOptions: () => void;
    onDelete: () => void;
}) {
    return (
        <article className="group rounded-[24px] border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xl shadow-sm transition-transform group-hover:scale-105">
                        {emoji}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-slate-800">
                                {scenario.title}
                            </h3>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                {statusLabels[scenario.status] ??
                                    scenario.status}
                            </span>
                        </div>
                        <p className="mt-2 max-w-3xl text-xs leading-relaxed font-medium text-slate-500">
                            {scenario.opening_text}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge className={statusClasses(scenario.status)}>
                                {statusLabels[scenario.status] ??
                                    scenario.status}
                            </Badge>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                                <ListChecks className="size-3.5 text-emerald-500" />
                                {scenario.options_count} respons
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                                <CalendarClock className="size-3.5 text-emerald-500" />
                                {formatDate(scenario.created_at)}
                            </span>
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
                        onClick={onOpenOptions}
                        className="rounded-2xl bg-emerald-600 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                    >
                        <ListChecks className="size-3.5" />
                        Respons
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
                    icon={<ListChecks className="size-4" />}
                    label="Pilihan Jawaban"
                    value={`${scenario.options_count} respons`}
                />
                <MetaItem
                    icon={<Sparkles className="size-4" />}
                    label="Percobaan"
                    value={`${scenario.attempts_count} kali`}
                />
                <MetaItem
                    icon={<UserRoundCheck className="size-4" />}
                    label="Dibuat oleh"
                    value={scenario.creator_name ?? 'Ustadz'}
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
                🗣️
            </div>
            <h4 className="mt-3 text-base font-extrabold text-slate-800">
                Belum ada skenario simulasi
            </h4>
            <p className="mt-1 max-w-sm text-xs leading-relaxed font-medium text-slate-500">
                Buat skenario pertama melalui tombol “Buat Skenario Baru”, lalu
                lengkapi dengan pilihan respons dan feedback.
            </p>
        </div>
    );
}

function firstError(errors: Partial<Record<string, string>>): string {
    return Object.values(errors)[0] ?? 'Terjadi kesalahan. Coba lagi.';
}
