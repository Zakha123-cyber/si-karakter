import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Compass,
    Play,
    RotateCcw,
    Sparkles,
    Star,
    Trophy,
    Volume2,
} from 'lucide-react';
import type { Auth } from '@/types';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

type PackageRow = {
    id: number;
    title: string;
    description: string | null;
    attempt_limit: number;
    attempts_used: number;
    cases_count: number;
    active_attempt: {
        id: number;
        status: string;
        attempt_number: number;
    } | null;
    can_start: boolean;
    can_resume: boolean;
};

type Props = {
    packages: PackageRow[];
};

export default function StudentTestsIndex({ packages }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const studentName = auth.user?.name ?? 'Santri Hebat';
    const firstName = studentName.split(' ')[0] ?? 'Santri';
    const readyCount = packages.filter((pkg) => pkg.can_start).length;
    const resumeCount = packages.filter((pkg) => pkg.can_resume).length;
    const totalCases = packages.reduce(
        (total, pkg) => total + pkg.cases_count,
        0,
    );

    return (
        <>
            <Head title="Pilih Jalanmu" />

            <div className="space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-purple-500 via-sky-500 to-emerald-400 p-6 text-white shadow-[0_12px_40px_rgba(14,165,233,0.32)] sm:p-8">
                    <svg
                        className="pointer-events-none absolute -top-10 -right-10 h-60 w-60 opacity-20"
                        viewBox="0 0 200 200"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M100 20l20 30h-40l20-30zM95 55v25h10V55h-10zM70 60l8 18h12l-6-16h-14zM123 60l-8 18h-12l6-16h14zM72 84h56v8H72z" />
                        <path d="M85 95l10 18 10-18h-20z" />
                    </svg>

                    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <button
                                type="button"
                                className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-extrabold backdrop-blur-sm transition-transform hover:scale-105"
                            >
                                <Volume2 className="size-4" />
                                Dengarkan petunjuk
                            </button>
                            <h1 className="text-3xl font-black sm:text-4xl">
                                Pilih Jalanmu, {firstName}! 🛤️
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed font-semibold text-purple-50 sm:text-base">
                                Baca kisahnya, pilih jalan yang baik, lalu
                                ceritakan alasanmu dengan suara atau tulisan.
                                Setiap pilihan baik membuat hatimu makin kuat.
                            </p>
                        </div>

                        <div className="grid min-w-0 gap-3 sm:grid-cols-3 lg:w-[420px]">
                            <HeroStat
                                icon={<Sparkles className="size-5" />}
                                value={String(readyCount)}
                                label="Siap Dimulai"
                            />
                            <HeroStat
                                icon={<RotateCcw className="size-5" />}
                                value={String(resumeCount)}
                                label="Bisa Lanjut"
                            />
                            <HeroStat
                                icon={<Compass className="size-5" />}
                                value={String(totalCases)}
                                label="Kisah Baik"
                            />
                        </div>
                    </div>

                    <div className="pointer-events-none absolute right-8 bottom-4 hidden text-8xl opacity-20 md:block">
                        🧭
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="min-w-0 space-y-5">
                        <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-xl">
                                        🛤️
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800">
                                            Paket Petualangan Akhlak
                                        </h2>
                                        <p className="text-xs font-semibold text-slate-400">
                                            Pilih satu paket yang ingin kamu
                                            kerjakan hari ini.
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">
                                    {packages.length} paket tersedia
                                </span>
                            </div>

                            {packages.length > 0 ? (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {packages.map((pkg, index) => (
                                        <PackageCard
                                            key={pkg.id}
                                            pkg={pkg}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState />
                            )}
                        </div>
                    </div>

                    <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
                        <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                                    🌟
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-800">
                                        Cara Bermain
                                    </h2>
                                    <p className="text-xs font-semibold text-slate-400">
                                        Mudah dan menyenangkan.
                                    </p>
                                </div>
                            </div>
                            <ol className="mt-4 space-y-3">
                                <GuideItem
                                    number="1"
                                    title="Baca atau dengarkan kisah"
                                    text="Pahami ceritanya pelan-pelan."
                                />
                                <GuideItem
                                    number="2"
                                    title="Pilih jalan terbaik"
                                    text="Ketuk kartu jawaban yang menurutmu baik."
                                />
                                <GuideItem
                                    number="3"
                                    title="Ceritakan alasanmu"
                                    text="Boleh rekam suara atau tulis singkat."
                                />
                            </ol>
                        </div>

                        <div className="rounded-[28px] bg-gradient-to-br from-amber-100 to-rose-100 p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">🌼</span>
                                <div>
                                    <h2 className="text-sm font-black text-amber-800">
                                        Ingat ya!
                                    </h2>
                                    <p className="mt-1 text-xs leading-relaxed font-semibold text-amber-700">
                                        Tidak perlu terburu-buru. Pilih dengan
                                        hati tenang dan niat belajar menjadi
                                        anak yang lebih baik.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </>
    );
}

function HeroStat({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="rounded-3xl bg-white/20 p-4 text-white shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 text-purple-50">
                {icon}
                <span className="text-2xl font-black">{value}</span>
            </div>
            <p className="mt-1 text-[11px] font-extrabold tracking-wide text-white/80 uppercase">
                {label}
            </p>
        </div>
    );
}

function PackageCard({ pkg, index }: { pkg: PackageRow; index: number }) {
    const used = Math.min(pkg.attempts_used, Math.max(pkg.attempt_limit, 1));
    const progress = Math.round((used / Math.max(pkg.attempt_limit, 1)) * 100);
    const cardTheme = packageThemes[index % packageThemes.length];
    const action = packageAction(pkg);

    return (
        <article className="group overflow-hidden rounded-[28px] border border-white bg-slate-50 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
            <div
                className={`relative min-h-40 bg-gradient-to-br ${cardTheme.gradient} p-5 text-white`}
            >
                <div className="relative z-10 flex items-start justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/22 px-3 py-1 text-[11px] font-black backdrop-blur-sm">
                            <Star className="size-3.5 fill-current" />
                            {pkg.cases_count} kisah
                        </span>
                        <h3 className="mt-4 line-clamp-2 text-xl font-black">
                            {pkg.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm font-semibold text-white/85">
                            {pkg.description ??
                                'Petualangan memilih jalan baik sudah menanti.'}
                        </p>
                    </div>
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white/25 text-4xl shadow-inner backdrop-blur-sm">
                        {cardTheme.emoji}
                    </div>
                </div>
                <div className="pointer-events-none absolute -right-8 -bottom-10 text-8xl opacity-20">
                    {cardTheme.emoji}
                </div>
            </div>

            <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <MiniInfo
                        icon={<Trophy className="size-4" />}
                        label="Kesempatan"
                        value={`${pkg.attempts_used}/${pkg.attempt_limit}`}
                    />
                    <MiniInfo
                        icon={<Clock className="size-4" />}
                        label="Percobaan"
                        value={
                            pkg.active_attempt
                                ? `Ke-${pkg.active_attempt.attempt_number}`
                                : 'Siap'
                        }
                    />
                </div>

                <div>
                    <div className="mb-1.5 flex justify-between text-[11px] font-black text-slate-400">
                        <span>Perjalanan paket</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${cardTheme.progress}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <Button
                    type="button"
                    disabled={action.disabled}
                    onClick={action.onClick}
                    className={`h-12 w-full rounded-2xl text-sm font-black shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 ${
                        action.disabled
                            ? 'bg-slate-100 text-slate-400 hover:bg-slate-100'
                            : cardTheme.button
                    }`}
                >
                    {action.icon}
                    {action.label}
                </Button>
            </div>
        </article>
    );
}

function MiniInfo({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500">
                {icon}
                <span className="text-sm font-black text-slate-700">
                    {value}
                </span>
            </div>
            <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase">
                {label}
            </p>
        </div>
    );
}

function GuideItem({
    number,
    title,
    text,
}: {
    number: string;
    title: string;
    text: string;
}) {
    return (
        <li className="flex gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-xs font-black text-white">
                {number}
            </span>
            <div>
                <p className="text-xs font-black text-slate-700">{title}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                    {text}
                </p>
            </div>
        </li>
    );
}

function EmptyState() {
    return (
        <div className="rounded-[28px] border-2 border-dashed border-sky-100 bg-sky-50/50 p-10 text-center">
            <div className="text-6xl">🌈</div>
            <h3 className="mt-4 text-lg font-black text-slate-700">
                Belum ada petualangan hari ini
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-slate-500">
                Nanti kalau ustadz sudah membuka paket, kamu bisa mulai memilih
                jalan baik di sini.
            </p>
        </div>
    );
}

function packageAction(pkg: PackageRow) {
    if (pkg.can_resume && pkg.active_attempt) {
        return {
            label: 'Lanjutkan Perjalanan',
            disabled: false,
            icon: <RotateCcw className="mr-2 size-4" />,
            onClick: () =>
                router.get(
                    `/student/tests/${pkg.id}/attempts/${pkg.active_attempt!.id}`,
                ),
        };
    }

    if (pkg.can_start) {
        return {
            label: 'Mulai Pilih Jalan',
            disabled: false,
            icon: <Play className="mr-2 size-4 fill-current" />,
            onClick: () => router.post(`/student/tests/${pkg.id}/attempts`),
        };
    }

    return {
        label: 'Petualangan Selesai',
        disabled: true,
        icon: <CheckCircle2 className="mr-2 size-4" />,
        onClick: () => undefined,
    };
}

const packageThemes = [
    {
        emoji: '🧭',
        gradient: 'from-purple-400 via-fuchsia-400 to-pink-400',
        progress: 'from-purple-400 to-fuchsia-500',
        button: 'bg-purple-500 text-white hover:bg-purple-600',
    },
    {
        emoji: '🛤️',
        gradient: 'from-sky-400 via-cyan-400 to-emerald-400',
        progress: 'from-sky-400 to-emerald-500',
        button: 'bg-sky-500 text-white hover:bg-sky-600',
    },
    {
        emoji: '🌟',
        gradient: 'from-amber-400 via-orange-400 to-rose-400',
        progress: 'from-amber-400 to-orange-500',
        button: 'bg-orange-500 text-white hover:bg-orange-600',
    },
];

StudentTestsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pilih Jalanmu', href: '/student/tests' },
    ],
};
