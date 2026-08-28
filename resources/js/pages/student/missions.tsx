import { Head, Link } from '@inertiajs/react';
import { CalendarHeart, Check, Sparkles } from 'lucide-react';

type Mission = {
    id: string;
    icon: string;
    title: string;
    description: string;
    reward: number;
    completed: boolean;
    href: string;
};

type Props = {
    student: {
        name: string;
        group: string | null;
    };
    missions: Mission[];
};

export default function StudentMissions({ student, missions }: Props) {
    const firstName = student.name.split(' ')[0];
    const completedMissions = missions.filter((m) => m.completed).length;
    const totalReward = missions.reduce((sum, m) => sum + m.reward, 0);
    const earnedReward = missions
        .filter((m) => m.completed)
        .reduce((sum, m) => sum + m.reward, 0);
    const allCompleted =
        missions.length > 0 && completedMissions === missions.length;
    const progressPercent =
        missions.length === 0 ? 0 : (completedMissions / missions.length) * 100;

    return (
        <>
            <Head title="Misi Harian" />

            {/* Hero */}
            <section className="relative mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 text-white shadow-[0_12px_40px_rgba(249,115,22,0.35)] sm:p-8">
                <div className="pointer-events-none absolute -top-8 -right-8 text-[120px] opacity-25 select-none">
                    🏆
                </div>
                <div className="relative">
                    <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                        <CalendarHeart className="size-4" />
                        Misi Harian
                    </span>
                    <h1 className="text-3xl font-extrabold sm:text-4xl">
                        Ayo Selesaikan Misi, {firstName}! 🚀
                    </h1>
                    <p className="mt-2 max-w-md text-sm font-medium text-white/90">
                        Setiap hari ada misi baru yang menantimu. Selesaikan dan
                        kumpulkan poin kebaikanmu!
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-3.5 py-2 backdrop-blur-sm">
                            <Sparkles className="size-4" />
                            <div className="leading-tight">
                                <div className="text-base font-extrabold">
                                    {completedMissions}/{missions.length}
                                </div>
                                <div className="text-[10px] font-semibold tracking-wide uppercase opacity-90">
                                    Misi Selesai
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-3.5 py-2 backdrop-blur-sm">
                            <span className="text-lg">🌟</span>
                            <div className="leading-tight">
                                <div className="text-base font-extrabold">
                                    +{earnedReward}/{totalReward}
                                </div>
                                <div className="text-[10px] font-semibold tracking-wide uppercase opacity-90">
                                    Poin Hari Ini
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 h-3 max-w-sm overflow-hidden rounded-full bg-white/25">
                        <div
                            className="h-full rounded-full bg-white transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </section>

            {/* Celebration */}
            {allCompleted && (
                <section className="mb-6 rounded-[28px] bg-gradient-to-br from-emerald-100 to-sky-100 p-5 text-center shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                    <div className="text-4xl">🎉</div>
                    <h2 className="mt-2 text-lg font-extrabold text-emerald-700">
                        Masha Allah, semua misi selesai!
                    </h2>
                    <p className="mt-1 text-xs font-medium text-emerald-600">
                        Kamu luar biasa, {firstName}! Kembali lagi besok untuk
                        misi baru ya.
                    </p>
                </section>
            )}

            {/* Missions */}
            <section className="mb-6 rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-700">
                        <span>📋</span>
                        Daftar Misi Hari Ini
                    </h2>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        {completedMissions}/{missions.length}
                    </span>
                </div>

                <ul className="space-y-3">
                    {missions.map((m) => (
                        <li
                            key={m.id}
                            className={`flex flex-wrap items-center gap-3.5 rounded-2xl p-3.5 transition-colors ${
                                m.completed ? 'bg-emerald-50' : 'bg-gray-50'
                            }`}
                        >
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                                {m.icon}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-extrabold text-slate-700">
                                    {m.title}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {m.description}
                                </p>
                                <span className="mt-1.5 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                                    +{m.reward} poin
                                </span>
                            </div>
                            {m.completed ? (
                                <span className="flex items-center gap-1.5 rounded-2xl bg-emerald-500 px-3.5 py-2 text-xs font-extrabold text-white">
                                    <Check className="size-4" />
                                    Selesai!
                                </span>
                            ) : (
                                <Link
                                    href={m.href}
                                    className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_6px_18px_rgba(16,185,129,0.28)] transition-transform hover:scale-[1.03]"
                                >
                                    Kerjakan Sekarang →
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Motivational */}
            <section className="rounded-[28px] bg-gradient-to-br from-amber-100 to-rose-100 p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🌼</span>
                    <p className="text-sm font-bold text-amber-800">
                        “Sebaik-baik manusia adalah yang paling bermanfaat bagi
                        sesama.”
                    </p>
                </div>
                <p className="mt-3 text-xs font-medium text-amber-700">
                    Misi direset setiap pagi. Kembali lagi besok untuk misi
                    baru, ya!
                </p>
            </section>
        </>
    );
}
