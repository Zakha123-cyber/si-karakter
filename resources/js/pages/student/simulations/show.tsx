import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Home,
    Lightbulb,
    MessageCircleQuestion,
    Play,
    ShieldCheck,
    Star,
    Volume2,
    XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

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

type Option = {
    id: number;
    text: string;
    feedback: string | null;
};

const optionTints = [
    'bg-rose-100 text-rose-600',
    'bg-pink-100 text-pink-600',
    'bg-orange-100 text-orange-600',
];

type Scenario = {
    id: number;
    title: string;
    description: string | null;
    opening_text: string;
    image: string | null;
    options_count: number;
};

type Result = {
    option_id: number;
    option_text: string;
    feedback: string;
    score: number;
    reward_points: number;
    correct_option_ids: number[];
};

type Props = {
    scenario: Scenario;
    options: Option[];
    student: {
        name: string;
    } | null;
    has_profile: boolean;
    latest_attempt: {
        reward_points: number;
        score: number;
        created_at: string;
    } | null;
    result: Result | null;
};

export default function StudentSimulationsShow({
    scenario,
    options,
    student,
    has_profile,
    latest_attempt,
    result,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        selected_option_id: number | null;
    }>({ selected_option_id: null });

    const submit = () => {
        if (data.selected_option_id === null || processing) {
            return;
        }

        post(`/student/simulations/${scenario.id}/attempts`, {
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (result) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [result]);

    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            return undefined;
        }

        return () => window.speechSynthesis.cancel();
    }, []);

    const firstName = student?.name.split(' ')[0] ?? 'Sobat';

    return (
        <>
            <Head title={scenario.title} />

            <div className="mx-auto max-w-3xl space-y-6 pb-8">
                <div className="flex items-center justify-between">
                    <Link
                        href="/student/simulations"
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-slate-500 shadow-sm transition hover:text-slate-700"
                    >
                        <ArrowLeft className="size-3.5" />
                        Semua simulasi
                    </Link>
                    {latest_attempt && !result && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-600">
                            <Star className="size-3.5 fill-current" />
                            Rekor terakhirmu: {
                                latest_attempt.reward_points
                            }{' '}
                            poin
                        </span>
                    )}
                </div>

                {/* Result panel */}
                {result && (
                    <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-center text-white sm:p-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                                <CheckCircle2 className="size-8" />
                            </div>
                            <h1 className="mt-2 text-xl font-black sm:text-2xl">
                                Bagus, {firstName}! 🌟
                            </h1>
                            <p className="mt-1 text-xs font-semibold text-emerald-50 sm:text-sm">
                                Kamu memilih: “{result.option_text}”
                            </p>
                            <div className="mt-3 flex items-center justify-center gap-3">
                                <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-extrabold">
                                    Nilai: {result.score}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1 text-xs font-extrabold text-emerald-700">
                                    <Star className="size-3.5 fill-current" />+
                                    {result.reward_points} poin kebaikan
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3 p-5 sm:p-6">
                            {result.correct_option_ids.includes(
                                result.option_id,
                            ) ? (
                                <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
                                    <Lightbulb className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                                    <p className="text-xs leading-relaxed font-semibold text-emerald-800 sm:text-sm">
                                        {result.feedback}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
                                    <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500" />
                                    <div className="text-xs leading-relaxed font-semibold text-amber-800 sm:text-sm">
                                        <p>{result.feedback}</p>
                                        <p className="mt-2">
                                            Berikut jawaban yang dianggap paling
                                            baik dalam situasi ini:
                                        </p>
                                        <ul className="mt-2 space-y-1.5">
                                            {options
                                                .filter((option) =>
                                                    result.correct_option_ids.includes(
                                                        option.id,
                                                    ),
                                                )
                                                .map((option) => (
                                                    <li
                                                        key={option.id}
                                                        className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700 sm:text-sm"
                                                    >
                                                        {option.text}
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 pt-1">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-2xl"
                                    onClick={() =>
                                        router.reload({ only: ['result'] })
                                    }
                                >
                                    <Play className="size-4" />
                                    Coba lagi
                                </Button>
                                <Link
                                    href="/student/simulations"
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                                >
                                    <Home className="size-4" />
                                    Selesai
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Scenario */}
                {!result && (
                    <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-rose-200 to-pink-300">
                            {scenario.image ? (
                                <img
                                    src={scenario.image}
                                    alt={scenario.title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-6xl">🗣️</span>
                            )}
                            <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold text-rose-500 backdrop-blur-sm">
                                {scenario.options_count} pilihan respons
                            </span>
                        </div>
                        <div className="p-5 sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h1 className="text-xl font-black text-slate-700 sm:text-2xl">
                                    {scenario.title}
                                </h1>
                                <Button
                                    type="button"
                                    onClick={() => speak(scenario.opening_text)}
                                    className="h-11 rounded-2xl bg-rose-500 px-4 text-sm font-black text-white hover:bg-rose-600"
                                >
                                    <Volume2 className="mr-2 size-4" />
                                    Putar Cerita
                                </Button>
                            </div>
                            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed font-medium text-slate-600 sm:text-base">
                                {scenario.opening_text}
                            </p>

                            {!has_profile && (
                                <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                                    Hmm, akunmu belum terhubung dengan data
                                    santri. Kamu tetap bisa berlatih, tetapi
                                    jawabanmu tidak disimpan dan tidak mendapat
                                    poin. Bilang ke ustadzmu agar dihubungkan
                                    ya!
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {/* Options */}
                {!result && (
                    <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                        <h2 className="flex items-center gap-2 text-sm font-black text-slate-700">
                            <MessageCircleQuestion className="size-4 text-rose-400" />
                            Apa yang akan kamu lakukan?
                        </h2>
                        <div className="mt-4 space-y-3">
                            {options.map((option, index) => {
                                const selected =
                                    data.selected_option_id === option.id;
                                const letterTint =
                                    optionTints[index % optionTints.length];

                                return (
                                    <div
                                        key={option.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                            setData(
                                                'selected_option_id',
                                                option.id,
                                            )
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === 'Enter' ||
                                                event.key === ' '
                                            ) {
                                                event.preventDefault();
                                                setData(
                                                    'selected_option_id',
                                                    option.id,
                                                );
                                            }
                                        }}
                                        className={`group cursor-pointer rounded-[28px] border-2 p-4 text-left transition-all duration-200 hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-rose-200 focus-visible:outline-none sm:p-5 ${
                                            selected
                                                ? 'border-rose-400 bg-rose-50 shadow-[0_10px_28px_rgba(244,63,94,0.18)] ring-4 ring-rose-100'
                                                : 'border-slate-100 bg-slate-50 hover:border-rose-200 hover:bg-white hover:shadow-lg'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span
                                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black shadow-sm ${
                                                    selected
                                                        ? 'bg-rose-500 text-white'
                                                        : letterTint
                                                }`}
                                            >
                                                {String.fromCharCode(
                                                    65 + index,
                                                )}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={`text-sm leading-7 font-black sm:text-base ${
                                                        selected
                                                            ? 'text-rose-800'
                                                            : 'text-slate-700'
                                                    }`}
                                                >
                                                    {option.text}
                                                </p>
                                                {selected && (
                                                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-black text-rose-600 shadow-sm">
                                                        <CheckCircle2 className="size-4" />
                                                        Pilihanmu tersimpan
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    speak(option.text);
                                                }}
                                                aria-label={`Dengarkan pilihan ${String.fromCharCode(65 + index)}`}
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110 ${
                                                    selected
                                                        ? 'bg-rose-100 text-rose-600'
                                                        : 'bg-white text-rose-500'
                                                }`}
                                            >
                                                <Volume2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.selected_option_id && (
                            <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-rose-500">
                                <XCircle className="size-3.5" />
                                {errors.selected_option_id}
                            </p>
                        )}
                        <Button
                            onClick={submit}
                            disabled={
                                data.selected_option_id === null || processing
                            }
                            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-extrabold shadow-md hover:from-rose-600 hover:to-pink-600"
                        >
                            <ShieldCheck className="size-4" />
                            {processing ? 'Menilai...' : 'Kirim jawabanku'}
                        </Button>
                        <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
                            Jawaban tidak ada yang salah sempurna — yang penting
                            kamu berlatih berpikir bijak! 💪
                        </p>
                    </section>
                )}
            </div>
        </>
    );
}
