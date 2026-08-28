import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    Clock,
    ShieldCheck,
    Sparkles,
    TreePine,
    Users,
    Volume2,
    PieChart as PieChartIcon,
    BarChart3,
    TrendingUp,
    Calendar,
    ChevronDown,
    CheckCircle2,
    AlertTriangle,
    AlertOctagon,
    Download,
    Send,
    Printer,
    Link2,
    Star,
    CheckSquare,
    Square
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import type { Auth } from '@/types';

type Stats = {
    total_students: number;
    pending_reviews: number;
    validated_reviews: number;
    active_packages: number;
    total_indicators: number;
    open_warnings: number;
    total_simulations: number;
    zona_aman?: number;
    zona_kuning?: number;
    zona_merah?: number;
    rata_rata_poin?: number;
};

type PendingReview = {
    id: number;
    student_name: string;
    group_name: string;
    package_title: string;
    case_title: string;
    submitted_at: string;
};

type DashboardProps = {
    stats?: Stats;
    recent_pending_reviews?: PendingReview[];
    analytics?: {
        moral_distribution: { name: string; value: number }[];
        observation_summary: { name: string; value: number; fill: string }[];
        score_trend: { name: string; score: number }[];
        early_warnings?: any[];
        recent_activities?: any[];
        students_for_observation?: any[];
        active_indicators?: any[];
        preview_report_student?: any;
    };
    filter_options?: {
        academic_years: { id: number; name: string }[];
        groups: { id: number; name: string }[];
        selected_academic_year_id: string | null;
        selected_group_id: string | null;
    };
};

export default function Dashboard({
    stats = {
        total_students: 0,
        pending_reviews: 0,
        validated_reviews: 0,
        active_packages: 0,
        total_indicators: 0,
        open_warnings: 0,
        total_simulations: 0,
    },
    recent_pending_reviews = [],
    analytics,
    filter_options,
}: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    const role = user?.role ?? 'teacher';
    const isAdmin = role === 'admin';
    const roleTitle = roleLabel(role);
    const firstName = user?.name
        ? user.name.split(' ')[0]
        : isAdmin
          ? 'Admin'
          : 'Ustadz';

    return (
        <>
            <Head title={`Dashboard ${roleTitle}`} />

            {isAdmin ? (
                <>
                    {/* Greeting Hero Card for Admin */}
                    <section className="relative mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                        <svg
                            className="pointer-events-none absolute -top-6 -right-6 h-56 w-56 opacity-20"
                            viewBox="0 0 200 200"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M100 20l20 30h-40l20-30zM95 55v25h10V55h-10zM70 60l8 18h12l-6-16h-14zM123 60l-8 18h-12l6-16h14zM72 84h56v8H72z" />
                            <path d="M85 95l10 18 10-18h-20z" />
                        </svg>
                        <div className="relative flex flex-wrap items-center justify-between gap-6">
                            <div className="max-w-2xl min-w-0">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                                    <Volume2 className="size-4 text-emerald-200" />
                                    <span>Portal {roleTitle} TeladanKu</span>
                                </div>
                                <h1 className="text-3xl font-extrabold sm:text-4xl">
                                    Assalamu'alaikum, {roleTitle} {firstName} 👋
                                </h1>
                                <p className="mt-2 text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                    Kelola struktur akademik, data santri, akun pengguna, dan pengaturan sistem.
                                </p>
                            </div>
                        </div>
                    </section>
                    <AdminDashboard
                        stats={stats}
                        roleTitle={roleTitle}
                        analytics={analytics}
                        filter_options={filter_options}
                    />
                </>
            ) : (
                <TeacherDashboard
                    stats={stats}
                    recentPendingReviews={recent_pending_reviews}
                    roleTitle={roleTitle}
                    analytics={analytics}
                    filter_options={filter_options}
                    firstName={firstName}
                    user={user}
                />
            )}
        </>
    );
}

