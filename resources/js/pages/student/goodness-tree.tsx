import { Head, router } from '@inertiajs/react';
import {
    Award,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Coins,
    Leaf,
    Lock,
    Sparkles,
    TreePine,
    Trophy,
} from 'lucide-react';
import type { ReactNode } from 'react';

type TreeLevel = {
    id: number;
    level: number;
    name: string;
    minimum_points: number;
    asset_path: string;
    description: string | null;
    unlocked?: boolean;
};

type RewardTransaction = {
    id: number;
    points: number;
    description: string;
    source_type: string;
    source_label: string;
    awarded_by: string | null;
    created_at: string | null;
    created_at_label: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedTransactions = {
    data: RewardTransaction[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    student: {
        name: string;
        group: string | null;
        student_code: string | null;
    };
    tree: {
        points: number;
        progress_percent: number;
        points_to_next_level: number;
        is_max_level: boolean;
        current_level: TreeLevel | null;
        next_level: TreeLevel | null;
        levels: TreeLevel[];
    };
    transactions: PaginatedTransactions;
};

export default function StudentGoodnessTree({
    student,
    tree,
    transactions,
}: Props) {
    const firstName = student.name.split(' ')[0] || 'Santri';
    const currentLevelName = tree.current_level?.name ?? 'Benih Kebaikan';
    const progress = clamp(tree.progress_percent, 0, 100);

    return (
        <>
            <Head title="Pohon Kebaikan" />

            <div className="space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 p-6 text-white shadow-[0_12px_40px_rgba(16,185,129,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-10 -right-8 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 left-10 h-40 w-40 rounded-full bg-lime-200/20 blur-3xl" />

                    <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
                        <div className="min-w-0">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                                <TreePine className="size-4 text-emerald-100" />
                                Pohon Kebaikan
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Kebaikanmu terus tumbuh, {firstName}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                Setiap poin adalah tanda latihan kebaikan. Terus
                                rawat pohon ini dengan sikap jujur, peduli,
                                berani, dan bertanggung jawab.
                            </p>
                        </div>

                        <div className="rounded-[28px] bg-white/18 p-4 backdrop-blur-md">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold text-emerald-50">
                                        Total Poin Baik
                                    </p>
                                    <p className="text-4xl font-extrabold">
                                        {tree.points}
                                    </p>
                                </div>
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20">
                                    <Coins className="size-8 text-amber-100" />
                                </div>
                            </div>
                            <div className="mt-4 rounded-2xl bg-white/18 px-4 py-3 text-xs font-semibold text-emerald-50">
                                Level saat ini:{' '}
                                <span className="font-extrabold text-white">
                                    {currentLevelName}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <main className="min-w-0 space-y-6">
                        <section className="rounded-[32px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
                                <div className="rounded-[28px] bg-gradient-to-br from-emerald-50 to-lime-50 p-5">
                                    <TreeIllustration
                                        progress={progress}
                                        level={tree.current_level?.level ?? 1}
                                    />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                                            Level{' '}
                                            {tree.current_level?.level ?? 1}
                                        </span>
                                        {tree.is_max_level && (
                                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                                                Level tertinggi
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="mt-3 text-2xl font-extrabold text-slate-800">
                                        {currentLevelName}
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-slate-500">
                                        {tree.current_level?.description ??
                                            'Mulai kumpulkan poin dari kebaikan harianmu. Tidak perlu terburu-buru, setiap langkah baik tetap berarti.'}
                                    </p>

                                    <div className="mt-6">
                                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500">
                                            <span>{tree.points} poin</span>
                                            {tree.next_level ? (
                                                <span>
                                                    Target berikutnya:{' '}
                                                    {
                                                        tree.next_level
                                                            .minimum_points
                                                    }{' '}
                                                    poin
                                                </span>
                                            ) : (
                                                <span>
                                                    Pohonmu sedang rindang
                                                </span>
                                            )}
                                        </div>
                                        <div className="h-4 overflow-hidden rounded-full bg-emerald-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-600 transition-all duration-700"
                                                style={{
                                                    width: `${progress}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-2 text-xs font-semibold text-emerald-700">
                                            {tree.next_level
                                                ? `${tree.points_to_next_level} poin lagi menuju ${tree.next_level.name}.`
                                                : 'Terus rawat pohonmu dengan kebaikan baru setiap hari.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[32px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-800">
                                        <Award className="size-5 text-amber-500" />
                                        Riwayat Reward Positif
                                    </h2>
                                    <p className="mt-1 text-xs font-medium text-slate-400">
                                        {transactions.from ?? 0}-
                                        {transactions.to ?? 0} dari{' '}
                                        {transactions.total} apresiasi
                                    </p>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                                    Poin kebaikan saja
                                </span>
                            </div>

                            {transactions.data.length === 0 ? (
                                <EmptyRewardState />
                            ) : (
                                <div className="space-y-3">
                                    {transactions.data.map((transaction) => (
                                        <RewardCard
                                            key={transaction.id}
                                            transaction={transaction}
                                        />
                                    ))}
                                </div>
                            )}

                            {transactions.links.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {transactions.links.map((link, index) => (
                                        <button
                                            key={`${link.label}-${index}`}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(
                                                        link.url,
                                                        {},
                                                        {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }
                                            }}
                                            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-xs font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                                link.active
                                                    ? 'bg-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)]'
                                                    : 'border border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50'
                                            }`}
                                        >
                                            <PaginationLabel
                                                label={link.label}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>

                    <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
                        <InfoCard
                            icon={<Sparkles className="size-5" />}
                            title="Cara pohon bertumbuh"
                            tone="emerald"
                        >
                            Poin reward positif dari observasi dan aktivitas
                            baik akan menumbuhkan pohon. Poin ini terpisah dari
                            skor asesmen karakter.
                        </InfoCard>

                        <section className="rounded-[32px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-800">
                                <Trophy className="size-5 text-amber-500" />
                                Perjalanan Level
                            </h2>
                            <div className="space-y-3">
                                {tree.levels.length === 0 ? (
                                    <p className="rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">
                                        Level pohon belum tersedia. Ustadz akan
                                        menyiapkannya terlebih dahulu.
                                    </p>
                                ) : (
                                    tree.levels.map((level) => (
                                        <LevelStep
                                            key={level.id}
                                            level={level}
                                        />
                                    ))
                                )}
                            </div>
                        </section>

                        <InfoCard
                            icon={<Leaf className="size-5" />}
                            title="Pesan hari ini"
                            tone="amber"
                        >
                            Kebaikan tidak harus besar. Senyum, jujur, membantu
                            teman, dan berani berkata baik juga membuat pohonmu
                            semakin indah.
                        </InfoCard>
                    </aside>
                </div>
            </div>
        </>
    );
}

function TreeIllustration({
    progress,
    level,
}: {
    progress: number;
    level: number;
}) {
    const canopyScale = 0.72 + Math.min(progress, 100) / 360;
    const leafOpacity = progress < 20 ? 0.45 : progress < 60 ? 0.72 : 1;
    const fruitCount = level >= 5 ? 6 : level >= 4 ? 4 : progress > 75 ? 3 : 0;

    return (
        <div className="relative mx-auto flex h-72 max-w-sm items-end justify-center overflow-hidden rounded-[28px] bg-gradient-to-b from-sky-100 via-emerald-50 to-lime-100 p-4">
            <div className="absolute top-5 left-5 h-12 w-12 rounded-full bg-amber-200 opacity-80 blur-sm" />
            <div className="absolute right-8 bottom-8 h-10 w-24 rounded-full bg-emerald-200/70 blur-md" />
            <svg
                viewBox="0 0 240 240"
                className="relative h-64 w-64"
                aria-hidden="true"
            >
                <ellipse
                    cx="120"
                    cy="220"
                    rx="72"
                    ry="12"
                    fill="#047857"
                    opacity="0.16"
                />
                <path
                    d="M112 218 C114 176 113 143 109 111 C125 136 135 166 132 218 Z"
                    fill="#92400e"
                />
                <path
                    d="M120 142 C100 122 82 108 59 103"
                    stroke="#92400e"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                />
                <path
                    d="M123 130 C143 107 159 94 184 87"
                    stroke="#92400e"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                />
                <g
                    transform={`translate(120 88) scale(${canopyScale}) translate(-120 -88)`}
                    opacity={leafOpacity}
                >
                    <circle cx="82" cy="94" r="38" fill="#34d399" />
                    <circle cx="119" cy="66" r="44" fill="#10b981" />
                    <circle cx="160" cy="96" r="40" fill="#22c55e" />
                    <circle cx="116" cy="112" r="48" fill="#059669" />
                    <circle
                        cx="93"
                        cy="62"
                        r="28"
                        fill="#86efac"
                        opacity="0.88"
                    />
                    <circle
                        cx="151"
                        cy="61"
                        r="27"
                        fill="#a7f3d0"
                        opacity="0.84"
                    />
                </g>
                {Array.from({ length: fruitCount }).map((_, index) => (
                    <circle
                        key={index}
                        cx={[99, 132, 158, 84, 121, 145][index]}
                        cy={[92, 80, 111, 122, 128, 61][index]}
                        r="6"
                        fill="#f59e0b"
                    />
                ))}
            </svg>
        </div>
    );
}

function RewardCard({ transaction }: { transaction: RewardTransaction }) {
    return (
        <article className="rounded-[24px] border border-emerald-100 bg-emerald-50/50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-sm">
                        <Award className="size-6" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-800">
                            {transaction.description}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                            <MetaPill
                                icon={<CalendarDays className="size-3.5" />}
                            >
                                {transaction.created_at_label ?? 'Baru saja'}
                            </MetaPill>
                            <MetaPill icon={<Sparkles className="size-3.5" />}>
                                {transaction.source_label}
                            </MetaPill>
                            {transaction.awarded_by && (
                                <MetaPill
                                    icon={<CheckCircle2 className="size-3.5" />}
                                >
                                    {transaction.awarded_by}
                                </MetaPill>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-emerald-700 shadow-sm">
                    <Coins className="size-4 text-amber-500" />+
                    {transaction.points}
                </div>
            </div>
        </article>
    );
}

function LevelStep({ level }: { level: TreeLevel }) {
    return (
        <div
            className={`flex items-start gap-3 rounded-2xl p-3.5 ${
                level.unlocked
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-slate-50 text-slate-500'
            }`}
        >
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    level.unlocked
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                }`}
            >
                {level.unlocked ? (
                    <CheckCircle2 className="size-5" />
                ) : (
                    <Lock className="size-5" />
                )}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-extrabold">
                    Level {level.level}: {level.name}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold opacity-75">
                    Mulai {level.minimum_points} poin
                </p>
                {level.description && (
                    <p className="mt-1 text-xs leading-relaxed opacity-80">
                        {level.description}
                    </p>
                )}
            </div>
        </div>
    );
}

function InfoCard({
    icon,
    title,
    tone,
    children,
}: {
    icon: ReactNode;
    title: string;
    tone: 'emerald' | 'amber';
    children: ReactNode;
}) {
    const toneClasses =
        tone === 'emerald'
            ? 'from-emerald-50 to-teal-50 text-emerald-700'
            : 'from-amber-50 to-orange-50 text-amber-800';

    return (
        <section
            className={`rounded-[32px] bg-gradient-to-br p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] ${toneClasses}`}
        >
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
                    {icon}
                </div>
                <h2 className="text-base font-extrabold">{title}</h2>
            </div>
            <p className="mt-3 text-xs leading-relaxed font-semibold text-slate-600">
                {children}
            </p>
        </section>
    );
}

function MetaPill({
    icon,
    children,
}: {
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm">
            {icon}
            {children}
        </span>
    );
}

function EmptyRewardState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Leaf className="size-7" />
            </div>
            <h3 className="mt-3 text-base font-extrabold text-slate-800">
                Belum ada reward tercatat
            </h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed font-medium text-slate-500">
                Mulai dari satu kebaikan hari ini. Saat ustadz memberi
                apresiasi, poinmu akan muncul di sini.
            </p>
        </div>
    );
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

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
