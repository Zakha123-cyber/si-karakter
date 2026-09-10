import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    MessageSquareText,
    Save,
    ShieldCheck,
    Star,
    Trash2,
    Trophy,
    User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttemptDetail {
    id: number;
    completed_at: string | null;
    score: number;
    reward_points: number;
    selected_option_id: number;
    student: {
        id: number;
        name: string;
        student_code: string | null;
        username: string | null;
    } | null;
    group: {
        id: number;
        name: string;
    } | null;
    scenario: {
        id: number;
        title: string;
        description: string | null;
        opening_text: string;
        image: string | null;
    } | null;
    options: Array<{
        id: number;
        text: string;
        feedback_text: string | null;
        score: number;
        reward_points: number;
        is_selected: boolean;
        is_best: boolean;
    }>;
    review: {
        status: string;
        teacher_note: string | null;
        teacher_name: string | null;
        reviewed_at: string | null;
    };
}

interface ShowProps {
    attempt: AttemptDetail;
}

function formatDateTime(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function SimulationReviewShow({ attempt }: ShowProps) {
    const reviewForm = useForm({
        teacher_note: attempt.review.teacher_note ?? '',
    });

    const isReviewed = attempt.review.status === 'reviewed';

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        reviewForm.post(`/teacher/simulation-reviews/${attempt.id}/review`, {
            preserveScroll: true,
        });
    };

    const cancelReview = () => {
        if (!window.confirm('Batalkan tanda review hasil simulasi ini?')) {
            return;
        }

        router.delete(`/teacher/simulation-reviews/${attempt.id}/review`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head
                title={`Detail Simulasi - ${attempt.student?.name ?? 'Santri'}`}
            />

            <div className="min-h-full space-y-6 pb-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="rounded-2xl border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-emerald-50 hover:text-emerald-700"
                        >
                            <Link href="/teacher/simulation-reviews">
                                <ArrowLeft className="size-4" />
                                <span className="sr-only">Kembali</span>
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
                                    Detail Simulasi Berani Menolak
                                </h1>
                                <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700">
                                    #{attempt.id}
                                </Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                {attempt.scenario?.title ?? 'Skenario'} —
                                selesai {formatDateTime(attempt.completed_at)}
                            </p>
                        </div>
                    </div>

                    <div>
                        {isReviewed ? (
                            <Badge className="gap-1.5 bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-600">
                                <CheckCircle2 className="size-4" />
                                Sudah Direview
                            </Badge>
                        ) : (
                            <Badge
                                variant="secondary"
                                className="gap-1.5 px-3 py-1"
                            >
                                <Clock className="size-4" />
                                Belum Direview
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)] md:col-span-2">
                        <CardHeader className="border-b border-slate-100 px-5 py-4">
                            <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-800">
                                <User className="size-5 text-emerald-600" />
                                Data Santri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-2">
                            <div>
                                <div className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                                    Nama
                                </div>
                                <div className="font-semibold text-slate-800">
                                    {attempt.student?.name ?? '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                                    NIS
                                </div>
                                <div className="font-medium text-slate-700">
                                    {attempt.student?.student_code ?? '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                                    Kelompok
                                </div>
                                <div className="font-medium text-slate-700">
                                    {attempt.group?.name ?? '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                                    Username
                                </div>
                                <div className="font-medium text-slate-700">
                                    @{attempt.student?.username ?? '-'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <CardHeader className="border-b border-slate-100 px-5 py-4">
                            <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-800">
                                <Trophy className="size-5 text-emerald-600" />
                                Skor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-4">
                            <div className="text-2xl font-extrabold text-slate-800">
                                {attempt.score}
                            </div>
                            <p className="text-xs font-medium text-slate-500">
                                Skor respons terpilih
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                        <CardHeader className="border-b border-slate-100 px-5 py-4">
                            <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-800">
                                <Star className="size-5 text-amber-500" />
                                Poin Kebaikan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-4">
                            <div className="text-2xl font-extrabold text-slate-800">
                                +{attempt.reward_points}
                            </div>
                            <p className="text-xs font-medium text-slate-500">
                                Poin yang diperoleh santri
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                    <CardHeader className="border-b border-slate-100 px-5 py-4">
                        <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-800">
                            <ShieldCheck className="size-5 text-emerald-600" />
                            Skenario: {attempt.scenario?.title ?? '-'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-5 py-4">
                        {attempt.scenario?.description && (
                            <p className="text-xs font-medium text-slate-400">
                                {attempt.scenario.description}
                            </p>
                        )}
                        <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                            {attempt.scenario?.opening_text}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                    <CardHeader className="border-b border-slate-100 px-5 py-4">
                        <CardTitle className="text-base font-extrabold text-slate-800">
                            Pilihan Respons Santri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 px-5 py-4">
                        {attempt.options.map((option) => (
                            <div
                                key={option.id}
                                className={`rounded-[24px] border p-4 text-sm ${
                                    option.is_selected
                                        ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                                        : 'border-slate-100 bg-slate-50/70'
                                }`}
                            >
                                <div className="flex flex-wrap items-start gap-2">
                                    <span className="text-slate-700">
                                        {option.text}
                                    </span>
                                    <div className="ml-auto flex flex-wrap gap-1.5">
                                        {option.is_selected && (
                                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                                Dipilih Santri
                                            </Badge>
                                        )}
                                        {option.is_best && (
                                            <Badge className="border-teal-200 bg-teal-50 text-teal-700">
                                                Pilihan Terbaik
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-bold text-slate-500">
                                    <span>Skor {option.score}</span>
                                    <span>+{option.reward_points} poin</span>
                                </div>
                                {option.feedback_text && (
                                    <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs leading-5 text-slate-600">
                                        {option.feedback_text}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                    <CardHeader className="border-b border-slate-100 px-5 py-4">
                        <CardTitle className="flex items-center gap-2 text-base font-extrabold text-slate-800">
                            <MessageSquareText className="size-5 text-emerald-600" />
                            Catatan Pembinaan Ustadz
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-5 py-4">
                        {isReviewed && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                                <div className="font-bold">
                                    Sudah direview
                                    {attempt.review.teacher_name
                                        ? ` oleh ${attempt.review.teacher_name}`
                                        : ''}
                                </div>
                                <div className="mt-0.5 text-emerald-700">
                                    {formatDateTime(attempt.review.reviewed_at)}
                                </div>
                            </div>
                        )}

                        <form onSubmit={submitReview} className="space-y-3">
                            <textarea
                                rows={4}
                                value={reviewForm.data.teacher_note}
                                onChange={(e) =>
                                    reviewForm.setData(
                                        'teacher_note',
                                        e.target.value,
                                    )
                                }
                                placeholder="Tulis catatan pembinaan untuk santri (opsional)..."
                                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-[3px] focus:ring-emerald-100"
                            />
                            {reviewForm.errors.teacher_note && (
                                <p className="text-[11px] text-rose-500">
                                    {reviewForm.errors.teacher_note}
                                </p>
                            )}
                            <div className="flex flex-wrap justify-end gap-2">
                                {isReviewed && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={cancelReview}
                                        className="rounded-2xl border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                                    >
                                        <Trash2 className="mr-1 size-4" />
                                        Batalkan Review
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={reviewForm.processing}
                                    className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    <Save className="mr-1 size-4" />
                                    {isReviewed
                                        ? 'Simpan Catatan'
                                        : 'Tandai Sudah Direview'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
