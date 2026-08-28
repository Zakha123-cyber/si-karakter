import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Filter,
    Pencil,
    Plus,
    Search,
    Sparkles,
    Star,
    Trash2,
    UserRoundCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type StudentOption = {
    id: number;
    name: string | null;
    student_code: string | null;
    group_name: string | null;
};

type TeacherOption = {
    id: number;
    name: string;
};

type IndicatorOption = {
    id: number;
    name: string;
    category: string;
};

type CategoryOption = {
    value: string;
    label: string;
};

type SentimentOption = {
    value: string;
    label: string;
};

type ItemForm = {
    character_indicator_id: number;
    sentiment: string;
    assessment_score: string;
    reward_points: string;
    note: string;
};

type ObservationItem = {
    id: number;
    character_indicator_id: number;
    indicator_name: string | null;
    sentiment: string;
    assessment_score: number | null;
    reward_points: number;
    note: string | null;
};

type Observation = {
    id: number;
    observed_at: string;
    general_note: string | null;
    sentiment: string | null;
    created_at: string;
    student: {
        id: number | null;
        name: string | null;
        student_code: string | null;
        group_name: string | null;
    };
    teacher: { id: number | null; name: string | null };
    items: ObservationItem[];
    score: number | null;
    total_reward_points: number;
    can_edit: boolean;
    can_delete: boolean;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedObservations = {
    data: Observation[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Summary = {
    total: number;
    average_score: number | null;
    sentiments: { positive: number; neutral: number; negative: number };
    total_reward_points: number;
};

type Props = {
    observations: PaginatedObservations;
    summary: Summary;
    filters: {
        search: string;
        date_from: string | null;
        date_to: string | null;
        student_id: number | null;
        teacher_id: number | null;
        sentiment: string;
    };
    students: StudentOption[];
    teachers: TeacherOption[];
    indicators: IndicatorOption[];
    categories: CategoryOption[];
    sentiments: SentimentOption[];
    scoreThresholds: { positive: number; negative: number };
};

type ObservationForm = {
    data: { items: ItemForm[] };
    setData: (key: 'items', value: ItemForm[]) => void;
};

const SENTIMENT_VALUES = ['positive', 'neutral', 'negative'] as const;

function sentimentLabel(value: string): string {
    const map: Record<string, string> = {
        positive: 'Positif',
        neutral: 'Netral',
        negative: 'Negatif',
    };

    return map[value] ?? value;
}

function sentimentClasses(value: string | null): string {
    switch (value) {
        case 'positive':
            return 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50';
        case 'neutral':
            return 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50';
        case 'negative':
            return 'border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-50';
        default:
            return 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-50';
    }
}

const sentimentButtonClasses: Record<string, string> = {
    positive: 'bg-emerald-600 text-white hover:bg-emerald-700',
    neutral: 'bg-amber-500 text-white hover:bg-amber-600',
    negative: 'bg-rose-500 text-white hover:bg-rose-600',
};

function studentInitial(name?: string | null): string {
    return name?.trim().charAt(0)?.toUpperCase() || 'S';
}

function suggestSentiment(
    score: string,
    thresholds: { positive: number; negative: number },
): string | null {
    if (score === '') {
        return null;
    }

    const value = Number(score);

    if (Number.isNaN(value)) {
        return null;
    }

    if (value >= thresholds.positive) {
        return 'positive';
    }

    if (value < thresholds.negative) {
        return 'negative';
    }

    return 'neutral';
}

function toggleIndicator(form: ObservationForm, id: number): void {
    const exists = form.data.items.some(
        (item) => item.character_indicator_id === id,
    );

    form.setData(
        'items',
        exists
            ? form.data.items.filter(
                  (item) => item.character_indicator_id !== id,
              )
            : [
                  ...form.data.items,
                  {
                      character_indicator_id: id,
                      sentiment: '',
                      assessment_score: '',
                      reward_points: '0',
                      note: '',
                  },
              ],
    );
}

function patchItem(
    form: ObservationForm,
    index: number,
    patch: Partial<ItemForm>,
): void {
    form.setData(
        'items',
        form.data.items.map((item, i) =>
            i === index ? { ...item, ...patch } : item,
        ),
    );
}

function PaginationLabel({ label }: { label: string }) {
    if (
        label === '&laquo; Previous' ||
        label === 'pagination.previous' ||
        label.toLowerCase().includes('previous')
    ) {
        return (
            <>
                <ChevronLeft className="size-4" />
                <span className="sr-only">Sebelumnya</span>
            </>
        );
    }

    if (
        label === 'Next &raquo;' ||
        label === 'pagination.next' ||
        label.toLowerCase().includes('next')
    ) {
        return (
            <>
                <ChevronRight className="size-4" />
                <span className="sr-only">Berikutnya</span>
            </>
        );
    }

    return <span>{label}</span>;
}

function ItemEditor({
    item,
    indicatorName,
    index,
    errors,
    onChange,
    onRemove,
    scoreThresholds,
}: {
    item: ItemForm;
    indicatorName: string;
    index: number;
    errors: Record<string, string | undefined>;
    onChange: (patch: Partial<ItemForm>) => void;
    onRemove: () => void;
    scoreThresholds: { positive: number; negative: number };
}) {
    const suggested = suggestSentiment(item.assessment_score, scoreThresholds);
    const errorAt = (key: string) => errors[`items.${index}.${key}`];

    return (
        <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-extrabold text-slate-700">
                    {indicatorName}
                </Label>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onRemove}
                    className="rounded-2xl text-xs font-extrabold text-rose-500 hover:bg-rose-50"
                >
                    Hapus
                </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                    Sentimen:
                </span>
                {SENTIMENT_VALUES.map((value) => (
                    <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={
                            item.sentiment === value ? 'default' : 'outline'
                        }
                        onClick={() => onChange({ sentiment: value })}
                        className={
                            item.sentiment === value
                                ? `rounded-2xl text-xs font-extrabold ${sentimentButtonClasses[value]}`
                                : 'rounded-2xl border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50'
                        }
                    >
                        {sentimentLabel(value)}
                    </Button>
                ))}
            </div>
            <InputError message={errorAt('sentiment')} />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                    <Label className="text-xs font-extrabold text-slate-600">
                        Skor (0-100)
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        className="h-10 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200"
                        value={item.assessment_score}
                        onChange={(event) =>
                            onChange({
                                assessment_score: event.target.value,
                            })
                        }
                        placeholder="Opsional"
                    />
                    {suggested && item.sentiment !== suggested && (
                        <p className="text-xs font-semibold text-slate-500">
                            Saran sentimen:{' '}
                            <Button
                                type="button"
                                size="sm"
                                variant="link"
                                className="h-auto p-0 text-xs font-extrabold text-emerald-600"
                                onClick={() =>
                                    onChange({ sentiment: suggested })
                                }
                            >
                                {sentimentLabel(suggested)}
                            </Button>
                        </p>
                    )}
                    <InputError message={errorAt('assessment_score')} />
                </div>
                <div className="grid gap-1.5">
                    <Label className="text-xs font-extrabold text-slate-600">
                        Poin Reward
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        className="h-10 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200"
                        value={item.reward_points}
                        onChange={(event) =>
                            onChange({ reward_points: event.target.value })
                        }
                    />
                    <InputError message={errorAt('reward_points')} />
                </div>
            </div>

            <div className="mt-3 grid gap-1.5">
                <Label className="text-xs font-extrabold text-slate-600">
                    Catatan Indikator
                </Label>
                <textarea
                    rows={2}
                    className="rounded-[22px] border border-slate-100 bg-slate-50 p-3 text-sm shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                    value={item.note}
                    onChange={(event) => onChange({ note: event.target.value })}
                    placeholder="Catatan singkat indikator ini..."
                />
                <InputError message={errorAt('note')} />
            </div>
        </div>
    );
}

export default function TeacherObservationsIndex({
    observations,
    summary,
    filters,
    students,
    teachers,
    indicators,
    categories,
    sentiments,
    scoreThresholds,
}: Props) {
    const { props } = usePage<{
        auth: Auth;
        flash?: { status?: string };
    }>();
    const auth = props.auth;
    const role = (auth.user?.role as string) ?? 'student';
    const userId = auth.user?.id;
    const firstName = auth.user?.name
        ? auth.user.name.split(' ')[0]
        : role === 'admin'
          ? 'Admin'
          : 'Ustadz';

    const today = new Date().toISOString().slice(0, 10);
    const defaultTeacherId = role === 'teacher' ? String(userId ?? '') : '';

    const [search, setSearch] = useState(filters.search || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [studentFilter, setStudentFilter] = useState(
        filters.student_id ? String(filters.student_id) : '',
    );
    const [teacherFilter, setTeacherFilter] = useState(
        filters.teacher_id ? String(filters.teacher_id) : '',
    );
    const [sentimentFilter, setSentimentFilter] = useState(
        filters.sentiment || '',
    );

    const [editing, setEditing] = useState<Observation | null>(null);
    const [viewing, setViewing] = useState<Observation | null>(null);

    const createForm = useForm({
        student_id: '',
        observed_at: today,
        teacher_id: defaultTeacherId,
        general_note: '',
        items: [] as ItemForm[],
    });

    const editForm = useForm({
        student_id: '',
        observed_at: today,
        teacher_id: defaultTeacherId,
        general_note: '',
        items: [] as ItemForm[],
    });

    const categoryList: CategoryOption[] = categories.map((cat) =>
        typeof cat === 'string' ? { value: cat, label: cat } : cat,
    );

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/teacher/observations',
            {
                search,
                date_from: dateFrom,
                date_to: dateTo,
                student_id: studentFilter,
                teacher_id: teacherFilter,
                sentiment: sentimentFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setStudentFilter('');
        setTeacherFilter('');
        setSentimentFilter('');

        router.get('/teacher/observations', {}, { preserveState: true });
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan observasi...');

        createForm.post('/teacher/observations', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Observasi berhasil disimpan.', {
                    id: toastId,
                });
                createForm.reset();
            },
            onError: () => {
                toast.error(
                    'Observasi belum bisa disimpan. Periksa kembali form.',
                    { id: toastId },
                );
            },
        });
    };

    const startEdit = (observation: Observation) => {
        setEditing(observation);
        editForm.setData({
            student_id: String(observation.student.id ?? ''),
            observed_at: observation.observed_at,
            teacher_id: String(observation.teacher.id ?? ''),
            general_note: observation.general_note || '',
            items: observation.items.map((item) => ({
                character_indicator_id: item.character_indicator_id,
                sentiment: item.sentiment,
                assessment_score:
                    item.assessment_score !== null
                        ? String(item.assessment_score)
                        : '',
                reward_points: String(item.reward_points),
                note: item.note || '',
            })),
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditing(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();

        if (!editing) {
            return;
        }

        const toastId = toast.loading('Menyimpan perubahan observasi...');

        editForm.put(`/teacher/observations/${editing.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Observasi berhasil diperbarui.', {
                    id: toastId,
                });
                cancelEdit();
            },
            onError: () => {
                toast.error(
                    'Observasi belum bisa diperbarui. Periksa kembali form.',
                    { id: toastId },
                );
            },
        });
    };

    const deleteObservation = (observation: Observation) => {
        toast.warning(
            `Hapus observasi ${observation.student.name} (${observation.observed_at})?`,
            {
                description:
                    'Observasi akan dihapus dari riwayat beserta poin reward-nya.',
                action: {
                    label: 'Hapus',
                    onClick: () => {
                        router.delete(
                            `/teacher/observations/${observation.id}`,
                            {
                                preserveScroll: true,
                                onSuccess: () => {
                                    toast.success(
                                        'Observasi berhasil dihapus.',
                                    );
                                },
                                onError: () => {
                                    toast.error('Gagal menghapus observasi.');
                                },
                            },
                        );
                    },
                },
                cancel: {
                    label: 'Batal',
                    onClick: () => undefined,
                },
                duration: 10000,
            },
        );
    };

    const isCreateSelected = (id: number) =>
        createForm.data.items.some(
            (item) => item.character_indicator_id === id,
        );

    const isEditSelected = (id: number) =>
        editForm.data.items.some((item) => item.character_indicator_id === id);

    const renderChecklist = (
        form: ObservationForm,
        selected: (id: number) => boolean,
        errors: Record<string, string | undefined>,
    ) => (
        <div className="grid gap-4">
            {categoryList.map((category) => {
                const categoryIndicators = indicators.filter(
                    (indicator) => indicator.category === category.value,
                );

                if (categoryIndicators.length === 0) {
                    return null;
                }

                return (
                    <div key={category.value} className="grid gap-2">
                        <Label className="text-xs font-extrabold tracking-wide text-slate-400 uppercase">
                            {category.label}
                        </Label>
                        {categoryIndicators.map((indicator) => {
                            const itemIndex = form.data.items.findIndex(
                                (item) =>
                                    item.character_indicator_id ===
                                    indicator.id,
                            );
                            const item = form.data.items[itemIndex];

                            return (
                                <div key={indicator.id} className="grid gap-2">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id={`indicator-${indicator.id}`}
                                            checked={selected(indicator.id)}
                                            onCheckedChange={() =>
                                                toggleIndicator(
                                                    form,
                                                    indicator.id,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`indicator-${indicator.id}`}
                                            className="text-sm font-bold text-slate-700"
                                        >
                                            {indicator.name}
                                        </Label>
                                    </div>
                                    {item && itemIndex >= 0 && (
                                        <ItemEditor
                                            item={item}
                                            indicatorName={indicator.name}
                                            index={itemIndex}
                                            errors={errors}
                                            scoreThresholds={scoreThresholds}
                                            onChange={(patch) =>
                                                patchItem(
                                                    form,
                                                    itemIndex,
                                                    patch,
                                                )
                                            }
                                            onRemove={() =>
                                                toggleIndicator(
                                                    form,
                                                    indicator.id,
                                                )
                                            }
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );

    return (
        <>
            <Head title="Observasi Harian" />

            <div className="min-h-full space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
                    <svg
                        className="pointer-events-none absolute top-6 right-8 h-48 w-48 text-white opacity-10"
                        viewBox="0 0 200 200"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M60 40h80c11 0 20 9 20 20v20h-20V60H60v80h40v20H60c-11 0-20-9-20-20V60c0-11 9-20 20-20zm32 40l-24 36h14v20h20v-20h14l-24-36z" />
                        <path d="M100 62l10 18h-20l10-18z" />
                        <path d="M128 96l6 12h-12l6-12zM146 112l6 12h-12l6-12z" />
                    </svg>

                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="max-w-3xl min-w-0">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                                <CalendarDays className="size-4 text-emerald-200" />
                                <span>
                                    Ruang Observasi{' '}
                                    {role === 'admin' ? 'Admin' : 'Ustadz'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Assalamu'alaikum, {firstName} 👀
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                Catat perilaku santri lewat checklist indikator,
                                sentimen, skor, dan poin reward untuk mendukung
                                tumbuh kembang karakter mereka.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <HeroPill
                                icon={<Eye className="size-5" />}
                                value={`${summary.total}`}
                                label="Total Observasi"
                            />
                            <HeroPill
                                icon={<Star className="size-5" />}
                                value={
                                    summary.average_score !== null
                                        ? `${summary.average_score}`
                                        : '—'
                                }
                                label="Rata-rata Skor"
                            />
                            <HeroPill
                                icon={<Sparkles className="size-5" />}
                                value={`${summary.total_reward_points}`}
                                label="Poin Reward"
                            />
                        </div>
                    </div>
                </section>

                {props.flash?.status && (
                    <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 shadow-sm">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<Eye className="size-5" />}
                        value={`${summary.total}`}
                        label="Total Observasi"
                        description="Semua catatan observasi yang tersimpan"
                        tone="emerald"
                    />
                    <SummaryCard
                        icon={<Star className="size-5" />}
                        value={
                            summary.average_score !== null
                                ? `${summary.average_score}`
                                : '—'
                        }
                        label="Rata-rata Skor"
                        description="Rata-rata skor dari seluruh observasi"
                        tone="sky"
                    />
                    <SummaryCard
                        icon={<CheckCircle2 className="size-5" />}
                        value={`${summary.sentiments.positive}`}
                        label="Sentimen Positif"
                        description={`${summary.sentiments.neutral} netral · ${summary.sentiments.negative} negatif`}
                        tone="amber"
                    />
                    <SummaryCard
                        icon={<Sparkles className="size-5" />}
                        value={`${summary.total_reward_points}`}
                        label="Total Poin Reward"
                        description="Poin kebaikan yang terkumpul"
                        tone="rose"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                    <main className="min-w-0 space-y-6">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                                        📓
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-800">
                                            Riwayat Observasi
                                        </h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            {observations.from ?? 0}-
                                            {observations.to ?? 0} dari{' '}
                                            {observations.total} observasi
                                        </p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                                    <Filter className="size-4" />
                                    Filter ramah ustadz
                                </div>
                            </div>

                            <form
                                onSubmit={submitFilters}
                                className="mb-5 grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3 lg:grid-cols-6"
                            >
                                <div className="relative lg:col-span-2">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                                    <Input
                                        className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari santri, pengamat, catatan"
                                    />
                                </div>
                                <Input
                                    type="date"
                                    className="h-10 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200"
                                    value={dateFrom}
                                    onChange={(event) =>
                                        setDateFrom(event.target.value)
                                    }
                                    title="Dari tanggal"
                                />
                                <Input
                                    type="date"
                                    className="h-10 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200"
                                    value={dateTo}
                                    onChange={(event) =>
                                        setDateTo(event.target.value)
                                    }
                                    title="Sampai tanggal"
                                />
                                <select
                                    className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={studentFilter}
                                    onChange={(event) =>
                                        setStudentFilter(event.target.value)
                                    }
                                >
                                    <option value="">Semua Santri</option>
                                    {students.map((student) => (
                                        <option
                                            key={student.id}
                                            value={student.id}
                                        >
                                            {student.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={teacherFilter}
                                    onChange={(event) =>
                                        setTeacherFilter(event.target.value)
                                    }
                                >
                                    <option value="">Semua Pengamat</option>
                                    {teachers.map((teacher) => (
                                        <option
                                            key={teacher.id}
                                            value={teacher.id}
                                        >
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={sentimentFilter}
                                    onChange={(event) =>
                                        setSentimentFilter(event.target.value)
                                    }
                                >
                                    <option value="">Semua Sentimen</option>
                                    {sentiments.map((sentiment) => (
                                        <option
                                            key={sentiment.value}
                                            value={sentiment.value}
                                        >
                                            {sentiment.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        className="flex-1 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                                    >
                                        <Search className="mr-1.5 size-3.5" />
                                        Filter
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={resetFilters}
                                        className="rounded-2xl text-xs font-bold text-slate-500 hover:bg-white"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>

                            {observations.data.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <div className="space-y-3">
                                    {observations.data.map((observation) => (
                                        <ObservationCard
                                            key={observation.id}
                                            observation={observation}
                                            onView={() =>
                                                setViewing(observation)
                                            }
                                            onEdit={() =>
                                                startEdit(observation)
                                            }
                                            onDelete={() =>
                                                deleteObservation(observation)
                                            }
                                        />
                                    ))}
                                </div>
                            )}

                            {observations.links.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {observations.links.map((link, index) => (
                                        <Button
                                            key={`${link.label}-${index}`}
                                            type="button"
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            disabled={!link.url}
                                            className={
                                                link.active
                                                    ? 'rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700'
                                                    : 'rounded-2xl border-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                            }
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(
                                                        link.url,
                                                        {},
                                                        {
                                                            preserveState: true,
                                                        },
                                                    );
                                                }
                                            }}
                                        >
                                            <PaginationLabel
                                                label={link.label}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>

                    <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                                    <Plus className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-800">
                                        Observasi Cepat
                                    </h2>
                                    <p className="text-xs font-medium text-slate-400">
                                        Catat observasi harian untuk satu
                                        santri.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={submitCreate}
                                className="mt-5 grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="create_student"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Santri
                                    </Label>
                                    <select
                                        id="create_student"
                                        className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                        value={createForm.data.student_id}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'student_id',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Pilih santri...
                                        </option>
                                        {students.map((student) => (
                                            <option
                                                key={student.id}
                                                value={student.id}
                                            >
                                                {student.name} (
                                                {student.student_code})
                                                {student.group_name
                                                    ? ` - ${student.group_name}`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={createForm.errors.student_id}
                                    />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="create_date"
                                            className="text-xs font-extrabold text-slate-600"
                                        >
                                            Tanggal Observasi
                                        </Label>
                                        <Input
                                            id="create_date"
                                            type="date"
                                            className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm focus-visible:ring-emerald-200"
                                            value={createForm.data.observed_at}
                                            onChange={(event) =>
                                                createForm.setData(
                                                    'observed_at',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                createForm.errors.observed_at
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="create_teacher"
                                            className="text-xs font-extrabold text-slate-600"
                                        >
                                            Pengamat
                                        </Label>
                                        {role === 'teacher' ? (
                                            <Input
                                                id="create_teacher"
                                                className="h-11 rounded-2xl border-slate-100 bg-slate-50 text-sm shadow-sm"
                                                value={auth.user?.name ?? ''}
                                                disabled
                                            />
                                        ) : (
                                            <select
                                                id="create_teacher"
                                                className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                                value={
                                                    createForm.data.teacher_id
                                                }
                                                onChange={(event) =>
                                                    createForm.setData(
                                                        'teacher_id',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Pilih pengamat...
                                                </option>
                                                {teachers.map((teacher) => (
                                                    <option
                                                        key={teacher.id}
                                                        value={teacher.id}
                                                    >
                                                        {teacher.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <InputError
                                            message={
                                                createForm.errors.teacher_id
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-xs font-extrabold text-slate-600">
                                        Checklist Indikator
                                    </Label>
                                    {createForm.data.items.length === 0 && (
                                        <p className="text-xs font-semibold text-slate-400">
                                            Pilih indikator perilaku yang
                                            diamati.
                                        </p>
                                    )}
                                    {renderChecklist(
                                        createForm,
                                        isCreateSelected,
                                        createForm.errors,
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="create_note"
                                        className="text-xs font-extrabold text-slate-600"
                                    >
                                        Catatan Observasi
                                    </Label>
                                    <textarea
                                        id="create_note"
                                        rows={4}
                                        className="rounded-[22px] border border-slate-100 bg-slate-50 p-3 text-sm shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                        value={createForm.data.general_note}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'general_note',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Catatan bebas perkembangan santri..."
                                    />
                                    <InputError
                                        message={createForm.errors.general_note}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="rounded-2xl bg-emerald-600 py-5 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-700"
                                >
                                    Simpan Observasi
                                </Button>
                            </form>

                            <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-700">
                                <p className="font-extrabold">Tips mencatat</p>
                                <p className="mt-1 font-medium">
                                    Tulis perilaku yang terlihat, bukan menebak
                                    niat. Biarkan skor mengikuti fakta di
                                    lapangan.
                                </p>
                            </div>
                        </section>

                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                            <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-700">
                                <Sparkles className="size-5 text-amber-500" />
                                Panduan Observasi
                            </h2>
                            <div className="space-y-3">
                                <GuideItem
                                    emoji="🌱"
                                    title="Fokus pada Perilaku"
                                    description="Catat apa yang tampak hari ini dan bandingkan dengan kebiasaan sebelumnya."
                                />
                                <GuideItem
                                    emoji="🎯"
                                    title="Skor & Sentimen"
                                    description="Skor membantu konsistensi; sentimen memberi arah cepat untuk tindak lanjut."
                                />
                                <GuideItem
                                    emoji="⭐"
                                    title="Poin Reward"
                                    description="Berikan poin untuk perilaku baik agar santri merasa dihargai."
                                />
                            </div>
                        </section>

                        <section className="rounded-[28px] bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-[0_8px_30px_rgba(15,23,42,0.15)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur-sm">
                                    🕌
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Prinsip Halaman Ini
                                    </p>
                                    <p className="text-sm font-extrabold text-white">
                                        Mencatat, bukan menghakimi
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-slate-300">
                                Observasi harian adalah alat bantu memahami,
                                bukan hukuman. Biarkan data menjadi jembatan
                                pendampingan yang hangat.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>

            <Sheet
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        cancelEdit();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                            <Pencil className="size-6" />
                        </div>
                        <SheetTitle className="text-xl font-extrabold text-slate-800">
                            Edit Observasi
                        </SheetTitle>
                        <SheetDescription className="text-slate-500">
                            {editing
                                ? `${editing.student.name} - ${editing.observed_at}`
                                : 'Perbarui data observasi.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submitEdit} className="mt-6 grid gap-5">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="edit_student"
                                className="text-xs font-extrabold text-slate-600"
                            >
                                Santri
                            </Label>
                            <select
                                id="edit_student"
                                className="h-11 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={editForm.data.student_id}
                                onChange={(event) =>
                                    editForm.setData(
                                        'student_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Pilih santri...</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} ({student.student_code})
                                    </option>
                                ))}
                            </select>
                            <InputError message={editForm.errors.student_id} />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="edit_date"
                                    className="text-xs font-extrabold text-slate-600"
                                >
                                    Tanggal Observasi
                                </Label>
                                <Input
                                    id="edit_date"
                                    type="date"
                                    className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm focus-visible:ring-emerald-200"
                                    value={editForm.data.observed_at}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'observed_at',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={editForm.errors.observed_at}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="edit_teacher"
                                    className="text-xs font-extrabold text-slate-600"
                                >
                                    Pengamat
                                </Label>
                                {role === 'teacher' ? (
                                    <Input
                                        id="edit_teacher"
                                        className="h-11 rounded-2xl border-slate-100 bg-white text-sm shadow-sm"
                                        value={auth.user?.name ?? ''}
                                        disabled
                                    />
                                ) : (
                                    <select
                                        id="edit_teacher"
                                        className="h-11 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                        value={editForm.data.teacher_id}
                                        onChange={(event) =>
                                            editForm.setData(
                                                'teacher_id',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Pilih pengamat...
                                        </option>
                                        {teachers.map((teacher) => (
                                            <option
                                                key={teacher.id}
                                                value={teacher.id}
                                            >
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <InputError
                                    message={editForm.errors.teacher_id}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-extrabold text-slate-600">
                                Checklist Indikator
                            </Label>
                            {renderChecklist(
                                editForm,
                                isEditSelected,
                                editForm.errors,
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="edit_note"
                                className="text-xs font-extrabold text-slate-600"
                            >
                                Catatan Observasi
                            </Label>
                            <textarea
                                id="edit_note"
                                rows={4}
                                className="rounded-[22px] border border-slate-100 bg-white p-3 text-sm shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={editForm.data.general_note}
                                onChange={(event) =>
                                    editForm.setData(
                                        'general_note',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={editForm.errors.general_note}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEdit}
                                className="rounded-2xl border-slate-200 text-slate-600"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={viewing !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewing(null);
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                            <Eye className="size-6" />
                        </div>
                        <SheetTitle className="text-xl font-extrabold text-slate-800">
                            Detail Observasi
                        </SheetTitle>
                        <SheetDescription className="text-slate-500">
                            {viewing
                                ? `${viewing.student.name} - ${viewing.observed_at}`
                                : 'Detail observasi harian.'}
                        </SheetDescription>
                    </SheetHeader>

                    {viewing && (
                        <div className="mt-6 grid gap-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    className={sentimentClasses(
                                        viewing.sentiment,
                                    )}
                                >
                                    {sentimentLabel(viewing.sentiment ?? '')}
                                </Badge>
                                <Badge className="border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-50">
                                    Skor:{' '}
                                    {viewing.score !== null
                                        ? viewing.score
                                        : '—'}
                                </Badge>
                                <Badge className="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50">
                                    <Star className="mr-1 size-3 fill-current" />
                                    Poin: {viewing.total_reward_points}
                                </Badge>
                            </div>

                            <div className="rounded-[24px] border border-slate-100 bg-white p-4 text-sm shadow-sm">
                                <div className="grid gap-2">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400">
                                            Pengamat:{' '}
                                        </span>
                                        <span className="font-extrabold text-slate-700">
                                            {viewing.teacher.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400">
                                            Kelompok:{' '}
                                        </span>
                                        <span className="font-extrabold text-slate-700">
                                            {viewing.student.group_name ?? '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400">
                                            Dicatat:{' '}
                                        </span>
                                        <span className="font-extrabold text-slate-700">
                                            {viewing.created_at
                                                ? new Date(
                                                      viewing.created_at,
                                                  ).toLocaleString('id-ID')
                                                : '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-xs font-extrabold text-slate-600">
                                    Catatan Observasi
                                </Label>
                                <p className="rounded-[24px] border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
                                    {viewing.general_note ||
                                        'Tidak ada catatan.'}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-xs font-extrabold text-slate-600">
                                    Indikator
                                </Label>
                                {viewing.items.length === 0 ? (
                                    <p className="text-sm font-semibold text-slate-400">
                                        Tidak ada indikator.
                                    </p>
                                ) : (
                                    <div className="grid gap-3">
                                        {viewing.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-[24px] border border-slate-100 bg-white p-4 text-sm shadow-sm"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-extrabold text-slate-800">
                                                        {item.indicator_name}
                                                    </span>
                                                    <Badge
                                                        className={sentimentClasses(
                                                            item.sentiment,
                                                        )}
                                                    >
                                                        {sentimentLabel(
                                                            item.sentiment,
                                                        )}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                                                    <span>
                                                        Skor:{' '}
                                                        {item.assessment_score !==
                                                        null
                                                            ? item.assessment_score
                                                            : '—'}
                                                    </span>
                                                    <span>
                                                        Poin:{' '}
                                                        {item.reward_points}
                                                    </span>
                                                </div>
                                                {item.note && (
                                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                                        {item.note}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

function HeroPill({
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
            <span className="text-emerald-100">{icon}</span>
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

function SummaryCard({
    icon,
    value,
    label,
    description,
    tone,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
    description: string;
    tone: 'rose' | 'amber' | 'emerald' | 'sky';
}) {
    const toneMap = {
        rose: {
            wrapper: 'from-rose-50 to-orange-50 text-rose-700',
            icon: 'bg-rose-100 text-rose-700',
        },
        amber: {
            wrapper: 'from-amber-50 to-yellow-50 text-amber-700',
            icon: 'bg-amber-100 text-amber-700',
        },
        emerald: {
            wrapper: 'from-emerald-50 to-teal-50 text-emerald-700',
            icon: 'bg-emerald-100 text-emerald-700',
        },
        sky: {
            wrapper: 'from-sky-50 to-blue-50 text-sky-700',
            icon: 'bg-sky-100 text-sky-700',
        },
    };

    const toneClass = toneMap[tone];

    return (
        <div
            className={`rounded-[24px] bg-gradient-to-br p-4 shadow-[0_8px_30px_rgba(16,58,58,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-lg ${toneClass.wrapper}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass.icon}`}
                >
                    {icon}
                </div>
                <div>
                    <div className="text-2xl font-extrabold">{value}</div>
                    <div className="text-xs font-extrabold">{label}</div>
                </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed font-medium text-slate-500">
                {description}
            </p>
        </div>
    );
}

function ObservationCard({
    observation,
    onView,
    onEdit,
    onDelete,
}: {
    observation: Observation;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <article className="group rounded-[24px] border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-extrabold text-white shadow-sm transition-transform group-hover:scale-105">
                        {studentInitial(observation.student.name)}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-slate-800">
                                {observation.student.name ?? 'Santri'}
                            </h3>
                            {observation.student.group_name && (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                    {observation.student.group_name}
                                </span>
                            )}
                            {observation.student.student_code && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                                    {observation.student.student_code}
                                </span>
                            )}
                        </div>
                        <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-relaxed font-medium text-slate-500">
                            {observation.general_note ??
                                'Tidak ada catatan umum.'}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge
                                className={sentimentClasses(
                                    observation.sentiment,
                                )}
                            >
                                {sentimentLabel(observation.sentiment ?? '')}
                            </Badge>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                                <CalendarDays className="size-3.5 text-emerald-500" />
                                {observation.observed_at}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                                <FileText className="size-3.5 text-emerald-500" />
                                {observation.items.length} indikator
                            </span>
                            {observation.total_reward_points > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
                                    <Star className="size-3.5 fill-current" />
                                    {observation.total_reward_points} poin
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onView}
                        className="rounded-2xl border-slate-200 bg-white text-xs font-extrabold text-slate-600 hover:bg-slate-50"
                    >
                        <Eye className="size-3.5" />
                        Lihat
                    </Button>
                    {observation.can_edit && (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={onEdit}
                            className="rounded-2xl border-slate-200 bg-white text-xs font-extrabold text-slate-600 hover:bg-slate-50"
                        >
                            <Pencil className="size-3.5" />
                            Edit
                        </Button>
                    )}
                    {observation.can_delete && (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={onDelete}
                            className="rounded-2xl border-rose-100 bg-white text-xs font-extrabold text-rose-600 hover:bg-rose-50"
                        >
                            <Trash2 className="size-3.5" />
                            Hapus
                        </Button>
                    )}
                </div>
            </div>

            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                <MetaItem
                    icon={<UserRoundCheck className="size-4" />}
                    label="Pengamat"
                    value={observation.teacher.name ?? 'Ustadz'}
                />
                <MetaItem
                    icon={<Users className="size-4" />}
                    label="Kelompok"
                    value={observation.student.group_name ?? '—'}
                />
                <MetaItem
                    icon={<Star className="size-4" />}
                    label="Skor"
                    value={
                        observation.score !== null
                            ? `${observation.score}`
                            : '—'
                    }
                />
            </div>
        </article>
    );
}

function MetaItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs shadow-sm">
            <span className="text-emerald-600">{icon}</span>
            <div className="min-w-0">
                <p className="font-bold text-slate-400">{label}</p>
                <p className="truncate font-extrabold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}

function GuideItem({
    emoji,
    title,
    description,
}: {
    emoji: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-teal-50/70 p-3.5">
            <span className="text-xl">{emoji}</span>
            <div className="text-xs">
                <p className="font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 leading-snug text-slate-600">
                    {description}
                </p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                🌿
            </div>
            <h4 className="mt-3 text-base font-extrabold text-slate-800">
                Belum ada observasi harian
            </h4>
            <p className="mt-1 max-w-sm text-xs leading-relaxed font-medium text-slate-500">
                Gunakan panel “Observasi Cepat” untuk mencatat perkembangan
                santri pertama kali.
            </p>
        </div>
    );
}
