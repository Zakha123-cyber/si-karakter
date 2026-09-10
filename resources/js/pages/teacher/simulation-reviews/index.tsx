import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Eye,
    Filter,
    Search,
    ShieldCheck,
    Star,
    Trophy,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface AttemptItem {
    id: number;
    completed_at: string | null;
    score: number;
    reward_points: number;
    is_best: boolean;
    student: {
        id: number;
        name: string;
        student_code: string | null;
    } | null;
    group: {
        id: number;
        name: string;
    } | null;
    scenario: {
        id: number;
        title: string;
    } | null;
    selected_option: {
        id: number;
        text: string;
    } | null;
    review: {
        status: string;
        teacher_note: string | null;
        teacher_name: string | null;
        reviewed_at: string | null;
    };
}

interface IndexProps {
    attempts: {
        data: AttemptItem[];
        links: any[];
        meta: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    filters: {
        search: string;
        status: string;
        scenario_id: number | null;
        group_id: number | null;
    };
    scenarios: Array<{ id: number; title: string }>;
    groups: Array<{ id: number; name: string }>;
}

function formatDateTime(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function SimulationReviewIndex({
    attempts,
    filters,
    scenarios,
    groups,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [scenarioId, setScenarioId] = useState<string>(
        filters.scenario_id?.toString() || '',
    );
    const [groupId, setGroupId] = useState<string>(
        filters.group_id?.toString() || '',
    );

    const applyFilters = (newFilters: {
        search?: string;
        status?: string;
        scenario_id?: string;
        group_id?: string;
    }) => {
        router.get(
            '/teacher/simulation-reviews',
            {
                search: newFilters.search ?? search,
                status: newFilters.status ?? status,
                scenario_id: newFilters.scenario_id ?? scenarioId,
                group_id: newFilters.group_id ?? groupId,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    return (
        <>
            <Head title="Review Simulasi" />

            <div className="min-h-full space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-emerald-100">
                                <ShieldCheck className="size-4" />
                                <span className="text-xs font-bold tracking-wider uppercase">
                                    Simulasi Berani Menolak
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Review Latihan Keberanian Santri
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/90">
                                Tinjau pilihan respons santri pada setiap
                                skenario dan berikan catatan pembinaan agar
                                latihan berani menolak semakin bermakna.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                🛡️
                            </span>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800">
                                    Daftar Hasil Simulasi
                                </h2>
                                <p className="text-xs font-medium text-slate-400">
                                    {attempts.meta.total} hasil latihan tercatat
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                            <Filter className="size-4" />
                            Filter hasil simulasi
                        </div>
                    </div>

                    <div className="mb-5 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
                        {[
                            { id: 'pending', label: 'Belum Direview' },
                            { id: 'reviewed', label: 'Sudah Direview' },
                            { id: 'all', label: 'Semua' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setStatus(tab.id);
                                    applyFilters({ status: tab.id });
                                }}
                                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                                    status === tab.id
                                        ? 'bg-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)]'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form
                        onSubmit={handleSearchSubmit}
                        className="mb-5 grid grid-cols-1 gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3 sm:grid-cols-2 xl:grid-cols-12"
                    >
                        <div className="relative sm:col-span-2 xl:col-span-3">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama santri"
                                className="h-10 w-full rounded-2xl border border-slate-100 bg-white pr-3 pl-9 text-sm text-slate-700 shadow-sm transition outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-100"
                            />
                        </div>
                        <div className="relative sm:col-span-1 xl:col-span-3">
                            <select
                                value={scenarioId}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setScenarioId(next);
                                    applyFilters({ scenario_id: next });
                                }}
                                className="h-10 w-full rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-100"
                            >
                                <option value="">Semua Skenario</option>
                                {scenarios.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="relative sm:col-span-1 xl:col-span-3">
                            <select
                                value={groupId}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setGroupId(next);
                                    applyFilters({ group_id: next });
                                }}
                                className="h-10 w-full rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-100"
                            >
                                <option value="">Semua Kelompok</option>
                                {groups.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2 sm:col-span-2 xl:col-span-3">
                            <button
                                type="submit"
                                className="h-10 flex-1 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition hover:bg-emerald-700"
                            >
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('all');
                                    setScenarioId('');
                                    setGroupId('');
                                    router.get(
                                        '/teacher/simulation-reviews',
                                        {},
                                        { preserveState: true },
                                    );
                                }}
                                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-500 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                                Reset
                            </button>
                        </div>
                    </form>

                    {attempts.data.length === 0 ? (
                        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                                🛡️
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-700">
                                Belum ada hasil simulasi
                            </h3>
                            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                                Belum ada latihan berani menolak yang sesuai
                                dengan filter saat ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {attempts.data.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition hover:border-emerald-100 hover:shadow-md sm:p-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                                <User className="size-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-sm font-extrabold text-slate-800">
                                                        {item.student?.name ??
                                                            'Santri'}
                                                    </h3>
                                                    {item.student
                                                        ?.student_code && (
                                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                                            {
                                                                item.student
                                                                    .student_code
                                                            }
                                                        </span>
                                                    )}
                                                    {item.group && (
                                                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600">
                                                            {item.group.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                                    {item.scenario?.title ??
                                                        'Skenario'}
                                                </p>
                                                <p className="line-clamp-1 text-[11px] text-slate-400">
                                                    {item.selected_option
                                                        ?.text ??
                                                        'Belum ada respons'}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                                                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-emerald-700">
                                                        <Trophy className="size-3.5" />
                                                        Skor {item.score}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-amber-700">
                                                        <Star className="size-3.5" />
                                                        +{item.reward_points}{' '}
                                                        poin
                                                    </span>
                                                    {item.is_best && (
                                                        <span className="inline-flex items-center gap-1 rounded-xl bg-teal-50 px-2.5 py-1 text-teal-700">
                                                            <ShieldCheck className="size-3.5" />
                                                            Pilihan Terbaik
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-slate-500">
                                                        <Clock className="size-3.5" />
                                                        {formatDateTime(
                                                            item.completed_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {item.review.status ===
                                            'reviewed' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Sudah Direview
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Belum Direview
                                                </span>
                                            )}
                                            <Link
                                                href={`/teacher/simulation-reviews/${item.id}`}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition hover:bg-emerald-700"
                                            >
                                                <Eye className="size-3.5" />
                                                Lihat Detail
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
