import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    Clock,
    ShieldCheck,
    Sparkles,
    TreePine,
    Users,
    Volume2,
} from 'lucide-react';
import type { Auth } from '@/types';

type Stats = {
    total_students: number;
    pending_reviews: number;
    validated_reviews: number;
    active_packages: number;
    total_indicators: number;
    open_warnings: number;
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
};

export default function Dashboard({
    stats = {
        total_students: 0,
        pending_reviews: 0,
        validated_reviews: 0,
        active_packages: 0,
        total_indicators: 0,
        open_warnings: 0,
    },
    recent_pending_reviews = [],
}: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    const role = user?.role ?? 'teacher';
    const roleTitle = roleLabel(role);
    const firstName = user?.name ? user.name.split(' ')[0] : 'Ustadz';

    const totalReviews = stats.validated_reviews + stats.pending_reviews;
    const validationPercentage =
        totalReviews > 0
            ? Math.round((stats.validated_reviews / totalReviews) * 100)
            : 100;

    return (
        <>
            <Head title={`Dashboard ${roleTitle}`} />

            {/* Greeting Hero Card */}
            <section className="relative mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                {/* Mosque silhouette background SVG */}
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
                            {role === 'admin'
                                ? 'Kelola akun, struktur akademik, paket tes, dan sistem pembinaan karakter santri.'
                                : 'Bimbing dan bina santri menjadi generasi berakhlak mulia melalui evaluasi dan pendampingan karakter.'}
                        </p>
                    </div>

                    {/* Quick Stats Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                        <StatPill
                            icon={<Users className="size-5 text-sky-200" />}
                            value={`${stats.total_students}`}
                            label="Santri Binaan"
                        />
                        <StatPill
                            icon={<Clock className="size-5 text-amber-200" />}
                            value={`${stats.pending_reviews}`}
                            label="Perlu Review"
                        />
                        <StatPill
                            icon={<BookOpen className="size-5 text-teal-200" />}
                            value={`${stats.active_packages}`}
                            label="Paket Tes"
                        />
                        <StatPill
                            icon={
                                <TreePine className="size-5 text-emerald-200" />
                            }
                            value={`${stats.total_indicators}`}
                            label="Indikator"
                        />
                        <StatPill
                            icon={
                                <ShieldCheck className="size-5 text-rose-200" />
                            }
                            value={`${stats.open_warnings}`}
                            label="Pendampingan"
                        />
                    </div>
                </div>
            </section>

            {/* Main Content Layout: Left main column + Right sticky panel */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
                {/* Left Main Column */}
                <div className="min-w-0 space-y-6">
                    {/* Section 1: Antrian Validasi Asesmen Santri */}
                    <Section
                        index="1"
                        emoji="📋"
                        title="Antrian Validasi Asesmen Santri"
                        color="text-emerald-600"
                        description="Tinjau penalaran moral santri dan berikan validasi ustadz."
                        actionLabel="Lihat Semua Antrian"
                        actionHref="/teacher/reviews"
                    >
                        {recent_pending_reviews.length > 0 ? (
                            <div className="space-y-3">
                                {recent_pending_reviews.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-emerald-100 bg-emerald-50/50 p-4 transition-all hover:bg-emerald-50 hover:shadow-sm"
                                    >
                                        <div className="flex min-w-0 items-center gap-3.5">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-bold text-white shadow-sm">
                                                {item.student_name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="truncate font-bold text-slate-800">
                                                        {item.student_name}
                                                    </h4>
                                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                                        {item.group_name}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                    <span className="font-semibold text-slate-600">
                                                        {item.case_title}
                                                    </span>{' '}
                                                    • {item.package_title}
                                                </p>
                                                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                                    <Clock className="size-3" />
                                                    Dikirim {item.submitted_at}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/teacher/reviews/${item.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-transform hover:scale-105 hover:bg-emerald-700"
                                        >
                                            Review Sekarang
                                            <ChevronRight className="size-4" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                                    🎉
                                </div>
                                <h4 className="mt-3 text-base font-extrabold text-slate-800">
                                    Semua Asesmen Divalidasi!
                                </h4>
                                <p className="mt-1 max-w-sm text-xs font-medium text-slate-500">
                                    Tidak ada antrian validasi santri saat ini.
                                    Terima kasih atas dedikasi pembinaan Ustadz!
                                </p>
                            </div>
                        )}
                    </Section>

                    {/* Section 2: Modul & Fitur Utama Ustadz */}
                    <Section
                        index="2"
                        emoji="🚀"
                        title="Modul & Fitur Utama"
                        color="text-sky-600"
                        description="Akses fitur evaluasi, paket tes, dan indikator karakter."
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                emoji="📝"
                                title="Validasi & Review Santri"
                                description="Tinjau dan validasi asesmen penalaran moral santri."
                                actionLabel="Buka Antrian Review"
                                actionHref="/teacher/reviews"
                                badgeText={`${stats.pending_reviews} Pending`}
                                badgeColor="bg-amber-100 text-amber-800"
                                gradient="from-amber-400 to-orange-400"
                            />

                            <FeatureCard
                                emoji="📦"
                                title="Paket Tes Dilema Moral"
                                description="Kelola penugasan dan pengelompokan tes moral."
                                actionLabel="Kelola Paket Tes"
                                actionHref="/teacher/test-packages"
                                badgeText={`${stats.active_packages} Aktif`}
                                badgeColor="bg-teal-100 text-teal-800"
                                gradient="from-teal-400 to-emerald-500"
                            />

                            <FeatureCard
                                emoji="🧭"
                                title="Kasus Dilema Moral"
                                description="Kelola bank cerita kasus dan opsi jawaban moral."
                                actionLabel="Kelola Kasus"
                                actionHref="/teacher/moral-cases"
                                gradient="from-sky-400 to-blue-500"
                            />

                            <FeatureCard
                                emoji="🌱"
                                title="Indikator Karakter"
                                description="Atur indikator dan standar perilaku kebaikan santri."
                                actionLabel="Kelola Indikator"
                                actionHref="/teacher/character-indicators"
                                badgeText={`${stats.total_indicators} Indikator`}
                                badgeColor="bg-emerald-100 text-emerald-800"
                                gradient="from-emerald-400 to-green-500"
                            />

                            <FeatureCard
                                emoji="⚖️"
                                title="Konfigurasi Scoring"
                                description="Atur bobot scoring tes dan observasi harian."
                                actionLabel="Atur Scoring"
                                actionHref="/teacher/scoring-configurations"
                                gradient="from-purple-400 to-indigo-500"
                            />

                            <FeatureCard
                                emoji="🌸"
                                title="Early Warning Pendampingan"
                                description="Pantau catatan santri yang membutuhkan pendampingan dengan bahasa positif."
                                actionLabel="Buka Pendampingan"
                                actionHref="/teacher/warnings"
                                badgeText={`${stats.open_warnings} Terbuka`}
                                badgeColor="bg-rose-100 text-rose-800"
                                gradient="from-rose-400 to-orange-400"
                            />

                            {role === 'admin' && (
                                <>
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
                                        title="Kelompok Santri"
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
                                        emoji="🎬"
                                        title="Materi Edukasi"
                                        description="Kelola video, komik, audio, gambar, cerita, dan rekomendasi materi santri."
                                        actionLabel="Kelola Materi"
                                        actionHref="/admin/educational-contents"
                                        gradient="from-sky-400 to-emerald-500"
                                    />
                                    <FeatureCard
                                        emoji="👥"
                                        title="Manajemen User"
                                        description="Kelola akun admin, ustadz, dan akses login santri."
                                        actionLabel="User Management"
                                        actionHref="/admin/users"
                                        gradient="from-rose-400 to-pink-500"
                                    />
                                </>
                            )}
                        </div>
                    </Section>
                </div>

                {/* Right Panel Column */}
                <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
                    {/* Progress Evaluasi Card */}
                    <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-700">
                                <ShieldCheck className="size-5 text-emerald-600" />
                                Progress Validasi
                            </h2>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                {validationPercentage}% Selesai
                            </span>
                        </div>

                        <div className="mt-4">
                            <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-500">
                                <span>
                                    {stats.validated_reviews} divalidasi
                                </span>
                                <span>{totalReviews} total asesmen</span>
                            </div>
                            <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-600 transition-all duration-700"
                                    style={{
                                        width: `${validationPercentage}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                            <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                                <p className="text-xl font-extrabold text-emerald-700">
                                    {stats.validated_reviews}
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-emerald-600">
                                    Selesai Review
                                </p>
                            </div>
                            <div className="rounded-2xl bg-amber-50 p-3 text-center">
                                <p className="text-xl font-extrabold text-amber-700">
                                    {stats.pending_reviews}
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-amber-600">
                                    Menunggu Validasi
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tips & Panduan Ustadz */}
                    <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-700">
                            <Sparkles className="size-5 text-amber-500" />
                            Catatan Pembinaan
                        </h2>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-2xl bg-teal-50/70 p-3.5">
                                <span className="text-xl">🎧</span>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-800">
                                        Dengarkan Rekaman Suara
                                    </p>
                                    <p className="mt-0.5 leading-snug text-slate-600">
                                        Gunakan rekaman audio santri untuk
                                        mengevaluasi kejujuran dan pemahaman
                                        moral secara utuh.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl bg-sky-50/70 p-3.5">
                                <span className="text-xl">🌸</span>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-800">
                                        Berikan Motivasi Positif
                                    </p>
                                    <p className="mt-0.5 leading-snug text-slate-600">
                                        Apresiasi setiap penalaran baik yang
                                        disampaikan santri untuk membakar
                                        semangat karakter mereka.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Peran */}
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
                            Anda memiliki akses penuh untuk membimbing santri
                            dan memvalidasi perkembangan moral mereka.
                        </p>
                    </div>
                </aside>
            </div>
        </>
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
