import { Head, Link, router } from '@inertiajs/react';
import {
    AudioLines,
    Bot,
    CheckCircle2,
    Clock,
    Eye,
    Filter,
    Search,
    ShieldAlert,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface ReviewItem {
    id: number;
    test_attempt_id: number;
    answer_status: string;
    submitted_at: string | null;
    student: {
        id: number;
        name: string;
        student_code: string;
    };
    group: {
        id: number;
        name: string;
    };
    test_package: {
        id: number;
        title: string;
    };
    moral_case: {
        id: number;
        title: string;
    };
    audio: {
        has_audio: boolean;
        file_count: number;
    };
    transcription: {
        status: string;
        confidence: number | null;
    };
    ai_assessment: {
        moral_level: string | null;
        confidence: number | null;
        status: string;
    };
    validation: {
        status: string;
        decision: string | null;
        final_moral_level: string | null;
        validated_at: string | null;
    };
}

interface IndexProps {
    reviews: {
        data: ReviewItem[];
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
        group_id: number | null;
        test_package_id: number | null;
    };
    groups: Array<{ id: number; name: string }>;
    testPackages: Array<{ id: number; title: string }>;
}

export default function ReviewQueueIndex({
    reviews,
    filters,
    groups,
    testPackages,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'pending');
    const [groupId, setGroupId] = useState<string>(
        filters.group_id?.toString() || '',
    );
    const [packageId, setPackageId] = useState<string>(
        filters.test_package_id?.toString() || '',
    );

    const applyFilters = (newFilters: {
        search?: string;
        status?: string;
        group_id?: string;
        test_package_id?: string;
    }) => {
        router.get(
            '/teacher/reviews',
            {
                search: newFilters.search ?? search,
                status: newFilters.status ?? status,
                group_id: newFilters.group_id ?? groupId,
                test_package_id: newFilters.test_package_id ?? packageId,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const renderStatusBadge = (validationStatus: string) => {
        if (validationStatus === 'approved') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Disetujui
                </span>
            );
        }

        if (validationStatus === 'overridden') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Dioverride
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Clock className="h-3.5 w-3.5" />
                Belum Direview
            </span>
        );
    };

    return (
        <>
            <Head title="Review Asesmen" />

            <div className="min-h-full space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-emerald-100">
                                <ShieldAlert className="size-4" />
                                <span className="text-xs font-bold tracking-wider uppercase">
                                    Review Asesmen
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Antrean Validasi Penilaian Santri
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/90">
                                Tinjau hasil transkripsi dan penilaian otomatis dari
                                AI atas tes penalaran moral santri untuk memberikan
                                validasi atau penyesuaian secara cepat dan konsisten.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                📋
                            </span>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800">
                                    Daftar Antrean Review
                                </h2>
                                <p className="text-xs font-medium text-slate-400">
                                    {reviews.meta.total} item perlu diperiksa
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                            <Filter className="size-4" />
                            Filter ramah ustadz
                        </div>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                        {[
                            { id: 'pending', label: 'Belum Direview' },
                            { id: 'approved', label: 'Disetujui' },
                            { id: 'overridden', label: 'Dioverride' },
                            { id: 'all', label: 'Semua' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setStatus(tab.id);
                                    applyFilters({ status: tab.id });
                                }}
                                className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
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
                        className="mb-5 grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3 lg:grid-cols-6"
                    >
                        <div className="relative lg:col-span-3">
                            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama santri"
                                className="h-10 w-full rounded-2xl border border-slate-100 bg-white pl-9 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-100"
                            />
                        </div>
                        <div className="relative lg:col-span-1">
                            <select
                                value={status}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setStatus(next);
                                    applyFilters({ status: next });
                                }}
                                className="h-10 w-full rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-100"
                            >
                                <option value="pending">Belum Direview</option>
                                <option value="approved">Disetujui</option>
                                <option value="overridden">Dioverride</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                        <div className="relative lg:col-span-1">
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
                        <div className="relative lg:col-span-1">
                            <select
                                value={packageId}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setPackageId(next);
                                    applyFilters({
                                        test_package_id: next,
                                    });
                                }}
                                className="h-10 w-full rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-100"
                            >
                                <option value="">Semua Paket</option>
                                {testPackages.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2 lg:col-span-2">
                            <button
                                type="submit"
                                className="flex-1 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition hover:bg-emerald-700"
                            >
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('pending');
                                    setGroupId('');
                                    setPackageId('');
                                    router.get('/teacher/reviews', {}, { preserveState: true });
                                }}
                                className="rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-white"
                            >
                                Reset
                            </button>
                        </div>
                    </form>

                    {reviews.data.length === 0 ? (
                        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                                📄
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-700">
                                Tidak ada antrean review
                            </h3>
                            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                                Belum ada jawaban tes yang membutuhkan validasi
                                berdasarkan filter saat ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviews.data.map((item) => (
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
                                                        {item.student.name}
                                                    </h3>
                                                    {item.student.student_code && (
                                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                                            {item.student.student_code}
                                                        </span>
                                                    )}
                                                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600">
                                                        {item.group.name}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs font-medium text-slate-500">
                                                    {item.moral_case.title}
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    {item.test_package.title}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                                                    {item.audio.has_audio && (
                                                        <span className="rounded-xl bg-indigo-50 px-2.5 py-1 text-indigo-700">
                                                            <span className="inline-flex items-center gap-1">
                                                                <AudioLines className="size-3.5" />
                                                                Audio
                                                            </span>
                                                        </span>
                                                    )}
                                                    {item.ai_assessment.moral_level && (
                                                        <span className="rounded-xl bg-teal-50 px-2.5 py-1 text-teal-700">
                                                            <span className="inline-flex items-center gap-1">
                                                                <Bot className="size-3.5" />
                                                                AI: {item.ai_assessment.moral_level}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {renderStatusBadge(item.validation.status)}
                                            <Link
                                                href={`/teacher/reviews/${item.id}`}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition hover:bg-emerald-700"
                                            >
                                                <Eye className="size-3.5" />
                                                Tinjau Detail
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
