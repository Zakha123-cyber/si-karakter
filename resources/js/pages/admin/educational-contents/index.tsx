import { Head, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    FileUp,
    Filter,
    ImageUp,
    Link2,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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

type CharacterIndicator = {
    id: number;
    code: string;
    name: string;
    category: string;
};

type ContentIndicator = Pick<
    CharacterIndicator,
    'id' | 'code' | 'name' | 'category'
>;

type EducationalContentRow = {
    id: number;
    title: string;
    slug: string;
    content_type: string;
    description: string | null;
    content_body: string | null;
    media_path: string | null;
    media_url: string | null;
    thumbnail_path: string | null;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    status: string;
    indicators_count: number;
    interactions_count: number;
    creator_name: string | null;
    indicators: ContentIndicator[];
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedContents = {
    data: EducationalContentRow[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    contents: PaginatedContents;
    basePath: string;
    filters: {
        search: string;
        status: string;
        content_type: string;
        indicator_id: number;
    };
    contentTypes: string[];
    statuses: string[];
    characterIndicators: CharacterIndicator[];
};

export default function AdminEducationalContentsIndex({
    contents,
    basePath,
    filters,
    contentTypes,
    statuses,
    characterIndicators,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [contentType, setContentType] = useState(filters.content_type);
    const [indicatorId, setIndicatorId] = useState(
        filters.indicator_id ? String(filters.indicator_id) : '',
    );
    const [editingContent, setEditingContent] =
        useState<EducationalContentRow | null>(null);
    const [isContentSheetOpen, setIsContentSheetOpen] = useState(false);
    const [indicatorContent, setIndicatorContent] =
        useState<EducationalContentRow | null>(null);
    const [selectedIndicators, setSelectedIndicators] = useState<Set<number>>(
        new Set(),
    );
    const [mediaContent, setMediaContent] =
        useState<EducationalContentRow | null>(null);

    const contentForm = useForm({
        title: '',
        content_type: 'story',
        description: '',
        content_body: '',
        duration_seconds: '',
        status: 'draft',
    });

    const mediaForm = useForm<{
        type: 'media' | 'thumbnail';
        media: File | null;
    }>({
        type: 'media',
        media: null,
    });

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            basePath,
            {
                search,
                status,
                content_type: contentType,
                indicator_id: indicatorId,
            },
            { preserveState: true, replace: true },
        );
    };

    const openCreate = () => {
        setEditingContent(null);
        contentForm.setData({
            title: '',
            content_type: 'story',
            description: '',
            content_body: '',
            duration_seconds: '',
            status: 'draft',
        });
        contentForm.clearErrors();
        setIsContentSheetOpen(true);
    };

    const openEdit = (content: EducationalContentRow) => {
        setEditingContent(content);
        contentForm.setData({
            title: content.title,
            content_type: content.content_type,
            description: content.description ?? '',
            content_body: content.content_body ?? '',
            duration_seconds:
                content.duration_seconds === null
                    ? ''
                    : String(content.duration_seconds),
            status: content.status,
        });
        contentForm.clearErrors();
        setIsContentSheetOpen(true);
    };

    const closeContentSheet = () => {
        setEditingContent(null);
        setIsContentSheetOpen(false);
        contentForm.reset();
        contentForm.clearErrors();
    };

    const submitContent = (event: FormEvent) => {
        event.preventDefault();

        const toastId = toast.loading(
            editingContent ? 'Menyimpan materi...' : 'Membuat materi...',
        );
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    editingContent
                        ? 'Materi berhasil diperbarui.'
                        : 'Materi berhasil dibuat.',
                    { id: toastId },
                );
                closeContentSheet();
            },
            onError: (errors: Partial<Record<string, string>>) => {
                toast.error(firstError(errors), { id: toastId });
            },
        };

        if (editingContent) {
            contentForm.put(`${basePath}/${editingContent.id}`, options);

            return;
        }

        contentForm.post(basePath, options);
    };

    const deleteContent = (content: EducationalContentRow) => {
        toast.warning(`Hapus materi ${content.title}?`, {
            description:
                'Materi yang sudah memiliki interaksi santri tidak dapat dihapus.',
            action: {
                label: 'Hapus',
                onClick: () => {
                    router.delete(`${basePath}/${content.id}`, {
                        preserveScroll: true,
                        onSuccess: () =>
                            toast.success('Materi berhasil dihapus.'),
                        onError: (errors) => toast.error(firstError(errors)),
                    });
                },
            },
            cancel: {
                label: 'Batal',
                onClick: () => undefined,
            },
            duration: 10000,
        });
    };

    const openIndicators = (content: EducationalContentRow) => {
        setIndicatorContent(content);
        setSelectedIndicators(
            new Set(content.indicators.map((item) => item.id)),
        );
    };

    const toggleIndicator = (id: number) => {
        const next = new Set(selectedIndicators);

        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }

        setSelectedIndicators(next);
    };

    const submitIndicators = (event: FormEvent) => {
        event.preventDefault();

        if (!indicatorContent) {
            return;
        }

        const toastId = toast.loading('Menyimpan mapping indikator...');

        router.post(
            `${basePath}/${indicatorContent.id}/indicators`,
            { indicator_ids: Array.from(selectedIndicators) },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Mapping indikator diperbarui.', {
                        id: toastId,
                    });
                    setIndicatorContent(null);
                    setSelectedIndicators(new Set());
                },
                onError: (errors) =>
                    toast.error(firstError(errors), { id: toastId }),
            },
        );
    };

    const openMedia = (content: EducationalContentRow) => {
        setMediaContent(content);
        mediaForm.setData({ type: 'media', media: null });
        mediaForm.clearErrors();
    };

    const submitMedia = (event: FormEvent) => {
        event.preventDefault();

        if (!mediaContent) {
            return;
        }

        const toastId = toast.loading('Mengupload file materi...');

        mediaForm.post(`${basePath}/${mediaContent.id}/media`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('File materi berhasil diupload.', {
                    id: toastId,
                });
                setMediaContent(null);
                mediaForm.reset();
            },
            onError: (errors) =>
                toast.error(firstError(errors), { id: toastId }),
        });
    };

    return (
        <>
            <Head title="Materi Edukasi" />

            <div className="min-h-full space-y-6 pb-8">
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                                Materi Edukasi
                            </span>
                            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Materi Edukasi Teladan
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/90">
                                Kelola video, komik, gambar, audio, cerita,
                                mapping indikator karakter, dan media yang akan
                                dilihat santri.
                            </p>
                        </div>

                        <Button
                            type="button"
                            onClick={openCreate}
                            className="rounded-2xl bg-white text-emerald-700 shadow-lg hover:bg-emerald-50"
                        >
                            <Plus className="size-4" />
                            Tambah Materi
                        </Button>
                    </div>
                    <div className="pointer-events-none absolute -top-10 -right-10 size-60 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute right-20 -bottom-10 size-40 rounded-full bg-emerald-500/20 blur-xl" />
                </div>

                <Card className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_30px_rgba(16,58,58,0.08)]">
                    <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                                    <BookOpen className="size-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-extrabold text-slate-800">
                                        Daftar Materi
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-500">
                                        Menampilkan {contents.from ?? 0}-
                                        {contents.to ?? 0} dari {contents.total}{' '}
                                        materi
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 p-6">
                        <form
                            onSubmit={submitFilters}
                            className="grid gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3 xl:grid-cols-[minmax(0,1fr)_160px_160px_220px_auto]"
                        >
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari judul, deskripsi, atau isi materi..."
                                    className="h-10 rounded-2xl border-slate-100 bg-white pr-4 pl-10 text-sm shadow-sm focus-visible:ring-emerald-200"
                                />
                            </div>
                            <select
                                className="h-10 rounded-2xl border border-slate-100 bg-white px-3.5 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            >
                                <option value="">Semua status</option>
                                {statuses.map((item) => (
                                    <option key={item} value={item}>
                                        {statusLabel(item)}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="h-10 rounded-2xl border border-slate-100 bg-white px-3.5 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={contentType}
                                onChange={(event) =>
                                    setContentType(event.target.value)
                                }
                            >
                                <option value="">Semua tipe</option>
                                {contentTypes.map((item) => (
                                    <option key={item} value={item}>
                                        {contentTypeLabel(item)}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="h-10 rounded-2xl border border-slate-100 bg-white px-3.5 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={indicatorId}
                                onChange={(event) =>
                                    setIndicatorId(event.target.value)
                                }
                            >
                                <option value="">Semua indikator</option>
                                {characterIndicators.map((indicator) => (
                                    <option
                                        key={indicator.id}
                                        value={indicator.id}
                                    >
                                        {indicator.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                type="submit"
                                className="h-10 rounded-2xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                            >
                                <Filter className="mr-2 size-4" />
                                Filter
                            </Button>
                        </form>

                        <div className="[scrollbar-color:rgb(148_163_184)_transparent] overflow-x-auto overscroll-x-contain rounded-[24px] border border-slate-100 bg-white [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
                            <table className="w-full min-w-[1100px] text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Materi</th>
                                        <th className="px-6 py-4">Tipe</th>
                                        <th className="px-6 py-4">Media</th>
                                        <th className="px-6 py-4">Mapping</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contents.data.map((content) => (
                                        <tr
                                            key={content.id}
                                            className="border-t border-slate-100 transition-colors hover:bg-emerald-50/30"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex gap-3">
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sky-50 text-2xl">
                                                        {content.thumbnail_url ? (
                                                            <img
                                                                src={
                                                                    content.thumbnail_url
                                                                }
                                                                alt={
                                                                    content.title
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            contentTypeEmoji(
                                                                content.content_type,
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-slate-800">
                                                            {content.title}
                                                        </div>
                                                        <div className="mt-1 line-clamp-2 max-w-xl text-xs text-slate-500">
                                                            {content.description ??
                                                                'Tanpa deskripsi'}
                                                        </div>
                                                        <div className="mt-1 text-[11px] text-slate-400">
                                                            /student/contents/
                                                            {content.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className="border-sky-200 bg-sky-50 text-sky-700"
                                                >
                                                    {contentTypeLabel(
                                                        content.content_type,
                                                    )}
                                                </Badge>
                                                {content.duration_seconds !==
                                                    null && (
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {Math.round(
                                                            content.duration_seconds /
                                                                60,
                                                        )}{' '}
                                                        menit
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <MediaBadge
                                                        active={
                                                            content.media_path !==
                                                            null
                                                        }
                                                        label="Media"
                                                    />
                                                    <MediaBadge
                                                        active={
                                                            content.thumbnail_path !==
                                                            null
                                                        }
                                                        label="Thumbnail"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                        {
                                                            content.indicators_count
                                                        }{' '}
                                                        indikator
                                                    </span>
                                                    <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                                                        {
                                                            content.interactions_count
                                                        }{' '}
                                                        interaksi
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge
                                                    status={content.status}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap justify-end gap-1.5">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            openEdit(content)
                                                        }
                                                        className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Pencil className="size-3.5" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            openIndicators(
                                                                content,
                                                            )
                                                        }
                                                        className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-sm hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                                    >
                                                        <SlidersHorizontal className="size-3.5" />
                                                        Indikator
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            openMedia(content)
                                                        }
                                                        className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                                    >
                                                        <ImageUp className="size-3.5" />
                                                        Media
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        disabled={
                                                            content.interactions_count >
                                                            0
                                                        }
                                                        onClick={() =>
                                                            deleteContent(
                                                                content,
                                                            )
                                                        }
                                                        className="h-8 rounded-xl border border-rose-100 bg-white px-2.5 text-xs font-bold text-rose-600 shadow-sm hover:border-rose-200 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {contents.data.length === 0 && (
                            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center text-sm text-slate-500">
                                Belum ada materi edukasi untuk filter ini.
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                            <div className="text-xs font-medium text-slate-500">
                                Total {contents.total} materi edukasi
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {contents.links.map((link) => (
                                    <Button
                                        key={`${link.label}-${link.url}`}
                                        type="button"
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.visit(link.url, {
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                        className={
                                            link.active
                                                ? 'h-8 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700'
                                                : 'h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50'
                                        }
                                    >
                                        <PaginationLabel label={link.label} />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Sheet
                open={isContentSheetOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeContentSheet();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-2xl">
                    <SheetHeader className="border-b border-slate-100 px-4 pb-4">
                        <div className="flex items-center gap-2 pr-8">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <BookOpen className="size-4" />
                            </div>
                            <SheetTitle className="text-lg font-extrabold text-slate-800">
                                {editingContent
                                    ? 'Edit Materi'
                                    : 'Tambah Materi'}
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-sm text-slate-500">
                            Tulis materi edukasi dan status tampil untuk santri.
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitContent}
                        className="grid gap-5 px-4 py-5"
                    >
                        <div className="grid gap-2">
                            <Label
                                htmlFor="title"
                                className="text-sm font-medium text-slate-700"
                            >
                                Judul Materi
                            </Label>
                            <Input
                                id="title"
                                value={contentForm.data.title}
                                onChange={(event) =>
                                    contentForm.setData(
                                        'title',
                                        event.target.value,
                                    )
                                }
                                placeholder="Contoh: Belajar dari Keteladanan Nabi"
                                className="h-10 rounded-2xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                            />
                            <InputError message={contentForm.errors.title} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="content_type"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Tipe
                                </Label>
                                <select
                                    id="content_type"
                                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={contentForm.data.content_type}
                                    onChange={(event) =>
                                        contentForm.setData(
                                            'content_type',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {contentTypes.map((item) => (
                                        <option key={item} value={item}>
                                            {contentTypeLabel(item)}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={contentForm.errors.content_type}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="status"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Status
                                </Label>
                                <select
                                    id="status"
                                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={contentForm.data.status}
                                    onChange={(event) =>
                                        contentForm.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {statuses.map((item) => (
                                        <option key={item} value={item}>
                                            {statusLabel(item)}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={contentForm.errors.status}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="duration_seconds"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Durasi (detik)
                                </Label>
                                <Input
                                    id="duration_seconds"
                                    type="number"
                                    min={1}
                                    max={86400}
                                    value={contentForm.data.duration_seconds}
                                    onChange={(event) =>
                                        contentForm.setData(
                                            'duration_seconds',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Opsional"
                                    className="h-10 rounded-2xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-200"
                                />
                                <InputError
                                    message={
                                        contentForm.errors.duration_seconds
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="description"
                                className="text-sm font-medium text-slate-700"
                            >
                                Deskripsi
                            </Label>
                            <textarea
                                id="description"
                                placeholder="Tambahkan deskripsi singkat materi..."
                                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={contentForm.data.description}
                                onChange={(event) =>
                                    contentForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={contentForm.errors.description}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="content_body"
                                className="text-sm font-medium text-slate-700"
                            >
                                Isi Cerita / Caption
                            </Label>
                            <textarea
                                id="content_body"
                                placeholder="Tuliskan isi cerita atau caption materi..."
                                className="min-h-48 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={contentForm.data.content_body}
                                onChange={(event) =>
                                    contentForm.setData(
                                        'content_body',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={contentForm.errors.content_body}
                            />
                        </div>

                        <div className="flex gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="submit"
                                disabled={contentForm.processing}
                                className="h-10 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                            >
                                {editingContent
                                    ? 'Simpan Perubahan'
                                    : 'Simpan Materi'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeContentSheet}
                                className="h-10 rounded-2xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={indicatorContent !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setIndicatorContent(null);
                        setSelectedIndicators(new Set());
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader className="border-b border-slate-100 px-4 pb-4">
                        <div className="flex items-center gap-2 pr-8">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Link2 className="size-4" />
                            </div>
                            <SheetTitle className="text-lg font-extrabold text-slate-800">
                                Mapping Indikator
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-sm text-slate-500">
                            {indicatorContent
                                ? indicatorContent.title
                                : 'Pilih indikator karakter yang terkait materi.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitIndicators}
                        className="grid gap-5 px-4 py-5"
                    >
                        <div className="grid gap-2">
                            {characterIndicators.map((indicator) => (
                                <label
                                    key={indicator.id}
                                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                                >
                                    <Checkbox
                                        checked={selectedIndicators.has(
                                            indicator.id,
                                        )}
                                        onCheckedChange={() =>
                                            toggleIndicator(indicator.id)
                                        }
                                    />
                                    <span>
                                        <span className="font-semibold text-slate-700">
                                            {indicator.name}
                                        </span>
                                        <span className="block text-xs text-slate-400">
                                            {indicator.code} •{' '}
                                            {indicator.category}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="submit"
                                className="h-10 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                            >
                                Simpan Mapping
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIndicatorContent(null)}
                                className="h-10 rounded-2xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={mediaContent !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setMediaContent(null);
                        mediaForm.reset();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-lg">
                    <SheetHeader className="border-b border-slate-100 px-4 pb-4">
                        <div className="flex items-center gap-2 pr-8">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <FileUp className="size-4" />
                            </div>
                            <SheetTitle className="text-lg font-extrabold text-slate-800">
                                Upload Media Materi
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-sm text-slate-500">
                            {mediaContent
                                ? mediaContent.title
                                : 'Upload media utama atau thumbnail.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitMedia}
                        className="grid gap-5 px-4 py-5"
                    >
                        <div className="grid gap-2">
                            <Label
                                htmlFor="media_type"
                                className="text-sm font-medium text-slate-700"
                            >
                                Jenis File
                            </Label>
                            <select
                                id="media_type"
                                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={mediaForm.data.type}
                                onChange={(event) =>
                                    mediaForm.setData(
                                        'type',
                                        event.target.value as
                                            'media' | 'thumbnail',
                                    )
                                }
                            >
                                <option value="media">Media utama</option>
                                <option value="thumbnail">Thumbnail</option>
                            </select>
                            <InputError message={mediaForm.errors.type} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="media"
                                className="text-sm font-medium text-slate-700"
                            >
                                File
                            </Label>
                            <Input
                                id="media"
                                type="file"
                                className="h-10 rounded-2xl border-slate-200 bg-white text-sm text-slate-600 shadow-sm file:mr-3 file:h-8 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:text-xs file:font-bold file:text-emerald-700 hover:file:bg-emerald-100 focus-visible:ring-emerald-200"
                                onChange={(event) =>
                                    mediaForm.setData(
                                        'media',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <p className="text-xs leading-relaxed text-slate-500">
                                Video maks 50MB, audio maks 20MB, gambar/komik
                                maks 10MB, thumbnail maks 5MB.
                            </p>
                            <InputError message={mediaForm.errors.media} />
                        </div>

                        {mediaForm.progress && (
                            <progress
                                value={mediaForm.progress.percentage}
                                max="100"
                                className="h-2 w-full"
                            >
                                {mediaForm.progress.percentage}%
                            </progress>
                        )}

                        <div className="flex gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="submit"
                                disabled={mediaForm.processing}
                                className="h-10 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
                            >
                                Upload
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMediaContent(null)}
                                className="h-10 rounded-2xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}

function MediaBadge({ active, label }: { active: boolean; label: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                active
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border border-slate-200 bg-slate-50 text-slate-400'
            }`}
        >
            {active ? '✓' : '—'} {label}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const color = {
        published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        draft: 'border-slate-200 bg-slate-50 text-slate-500',
        archived: 'border-amber-200 bg-amber-50 text-amber-700',
    }[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                color ?? 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
        >
            {statusLabel(status)}
        </span>
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

function statusLabel(status: string) {
    return (
        {
            draft: 'Draft',
            published: 'Published',
            archived: 'Arsip',
        }[status] ?? status
    );
}

function firstError(errors: Partial<Record<string, string>>) {
    return (
        Object.values(errors)[0] ?? 'Terjadi kesalahan. Periksa kembali form.'
    );
}
