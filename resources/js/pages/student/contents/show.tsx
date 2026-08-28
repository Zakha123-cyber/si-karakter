import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';

type Indicator = {
    id: number;
    name: string;
    category: string;
};

type ContentCard = {
    id: number;
    title: string;
    slug: string;
    content_type: string;
    description: string | null;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    completed: boolean;
    indicators: Indicator[];
};

type ContentDetail = ContentCard & {
    content_body: string | null;
    media_url: string | null;
    interaction: {
        emotion_response: string | null;
        started_at: string | null;
        completed_at: string | null;
    } | null;
};

type EmotionOption = {
    value: string;
    label: string;
    emoji: string;
};

type Props = {
    content: ContentDetail;
    related: ContentCard[];
    emotionOptions: EmotionOption[];
    studentHasProfile: boolean;
};

export default function StudentContentShow({
    content,
    related,
    emotionOptions,
    studentHasProfile,
}: Props) {
    const responseForm = useForm({
        emotion_response: content.interaction?.emotion_response ?? '',
        completed: true,
    });

    const submitEmotion = (event: FormEvent) => {
        event.preventDefault();

        if (!responseForm.data.emotion_response) {
            responseForm.setError(
                'emotion_response',
                'Pilih satu emotikon dulu ya.',
            );

            return;
        }

        const toastId = toast.loading('Menyimpan responsmu...');

        responseForm.post(`/student/contents/${content.slug}/interactions`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Responsmu tersimpan. MasyaAllah!', {
                    id: toastId,
                });
                router.reload({ only: ['content'] });
            },
            onError: () => {
                toast.error('Respons belum bisa disimpan.', { id: toastId });
            },
        });
    };

    return (
        <>
            <Head title={content.title} />

            <div className="space-y-6 pb-8">
                <Link
                    href="/student/contents"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm transition-colors hover:text-emerald-600"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Bioskop Teladan
                </Link>

                <section className="overflow-hidden rounded-[32px] bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                    <div className="relative bg-gradient-to-br from-sky-100 via-emerald-50 to-amber-50 p-5 sm:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                            <div className="flex-1">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-600 shadow-sm">
                                    <Sparkles className="size-4" />
                                    {contentTypeLabel(
                                        content.content_type,
                                    )}{' '}
                                    Teladan
                                </span>
                                <h1 className="mt-4 text-3xl font-black text-slate-800 sm:text-4xl">
                                    {content.title}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed font-semibold text-slate-500 sm:text-base">
                                    {content.description ??
                                        'Materi ini mengajakmu belajar kebaikan dengan hati gembira.'}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {content.duration_seconds && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm">
                                            <Clock className="size-4" />
                                            {Math.max(
                                                1,
                                                Math.round(
                                                    content.duration_seconds /
                                                        60,
                                                ),
                                            )}{' '}
                                            menit
                                        </span>
                                    )}
                                    {content.completed && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white shadow-sm">
                                            <CheckCircle2 className="size-4" />
                                            Sudah kamu selesaikan
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-[32px] bg-white text-6xl shadow-inner sm:h-40 sm:w-40">
                                {content.thumbnail_url ? (
                                    <img
                                        src={content.thumbnail_url}
                                        alt={content.title}
                                        className="h-full w-full rounded-[32px] object-cover"
                                    />
                                ) : (
                                    contentTypeEmoji(content.content_type)
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="min-w-0 space-y-5">
                            <MediaPanel content={content} />

                            {content.content_body && (
                                <article className="rounded-[28px] bg-slate-50 p-5 text-sm leading-7 font-semibold whitespace-pre-line text-slate-600 sm:p-6">
                                    {content.content_body}
                                </article>
                            )}

                            {content.indicators.length > 0 && (
                                <div className="rounded-[28px] bg-emerald-50 p-5">
                                    <h2 className="text-sm font-black text-emerald-700">
                                        Nilai baik yang dipelajari
                                    </h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {content.indicators.map((indicator) => (
                                            <span
                                                key={indicator.id}
                                                className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-600 shadow-sm"
                                            >
                                                {indicator.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="space-y-5">
                            <form
                                onSubmit={submitEmotion}
                                className="rounded-[28px] bg-gradient-to-br from-amber-50 to-rose-50 p-5 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                                        💛
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-slate-800">
                                            Bagaimana perasaanmu?
                                        </h2>
                                        <p className="text-xs font-semibold text-slate-500">
                                            Pilih emotikon setelah
                                            membaca/menonton.
                                        </p>
                                    </div>
                                </div>

                                {!studentHasProfile && (
                                    <div className="mt-4 rounded-2xl bg-white/70 p-3 text-xs font-semibold text-amber-700">
                                        Materi bisa tetap dibaca, tetapi respons
                                        belum dapat disimpan karena profil
                                        santri belum lengkap.
                                    </div>
                                )}

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {emotionOptions.map((option) => {
                                        const selected =
                                            responseForm.data
                                                .emotion_response ===
                                            option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    responseForm.setData(
                                                        'emotion_response',
                                                        option.value,
                                                    )
                                                }
                                                disabled={!studentHasProfile}
                                                className={`rounded-3xl border-2 p-4 text-center transition-all ${
                                                    selected
                                                        ? 'border-emerald-400 bg-white shadow-md ring-4 ring-emerald-100'
                                                        : 'border-white/70 bg-white/70 hover:border-emerald-200 hover:bg-white'
                                                } disabled:cursor-not-allowed disabled:opacity-60`}
                                            >
                                                <div className="text-3xl">
                                                    {option.emoji}
                                                </div>
                                                <div className="mt-1 text-xs font-black text-slate-600">
                                                    {option.label}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError
                                    message={
                                        responseForm.errors.emotion_response
                                    }
                                    className="mt-2"
                                />

                                <Button
                                    type="submit"
                                    disabled={
                                        responseForm.processing ||
                                        !studentHasProfile
                                    }
                                    className="mt-4 h-11 w-full rounded-2xl bg-emerald-500 text-sm font-black text-white hover:bg-emerald-600"
                                >
                                    <Heart className="mr-2 size-4" />
                                    Simpan Respons
                                </Button>
                            </form>

                            {related.length > 0 && (
                                <div className="rounded-[28px] bg-white p-5 shadow-sm">
                                    <h2 className="text-base font-black text-slate-800">
                                        Materi lain untukmu
                                    </h2>
                                    <div className="mt-4 space-y-3">
                                        {related.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={`/student/contents/${item.slug}`}
                                                className="flex gap-3 rounded-2xl bg-slate-50 p-3 transition-colors hover:bg-emerald-50"
                                            >
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                                                    {item.thumbnail_url ? (
                                                        <img
                                                            src={
                                                                item.thumbnail_url
                                                            }
                                                            alt={item.title}
                                                            className="h-full w-full rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        contentTypeEmoji(
                                                            item.content_type,
                                                        )
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="line-clamp-2 text-xs font-black text-slate-700">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] font-bold text-emerald-500">
                                                        {contentTypeLabel(
                                                            item.content_type,
                                                        )}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </section>
            </div>
        </>
    );
}

function MediaPanel({ content }: { content: ContentDetail }) {
    if (!content.media_url) {
        return (
            <div className="flex min-h-64 items-center justify-center rounded-[28px] bg-gradient-to-br from-sky-100 to-emerald-100 p-8 text-center">
                <div>
                    <div className="text-6xl">
                        {contentTypeEmoji(content.content_type)}
                    </div>
                    <p className="mt-3 text-sm font-black text-slate-600">
                        Baca kisahnya di bawah ini ya.
                    </p>
                </div>
            </div>
        );
    }

    if (content.content_type === 'video') {
        return (
            <video
                controls
                poster={content.thumbnail_url ?? undefined}
                className="w-full rounded-[28px] bg-slate-900 shadow-sm"
            >
                <source src={content.media_url} />
                Browser belum mendukung pemutar video.
            </video>
        );
    }

    if (content.content_type === 'audio') {
        return (
            <div className="rounded-[28px] bg-sky-50 p-6">
                <div className="mb-4 text-center text-6xl">🎧</div>
                <audio controls className="w-full">
                    <source src={content.media_url} />
                    Browser belum mendukung pemutar audio.
                </audio>
            </div>
        );
    }

    if (content.content_type === 'image' || content.content_type === 'comic') {
        return (
            <img
                src={content.media_url}
                alt={content.title}
                className="w-full rounded-[28px] bg-slate-50 object-cover shadow-sm"
            />
        );
    }

    return (
        <div className="flex min-h-64 items-center justify-center rounded-[28px] bg-gradient-to-br from-amber-100 to-emerald-100 p-8 text-center">
            <div>
                <div className="text-6xl">📖</div>
                <p className="mt-3 text-sm font-black text-slate-600">
                    Cerita teladan siap dibaca.
                </p>
            </div>
        </div>
    );
}

function contentTypeLabel(type: string) {
    return (
        {
            video: 'Video',
            comic: 'Komik',
            image: 'Gambar',
            audio: 'Audio',
            story: 'Cerita',
        }[type] ?? type
    );
}

function contentTypeEmoji(type: string) {
    return (
        {
            video: '🎬',
            comic: '📚',
            image: '🖼️',
            audio: '🎧',
            story: '📖',
        }[type] ?? '🌟'
    );
}
