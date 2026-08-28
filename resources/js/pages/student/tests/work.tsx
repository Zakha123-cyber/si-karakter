import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    FileAudio,
    LoaderCircle,
    Mic,
    PauseCircle,
    Save,
    Sparkles,
    Upload,
    Volume2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

type CurrentCase = {
    id: number;
    title: string;
    story: string;
    options: Array<{
        id: number;
        label: string;
        text: string;
    }>;
};

type Props = {
    package: {
        id: number;
        title: string;
        description: string | null;
    };
    attempt: {
        id: number;
        status: string;
        attempt_number: number;
    };
    current_case: CurrentCase | null;
    case_index: number;
    total_cases: number;
    answers: Record<
        string,
        { selected_option_id: number | null; typed_reason: string | null }
    >;
};

export default function StudentTestWork({
    package: pkg,
    attempt,
    current_case,
    case_index,
    total_cases,
    answers,
}: Props) {
    const form = useForm({
        moral_case_id: current_case?.id ?? 0,
        selected_option_id: null as number | null,
        typed_reason: '',
        audio: null as File | null,
    });
    const [autoSaveStatus, setAutoSaveStatus] = useState<
        'idle' | 'saving' | 'saved'
    >('idle');

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    const [isStoryLoading, setIsStoryLoading] = useState(false);
    const [isStoryPlaying, setIsStoryPlaying] = useState(false);
    const storyAudioRef = useRef<HTMLAudioElement | null>(null);

    const nextCase = case_index + 1;
    const isLastCase = nextCase >= total_cases;
    const answerState = current_case
        ? (answers[String(current_case.id)] ?? {
              selected_option_id: null,
              typed_reason: '',
          })
        : { selected_option_id: null, typed_reason: '' };
    const progressPercent = Math.round(
        ((case_index + 1) / Math.max(total_cases, 1)) * 100,
    );
    const selectedOption = current_case?.options.find(
        (option) => option.id === form.data.selected_option_id,
    );

    useEffect(() => {
        if (!current_case) {
            return;
        }

        form.setData('moral_case_id', current_case.id);
        form.setData(
            'selected_option_id',
            answerState.selected_option_id ?? null,
        );
        form.setData('typed_reason', answerState.typed_reason ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        current_case?.id,
        answerState.selected_option_id,
        answerState.typed_reason,
    ]);

    useEffect(() => {
        if (!current_case) {
            return;
        }

        const hasData =
            form.data.selected_option_id !== null ||
            form.data.typed_reason !== '';

        if (!hasData) {
            return;
        }

        const timer = window.setTimeout(() => {
            setAutoSaveStatus('saving');

            form.post(
                `/student/tests/${pkg.id}/attempts/${attempt.id}/answers`,
                {
                    preserveScroll: true,
                    onSuccess: () => setAutoSaveStatus('saved'),
                    onError: () => setAutoSaveStatus('idle'),
                },
            );
        }, 800);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        attempt.id,
        current_case?.id,
        form.data.selected_option_id,
        form.data.typed_reason,
        pkg.id,
    ]);

    useEffect(() => {
        return () => {
            if (recordedUrl) {
                URL.revokeObjectURL(recordedUrl);
            }

            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [recordedUrl, filePreviewUrl]);

    const chooseOption = (optionId: number) => {
        form.setData('selected_option_id', optionId);
    };

    const saveAndContinue = () => {
        if (isLastCase) {
            const confirmed = window.confirm(
                'Sudah siap mengirim semua jawaban? Pastikan pilihan dan alasanmu sudah sesuai ya.',
            );

            if (!confirmed) {
                return;
            }
        }

        setAutoSaveStatus('saving');

        form.post(`/student/tests/${pkg.id}/attempts/${attempt.id}/answers`, {
            preserveScroll: true,
            onSuccess: () => {
                setAutoSaveStatus('saved');

                if (isLastCase) {
                    router.post(
                        `/student/tests/${pkg.id}/attempts/${attempt.id}/submit`,
                        {},
                        {
                            preserveScroll: true,
                        },
                    );

                    return;
                }

                router.get(
                    `/student/tests/${pkg.id}/attempts/${attempt.id}?case=${nextCase}`,
                );
            },
            onError: () => setAutoSaveStatus('idle'),
        });
    };

    const navigateToCase = (targetCase: number) => {
        setAutoSaveStatus('saving');

        form.post(`/student/tests/${pkg.id}/attempts/${attempt.id}/answers`, {
            preserveScroll: true,
            onSuccess: () => {
                setAutoSaveStatus('saved');
                router.get(
                    `/student/tests/${pkg.id}/attempts/${attempt.id}?case=${targetCase}`,
                );
            },
            onError: () => setAutoSaveStatus('idle'),
        });
    };

    const handleAudioUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!current_case) {
            return;
        }

        const formData = new FormData();
        formData.append('moral_case_id', String(current_case.id));
        formData.append(
            'selected_option_id',
            String(form.data.selected_option_id ?? ''),
        );
        formData.append('typed_reason', form.data.typed_reason);
        formData.append('audio', file);

        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);

        setAutoSaveStatus('saving');
        router.post(
            `/student/tests/${pkg.id}/attempts/${attempt.id}/answers`,
            formData,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setAutoSaveStatus('saved'),
                onError: () => setAutoSaveStatus('idle'),
            },
        );
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Browser Anda tidak mendukung perekaman audio.');

            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mr = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            mr.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mr.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setRecordedBlob(blob);
                const url = URL.createObjectURL(blob);
                setRecordedUrl(url);
                uploadRecordedAudio(blob);
            };

            mediaRecorderRef.current = mr;
            mr.start();
            setIsRecording(true);
        } catch (err) {
            console.error(err);
            alert('Gagal mengakses mikrofon.');
        }
    };

    const stopRecording = () => {
        const mr = mediaRecorderRef.current;

        if (!mr) {
            return;
        }

        mr.stop();
        setIsRecording(false);
        mr.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
    };

    const uploadRecordedAudio = (blob: Blob) => {
        if (!current_case) {
            return;
        }

        const formData = new FormData();
        formData.append('moral_case_id', String(current_case.id));
        formData.append(
            'selected_option_id',
            String(form.data.selected_option_id ?? ''),
        );
        formData.append('typed_reason', form.data.typed_reason);
        const file = new File([blob], `recording-${Date.now()}.webm`, {
            type: blob.type,
        });
        formData.append('audio', file);

        setAutoSaveStatus('saving');
        router.post(
            `/student/tests/${pkg.id}/attempts/${attempt.id}/answers`,
            formData,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setAutoSaveStatus('saved'),
                onError: () => setAutoSaveStatus('idle'),
            },
        );
    };

    const playStory = () => {
        if (!current_case) {
            return;
        }

        const audio = storyAudioRef.current;

        if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            setIsStoryPlaying(false);

            return;
        }

        if (!audio) {
            return;
        }

        setIsStoryLoading(true);
        audio.src = `/student/stories/${current_case.id}/tts`;
        audio.onended = () => setIsStoryPlaying(false);
        audio.onerror = () => {
            setIsStoryLoading(false);
            setIsStoryPlaying(false);
            playWithBrowserSpeech(current_case.story);
        };
        audio
            .play()
            .then(() => {
                setIsStoryPlaying(true);
                setIsStoryLoading(false);
            })
            .catch(() => {
                setIsStoryLoading(false);
                setIsStoryPlaying(false);
            });
    };

    const playWithBrowserSpeech = (text: string) => {
        if (!('speechSynthesis' in window)) {
            alert('Browser Anda tidak mendukung Text-to-Speech.');

            return;
        }

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'id-ID';
        utter.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    };

    if (!current_case) {
        return (
            <>
                <Head title="Pilih Jalanmu" />
                <div className="flex min-h-[60vh] items-center justify-center p-4">
                    <div className="max-w-lg rounded-[32px] bg-white p-10 text-center shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <div className="text-6xl">🌈</div>
                        <h1 className="mt-4 text-2xl font-black text-slate-800">
                            Belum ada kisah di paket ini
                        </h1>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Nanti kalau kisahnya sudah siap, kamu bisa kembali
                            memilih jalan baik di sini.
                        </p>
                        <Link
                            href="/student/tests"
                            className="mt-6 inline-flex rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-sm transition-transform hover:scale-[1.02]"
                        >
                            Kembali ke Pilih Jalanmu
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Kisah ${case_index + 1} - ${pkg.title}`} />

            <div className="space-y-6 pb-8">
                <Link
                    href="/student/tests"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm transition-colors hover:text-emerald-600"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Pilih Jalanmu
                </Link>

                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-purple-500 via-sky-500 to-emerald-400 p-5 text-white shadow-[0_12px_40px_rgba(14,165,233,0.32)] sm:p-8">
                    <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
                        <div>
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-black backdrop-blur-sm">
                                    <Sparkles className="size-4" />
                                    Percobaan ke-{attempt.attempt_number}
                                </span>
                                <AutoSaveBadge status={autoSaveStatus} />
                            </div>
                            <h1 className="text-2xl font-black sm:text-4xl">
                                {pkg.title}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-semibold text-purple-50 sm:text-base">
                                {pkg.description ??
                                    'Baca satu kisah, pilih jalan terbaik, lalu ceritakan alasanmu.'}
                            </p>
                        </div>

                        <div className="rounded-[28px] bg-white/20 p-4 backdrop-blur-md">
                            <div className="mb-3 flex items-center justify-between text-xs font-black text-white/80">
                                <span>
                                    Kisah {case_index + 1} dari {total_cases}
                                </span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="h-4 overflow-hidden rounded-full bg-white/25">
                                <div
                                    className="h-full rounded-full bg-white transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="mt-4 flex justify-center gap-1.5">
                                {Array.from({ length: total_cases }).map(
                                    (_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() =>
                                                index === case_index
                                                    ? undefined
                                                    : navigateToCase(index)
                                            }
                                            className={`h-3 flex-1 rounded-full transition-all ${
                                                index <= case_index
                                                    ? 'bg-white'
                                                    : 'bg-white/30'
                                            }`}
                                            aria-label={`Buka kisah ${index + 1}`}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute -right-8 -bottom-12 text-9xl opacity-20">
                        🛤️
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="min-w-0 space-y-6">
                        <div className="rounded-[32px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex gap-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-amber-200 to-orange-200 text-4xl shadow-inner">
                                        📖
                                    </div>
                                    <div>
                                        <span className="text-xs font-black tracking-wide text-purple-500 uppercase">
                                            Kisah Hari Ini
                                        </span>
                                        <h2 className="mt-1 text-2xl font-black text-slate-800">
                                            {current_case.title}
                                        </h2>
                                        <p className="mt-1 text-sm font-semibold text-slate-400">
                                            Dengarkan atau baca pelan-pelan ya.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    onClick={playStory}
                                    disabled={isStoryLoading}
                                    className="h-11 rounded-2xl bg-sky-500 px-4 text-sm font-black text-white hover:bg-sky-600 disabled:cursor-wait disabled:opacity-70"
                                >
                                    {isStoryLoading ? (
                                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <Volume2 className="mr-2 size-4" />
                                    )}
                                    {isStoryLoading
                                        ? 'Menyiapkan Suara...'
                                        : isStoryPlaying
                                          ? 'Hentikan Cerita'
                                          : 'Putar Cerita'}
                                </Button>
                                <audio
                                    ref={storyAudioRef}
                                    className="hidden"
                                    preload="none"
                                />
                            </div>

                            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-50 via-purple-50 to-emerald-50 p-5 sm:p-6">
                                <div className="absolute top-4 right-4 text-5xl opacity-20">
                                    🕌
                                </div>
                                <p className="relative text-base leading-8 font-bold whitespace-pre-line text-slate-600 sm:text-lg">
                                    {current_case.story}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[32px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <SectionHeader
                                icon="✨"
                                title="Pilih jalan terbaik"
                                description="Ketuk satu kartu jawaban yang menurutmu paling baik."
                            />

                            <div className="mt-5 grid gap-4">
                                {current_case.options.map((option, index) => {
                                    const selected =
                                        form.data.selected_option_id ===
                                        option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() =>
                                                chooseOption(option.id)
                                            }
                                            className={`group rounded-[28px] border-2 p-4 text-left transition-all duration-200 hover:-translate-y-1 sm:p-5 ${
                                                selected
                                                    ? 'border-emerald-400 bg-emerald-50 shadow-[0_10px_28px_rgba(16,185,129,0.18)] ring-4 ring-emerald-100'
                                                    : 'border-slate-100 bg-slate-50 hover:border-sky-200 hover:bg-white hover:shadow-lg'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <span
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black shadow-sm ${
                                                        selected
                                                            ? 'bg-emerald-500 text-white'
                                                            : optionColors[
                                                                  index %
                                                                      optionColors.length
                                                              ]
                                                    }`}
                                                >
                                                    {option.label}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm leading-7 font-black text-slate-700 sm:text-base">
                                                        {option.text}
                                                    </p>
                                                    {selected && (
                                                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-600 shadow-sm">
                                                            <CheckCircle2 className="size-4" />
                                                            Pilihanmu tersimpan
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-[32px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <SectionHeader
                                icon="💬"
                                title="Ceritakan alasanmu"
                                description="Tulis singkat atau rekam suara agar ustadz memahami isi hatimu."
                            />

                            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                                <div>
                                    <label
                                        className="mb-2 block text-sm font-black text-slate-700"
                                        htmlFor="typed_reason"
                                    >
                                        Alasan singkat
                                    </label>
                                    <textarea
                                        id="typed_reason"
                                        className="min-h-40 w-full rounded-[24px] border-2 border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-7 font-semibold text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                        value={form.data.typed_reason}
                                        onChange={(
                                            event: React.ChangeEvent<HTMLTextAreaElement>,
                                        ) =>
                                            form.setData(
                                                'typed_reason',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Saya memilih ini karena ingin jujur dan menjaga teman..."
                                        rows={5}
                                    />
                                    {selectedOption && (
                                        <p className="mt-2 text-xs font-semibold text-emerald-600">
                                            Pilihanmu: {selectedOption.label} —{' '}
                                            {selectedOption.text}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-[28px] bg-gradient-to-br from-rose-50 to-amber-50 p-4">
                                    <div className="text-center">
                                        <div
                                            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-4xl shadow-inner transition-all ${
                                                isRecording
                                                    ? 'animate-pulse bg-rose-500 text-white'
                                                    : 'bg-white text-rose-500'
                                            }`}
                                        >
                                            <Mic className="size-10" />
                                        </div>
                                        <h3 className="mt-3 text-sm font-black text-slate-700">
                                            Rekam Suaramu
                                        </h3>
                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                            Ceritakan alasanmu dengan suara yang
                                            jelas.
                                        </p>
                                    </div>

                                    <div className="mt-4 grid gap-2">
                                        {!isRecording ? (
                                            <Button
                                                type="button"
                                                onClick={startRecording}
                                                className="h-12 rounded-2xl bg-rose-500 text-sm font-black text-white hover:bg-rose-600"
                                            >
                                                <Mic className="mr-2 size-4" />
                                                Mulai Rekam
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={stopRecording}
                                                className="h-12 rounded-2xl bg-slate-800 text-sm font-black text-white hover:bg-slate-700"
                                            >
                                                <PauseCircle className="mr-2 size-4" />
                                                Stop Rekaman
                                            </Button>
                                        )}

                                        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white text-xs font-black text-amber-700 shadow-sm transition-transform hover:scale-[1.02]">
                                            <Upload className="size-4" />
                                            Upload Audio
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                onChange={handleAudioUpload}
                                                className="sr-only"
                                            />
                                        </label>
                                    </div>

                                    {(recordedUrl || filePreviewUrl) && (
                                        <div className="mt-4 space-y-3 rounded-2xl bg-white/80 p-3">
                                            {recordedUrl && (
                                                <AudioPreview
                                                    label="Rekamanmu"
                                                    src={recordedUrl}
                                                />
                                            )}
                                            {filePreviewUrl && (
                                                <AudioPreview
                                                    label="Audio upload"
                                                    src={filePreviewUrl}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
                        <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <h2 className="text-base font-black text-slate-800">
                                Ringkasan Jawaban
                            </h2>
                            <div className="mt-4 space-y-3">
                                <SummaryItem
                                    icon="🧭"
                                    label="Pilihan"
                                    value={
                                        selectedOption
                                            ? `${selectedOption.label}. ${selectedOption.text}`
                                            : 'Belum memilih'
                                    }
                                />
                                <SummaryItem
                                    icon="💬"
                                    label="Alasan"
                                    value={
                                        form.data.typed_reason.trim()
                                            ? 'Sudah ditulis'
                                            : 'Boleh ditulis singkat'
                                    }
                                />
                                <SummaryItem
                                    icon="🎙️"
                                    label="Suara"
                                    value={
                                        recordedUrl || filePreviewUrl
                                            ? 'Audio siap'
                                            : 'Opsional, boleh direkam'
                                    }
                                />
                            </div>
                        </div>

                        <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <h2 className="text-base font-black text-slate-800">
                                Pindah Kisah
                            </h2>
                            <div className="mt-4 grid grid-cols-5 gap-2">
                                {Array.from({ length: total_cases }).map(
                                    (_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() =>
                                                index === case_index
                                                    ? undefined
                                                    : navigateToCase(index)
                                            }
                                            className={`flex h-10 items-center justify-center rounded-2xl text-xs font-black transition-all ${
                                                index === case_index
                                                    ? 'bg-emerald-500 text-white shadow-sm'
                                                    : index < case_index
                                                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                      : 'bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-500'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="rounded-[28px] bg-gradient-to-br from-emerald-50 to-sky-50 p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">🌱</span>
                                <p className="text-xs leading-relaxed font-bold text-emerald-700">
                                    Jawabanmu tersimpan otomatis. Tetap tenang,
                                    pilih dengan hati baik, lalu lanjutkan saat
                                    sudah siap.
                                </p>
                            </div>
                        </div>
                    </aside>
                </section>

                <div className="sticky bottom-4 z-20 rounded-[28px] bg-white/90 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 backdrop-blur-md">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 px-2">
                            <AutoSaveIcon status={autoSaveStatus} />
                            <div>
                                <p className="text-xs font-black text-slate-700">
                                    {autoSaveText(autoSaveStatus)}
                                </p>
                                <p className="text-[11px] font-semibold text-slate-400">
                                    {isLastCase
                                        ? 'Siap kirim jika semua jawaban sudah cocok.'
                                        : 'Lanjut ke kisah berikutnya saat siap.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                            {case_index > 0 && (
                                <Button
                                    type="button"
                                    onClick={() =>
                                        navigateToCase(case_index - 1)
                                    }
                                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="mr-2 size-4" />
                                    Sebelumnya
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={saveAndContinue}
                                disabled={form.processing}
                                className="h-12 rounded-2xl bg-emerald-500 px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.28)] hover:bg-emerald-600 disabled:opacity-70"
                            >
                                {isLastCase ? (
                                    <CheckCircle2 className="mr-2 size-4" />
                                ) : (
                                    <ArrowRight className="mr-2 size-4" />
                                )}
                                {isLastCase
                                    ? 'Kirim Jawaban'
                                    : 'Simpan & Lanjut'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function SectionHeader({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-xl">
                {icon}
            </div>
            <div>
                <h2 className="text-lg font-black text-slate-800">{title}</h2>
                <p className="text-xs font-semibold text-slate-400">
                    {description}
                </p>
            </div>
        </div>
    );
}

function AutoSaveBadge({ status }: { status: 'idle' | 'saving' | 'saved' }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-black backdrop-blur-sm">
            <AutoSaveIcon status={status} light />
            {autoSaveText(status)}
        </span>
    );
}

function AutoSaveIcon({
    status,
    light = false,
}: {
    status: 'idle' | 'saving' | 'saved';
    light?: boolean;
}) {
    const className = light ? 'size-4 text-white' : 'size-5 text-emerald-500';

    if (status === 'saving') {
        return <LoaderCircle className={`${className} animate-spin`} />;
    }

    if (status === 'saved') {
        return <CheckCircle2 className={className} />;
    }

    return <Save className={className} />;
}

function autoSaveText(status: 'idle' | 'saving' | 'saved') {
    if (status === 'saving') {
        return 'Menyimpan...';
    }

    if (status === 'saved') {
        return 'Tersimpan otomatis';
    }

    return 'Siap disimpan';
}

function AudioPreview({ label, src }: { label: string; src: string }) {
    return (
        <div>
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-black text-slate-500">
                <FileAudio className="size-3.5" />
                {label}
            </p>
            <audio controls src={src} className="w-full" />
        </div>
    );
}

function SummaryItem({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-400 uppercase">
                    {label}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs font-bold text-slate-600">
                    {value}
                </p>
            </div>
        </div>
    );
}

const optionColors = [
    'bg-sky-100 text-sky-600',
    'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
    'bg-emerald-100 text-emerald-600',
];

StudentTestWork.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pilih Jalanmu', href: '/student/tests' },
        { title: 'Kerjakan Tes', href: '#' },
    ],
};