function AdminDashboard({
    stats,
    roleTitle,
    analytics,
    filter_options,
}: {
    stats: Stats;
    roleTitle: string;
    analytics?: DashboardProps['analytics'];
    filter_options?: DashboardProps['filter_options'];
}) {
    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
            <div className="min-w-0 space-y-6">
                <Section
                    index="1"
                    emoji="🗂️"
                    title="Menu Administrasi"
                    color="text-sky-600"
                    description="Akses menu yang menjadi wewenang admin sistem."
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            emoji="📅"
                            title="Tahun Ajaran"
                            description="Kelola periode akademik aktif untuk kelompok dan riwayat santri."
                            actionLabel="Kelola Tahun Ajaran"
                            actionHref="/admin/academic-years"
                            gradient="from-cyan-400 to-sky-500"
                        />
                        <FeatureCard
                            emoji="🏫"
                            title="Kelompok"
                            description="Kelola kelompok belajar, ustadz pembimbing, dan penempatan santri."
                            actionLabel="Kelola Kelompok"
                            actionHref="/admin/groups"
                            gradient="from-teal-400 to-emerald-500"
                        />
                        <FeatureCard
                            emoji="🎓"
                            title="Data Santri"
                            description="Kelola profil santri agar asesmen, observasi, dan respons materi bisa tersimpan."
                            actionLabel="Kelola Santri"
                            actionHref="/admin/students"
                            badgeText={`${stats.total_students} Santri`}
                            badgeColor="bg-sky-100 text-sky-800"
                            gradient="from-indigo-400 to-blue-500"
                        />
                        <FeatureCard
                            emoji="👥"
                            title="Manajemen User"
                            description="Kelola akun admin, ustadz, dan akses login santri."
                            actionLabel="User Management"
                            actionHref="/admin/users"
                            gradient="from-rose-400 to-pink-500"
                        />
                        <FeatureCard
                            emoji="⚙️"
                            title="Pengaturan"
                            description="Atur profil, keamanan akun, dan preferensi tampilan."
                            actionLabel="Buka Pengaturan"
                            actionHref="/settings/profile"
                            gradient="from-slate-400 to-slate-600"
                        />
                    </div>
                </Section>

                <AnalyticsSection
                    analytics={analytics}
                    filter_options={filter_options}
                />
            </div>

            <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
                <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                    <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-700">
                        <Users className="size-5 text-emerald-600" />
                        Ringkasan Admin
                    </h2>

                    <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-center">
                        <p className="text-3xl font-extrabold text-emerald-700">
                            {stats.total_students}
                        </p>
                        <p className="mt-1 text-xs font-bold text-emerald-600">
                            Data santri terdaftar
                        </p>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed font-medium text-slate-500">
                        Menu admin difokuskan untuk mengelola struktur akademik,
                        data santri, akun pengguna, dan pengaturan sistem.
                    </p>
                </div>

                <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                    <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-700">
                        <Sparkles className="size-5 text-amber-500" />
                        Catatan Admin
                    </h2>

                    <div className="space-y-3 text-xs leading-relaxed font-medium text-slate-600">
                        <div className="rounded-2xl bg-sky-50 p-3.5">
                            Pastikan setiap user santri memiliki profil di menu
                            Data Santri agar aktivitas santri bisa tersimpan.
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-3.5">
                            Gunakan menu Kelompok untuk menempatkan santri pada
                            kelompok belajar dan ustadz pembimbing yang sesuai.
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-[0_8px_30px_rgba(15,23,42,0.15)]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur-sm">
                            🕌
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Status Peran
                            </p>
                            <p className="text-sm font-extrabold text-white">
                                {roleTitle} TeladanKu
                            </p>
                        </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-300">
                        Anda memiliki akses administratif untuk menjaga data
                        dasar sistem tetap rapi dan siap digunakan ustadz.
                    </p>
                </div>
            </aside>
        </div>
    );
}

