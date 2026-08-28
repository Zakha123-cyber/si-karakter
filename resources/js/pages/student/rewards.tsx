import { Head } from '@inertiajs/react';
import { Check, Gift, Lock, Sparkles } from 'lucide-react';

type Badge = {
    id: string;
    emoji: string;
    title: string;
    description: string;
    unlocked: boolean;
    progress_current: number;
    progress_target: number;
};

type Props = {
    student: {
        name: string;
        group: string | null;
        points: number;
        tree_level: string | null;
    };
    badges: Badge[];
};

export default function StudentRewards({ student, badges }: Props) {
    const firstName = student.name.split(' ')[0];
    const unlockedBadges = badges.filter((b) => b.unlocked).length;
    const allUnlocked = badges.length > 0 && unlockedBadges === badges.length;

    return (
        <>
            <Head title="Kabinet Hadiah" />

            {/* Hero */}
            <section className="relative mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 p-6 text-white shadow-[0_12px_40px_rgba(168,85,247,0.35)] sm:p-8">
                <div className="pointer-events-none absolute -top-8 -right-8 text-[120px] opacity-25 select-none">
                    🎁
                </div>
                <div className="relative">
                    <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                        <Gift className="size-4" />
                        Kabinet Hadiah
                    </span>
                    <h1 className="text-3xl font-extrabold sm:text-4xl">
                        Lencana Kebaikanmu, {firstName}! 🏅
                    </h1>
                    <p className="mt-2 max-w-md text-sm font-medium text-white/90">
                        Setiap kebaikanmu dihargai. Kumpulkan semua lencana
                        dengan terus berbuat baik!
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-3.5 py-2 backdrop-blur-sm">
                            <span className="text-lg">🌱</span>
                            <div className="leading-tight">
                                <div className="text-base font-extrabold">
                                    {student.points}
                                </div>
                                <div className="text-[10px] font-semibold tracking-wide uppercase opacity-90">
                                    Poin Kebaikan
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-3.5 py-2 backdrop-blur-sm">
                            <span className="text-lg">🌳</span>
                            <div className="leading-tight">
                                <div className="text-base font-extrabold">
                                    {student.tree_level ?? 'Benih Kebaikan'}
                                </div>
                                <div className="text-[10px] font-semibold tracking-wide uppercase opacity-90">
                                    Level Pohon
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-3.5 py-2 backdrop-blur-sm">
                            <Sparkles className="size-4" />
                            <div className="leading-tight">
                                <div className="text-base font-extrabold">
                                    {unlockedBadges}/{badges.length}
                                </div>
                                <div className="text-[10px] font-semibold tracking-wide uppercase opacity-90">
                                    Lencana
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Celebration */}
            {allUnlocked && (
                <section className="mb-6 rounded-[28px] bg-gradient-to-br from-amber-100 to-rose-100 p-5 text-center shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                    <div className="text-4xl">🎉</div>
                    <h2 className="mt-2 text-lg font-extrabold text-amber-700">
                        Masha Allah, semua lencana terkumpul!
                    </h2>
                    <p className="mt-1 text-xs font-medium text-amber-600">
                        Kamu hebat sekali, {firstName}! Terus jadi teladan ya.
                    </p>
                </section>
            )}

            {/* Badge grid */}
            <section className="mb-6 rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-700">
                        <span>🏅</span>
                        Koleksi Lencana
                    </h2>
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                        {unlockedBadges}/{badges.length}
                    </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className={`rounded-3xl p-4 transition-all duration-200 ${
                                badge.unlocked
                                    ? 'bg-gradient-to-br from-violet-50 to-fuchsia-50 ring-2 ring-violet-200'
                                    : 'bg-gray-50'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-sm ${
                                        badge.unlocked
                                            ? 'bg-white'
                                            : 'bg-white opacity-40 grayscale'
                                    }`}
                                >
                                    {badge.emoji}
                                </span>
                                {badge.unlocked ? (
                                    <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-white">
                                        <Check className="size-3.5" />
                                        Didapat!
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-extrabold text-slate-500">
                                        <Lock className="size-3.5" />
                                        Terkunci
                                    </span>
                                )}
                            </div>

                            <h3
                                className={`mt-3 text-sm font-extrabold ${
                                    badge.unlocked
                                        ? 'text-slate-700'
                                        : 'text-slate-400'
                                }`}
                            >
                                {badge.title}
                            </h3>
                            <p
                                className={`mt-0.5 text-xs ${
                                    badge.unlocked
                                        ? 'text-slate-500'
                                        : 'text-slate-400'
                                }`}
                            >
                                {badge.description}
                            </p>

                            <div className="mt-3 flex items-center gap-2">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            badge.unlocked
                                                ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400'
                                                : 'bg-gradient-to-r from-amber-300 to-orange-300'
                                        }`}
                                        style={{
                                            width: `${
                                                badge.progress_target === 0
                                                    ? 0
                                                    : Math.min(
                                                          100,
                                                          (badge.progress_current /
                                                              badge.progress_target) *
                                                              100,
                                                      )
                                            }%`,
                                        }}
                                    />
                                </div>
                                <span
                                    className={`text-[11px] font-extrabold ${
                                        badge.unlocked
                                            ? 'text-violet-600'
                                            : 'text-slate-400'
                                    }`}
                                >
                                    {badge.unlocked
                                        ? `${badge.progress_current}/${badge.progress_target}`
                                        : badge.progress_target -
                                                badge.progress_current <=
                                            0
                                          ? ''
                                          : `${badge.progress_target - badge.progress_current} lagi!`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Motivational */}
            <section className="rounded-[28px] bg-gradient-to-br from-amber-100 to-rose-100 p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🌼</span>
                    <p className="text-sm font-bold text-amber-800">
                        “Sesungguhnya yang paling dicintai Allah adalah amal
                        yang kontinu walau sedikit.”
                    </p>
                </div>
                <p className="mt-3 text-xs font-medium text-amber-700">
                    Lencana baru akan hadir seiring perjalanan kebaikanmu!
                </p>
            </section>
        </>
    );
}
