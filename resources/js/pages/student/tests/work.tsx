import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

    // Recorder & preview state
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    const nextCase = case_index + 1;
    const isLastCase = nextCase >= total_cases;
    const answerState = current_case
        ? (answers[String(current_case.id)] ?? {
              selected_option_id: null,
              typed_reason: '',
          })
        : { selected_option_id: null, typed_reason: '' };

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

        // set preview for uploaded file
        if (file) {
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
        }

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
                // auto upload recorded audio
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
        // stop all tracks
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

        if (!('speechSynthesis' in window)) {
            alert('Browser Anda tidak mendukung Text-to-Speech.');

            return;
        }

        const utter = new SpeechSynthesisUtterance(current_case.story);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    };

    if (!current_case) {
        return (
            <>
                <Head title="Tes Dilema Moral" />
                <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                        Belum ada kasus yang tersedia untuk paket ini.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Kasus ${case_index + 1} - ${pkg.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            {pkg.title}
                        </h1>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                            Kasus {case_index + 1} dari {total_cases}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {pkg.description ??
                            'Kerjakan setiap kasus dengan seksama.'}
                    </p>
                    <div className="flex flex-col gap-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                    width: `${((case_index + 1) / Math.max(total_cases, 1)) * 100}%`,
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progres pengerjaan</span>
                            <span>
                                {case_index + 1}/{total_cases}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Status simpan:{' '}
                        {autoSaveStatus === 'saved'
                            ? 'Tersimpan otomatis'
                            : autoSaveStatus === 'saving'
                              ? 'Menyimpan...'
                              : 'Siap'}
                    </p>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>{current_case.title}</CardTitle>
                        <CardDescription>
                            Silakan pilih satu opsi yang paling sesuai.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                            {current_case.story}
                        </div>

                        <div className="grid gap-3">
                            {current_case.options.map((option) => {
                                const selected =
                                    form.data.selected_option_id === option.id;

                                return (
                                    <Button
                                        key={option.id}
                                        type="button"
                                        variant={
                                            selected ? 'default' : 'outline'
                                        }
                                        className="h-auto justify-start px-4 py-4 text-left"
                                        onClick={() => chooseOption(option.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5 flex size-6 items-center justify-center rounded-full border text-xs font-semibold">
                                                {option.label}
                                            </span>
                                            <span>{option.text}</span>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>

                        <div className="grid gap-2">
                            <label
                                className="text-sm font-medium"
                                htmlFor="typed_reason"
                            >
                                Alasan singkat
                            </label>
                            <textarea
                                id="typed_reason"
                                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={form.data.typed_reason}
                                onChange={(
                                    event: React.ChangeEvent<HTMLTextAreaElement>,
                                ) =>
                                    form.setData(
                                        'typed_reason',
                                        event.target.value,
                                    )
                                }
                                placeholder="Tuliskan alasan Anda singkat..."
                                rows={4}
                            />
                        </div>

                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        Audio singkat
                                    </span>
                                </label>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleAudioUpload}
                                    />
                                    <button
                                        type="button"
                                        className="text-sm text-primary underline"
                                        onClick={playStory}
                                    >
                                        Putar Cerita (TTS)
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!isRecording ? (
                                        <Button
                                            type="button"
                                            onClick={startRecording}
                                        >
                                            Mulai Rekam
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={stopRecording}
                                        >
                                            Stop
                                        </Button>
                                    )}
                                    {recordedUrl ? (
                                        <audio controls src={recordedUrl} />
                                    ) : null}
                                    {filePreviewUrl ? (
                                        <audio controls src={filePreviewUrl} />
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-end gap-2">
                                {case_index > 0 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            navigateToCase(case_index - 1)
                                        }
                                    >
                                        Sebelumnya
                                    </Button>
                                ) : null}
                                <Button type="button" onClick={saveAndContinue}>
                                    {isLastCase
                                        ? 'Kirim Jawaban'
                                        : 'Simpan & Lanjut'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StudentTestWork.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Tes Dilema Moral', href: '/student/tests' },
        { title: 'Kerjakan Tes', href: '#' },
    ],
};
