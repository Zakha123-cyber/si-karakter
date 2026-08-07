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
import type { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Validasi & Review',
        href: '/teacher/reviews',
    },
];

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Antrean Review Validasi Ustadz" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-xl md:p-8">
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
                            Phase 8 — Teacher Validation
                        </span>
                        <h1 className="mt-3 text-2xl font-bold md:text-3xl">
                            Antrean Validasi Penilaian Santri
                        </h1>
                        <p className="mt-2 text-sm text-emerald-100 md:text-base">
                            Tinjau hasil transkripsi dan penilaian otomatis dari
                            AI atas tes penalaran moral santri untuk memberikan
                            validasi atau penyesuaian (*override*).
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Status Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'pending', label: 'Belum Direview' },
                                { id: 'approved', label: 'Disetujui' },
                                { id: 'overridden', label: 'Dioverride' },
                                { id: 'all', label: 'Semua' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setStatus(tab.id);
                                        applyFilters({ status: tab.id });
                                    }}
                                    className={`rounded-lg px-4 py-2 text-xs font-medium transition-all md:text-sm ${
                                        status === tab.id
                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative flex-1 md:max-w-xs"
                        >
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama santri..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs text-slate-800 transition outline-none focus:border-emerald-500 focus:bg-white md:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-emerald-500"
                            />
                        </form>
                    </div>

                    {/* Secondary Filters */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Filter className="h-3.5 w-3.5" />
                            <span>Filter:</span>
                        </div>

                        {/* Group Selector */}
                        <select
                            value={groupId}
                            onChange={(e) => {
                                setGroupId(e.target.value);
                                applyFilters({ group_id: e.target.value });
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            <option value="">Semua Kelompok</option>
                            {groups.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.name}
                                </option>
                            ))}
                        </select>

                        {/* Test Package Selector */}
                        <select
                            value={packageId}
                            onChange={(e) => {
                                setPackageId(e.target.value);
                                applyFilters({
                                    test_package_id: e.target.value,
                                });
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            <option value="">Semua Paket Tes</option>
                            {testPackages.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Queue Review Table/Cards */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {reviews.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                <Clock className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                                Tidak ada antrean review
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Belum ada jawaban tes yang membutuhkan validasi
                                berdasarkan filter saat ini.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {reviews.data.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/75 md:flex-row md:items-center md:justify-between dark:hover:bg-slate-800/50"
                                >
                                    {/* Left: Student & Case Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                                    {item.student.name}
                                                </h4>
                                                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                    {item.student.student_code}
                                                </span>
                                                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                    {item.group.name}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {item.moral_case.title}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {item.test_package.title}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                                {item.audio.has_audio && (
                                                    <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                                        <AudioLines className="h-3.5 w-3.5" />
                                                        Audio Rekaman
                                                    </span>
                                                )}
                                                {item.ai_assessment
                                                    .moral_level && (
                                                    <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
                                                        <Bot className="h-3.5 w-3.5" />
                                                        AI Level:{' '}
                                                        {
                                                            item.ai_assessment
                                                                .moral_level
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Validation Status & Action */}
                                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                                        <div>
                                            {renderStatusBadge(
                                                item.validation.status,
                                            )}
                                        </div>
                                        <Link
                                            href={`/teacher/reviews/${item.id}`}
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Tinjau Detail
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