function TeacherDashboard({
    stats,
    recentPendingReviews,
    roleTitle,
    analytics,
    filter_options,
    firstName,
    user,
}: {
    stats: Stats;
    recentPendingReviews: PendingReview[];
    roleTitle: string;
    analytics?: DashboardProps['analytics'];
    filter_options?: DashboardProps['filter_options'];
    firstName: string;
    user?: any;
}) {
    // Constants for layout
    const today = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

    // Extract real data from analytics prop
    const moralDistribution = analytics?.moral_distribution || [
        { name: 'Pra-Konvensional', value: 0 },
        { name: 'Konvensional', value: 1 },
        { name: 'Pasca-Konvensional', value: 0 },
    ];
    
    // Calculate percentages and SVG strokes for Donut Chart
    const totalMoral = moralDistribution.reduce((acc: number, curr: any) => acc + curr.value, 0);
    const praKonv = moralDistribution.find((m: any) => m.name === 'Pra-Konvensional')?.value || 0;
    const konv = moralDistribution.find((m: any) => m.name === 'Konvensional')?.value || 0;
    const pascaKonv = moralDistribution.find((m: any) => m.name === 'Pasca-Konvensional')?.value || 0;
    
    const praPct = totalMoral > 0 ? (praKonv / totalMoral) * 100 : 0;
    const konvPct = totalMoral > 0 ? (konv / totalMoral) * 100 : 100;
    const pascaPct = totalMoral > 0 ? (pascaKonv / totalMoral) * 100 : 0;
    
    const praStroke = `${praPct} 100`;
    const konvStroke = `${konvPct} 100`;
    const pascaStroke = `${pascaPct} 100`;
    
    const scoreTrend = analytics?.score_trend || [];
    const earlyWarnings = analytics?.early_warnings || [];
    const recentActivities = analytics?.recent_activities || [];
    const studentsForObservation = analytics?.students_for_observation || [];
    const activeIndicators = analytics?.active_indicators || [];
    const previewReportStudent = analytics?.preview_report_student || { name: '-', class: '-', stats: { empati: 0, kejujuran: 0, keberanian: 0 }, level: '-' };

    return (
        <div className="space-y-6 text-slate-800">
            {/* ═══════════════════════════════════════════
                TOP HEADER BAR
                ═══════════════════════════════════════════ */}
            <div className="flex flex-col gap-4 rounded-[28px] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-emerald-100">
                        <img src="/images/dashboard/ustadz-mascot.png" alt="Ustadz" className="h-full w-full object-cover object-top" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold sm:text-2xl">
                            Assalamu'alaikum, {roleTitle} {firstName}
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            Kelola dan pantau perkembangan karakter santri dengan mudah
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                        <div className="text-xs">
                            <span className="block text-[10px] text-slate-400">Kelas</span>
                            <span className="font-bold">Semua Kelas</span>
                        </div>
                        <ChevronDown className="size-4 text-slate-400" />
                    </div>
                    
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                        <Calendar className="size-4 text-slate-400" />
                        <div className="text-xs">
                            <span className="block text-[10px] text-slate-400">Hari Ini</span>
                            <span className="font-bold">{today}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                        <img src="/images/dashboard/ustadz-avatar.png" className="size-8 rounded-full bg-slate-100" alt="Avatar" />
                        <div className="text-xs">
                            <span className="block font-bold">{user?.name || 'Ustadz'}</span>
                            <span className="text-[10px] text-slate-400">Pengelola</span>
                        </div>
                        <ChevronDown className="size-4 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                STATS ROW
                ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="flex flex-col justify-between rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-purple-600">Total Santri</p>
                            <p className="mt-1 text-3xl font-extrabold text-slate-800">{stats.total_students || 0}</p>
                            <p className="text-[11px] font-medium text-slate-400">Santri Aktif</p>
                        </div>
                        <Users className="size-8 text-purple-500 opacity-80" />
                    </div>
                </div>
                
                <div className="flex flex-col justify-between rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-600">Zona Aman</p>
                            <p className="mt-1 text-3xl font-extrabold text-slate-800">{stats.zona_aman || 0}</p>
                            <p className="text-[11px] font-medium text-slate-400">{stats.total_students > 0 ? Math.round((stats.zona_aman / stats.total_students) * 100) : 0}%</p>
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="size-6" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-amber-500">Perlu Pendampingan</p>
                            <p className="mt-1 text-3xl font-extrabold text-slate-800">{stats.zona_kuning || 0}</p>
                            <p className="text-[11px] font-medium text-slate-400">{stats.total_students > 0 ? Math.round((stats.zona_kuning / stats.total_students) * 100) : 0}%</p>
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-500">
                            <AlertTriangle className="size-6" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-rose-500">Zona Merah</p>
                            <p className="mt-1 text-3xl font-extrabold text-slate-800">{stats.zona_merah || 0}</p>
                            <p className="text-[11px] font-medium text-slate-400">{stats.total_students > 0 ? Math.round((stats.zona_merah / stats.total_students) * 100) : 0}%</p>
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                            <AlertOctagon className="size-6" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-blue-500">Rata-rata Poin Kebaikan</p>
                            <p className="mt-1 text-3xl font-extrabold text-slate-800">{stats.rata_rata_poin || 0}</p>
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-sm shadow-blue-200">
                            <Star className="size-5 fill-current" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                CHARTS & WARNING ROW
                ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-extrabold">Tingkat Penalaran Moral Santri</h3>
                    </div>
                    <div className="flex flex-col 2xl:flex-row items-center 2xl:items-start gap-6 mt-4">
                        <div className="h-40 w-40 relative shrink-0 mx-auto 2xl:mx-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-sm -rotate-90">
                                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                                {praPct > 0 && <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray={praStroke} strokeDashoffset="0" />}
                                {konvPct > 0 && <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray={konvStroke} strokeDashoffset={-praPct} />}
                                {pascaPct > 0 && <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray={pascaStroke} strokeDashoffset={-(praPct + konvPct)} />}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-extrabold">{totalMoral}</span>
                                <span className="text-[10px] font-medium text-slate-400">Santri</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-2">
                                <div className="mt-1 size-3 rounded-full bg-rose-500 shrink-0"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">Pra-Konvensional</p>
                                    <p className="text-[10px] text-slate-500">{Math.round(praPct)}% ({praKonv} Santri)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-1 size-3 rounded-full bg-amber-500 shrink-0"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">Konvensional</p>
                                    <p className="text-[10px] text-slate-500">{Math.round(konvPct)}% ({konv} Santri)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-1 size-3 rounded-full bg-emerald-500 shrink-0"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">Pasca-Konvensional</p>
                                    <p className="text-[10px] text-slate-500">{Math.round(pascaPct)}% ({pascaKonv} Santri)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-extrabold mb-4">Tren Perkembangan Karakter</h3>
                    <div className="h-40 w-full relative">
                         <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                            <line x1="10" y1="5" x2="100" y2="5" stroke="#f1f5f9" strokeWidth="0.5" />
                            <line x1="10" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                            <line x1="10" y1="45" x2="100" y2="45" stroke="#f1f5f9" strokeWidth="0.5" />
                            {scoreTrend.map((trend: any, i: number, arr: any[]) => (
                                <g key={i}>
                                    {i < arr.length - 1 && <line x1={15 + i*15} y1={40 - trend.empati/2.5} x2={15 + (i+1)*15} y2={40 - arr[i+1].empati/2.5} stroke="#f43f5e" strokeWidth="1" />}
                                    <circle cx={15 + i*15} cy={40 - trend.empati/2.5} r="1.5" fill="#f43f5e" />
                                </g>
                            ))}
                         </svg>
                    </div>
                </div>

                <div className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-extrabold">Peringatan Dini</h3>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto">
                        {earlyWarnings.map((w: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={w.img} alt={w.name} className="size-8 rounded-full bg-slate-100" />
                                    <div>
                                        <p className="text-xs font-bold leading-tight">{w.name}</p>
                                        <p className="text-[10px] text-slate-400">{w.class}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${w.zone === 'merah' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {w.zone === 'merah' ? 'Zona Merah' : 'Zona Kuning'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                ACTION ROW
                ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Observasi Harian Input */}
                <div className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-sm font-extrabold mb-4">Observasi Harian <span className="font-normal text-slate-400">(Input Cepat)</span></h3>
                    
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Pilih Santri</label>
                            <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                {studentsForObservation.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-32">
                            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Tanggal</label>
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 bg-white">
                                <span className="text-xs text-slate-600">Hari ini</span>
                                <Calendar className="size-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4">
                        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 mb-2 px-2 border-b border-slate-100 pb-2">
                            <div className="col-span-6">Indikator</div>
                            <div className="col-span-2 text-center">Ya</div>
                            <div className="col-span-4 text-right">Poin</div>
                        </div>
                        
                        <div className="space-y-3">
                            {activeIndicators.map((ind: any) => (
                                <div key={ind.id} className="grid grid-cols-12 gap-2 items-center px-2">
                                    <div className="col-span-6 text-xs text-slate-600">{ind.name}</div>
                                    <div className="col-span-2 text-center">
                                        <div className="inline-flex size-4 items-center justify-center rounded border border-emerald-500 bg-emerald-50 text-emerald-500">
                                            <CheckSquare className="size-3" />
                                        </div>
                                    </div>
                                    <div className="col-span-4 text-right text-[10px] font-bold text-emerald-500">+{ind.points}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-800">Total Poin</span>
                            <span className="text-lg font-extrabold text-emerald-500">+{activeIndicators.length * 10}</span>
                        </div>
                        <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-purple-700">
                            <CheckCircle2 className="size-4" />
                            Simpan
                        </button>
                    </div>
                </div>

                {/* Laporan Tumbuh Kembang */}
                <div className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-extrabold">Laporan Tumbuh Kembang</h3>
                        <span className="text-[10px] font-bold text-sky-500 cursor-pointer">Lihat Contoh</span>
                    </div>

                    <div className="flex gap-4 mb-4">
                        <div className="flex-1 flex items-center gap-3">
                            <img src={previewReportStudent.img || "/images/dashboard/student-boy.png"} alt={previewReportStudent.name} className="size-10 rounded-full bg-slate-100" />
                            <div>
                                <p className="text-xs font-bold text-slate-800">{previewReportStudent.name}</p>
                                <p className="text-[10px] text-slate-500 mb-1">{previewReportStudent.class}</p>
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[9px] font-bold cursor-pointer">Lihat Detail Santri &gt;</span>
                            </div>
                        </div>
                        <div className="w-48">
                            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Periode</label>
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-[11px]">
                                <span>Semester Genap</span>
                                <ChevronDown className="size-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-1 gap-4">
                        <div className="w-1/3 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <img src="/images/dashboard/pohon-kebaikan.png" alt="Pohon Kebaikan" className="h-28 object-contain mb-2" />
                            <p className="text-[10px] font-bold text-slate-800 self-start">Pohon Kebaikan</p>
                            <p className="text-[10px] font-bold text-emerald-600 self-start mb-2">{previewReportStudent.level}</p>
                            
                            <div className="flex justify-between w-full px-1 border-t border-slate-200 pt-2">
                                <div className="text-center">
                                    <span className="text-xs">❤️</span>
                                    <p className="text-[8px] text-slate-400 font-bold">Empati</p>
                                    <p className="text-xs font-extrabold">{previewReportStudent.stats?.empati || 0}</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-xs">⭐</span>
                                    <p className="text-[8px] text-slate-400 font-bold">Kejujuran</p>
                                    <p className="text-xs font-extrabold">{previewReportStudent.stats?.kejujuran || 0}</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-xs">🛡️</span>
                                    <p className="text-[8px] text-slate-400 font-bold">Berani</p>
                                    <p className="text-xs font-extrabold">{previewReportStudent.stats?.keberanian || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-1/3 text-[10px]">
                            <p className="font-bold text-slate-800 mb-1">Ringkasan Perkembangan</p>
                            <p className="text-slate-600 mb-2 leading-relaxed text-justify">
                                Ananda {previewReportStudent.name.split(' ')[0]} menunjukkan perkembangan karakter yang positif.
                            </p>
                            
                            <p className="font-bold text-sky-600 mb-1 mt-4">Saran untuk Orang Tua</p>
                            <p className="text-slate-600 leading-relaxed text-justify">
                                Terus berikan dukungan agar semakin berani dalam melakukan kebaikan.
                            </p>
                        </div>

                        <div className="w-1/3 space-y-2">
                            <p className="text-[10px] font-bold text-slate-800 mb-1">Aksi</p>
                            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                <Download className="size-3 text-purple-600" /> Unduh PDF
                            </button>
                            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                <Send className="size-3 text-emerald-600" /> Kirim ke Wali
                            </button>
                            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                <Printer className="size-3 text-blue-600" /> Cetak Laporan
                            </button>
                            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                <Link2 className="size-3 text-sky-600" /> Bagikan Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                BOTTOM ROW
                ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
                {/* Aktivitas Terbaru */}
                <div className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-extrabold">Aktivitas Terbaru</h3>
                        <span className="text-[10px] font-bold text-sky-500 cursor-pointer">Lihat Semua</span>
                    </div>
                    <table className="w-full text-left text-[11px]">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold">
                                <th className="pb-2">Waktu</th>
                                <th className="pb-2">Aktivitas</th>
                                <th className="pb-2">Santri</th>
                                <th className="pb-2">Oleh</th>
                                <th className="pb-2 text-right">Poin</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700 font-medium">
                            {recentActivities.map((act: any, idx: number) => (
                                <tr key={idx} className="border-b border-slate-50">
                                    <td className="py-2.5 text-slate-500">
                                        {act.time}
                                    </td>
                                    <td className="py-2.5">{act.activity}</td>
                                    <td className="py-2.5">{act.student}</td>
                                    <td className="py-2.5">{act.by}</td>
                                    <td className="py-2.5 text-right font-extrabold text-emerald-500">{act.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Tips Hari Ini */}
                <div className="rounded-[24px] bg-gradient-to-r from-purple-50 to-purple-100 p-5 border border-purple-100 flex flex-col justify-center relative min-h-[160px] overflow-hidden">
                    <div className="pl-36 relative z-10 py-2">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-extrabold text-purple-900">Tips Hari Ini</h3>
                            <Sparkles className="size-4 text-amber-500" />
                        </div>
                        <p className="text-xs text-purple-800 font-medium leading-relaxed">
                            Berikan apresiasi setiap kebaikan kecil santri. Pujian akan menumbuhkan semangat berbuat baik!
                        </p>
                    </div>
                    {/* Mascot properly anchored slightly inside for symmetry */}
                    <img 
                        src="/images/dashboard/ustadz-mascot.png" 
                        alt="Ustadz Mascot" 
                        className="absolute left-3 bottom-0 w-32 h-auto drop-shadow-sm opacity-95 object-contain object-bottom" 
                    />
                    {/* Decorative stars */}
                    <span className="absolute top-4 right-10 text-amber-300 text-xl">✦</span>
                    <span className="absolute bottom-6 right-4 text-amber-400 text-lg">✦</span>
                </div>
            </div>
        </div>
    );
}

function roleLabel(role: string) {
    return (
        {
            admin: 'Admin',
            teacher: 'Ustadz',
            student: 'Santri',
        }[role] ?? role
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
        <div className="flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md transition-transform hover:scale-105">
            {icon}
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

function Section({
    index,
    emoji,
    title,
    color,
    description,
    actionLabel,
    actionHref,
    children,
}: {
    index: string;
    emoji: string;
    title: string;
    color: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">
                        {index}
                    </span>
                    <div>
                        <h2
                            className={`flex items-center gap-2 text-lg font-extrabold ${color}`}
                        >
                            <span>{emoji}</span> {title}
                        </h2>
                        <p className="text-xs font-medium text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>

                {actionLabel && actionHref && (
                    <Link
                        href={actionHref}
                        className="flex items-center gap-1 text-xs font-extrabold text-emerald-600 transition-colors hover:text-emerald-700"
                    >
                        {actionLabel}
                        <ChevronRight className="size-4" />
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}

function FeatureCard({
    emoji,
    title,
    description,
    actionLabel,
    actionHref,
    badgeText,
    badgeColor,
    gradient,
}: {
    emoji: string;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    badgeText?: string;
    badgeColor?: string;
    gradient: string;
}) {
    return (
        <div className="group relative flex flex-col justify-between rounded-[24px] border border-slate-100 bg-slate-50/50 p-5 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl text-white shadow-md transition-transform group-hover:scale-110`}
                    >
                        {emoji}
                    </div>

                    {badgeText && (
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                badgeColor ?? 'bg-slate-100 text-slate-700'
                            }`}
                        >
                            {badgeText}
                        </span>
                    )}
                </div>

                <h3 className="text-base font-extrabold text-slate-800 transition-colors group-hover:text-emerald-600">
                    {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed font-medium text-slate-500">
                    {description}
                </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3">
                <Link
                    href={actionHref}
                    className="flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-600"
                >
                    <span>{actionLabel}</span>
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}

function AnalyticsSection({
    analytics,
    filter_options,
}: {
    analytics: DashboardProps['analytics'];
    filter_options?: DashboardProps['filter_options'];
}) {
    if (!analytics) {
        return null;
    }

    const moralDistribution = analytics.moral_distribution || [];
    const observationSummary = analytics.observation_summary || [];
    const scoreTrend = analytics.score_trend || [];

    const handleFilterChange = (key: string, value: string) => {
        const query = new URLSearchParams(window.location.search);

        if (value) {
            query.set(key, value);
        } else {
            query.delete(key);
        }

        router.get(`/dashboard?${query.toString()}`, undefined, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <Section
            index="📊"
            emoji="📈"
            title="Dasbor Analitik"
            color="text-emerald-600"
            description="Wawasan komprehensif terkait perkembangan moral dan observasi santri."
        >
            {filter_options && (
                <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500">
                            Periode (Tahun Ajaran):
                        </label>
                        <select
                            className="rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            value={
                                filter_options.selected_academic_year_id ?? ''
                            }
                            onChange={(e) =>
                                handleFilterChange(
                                    'academic_year_id',
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">Semua Periode</option>
                            {filter_options.academic_years.map((ay) => (
                                <option key={ay.id} value={ay.id}>
                                    {ay.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500">
                            Kelompok:
                        </label>
                        <select
                            className="rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            value={filter_options.selected_group_id ?? ''}
                            onChange={(e) =>
                                handleFilterChange('group_id', e.target.value)
                            }
                        >
                            <option value="">Semua Kelompok</option>
                            {filter_options.groups.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
                {/* Moral Distribution Chart */}
                <div className="min-w-0 rounded-[24px] border border-slate-100 bg-slate-50/50 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-700">
                        <PieChartIcon className="size-4 text-emerald-500" />
                        Distribusi Level Moral
                    </h3>
                    <div className="h-72 w-full">
                        {moralDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={moralDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {moralDistribution.map(
                                            (entry, index) => {
                                                const colors = [
                                                    '#10b981',
                                                    '#3b82f6',
                                                    '#f59e0b',
                                                    '#8b5cf6',
                                                    '#ec4899',
                                                ];

                                                return (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            colors[
                                                                index %
                                                                    colors.length
                                                            ]
                                                        }
                                                    />
                                                );
                                            },
                                        )}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                Belum ada data distribusi.
                            </div>
                        )}
                    </div>
                </div>

                {/* Observation Summary Chart */}
                <div className="min-w-0 rounded-[24px] border border-slate-100 bg-slate-50/50 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-700">
                        <BarChart3 className="size-4 text-sky-500" />
                        Ringkasan Observasi
                    </h3>
                    <div className="h-72 w-full">
                        {observationSummary.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={observationSummary}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar
                                        dataKey="value"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={60}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                Belum ada data observasi.
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Trend Chart */}
                <div className="col-span-1 min-w-0 rounded-[24px] border border-slate-100 bg-slate-50/50 p-5 2xl:col-span-2">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-700">
                        <TrendingUp className="size-4 text-purple-500" />
                        Tren Skor Rata-rata
                    </h3>
                    <div className="h-72 w-full">
                        {scoreTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={scoreTrend}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#8b5cf6"
                                        strokeWidth={4}
                                        dot={{
                                            r: 4,
                                            strokeWidth: 2,
                                            fill: '#fff',
                                        }}
                                        activeDot={{
                                            r: 6,
                                            fill: '#8b5cf6',
                                            stroke: '#fff',
                                        }}
                                    />
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
        </Section>
    );
}
