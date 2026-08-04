import { Head, Link } from '@inertiajs/react';
import {
    AudioLines,
    CalendarHeart,
    Check,
    Flame,
    Play,
    Volume2,
} from 'lucide-react';

type TreeLevel = {
    level: number;
    name: string;
    description: string | null;
};

type NextLevel = {
    level: number;
    name: string;
    minimum_points: number;
};

type TestPackage = {
    id: number;
    title: string;
    description: string | null;
    cases_count: number;
    can_start: boolean;
};

type Content = {
    id: number;
    title: string;
    description: string | null;
    thumbnail: string | null;
    duration_seconds: number | null;
};

type Scenario = {
    id: number;
    title: string;
    description: string | null;
    opening_text: string | null;
    image: string | null;
};

type Mission = {
    id: string;
    icon: string;
    title: string;
    description: string;
    reward: number;
    completed: boolean;
};

type Props = {
    student: {
        name: string;
        gender: string | null;
        group: string | null;
        points: number;
        streak: number;
        stars: number;
        tree_level: TreeLevel | null;
        tree_progress: number;
        next_level: NextLevel | null;
    };
    test_packages: TestPackage[];
    contents: Content[];
    scenarios: Scenario[];
    missions: Mission[];
};

export default function StudentDashboard({
    student,
    test_packages,
    contents,
    scenarios,
    missions,
}: Props) {
    const firstName = student.name.split(' ')[0];
    const completedMissions = missions.filter((m) => m.completed).length;
    const packageToShow =
        test_packages.find((p) => p.can_start) ?? test_packages[0];

    return (
        <>
            <Head title="Beranda Santri" />

            {/* Greeting card */}
            <section className="relative mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 p-6 text-white shadow-[0_12px_40px_rgba(16,185,129,0.35)] sm:p-8">
                {/* Mosque silhouette */}
                <svg
                    className="pointer-events-none absolute -right-6 -top-6 h-56 w-56 opacity-20"
                    viewBox="0 0 200 200"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M100 20l20 30h-40l20-30zM95 55v25h10V55h-10zM70 60l8 18h12l-6-16h-14zM123 60l-8 18h-12l6-16h14zM72 84h56v8H72z" />
                    <path d="M85 95l10 18 10-18h-20z" />
                </svg>

                <div className="relative flex flex-wrap items-center justify-between gap-6">
                    <div className="min-w-0">
                        <button className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm transition-transform hover:scale-105">
                            <Volume2 className="size-4" />
                            Assalamu'alaikum
                        </button>
                        <h1 className="text-3xl font-extrabold sm:text-4xl">
                            Assalamu'alaikum, {firstName} 👋
                        </h1>
                        <p className="mt-2 max-w-md text-sm font-medium text-emerald-50 sm:text-base">
                            Yuk, jadi anak hebat berakhlak mulia!
                        </p>
                    </div>

                    {/* Top-right stats */}
                    <div className="flex flex-wrap items-center gap-3">
                        <StatPill
                            icon={<Flame className="size-5 text-orange-200" />}
                            value={`${student.streak}`}
                            label="Streak"
                        />
                        <StatPill
                            icon={<Star className="size-5 text-yellow-200" />}
                            value={`${student.stars}`}
                            label="Bintang"
                        />
                        <StatPill
                            icon={<Coins className="size-5 text-amber-200" />}
                            value={`${student.points}`}
                            label="Poin"
                        />
                    </div>
                </div>
            </section>

            {/* Body: main content + right panel */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
                {/* Main content */}
                <div className="min-w-0 space-y-6">
                    {/* Section 1: Bioskop Teladan */}
                    <Section
                        index="1"
                        emoji="🎬"
                        title="Bioskop Teladan"
                        color="text-sky-600"
                        description="Tonton kisah teladan yang mengajarkan kebaikan."
                        actionLabel="Lihat semua"
                        onAction={() => {}}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            {(contents.length > 0 ? contents : placeholderContents).map(
                                (c) => <MovieCard key={`${c.id}-${c.title}`} content={c} />,
                            )}
                        </div>
                    </Section>

                    {/* Section 2: Pilih Jalanmu */}
                    <Section
                        index="2"
                        emoji="🛤️"
                        title="Pilih Jalanmu"
                        color="text-purple-600"
                        description="Ikuti kisah dan pilih jalan yang benar."
                        actionLabel="Lihat paket"
                        onAction={() => {}}
                    >
                        {packageToShow && (
                            <div className="flex flex-wrap items-center gap-4 rounded-[28px] bg-purple-50 p-5">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-300 to-fuchsia-300 text-3xl">
                                    🧭
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-bold text-slate-700">
                                        {packageToShow.title}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {packageToShow.description ??
                                            'Kasus dilema moral menantimu'}
                                    </p>
                                </div>
                                <Link
                                    href="/student/tests"
                                    className="rounded-2xl bg-purple-500 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(168,85,247,0.35)] transition-transform hover:scale-[1.03]"
                                >
                                    Mulai Sekarang
                                </Link>
                            </div>
                        )}
                        {!packageToShow && (
                            <div className="rounded-[28px] bg-purple-50 p-5 text-sm text-purple-600">
                                Belum ada paket tes untukmu saat ini.
                            </div>
                        )}
                    </Section>

                    {/* Section 3: Simulasi Berani Menolak */}
                    <Section
                        index="3"
                        emoji="🛡️"
                        title="Simulasi Berani Menolak"
                        color="text-rose-600"
                        description="Latih keberanian menolak ajakan yang tidak baik."
                        actionLabel="Lihat semua"
                        onAction={() => {}}
                    >
                        <div className="grid gap-4 sm:grid-cols-3">
                            {(scenarios.length > 0 ? scenarios : placeholderScenarios).map(
                                (s) => <ScenarioCard key={s.title} scenario={s} />,
                            )}
                        </div>
                    </Section>
                </div>

                {/* Right panel */}
                <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
                    {/* Tree */}
                    <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-extrabold text-slate-700">
                                🌳 Pohon Kebaikan
                            </h2>
                            <span className="text-xs font-bold text-emerald-600">
                                Lv {student.tree_level?.level ?? 1}
                            </span>
                        </div>
                        <TreeIllustration progress={student.tree_progress} />
                        {student.tree_level ? (
                            <p className="-mt-2 text-center text-sm font-bold text-slate-600">
                                {student.tree_level.name}
                            </p>
                        ) : (
                            <p className="-mt-2 text-center text-sm font-bold text-slate-600">
                                Mulai menanam kebaikan
                            </p>
                        )}
                        <div className="mt-4">
                            <div className="mb-1 flex justify-between text-xs font-semibold text-slate-400">
                                <span>{student.points} poin</span>
                                <span>
                                    {student.next_level?.minimum_points ??
                                        student.points}{' '}
                                poin
                                </span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                                    style={{ width: `${student.tree_progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-center gap-1.5">
                            {Array.from({ length: 5 }).map((_, i) =>
                                i < student.stars ? (
                                    <Star key={i} className="size-5 fill-yellow-400 text-yellow-400" />
                                ) : (
                                    <Star key={i} className="size-5 text-slate-200" />
                                ),
                            )}
                        </div>
                    </div>

                    {/* Daily mission */}
                    <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-700">
                                <CalendarHeart className="size-5 text-rose-500" />
                                Misi Harian
                            </h2>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                {completedMissions}/{missions.length}
                            </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2.5">
                            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                                    style={{
                                        width: `${
                                            (completedMissions / missions.length) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>
                        <ul className="mt-4 space-y-2.5">
                            {missions.map((m) => (
                                <li
                                    key={m.id}
                                    className={`flex items-center gap-3 rounded-2xl p-2.5 ${
                                        m.completed ? 'bg-emerald-50' : 'bg-gray-50'
                                    }`}
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                                        {m.icon}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-600">
                                            {m.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            +{m.reward} poin
                                        </p>
                                    </div>
                                    {m.completed ? (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                                            <Check className="size-4" />
                                        </span>
                                    ) : (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Motivational */}
                    <div className="rounded-[28px] bg-gradient-to-br from-amber-100 to-rose-100 p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🌼</span>
                            <p className="text-sm font-bold text-amber-800">
                                “Sebaik-baik manusia adalah yang paling bermanfaat
                                bagi sesama.”
                            </p>
                        </div>
                        <button className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-amber-700 shadow-sm transition-transform hover:scale-[1.02]">
                            <AudioLines className="size-4" />
                            Dengarkan
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}

/* ---------- helpers & components ---------- */

function Star({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M12 2l2.9 6.26 6.6.6-5 4.36 1.5 6.44L12 16.9 5.99 19.66l1.5-6.44-5-4.36 6.6-.6z" />
        </svg>
    );
}

function Coins({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="currentColor"
            aria-hidden="true"
        >
            <circle cx="9" cy="9" r="5" />
            <circle cx="15" cy="14" r="6" opacity="0.6" />
        </svg>
    );
}

function StatPill({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-3.5 py-2 backdrop-blur-sm">
            {icon}
            <div className="leading-tight">
                <div className="text-base font-extrabold">{value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
                    {label}
                </div>
            </div>
        </div>
    );
}

function Section({
    index,
    emoji,
    title,
    color,
    description,
    actionLabel,
    onAction,
    children,
}: {
    index: string;
    emoji: string;
    title: string;
    color: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 text-lg font-extrabold text-slate-400">
                        {index}
                    </span>
                    <div>
                        <h2 className={`flex items-center gap-2 text-lg font-extrabold ${color}`}>
                            <span>{emoji}</span>
                            {title}
                        </h2>
                        <p className="text-xs text-slate-400">{description}</p>
                    </div>
                </div>
                <button
                    onClick={onAction}
                    className="rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                    {actionLabel} →
                </button>
            </div>
            {children}
        </section>
    );
}

function MovieCard({ content }: { content: Content }) {
    const minutes = content.duration_seconds
        ? Math.round(content.duration_seconds / 60)
        : null;

    return (
        <div className="group overflow-hidden rounded-[24px] bg-sky-50 transition-transform duration-200 group-hover:-translate-y-1">
            <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-sky-200 to-sky-300">
                {content.thumbnail ? (
                    <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-4xl">🎬</span>
                )}
                <button
                    className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-sky-600 shadow-lg transition-transform group-hover:scale-110"
                    aria-label="Putar"
                >
                    <Play className="ml-0.5 size-5 fill-current" />
                </button>
                {minutes !== null && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
                        {minutes} mnt
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-sm font-extrabold text-slate-700">
                    {content.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {content.description}
                </p>
            </div>
        </div>
    );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
    return (
        <button className="rounded-[24px] bg-rose-50 p-4 text-left transition-transform duration-200 hover:-translate-y-1">
            <div className="mb-3 flex h-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-200 to-pink-200 text-3xl">
                {scenario.image ? (
                    <img
                        src={scenario.image}
                        alt={scenario.title}
                        className="h-full w-full rounded-2xl object-cover"
                    />
                ) : (
                    '🛡️'
                )}
            </div>
            <h3 className="text-sm font-extrabold text-slate-700">
                {scenario.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {scenario.opening_text ?? scenario.description}
            </p>
        </button>
    );
}

function TreeIllustration({ progress }: { progress: number }) {
    const leafCount = progress > 80 ? 6 : progress > 50 ? 5 : progress > 25 ? 4 : 3;

    return (
        <div className="relative mx-auto mt-6 flex h-32 w-40 items-end justify-center">
            <div className="absolute bottom-0 h-3 w-16 rounded-full bg-emerald-800" />
            <svg viewBox="0 0 160 130" className="absolute bottom-0 h-full w-full" aria-hidden="true">
                {/* trunk */}
                <path
                    d="M78 128 C74 105 74 88 78 70 C82 88 82 105 78 128 Z"
                    fill="#92400e"
                />
                {/* leaves */}
                {[...Array(leafCount)].map((_, i) => (
                    <g key={i} opacity={i < 3 ? 0.4 : 1}>
                        <circle
                            cx={62 + (i % 3) * 24}
                            cy={30 + Math.floor(i / 3) * 24}
                            r={22}
                            fill={i % 2 ? '#34d399' : '#10b981'}
                        />
                    </g>
                ))}
                <circle cx="82" cy="18" r="12" fill="#a7f3d0" />
            </svg>
            <div className="absolute right-0 top-0 -translate-y-2 animate-bounce">
                <span className="text-2xl">🐭</span>
            </div>
        </div>
    );
}

const placeholderContents: Content[] = [
    {
        id: 0,
        title: 'Kisah Nabi Ibrahim',
        description: 'Belajar kejujuran dan keberanian dari Nabi Ibrahim a.s.',
        thumbnail: null,
        duration_seconds: 300,
    },
    {
        id: 0,
        title: 'Anak Saleh Membersihkan Masjid',
        description: 'Kisah tentang tanggung jawab menjaga kebersihan.',
        thumbnail: null,
        duration_seconds: 240,
    },
];

const placeholderScenarios: Scenario[] = [
    {
        id: 0,
        title: 'Ajakan Merokok',
        description: 'Teman mengajak merokok di kantin',
        opening_text: 'Latihan katakan tidak pada rokok',
        image: null,
    },
    {
        id: 0,
        title: 'Menolak Bullying',
        description: 'Beranilah melindungi temanmu',
        opening_text: 'Latihan bersikap berani dan peduli',
        image: null,
    },
    {
        id: 0,
        title: 'Jujur Umat',
        description: 'Belajar berani mengakui kesalahan',
        opening_text: 'Latihan menjadi pribadi jujur',
        image: null,
    },
];