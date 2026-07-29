import { Head, Link, router } from '@inertiajs/react';
import {
    AudioLines,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    FileText,
    Filter,
    Search,
    ShieldAlert,
    User,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';

type AttemptRow = {
    id: number;
    attempt_number: number;
    status: string;
    started_at: string | null;
    submitted_at: string | null;
    completed_at: string | null;
    student: {
        id: number;
        name: string | null;
        username: string | null;
        student_code: string;
    } | null;
    group: { id: number; name: string } | null;
    test_package: { id: number; title: string } | null;
    summary: {
        answers_count: number;
        audio_count: number;
        completed_transcriptions: number;
        failed_transcriptions: number;
        processing_transcriptions: number;
        pending_transcriptions: number;
        validated_answers: number;
    };
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedAttempts = {
    data: AttemptRow[];
    links:
        | PaginationLink[]
        | {
              first: string | null;
              last: string | null;
              prev: string | null;
              next: string | null;
          };
    meta?: {
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links?: PaginationLink[];
    };
};

type Props = {
    attempts: PaginatedAttempts;
    filters: {
        search: string;
        group_id: number | null;
        test_package_id: number | null;
        status: string;
    };
    groups: Array<{ id: number; name: string }>;
    testPackages: Array<{ id: number; title: string }>;
};

const statusLabel: Record<string, string> = {
    in_progress: 'Sedang Dikerjakan',
    submitted: 'Sudah Dikirim',
    processing: 'Diproses',
    review_pending: 'Menunggu Review',
    completed: 'Selesai',
};

const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    in_progress: 'outline',
    submitted: 'secondary',
    processing: 'secondary',
    review_pending: 'default',
    completed: 'default',
};

function formatDateTime(value: string | null) {
    if (!value) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function transcribeSummary(item: AttemptRow) {
    const { summary } = item;

    if (summary.audio_count === 0) {
        return {
            label: 'Tidak ada audio',
            className:
                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
            icon: AudioLines,
        };
    }

    if (summary.failed_transcriptions > 0) {
        return {
            label: `${summary.failed_transcriptions} gagal`,
            className:
                'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
            icon: ShieldAlert,
        };
    }

    if (
        summary.processing_transcriptions > 0 ||
        summary.pending_transcriptions > 0
    ) {
        return {
            label: 'STT diproses',
            className:
                'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
            icon: Clock,
        };
    }

    return {
        label: `${summary.completed_transcriptions}/${summary.audio_count} selesai`,
        className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        icon: CheckCircle2,
    };
}

export default function AdminTestResultsIndex({
    attempts,
    filters,
    groups,
    testPackages,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [groupId, setGroupId] = useState(filters.group_id?.toString() || '');
    const [packageId, setPackageId] = useState(
        filters.test_package_id?.toString() || '',
    );
    const [status, setStatus] = useState(filters.status || '');
    const paginationLinks = Array.isArray(attempts.links)
        ? attempts.links
        : (attempts.meta?.links ?? []);

    const applyFilters = (event?: FormEvent) => {
        event?.preventDefault();

        router.get(
            '/admin/test-results',
            {
                search,
                group_id: groupId,
                test_package_id: packageId,
                status,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Hasil Pengerjaan Test" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Hasil Pengerjaan Test
                        </h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Pantau hasil pengerjaan tes dilema moral santri,
                        termasuk jawaban, audio, status transkripsi STT, dan
                        hasil validasi jika sudah tersedia.
                    </p>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="size-5 text-muted-foreground" />
                            Filter Hasil Test
                        </CardTitle>
                        <CardDescription>
                            Gunakan filter untuk mencari attempt berdasarkan
                            santri, kelompok, paket, atau status pengerjaan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilters}
                            className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_220px_190px_auto]"
                        >
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari nama, username, atau NIS..."
                                    className="pl-9"
                                />
                            </div>
                            <select
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={groupId}
                                onChange={(event) =>
                                    setGroupId(event.target.value)
                                }
                            >
                                <option value="">Semua kelompok</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={packageId}
                                onChange={(event) =>
                                    setPackageId(event.target.value)
                                }
                            >
                                <option value="">Semua paket test</option>
                                {testPackages.map((testPackage) => (
                                    <option
                                        key={testPackage.id}
                                        value={testPackage.id}
                                    >
                                        {testPackage.title}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            >
                                <option value="">Semua status</option>
                                <option value="in_progress">
                                    Sedang dikerjakan
                                </option>
                                <option value="submitted">Sudah dikirim</option>
                                <option value="processing">Diproses</option>
                                <option value="review_pending">
                                    Menunggu review
                                </option>
                                <option value="completed">Selesai</option>
                            </select>
                            <Button type="submit">Terapkan</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Daftar Attempt Test
                        </CardTitle>
                        <CardDescription>
                            {attempts.meta?.from ?? 0}-{attempts.meta?.to ?? 0}{' '}
                            dari {attempts.meta?.total ?? attempts.data.length}{' '}
                            attempt
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[1040px] text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Santri
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Paket Test
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Jawaban
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            STT
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Dikirim
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attempts.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-10 text-center text-sm text-muted-foreground"
                                            >
                                                Belum ada hasil test sesuai
                                                filter saat ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        attempts.data.map((attempt) => {
                                            const stt =
                                                transcribeSummary(attempt);
                                            const SttIcon = stt.icon;

                                            return (
                                                <tr
                                                    key={attempt.id}
                                                    className="border-t"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                <User className="size-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {attempt
                                                                        .student
                                                                        ?.name ??
                                                                        '-'}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {attempt
                                                                        .student
                                                                        ?.student_code ??
                                                                        '-'}{' '}
                                                                    •{' '}
                                                                    {attempt
                                                                        .group
                                                                        ?.name ??
                                                                        'Tanpa kelompok'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">
                                                            {attempt
                                                                .test_package
                                                                ?.title ?? '-'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Attempt #
                                                            {
                                                                attempt.attempt_number
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={
                                                                statusVariant[
                                                                    attempt
                                                                        .status
                                                                ] ?? 'outline'
                                                            }
                                                        >
                                                            {statusLabel[
                                                                attempt.status
                                                            ] ?? attempt.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                            <FileText className="size-3.5" />
                                                            {
                                                                attempt.summary
                                                                    .answers_count
                                                            }{' '}
                                                            jawaban
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${stt.className}`}
                                                        >
                                                            <SttIcon className="size-3.5" />
                                                            {stt.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {formatDateTime(
                                                            attempt.submitted_at,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end">
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <Link
                                                                    href={`/admin/test-results/${attempt.id}`}
                                                                >
                                                                    <Eye className="size-4" />
                                                                    Detail
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {paginationLinks.map((link) => (
                                <Button
                                    key={`${link.label}-${link.url}`}
                                    type="button"
                                    size="sm"
                                    variant={
                                        link.active ? 'default' : 'outline'
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
                                    {link.label === '&laquo; Previous' ||
                                    link.label
                                        .toLowerCase()
                                        .includes('previous') ? (
                                        <>
                                            <ChevronLeft className="size-4" />
                                            <span className="sr-only">
                                                Sebelumnya
                                            </span>
                                        </>
                                    ) : link.label === 'Next &raquo;' ||
                                      link.label
                                          .toLowerCase()
                                          .includes('next') ? (
                                        <>
                                            <ChevronRight className="size-4" />
                                            <span className="sr-only">
                                                Berikutnya
                                            </span>
                                        </>
                                    ) : (
                                        <span>{link.label}</span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminTestResultsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Hasil Pengerjaan Test', href: '/admin/test-results' },
    ],
};
