import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, MessagesSquare, Star, Volume2 } from 'lucide-react';

function speak(text: string) {
    if (!('speechSynthesis' in window)) {
        alert('Browser Anda tidak mendukung Text-to-Speech.');

        return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'id-ID';
    utter.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
}

type ScenarioCard = {
    id: number;
    title: string;
    description: string | null;
    opening_text: string;
    image: string | null;
    options_count: number;
    latest_attempt: {
        reward_points: number;
        score: number;
    } | null;
};

type Props = {
    scenarios: ScenarioCard[];
};

export default function StudentSimulationsIndex({ scenarios }: Props) {
    return (
        <>
            <Head title="Simulasi Berani Menolak" />

            <div className="space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-400 via-pink-400 to-orange-300 p-6 text-white shadow-[0_12px_40px_rgba(244,63,94,0.32)] sm:p-8">
                    <div className="relative z-10 max-w-3xl">
                        <button
                            type="button"
                            onClick={() =>
                                speak(
                                    'Setiap orang boleh punya batasan. Yuk latih cara menyampaikannya dengan tegas, sopan, dan tetap peduli lewat cerita berikut.',
                                )
                            }
                            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-extrabold backdrop-blur-sm transition-transform hover:scale-105"
                        >
                            <Volume2 className="size-4" />
                            Dengarkan petunjuk
                        </button>
                        <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                            Berani bilang tidak dengan sopan!
                        </h1>
                        <p className="mt-2 max-w-xl text-sm font-semibold text-rose-50 sm:text-base">
                            Setiap orang boleh punya batasan. Yuk latih cara
                            menyampaikannya dengan tegas, sopan, dan tetap
                            peduli lewat cerita berikut.
                        </p>
                    </div>
                    <div className="pointer-events-none absolute -right-8 -bottom-10 text-9xl opacity-25">
                        🛡️
                    </div>
                </section>

                {scenarios.length === 0 && (
                    <div className="rounded-[28px] border-2 border-dashed border-rose-100 bg-rose-50/50 p-10 text-center">
                        <div className="text-5xl">🌈</div>
                        <p className="mt-3 text-sm font-bold text-slate-600">
                            Belum ada latihan untukmu saat ini.
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                            Ustadz akan segera menyiapkan simulasi baru. Pantau
                            terus, ya!
                        </p>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {scenarios.map((scenario) => (
                        <ScenarioCardView
                            key={scenario.id}
                            scenario={scenario}
                        />
                    ))}
                </div>

                <section className="rounded-[28px] bg-gradient-to-br from-amber-100 to-rose-100 p-5 sm:p-6">
                    <h2 className="text-sm font-black text-amber-800">
                        Ingat ya! 🌼
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-amber-700">
                        Menolak dengan sopan itu bukan tidak baik. Justru itu
                        tanda kamu menghargai dirimu sendiri dan orang lain.
                        Berlatihlah setiap hari!
                    </p>
                </section>
            </div>
        </>
    );
}

function ScenarioCardView({ scenario }: { scenario: ScenarioCard }) {
    return (
        <Link
            href={`/student/simulations/${scenario.id}`}
            className="group block overflow-hidden rounded-[26px] bg-slate-50 transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
        >
            <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-rose-200 to-pink-300">
                {scenario.image ? (
                    <img
                        src={scenario.image}
                        alt={scenario.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-6xl transition-transform group-hover:scale-110">
                        🗣️
                    </span>
                )}
                {scenario.latest_attempt && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
                        <CheckCircle2 className="size-3.5" />
                        Pernah dicoba
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-black text-slate-800 group-hover:text-rose-600">
                    {scenario.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed font-semibold text-slate-500">
                    {scenario.description ?? scenario.opening_text}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                        <MessagesSquare className="size-3" />
                        {scenario.options_count} pilihan
                    </span>
                    {scenario.latest_attempt && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-600">
                            <Star className="size-3 fill-current" />
                            {scenario.latest_attempt.reward_points} poin
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
