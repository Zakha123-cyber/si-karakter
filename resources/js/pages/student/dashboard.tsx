import { Head, Link } from '@inertiajs/react';
import {
    AudioLines,
    Check,
    ChevronRight,
    Flame,
    HelpCircle,
    Mic,
    Play,
    Trophy,
    Volume2,
    BarChart3,
    TrendingUp,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

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
    slug?: string;
    content_type?: string;
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
    analytics?: {
        observation_summary: { name: string; value: number; fill: string }[];
        score_trend: { name: string; score: number }[];
    };
};

/* ═══════════════════════════════════════════════════════
   Dashboard images
   ═══════════════════════════════════════════════════════ */

const DASHBOARD_IMAGES = {
    mascot: '/images/dashboard/mascot.png',
    tree: '/images/dashboard/pohon-kebaikan.png',
    pilihJalanmu: '/images/dashboard/pilih-jalanmu.png',
    simulasi: '/images/dashboard/simulasi.png',
    bioskop: [
        '/images/dashboard/bioskop-1.png',
        '/images/dashboard/bioskop-2.png',
        '/images/dashboard/bioskop-3.png',
        '/images/dashboard/bioskop-4.png',
    ],
};

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */

export default function StudentDashboard({
    student,
    test_packages,
    contents,
    scenarios,
    missions,
    analytics,
}: Props) {
    const firstName = student.name.split(' ')[0];
    const completedMissions = missions.filter((m) => m.completed).length;
    const packageToShow =
        test_packages.find((p) => p.can_start) ?? test_packages[0];
    const treeLevel = student.tree_level?.level ?? 1;
    const treeName = student.tree_level?.name ?? 'Penjaga Kebaikan';

    return (
        <>
            <Head title="Beranda Santri" />

            {/* ═══════════════════════════════════════════
                TOP HEADER BAR — White card with greeting + stats
                ═══════════════════════════════════════════ */}
            <section className="relative mb-5 overflow-hidden rounded-[24px] bg-white p-0 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                {/* Sky gradient background with mosque */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#d4f0ff] via-[#e8f6ff] to-white" />
                    {/* Mosque silhouette */}
                    <svg
                        viewBox="0 0 1200 200"
                        className="absolute right-0 bottom-0 h-32 w-auto opacity-[0.08]"
                        fill="#0e7490"
                    >
                        <rect x="100" y="50" width="16" height="150" rx="3" />
                        <circle cx="108" cy="42" r="12" />
                        <rect x="103" y="24" width="10" height="18" rx="2" />
                        <path d="M200 60 Q300 -10 400 60 L400 200 L200 200 Z" />
                        <rect x="260" y="120" width="80" height="80" rx="4" />
                        <path d="M450 80 Q520 30 590 80 L590 200 L450 200 Z" />
                        <rect x="620" y="60" width="14" height="140" rx="3" />
                        <circle cx="627" cy="52" r="11" />
                        <rect x="622" y="34" width="10" height="18" rx="2" />
                        <circle cx="180" cy="30" r="3" />
                        <circle cx="500" cy="20" r="2.5" />
                        <circle cx="700" cy="35" r="2" />
                        <circle cx="350" cy="15" r="2" />
                    </svg>
                </div>

                {/* Top stats bar */}
                <div className="relative flex items-center justify-between border-b border-slate-100/60 px-6 py-3">
                    {/* Greeting text */}
                    <div className="flex items-center gap-3">
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-cyan-600 shadow-sm transition-transform hover:scale-110"
                            aria-label="Putar salam"
                        >
                            <Volume2 className="size-4" />
                        </button>
                        <span className="text-sm font-medium text-slate-500">
                            Yuk, jadi anak hebat berakhlak mulia!
                        </span>
                    </div>

                    {/* Stats pills */}
                    <div className="flex items-center gap-4">
                        <StatPill
                            icon={<Trophy className="size-4 text-amber-500" />}
                            value={`${student.points}`}
                            label="Poin"
                        />
                        <StatPill
                            icon={<span className="text-sm">⭐</span>}
                            value={`Level ${treeLevel}`}
                            label={treeName}
                        />
                        <StatPill
                            icon={<Flame className="size-4 text-orange-500" />}
                            value={`${student.streak}`}
                            label="Hari Beruntun"
                        />

                        {/* User avatar */}
                        <div className="flex items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1 shadow-sm">
                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-300 to-teal-300">
                                <img
                                    src={DASHBOARD_IMAGES.mascot}
                                    alt={firstName}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                            <span className="text-sm font-bold text-slate-600">
                                {firstName}
                            </span>
                            <ChevronRight className="size-3 text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Main greeting area with mascot */}
                <div className="relative flex items-end px-6 pt-4 pb-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold text-slate-800 lg:text-4xl">
                            Assalamu'alaikum,{' '}
                            <span className="text-[#0ea5e9]">{firstName}</span>{' '}
                            👋
                        </h1>
                    </div>
                    {/* Mascot illustration */}
                    <div className="relative -mb-6 hidden h-36 w-32 sm:block">
                        <img
                            src={DASHBOARD_IMAGES.mascot}
                            alt="Maskot"
                            className="h-full w-full object-contain object-bottom"
                        />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                BODY: Main Content + Right Panel
                ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_330px]">
                {/* ─── Main Content ─── */}
                <div className="min-w-0 space-y-5">

                    {/* ════════════════════════════════════
                        SECTION 1: BIOSKOP TELADAN
                        ════════════════════════════════════ */}
                    <section className="rounded-[24px] bg-[#e8f4fd] p-5 sm:p-6">
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-200 text-base font-extrabold text-sky-700">
                                    1
                                </span>
                                <div>
                                    <h2 className="text-lg font-extrabold text-sky-700">
                                        Bioskop Teladan
                                    </h2>
                                    <p className="text-[11px] text-slate-400">
                                        Tonton cerita inspiratif dan belajar nilai kebaikan
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/student/contents"
                                className="flex items-center gap-1 rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.03] hover:bg-rose-500"
                            >
                                Lihat Semua
                                <ChevronRight className="size-3.5" />
                            </Link>
                        </div>

                        {/* Horizontal scroll cards */}
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {(contents.length > 0 ? contents : placeholderContents).map((c, idx) => (
                                <BioskopCard key={`${c.id}-${c.title}`} content={c} imageIndex={idx} />
                            ))}
                        </div>
                    </section>

                    {/* ════════════════════════════════════
                        SECTION 2: PILIH JALANMU!
                        ════════════════════════════════════ */}
                    <section className="rounded-[24px] bg-[#e6f9ee] p-5 sm:p-6">
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-200 text-base font-extrabold text-green-700">
                                    2
                                </span>
                                <div>
                                    <h2 className="text-lg font-extrabold text-green-700">
                                        Pilih Jalanmu!
                                    </h2>
                                    <p className="text-[11px] text-slate-400">
                                        Pilih tindakan yang paling benar dalam setiap cerita
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/student/tests"
                                className="flex items-center gap-1 rounded-full bg-green-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.03] hover:bg-green-600"
                            >
                                Mulai Sekarang
                                <ChevronRight className="size-3.5" />
                            </Link>
                        </div>

                        {packageToShow ? (
                            <div className="flex flex-col gap-5 lg:flex-row">
                                {/* Left: Illustration with speech bubble */}
                                <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 lg:w-52 lg:shrink-0">
                                    <img
                                        src={DASHBOARD_IMAGES.pilihJalanmu}
                                        alt="Pilih Jalanmu"
                                        className="h-40 w-full object-contain p-2 lg:h-48"
                                    />
                                    {/* Speech bubble overlay */}
                                    <div className="absolute top-3 left-3 max-w-[140px] rounded-xl rounded-bl-sm bg-white/90 px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-sm italic">
                                        "Ayo bolos mengaji,
                                        <br />
                                        main game saja!"
                                    </div>
                                </div>

                                {/* Right: Content */}
                                <div className="flex-1 space-y-3">
                                    <h3 className="text-base font-bold text-slate-700">
                                        Apa yang akan kamu lakukan?
                                    </h3>

                                    {/* Option A */}
                                    <button className="flex w-full items-center gap-3 rounded-2xl border-2 border-transparent bg-white p-3 text-left transition-all hover:border-slate-200 hover:shadow-sm">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-500 text-sm font-extrabold text-white">
                                            A
                                        </span>
                                        <span className="text-sm font-semibold text-slate-600">
                                            {packageToShow.description ?? 'Ikut teman bolos mengaji'}
                                        </span>
                                    </button>

                                    {/* Option B (correct) */}
                                    <button className="flex w-full items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-left transition-all hover:shadow-sm">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-sm font-extrabold text-white">
                                            B
                                        </span>
                                        <span className="text-sm font-semibold text-slate-600">
                                            Menolak dan tetap mengaji
                                        </span>
                                        <Check className="ml-auto size-5 shrink-0 text-emerald-500" />
                                    </button>

                                    {/* Voice recording / reason area */}
                                    <div className="mt-2 rounded-2xl bg-white p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-600">
                                                Ceritakan alasanmu
                                            </p>
                                        </div>
                                        <div className="mt-3 flex items-center justify-center gap-4">
                                            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200">
                                                <AudioLines className="size-4" />
                                            </button>
                                            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200 transition-transform hover:scale-110">
                                                <Mic className="size-5" />
                                            </button>
                                            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200">
                                                <AudioLines className="size-4" />
                                            </button>
                                        </div>
                                        <p className="mt-2 text-center text-[10px] text-slate-400">
                                            Tekan tombol mic untuk merekam
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-white/70 p-8 text-center">
                                <span className="text-4xl">📚</span>
                                <p className="mt-2 text-sm font-semibold text-green-600">
                                    Belum ada paket tes untukmu saat ini.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* ════════════════════════════════════
                        SECTION 3: SIMULASI BERANI MENOLAK
                        ════════════════════════════════════ */}
                    <section className="rounded-[24px] bg-[#fff0f3] p-5 sm:p-6">
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-200 text-base font-extrabold text-rose-700">
                                    3
                                </span>
                                <div>
                                    <h2 className="text-lg font-extrabold text-rose-700">
                                        Simulasi Berani Menolak
                                    </h2>
                                    <p className="text-[11px] text-slate-400">
                                        Latih keberanianmu menolak ajakan yang tidak baik
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/student/simulations"
                                className="flex items-center gap-1 rounded-full bg-green-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.03] hover:bg-green-600"
                            >
                                Mulai Bermain
                                <ChevronRight className="size-3.5" />
                            </Link>
                        </div>

                        <div className="flex flex-col gap-5 lg:flex-row">
                            {/* Left: Illustration */}
                            <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-100 to-pink-50 lg:w-52 lg:shrink-0">
                                <img
                                    src={DASHBOARD_IMAGES.simulasi}
                                    alt="Simulasi Berani Menolak"
                                    className="h-40 w-full object-contain p-2 lg:h-52"
                                />
                                {/* Speech bubble */}
                                <div className="absolute bottom-3 left-3 max-w-[140px] rounded-xl rounded-bl-sm bg-white/90 px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-sm italic">
                                    "Yuk, curi pensil teman kita!
                                    <br />
                                    Seru kok!"
                                </div>
                            </div>

                            {/* Right: Choices */}
                            <div className="flex-1 space-y-3">
                                <h3 className="text-sm font-bold text-slate-700">
                                    Pilih jawaban terbaikmu
                                </h3>

                                {/* Option buttons */}
                                <button className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition-all hover:shadow-md">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base">
                                        😊
                                    </span>
                                    <span className="text-xs font-semibold text-slate-600">
                                        Aku tidak mau, itu salah
                                    </span>
                                </button>

                                <button className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition-all hover:shadow-md">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-base">
                                        ❤️
                                    </span>
                                    <span className="text-xs font-semibold text-slate-600">
                                        Jangan ya, kasihan dia
                                    </span>
                                </button>

                                <button className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition-all hover:shadow-md">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-base">
                                        🤝
                                    </span>
                                    <span className="text-xs font-semibold text-slate-600">
                                        Aku tidak ikut, terima kasih
                                    </span>
                                </button>

                                {/* Success celebration */}
                                <div className="mt-2 flex flex-col items-center rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-4">
                                    <p className="text-lg font-extrabold text-amber-700">
                                        Berhasil!
                                    </p>
                                    <div className="my-1 flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <span
                                                key={i}
                                                className="animate-bounce text-2xl"
                                                style={{
                                                    animationDelay: `${i * 120}ms`,
                                                    animationDuration: '1s',
                                                }}
                                            >
                                                ⭐
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold text-amber-600">
                                        +15 Poin Keberanian
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════════
                        SECTION 4: RAPOR KARAKTERKU (Analytics)
                        ════════════════════════════════════ */}
                    {analytics && (
                        <section className="rounded-[24px] bg-[#eefbf0] p-5 sm:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-200 text-base font-extrabold text-emerald-700">
                                        4
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-emerald-700">
                                            Rapor Karakterku
                                        </h2>
                                        <p className="text-[11px] text-slate-400">
                                            Lihat perkembangan karakter dan capaian skormu
                                        </p>
                                    </div>
                                </div>
                                <button className="flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md">
                                    Detail
                                    <ChevronRight className="size-3.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                                {/* Observation summary */}
                                <div className="rounded-[20px] bg-white p-5 shadow-sm">
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-600">
                                        <BarChart3 className="size-4 text-sky-500" />
                                        Ringkasan Observasi
                                    </h3>
                                    <div className="h-52 w-full">
                                        {analytics.observation_summary.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.observation_summary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={50} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                Belum ada data observasi.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Score trend */}
                                <div className="rounded-[20px] bg-white p-5 shadow-sm">
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-600">
                                        <TrendingUp className="size-4 text-purple-500" />
                                        Tren Skor Karakter
                                    </h3>
                                    <div className="h-52 w-full">
                                        {analytics.score_trend.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={analytics.score_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff' }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                Belum ada data tren skor.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* ═══════════════════════════════════════════
                    RIGHT PANEL
                    ═══════════════════════════════════════════ */}
                <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">

                    {/* ──── POHON KEBAIKAN ──── */}
                    <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                        {/* Title + help icon */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-extrabold text-slate-800">
                                Pohon Kebaikan
                            </h2>
                            <button
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-500 transition-colors hover:bg-sky-200"
                                aria-label="Info"
                            >
                                <HelpCircle className="size-4" />
                            </button>
                        </div>

                        {/* Level + progress bar */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-emerald-600">
                                    Level {treeLevel} - {treeName}
                                </p>
                                <span className="text-xs font-bold text-slate-400">
                                    {student.tree_progress}/100
                                </span>
                            </div>
                            <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-emerald-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-1000"
                                    style={{ width: `${student.tree_progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Tree illustration IMAGE */}
                        <div className="my-4 flex justify-center">
                            <img
                                src={DASHBOARD_IMAGES.tree}
                                alt="Pohon Kebaikan"
                                className="h-44 w-auto object-contain"
                            />
                        </div>

                        {/* Motivational text */}
                        <p className="text-center text-[11px] leading-relaxed font-medium text-slate-400">
                            Kumpulkan poin kebaikan setiap hari
                            <br />
                            dan lihat pohonmu tumbuh!
                        </p>

                        {/* 3 Character scores — like reference */}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            <CharacterScoreCard
                                emoji="❤️"
                                label="Empati"
                                value={Math.max(Math.round(student.points * 0.4), 120)}
                                stars={Math.min(5, Math.max(3, student.stars))}
                            />
                            <CharacterScoreCard
                                emoji="💎"
                                label="Kejujuran"
                                value={Math.max(Math.round(student.points * 0.5), 150)}
                                stars={Math.min(5, Math.max(4, student.stars))}
                            />
                            <CharacterScoreCard
                                emoji="🛡️"
                                label="Keberanian"
                                value={Math.max(Math.round(student.points * 0.35), 100)}
                                stars={Math.min(5, Math.max(3, student.stars))}
                            />
                        </div>
                    </div>

                    {/* ──── MISI HARIAN ──── */}
                    <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-extrabold text-slate-800">
                                Misi Harian
                            </h2>
                            <button className="text-xs font-bold text-sky-500 transition-colors hover:text-sky-600">
                                Lihat Semua
                            </button>
                        </div>

                        {/* Mission list */}
                        <ul className="mt-4 space-y-2">
                            {(missions.length > 0 ? missions : defaultMissions).map((m) => (
                                <li
                                    key={m.id}
                                    className={`flex items-start gap-3 rounded-2xl p-3 ${
                                        m.completed ? 'bg-emerald-50/70' : 'bg-slate-50'
                                    }`}
                                >
                                    <span className="mt-0.5 text-lg leading-none">
                                        {m.icon}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-700">
                                            {m.title}
                                        </p>
                                        <p className={`text-[10px] font-semibold ${
                                            m.completed ? 'text-emerald-500' : 'text-amber-500'
                                        }`}>
                                            +{m.reward} Poin
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {m.completed ? '1/1' : '0/1'}
                                        </span>
                                        {m.completed ? (
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                                                <Check className="size-3.5" />
                                            </span>
                                        ) : (
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-200 bg-white" />
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ──── MOTIVATIONAL BANNER ──── */}
                    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white">
                        {/* Background decoration */}
                        <div className="pointer-events-none absolute -right-3 -bottom-3 text-6xl opacity-15">
                            🌟
                        </div>

                        <p className="relative text-sm leading-relaxed font-bold">
                            Ayo terus berbuat baik setiap hari!
                            <br />
                            Kebaikanmu membuat dunia lebih indah ✨
                        </p>

                        <button className="relative mt-3 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur-sm transition-all hover:bg-white/30">
                            <Volume2 className="size-3.5" />
                            Dengarkan Motivasi
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}

/* ═══════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════ */

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
        <div className="flex items-center gap-2">
            {icon}
            <div className="leading-tight">
                <div className="text-sm font-extrabold text-slate-700">{value}</div>
                <div className="text-[9px] font-semibold text-slate-400">
                    {label}
                </div>
            </div>
        </div>
    );
}

function BioskopCard({ content, imageIndex }: { content: Content; imageIndex: number }) {
    const minutes = content.duration_seconds
        ? `${String(Math.floor(content.duration_seconds / 60)).padStart(2, '0')}:${String(content.duration_seconds % 60).padStart(2, '0')}`
        : null;

    const placeholderImage = DASHBOARD_IMAGES.bioskop[imageIndex % DASHBOARD_IMAGES.bioskop.length];

    const card = (
        <div className="group w-[165px] shrink-0 overflow-hidden rounded-[18px] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            {/* Thumbnail */}
            <div className="relative h-28 overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100">
                <img
                    src={content.thumbnail ?? placeholderImage}
                    alt={content.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Play button */}
                <button
                    className="absolute inset-0 m-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-sky-600 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110"
                    aria-label="Putar"
                >
                    <Play className="ml-0.5 size-4 fill-current" />
                </button>
                {/* Duration badge */}
                {minutes && (
                    <span className="absolute right-2 bottom-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        {minutes}
                    </span>
                )}
            </div>
            {/* Text */}
            <div className="p-3">
                <h3 className="line-clamp-1 text-xs font-extrabold text-slate-700">
                    {content.title}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">
                    {content.description}
                </p>
                <button
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 transition-colors hover:text-sky-500"
                    aria-label="Dengarkan"
                >
                    <Volume2 className="size-3" />
                </button>
            </div>
        </div>
    );

    if (content.slug) {
        return <Link href={`/student/contents/${content.slug}`}>{card}</Link>;
    }
    return card;
}

function CharacterScoreCard({
    emoji,
    label,
    value,
    stars,
}: {
    emoji: string;
    label: string;
    value: number;
    stars: number;
}) {
    return (
        <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-3">
            <span className="text-lg">{emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-slate-500">{label}</p>
            <p className="text-lg font-extrabold text-slate-700">{value}</p>
            <div className="mt-0.5 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                        key={i}
                        className={`size-3 ${
                            i < stars
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-slate-200 text-slate-200'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

function StarIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.9 6.26 6.6.6-5 4.36 1.5 6.44L12 16.9 5.99 19.66l1.5-6.44-5-4.36 6.6-.6z" />
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════
   Placeholder Data
   ═══════════════════════════════════════════════════════ */

const placeholderContents: Content[] = [
    {
        id: 1,
        title: 'Nabi dan Kucing',
        slug: undefined,
        content_type: 'video',
        description: 'Kasih sayang kepada makhluk Allah',
        thumbnail: null,
        duration_seconds: 330,
    },
    {
        id: 2,
        title: 'Sahabat yang Menepati Janji',
        slug: undefined,
        content_type: 'video',
        description: 'Kejujuran adalah kebaikan',
        thumbnail: null,
        duration_seconds: 255,
    },
    {
        id: 3,
        title: 'Sayang Ibu Sepanjang Masa',
        slug: undefined,
        content_type: 'video',
        description: 'Berbakti kepada orang tua',
        thumbnail: null,
        duration_seconds: 370,
    },
    {
        id: 4,
        title: 'Menolong Burung Kecil',
        slug: undefined,
        content_type: 'video',
        description: 'Kebaikan pada hewan',
        thumbnail: null,
        duration_seconds: 280,
    },
];

const defaultMissions: Mission[] = [
    {
        id: 'bantu',
        icon: '🤝',
        title: 'Bantu teman yang kesulitan',
        description: 'Bantu satu temanmu hari ini',
        reward: 10,
        completed: true,
    },
    {
        id: 'syukur',
        icon: '❤️',
        title: 'Ucapkan terima kasih kepada orang tua',
        description: 'Ucapkan terima kasih',
        reward: 10,
        completed: true,
    },
    {
        id: 'jujur',
        icon: '💎',
        title: 'Jujur dalam setiap keadaan',
        description: 'Berlaku jujur',
        reward: 15,
        completed: false,
    },
];
