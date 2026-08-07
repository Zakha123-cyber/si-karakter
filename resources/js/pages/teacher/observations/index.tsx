import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    BookOpenCheck,
    CalendarDays,
    Eye,
    FileText,
    Pencil,
    Plus,
    Star,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Auth } from '@/types';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
            return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
        case 'neutral':
            return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
        case 'negative':
            return 'bg-red-100 text-red-700 hover:bg-red-100';
        default:
            return 'bg-muted text-muted-foreground hover:bg-muted';
    }
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
        <div className="grid gap-3 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
                <Label className="font-medium">{indicatorName}</Label>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onRemove}
                >
                    Hapus
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Sentimen:</span>
                {SENTIMENT_VALUES.map((value) => (
                    <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={
                            item.sentiment === value ? 'default' : 'outline'
                        }
                        onClick={() => onChange({ sentiment: value })}
                    >
                        {sentimentLabel(value)}
                    </Button>
                ))}
            </div>
            <InputError message={errorAt('sentiment')} />

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                    <Label>Skor (0-100)</Label>
                    <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={item.assessment_score}
                        onChange={(event) =>
                            onChange({
                                assessment_score: event.target.value,
                            })
                        }
                        placeholder="Opsional"
                    />
                    {suggested && item.sentiment !== suggested && (
                        <p className="text-xs text-muted-foreground">
                            Saran sentimen:{' '}
                            <Button
                                type="button"
                                size="sm"
                                variant="link"
                                className="h-auto p-0 text-xs"
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
                    <Label>Poin Reward</Label>
                    <Input
                        type="number"
                        min={0}
                        value={item.reward_points}
                        onChange={(event) =>
                            onChange({ reward_points: event.target.value })
                        }
                    />
                    <InputError message={errorAt('reward_points')} />
                </div>
            </div>

            <div className="grid gap-1.5">
                <Label>Catatan Indikator</Label>
                <textarea
                    rows={2}
                    className="rounded-md border border-input bg-background p-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                        <Label className="text-xs text-muted-foreground uppercase">
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

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Observasi Harian
                        </h1>
                        <Badge variant="secondary">
                            {role === 'admin' ? 'Admin' : 'Ustadz'}
                        </Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Catat perkembangan perilaku santri melalui checklist
                        indikator, sentimen, skor, dan poin reward.
                    </p>
                </div>

                {props.flash?.status && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3 p-4">
                            <BookOpenCheck className="size-5 text-muted-foreground" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {summary.total}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Total Observasi
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3 p-4">
                            <Star className="size-5 text-muted-foreground" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {summary.average_score !== null
                                        ? summary.average_score
                                        : '—'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Rata-rata Skor
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="grid gap-1.5 p-4">
                            <div className="text-xs text-muted-foreground">
                                Distribusi Sentimen
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <Badge className={sentimentClasses('positive')}>
                                    Positif {summary.sentiments.positive}
                                </Badge>
                                <Badge className={sentimentClasses('neutral')}>
                                    Netral {summary.sentiments.neutral}
                                </Badge>
                                <Badge className={sentimentClasses('negative')}>
                                    Negatif {summary.sentiments.negative}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3 p-4">
                            <CalendarDays className="size-5 text-muted-foreground" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {summary.total_reward_points}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Total Poin Reward
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
                    <Card className="h-fit rounded-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Plus className="size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    Observasi Cepat
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Catat observasi harian untuk satu santri.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitCreate}
                                className="grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="create_student">
                                        Santri
                                    </Label>
                                    <select
                                        id="create_student"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                        <Label htmlFor="create_date">
                                            Tanggal Observasi
                                        </Label>
                                        <Input
                                            id="create_date"
                                            type="date"
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
                                        <Label htmlFor="create_teacher">
                                            Pengamat
                                        </Label>
                                        {role === 'teacher' ? (
                                            <Input
                                                id="create_teacher"
                                                value={auth.user?.name ?? ''}
                                                disabled
                                            />
                                        ) : (
                                            <select
                                                id="create_teacher"
                                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                    <Label>Checklist Indikator</Label>
                                    {createForm.data.items.length === 0 && (
                                        <p className="text-xs text-muted-foreground">
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
                                    <Label htmlFor="create_note">
                                        Catatan Observasi
                                    </Label>
                                    <textarea
                                        id="create_note"
                                        rows={4}
                                        className="rounded-md border border-input bg-background p-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                >
                                    Simpan Observasi
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex min-w-0 flex-col gap-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="size-5 text-muted-foreground" />
                                    <CardTitle className="text-base">
                                        Riwayat Observasi
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    {observations.from ?? 0}-
                                    {observations.to ?? 0} dari{' '}
                                    {observations.total} observasi
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <form
                                    onSubmit={submitFilters}
                                    className="grid gap-3 lg:grid-cols-6"
                                >
                                    <Input
                                        className="lg:col-span-2"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari santri, pengamat, catatan"
                                    />
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(event) =>
                                            setDateFrom(event.target.value)
                                        }
                                        title="Dari tanggal"
                                    />
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(event) =>
                                            setDateTo(event.target.value)
                                        }
                                        title="Sampai tanggal"
                                    />
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={sentimentFilter}
                                        onChange={(event) =>
                                            setSentimentFilter(
                                                event.target.value,
                                            )
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
                                        <Button type="submit" variant="outline">
                                            Filter
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={resetFilters}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </form>

                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[820px] text-sm">
                                        <thead className="bg-muted/50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">
                                                    Tanggal
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Santri
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Pengamat
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Sentimen
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Skor
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Poin
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {observations.data.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="px-4 py-8 text-center text-muted-foreground"
                                                    >
                                                        Belum ada observasi
                                                        harian.
                                                    </td>
                                                </tr>
                                            ) : (
                                                observations.data.map(
                                                    (observation) => (
                                                        <tr
                                                            key={observation.id}
                                                            className="border-t"
                                                        >
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                {
                                                                    observation.observed_at
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium">
                                                                    {
                                                                        observation
                                                                            .student
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {
                                                                        observation
                                                                            .student
                                                                            .group_name
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {
                                                                    observation
                                                                        .teacher
                                                                        .name
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge
                                                                    className={sentimentClasses(
                                                                        observation.sentiment,
                                                                    )}
                                                                >
                                                                    {sentimentLabel(
                                                                        observation.sentiment ??
                                                                            '',
                                                                    )}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-medium">
                                                                {observation.score !==
                                                                null
                                                                    ? observation.score
                                                                    : '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                {observation.total_reward_points >
                                                                0 ? (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="ml-auto flex w-fit items-center gap-1"
                                                                    >
                                                                        <Star className="size-3" />
                                                                        {
                                                                            observation.total_reward_points
                                                                        }
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-muted-foreground">
                                                                        0
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            setViewing(
                                                                                observation,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye className="size-4" />
                                                                    </Button>
                                                                    {observation.can_edit && (
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() =>
                                                                                startEdit(
                                                                                    observation,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil className="size-4" />
                                                                        </Button>
                                                                    )}
                                                                    {observation.can_delete && (
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() =>
                                                                                deleteObservation(
                                                                                    observation,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="size-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {observations.links.map((link, idx) => (
                                        <Button
                                            key={`${idx}-${link.label}`}
                                            type="button"
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.visit(link.url, {
                                                        preserveScroll: true,
                                                    });
                                                }
                                            }}
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <Pencil className="size-5 text-muted-foreground" />
                            <SheetTitle>Edit Observasi</SheetTitle>
                        </div>
                        <SheetDescription>
                            {editing
                                ? `${editing.student.name} - ${editing.observed_at}`
                                : 'Perbarui data observasi.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitEdit}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="edit_student">Santri</Label>
                            <select
                                id="edit_student"
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                <Label htmlFor="edit_date">
                                    Tanggal Observasi
                                </Label>
                                <Input
                                    id="edit_date"
                                    type="date"
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
                                <Label htmlFor="edit_teacher">Pengamat</Label>
                                {role === 'teacher' ? (
                                    <Input
                                        id="edit_teacher"
                                        value={auth.user?.name ?? ''}
                                        disabled
                                    />
                                ) : (
                                    <select
                                        id="edit_teacher"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                            <Label>Checklist Indikator</Label>
                            {renderChecklist(
                                editForm,
                                isEditSelected,
                                editForm.errors,
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_note">Catatan Observasi</Label>
                            <textarea
                                id="edit_note"
                                rows={4}
                                className="rounded-md border border-input bg-background p-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Simpan Perubahan
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEdit}
                            >
                                Batal
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
                <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <Eye className="size-5 text-muted-foreground" />
                            <SheetTitle>Detail Observasi</SheetTitle>
                        </div>
                        <SheetDescription>
                            {viewing
                                ? `${viewing.student.name} - ${viewing.observed_at}`
                                : 'Detail observasi harian.'}
                        </SheetDescription>
                    </SheetHeader>

                    {viewing && (
                        <div className="grid gap-4 px-4 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    className={sentimentClasses(
                                        viewing.sentiment,
                                    )}
                                >
                                    {sentimentLabel(viewing.sentiment ?? '')}
                                </Badge>
                                <Badge variant="secondary">
                                    Skor:{' '}
                                    {viewing.score !== null
                                        ? viewing.score
                                        : '—'}
                                </Badge>
                                <Badge variant="secondary">
                                    Poin: {viewing.total_reward_points}
                                </Badge>
                            </div>

                            <div className="grid gap-1.5 text-sm">
                                <div>
                                    <span className="text-muted-foreground">
                                        Pengamat:{' '}
                                    </span>
                                    <span className="font-medium">
                                        {viewing.teacher.name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Kelompok:{' '}
                                    </span>
                                    <span className="font-medium">
                                        {viewing.student.group_name ?? '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Dicatat:{' '}
                                    </span>
                                    <span className="font-medium">
                                        {viewing.created_at
                                            ? new Date(
                                                  viewing.created_at,
                                              ).toLocaleString('id-ID')
                                            : '—'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Catatan Observasi</Label>
                                <p className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                                    {viewing.general_note ||
                                        'Tidak ada catatan.'}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label>Indikator</Label>
                                {viewing.items.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Tidak ada indikator.
                                    </p>
                                ) : (
                                    viewing.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-md border p-3 text-sm"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium">
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
                                            <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span>
                                                    Skor:{' '}
                                                    {item.assessment_score !==
                                                    null
                                                        ? item.assessment_score
                                                        : '—'}
                                                </span>
                                                <span>
                                                    Poin: {item.reward_points}
                                                </span>
                                            </div>
                                            {item.note && (
                                                <p className="mt-1.5 text-xs">
                                                    {item.note}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
