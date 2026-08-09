import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
    Search,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedContents = {
    data: ContentCard[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    student: {
        name: string;
        group: string | null;
    };
    contents: PaginatedContents;
    recommended: ContentCard[];
    filters: {
        search: string;
        content_type: string;
        indicator_id: number;
    };
    contentTypes: string[];
    characterIndicators: Indicator[];
};

export default function StudentContentsIndex({
    student,
    contents,
    recommended,
    filters,
    contentTypes,
    characterIndicators,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [contentType, setContentType] = useState(filters.content_type);
    const [indicatorId, setIndicatorId] = useState(
        filters.indicator_id ? String(filters.indicator_id) : '',
    );

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/student/contents',
            {
                search,
                content_type: contentType,
                indicator_id: indicatorId,
            },
            { preserveState: true, replace: true },
        );
    };

    const firstName = student.name.split(' ')[0] ?? 'Santri';

    return (
        <>
            <Head title="Bioskop Teladan" />

            <div className="space-y-6 pb-8">
                <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 p-6 text-white shadow-[0_12px_40px_rgba(56,189,248,0.32)] sm:p-8">
                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-extrabold backdrop-blur-sm">
                            <Sparkles className="size-4" />
                            Phase 13 — Bioskop Teladan
                        </span>
                        <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                            Yuk belajar dari kisah baik, {firstName}!
                        </h1>
                        <p className="mt-2 max-w-xl text-sm font-semibold text-sky-50 sm:text-base">
                            Pilih video, komik, audio, gambar, atau cerita yang
                            membuat hati makin baik. Setelah selesai, kamu bisa
                            memilih emotikon perasaanmu.
                        </p>
                        {student.group && (
                            <p className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                                Kelompok: {student.group}
                            </p>
                        )}
                    </div>
                    <div className="pointer-events-none absolute -right-8 -bottom-10 text-9xl opacity-25">
                        🎬
                    </div>
                </section>

                {recommended.length > 0 && (
                    <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-xl">
                                ✨
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-800">
                                    Rekomendasi Untukmu
                                </h2>
                                <p className="text-xs font-semibold text-slate-400">
                                    Materi yang cocok dengan perjalanan
                                    belajarmu.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {recommended.map((content) => (
                                <ContentCardView
                                    key={`recommended-${content.id}`}
                                    content={content}
                                    compact
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-black text-slate-800">
                                <BookOpen className="size-5 text-emerald-500" />
                                Semua Materi Teladan
                            </h2>
                            <p className="text-xs font-semibold text-slate-400">
                                Menampilkan {contents.from ?? 0}-
                                {contents.to ?? 0} dari {contents.total} materi
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={submitFilters}
                        className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px_auto]"
                    >
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari kisah, nilai baik, atau judul..."
                                className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
                            />
                        </div>
                        <select
                            value={contentType}
                            onChange={(event) =>
                                setContentType(event.target.value)
                            }
                            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600"
                        >
                            <option value="">Semua bentuk</option>
                            {contentTypes.map((type) => (
                                <option key={type} value={type}>
                                    {contentTypeLabel(type)}
                                </option>
                            ))}
                        </select>
                        <select
                            value={indicatorId}
                            onChange={(event) =>
                                setIndicatorId(event.target.value)
                            }
                            className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600"
                        >
                            <option value="">Semua nilai baik</option>
                            {characterIndicators.map((indicator) => (
                                <option key={indicator.id} value={indicator.id}>
                                    {indicator.name}
                                </option>
                            ))}
                        </select>
                        <Button
                            type="submit"
                            className="h-11 rounded-2xl bg-emerald-500 px-5 text-sm font-black text-white hover:bg-emerald-600"
                        >
                            <Filter className="mr-2 size-4" />
                            Filter
                        </Button>
                    </form>

                    {contents.data.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {contents.data.map((content) => (
                                <ContentCardView
                                    key={content.id}
                                    content={content}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[28px] border-2 border-dashed border-sky-100 bg-sky-50/50 p-10 text-center">
                            <div className="text-5xl">🌈</div>
                            <h3 className="mt-3 text-lg font-black text-slate-700">
                                Belum ada materi untuk filter ini
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                Coba hapus filter atau cari kata lain ya.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                        <div className="text-xs font-semibold text-slate-400">
                            Total {contents.total} materi
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
                                            ? 'h-8 rounded-xl bg-emerald-500 px-3 text-xs font-black text-white hover:bg-emerald-600'
                                            : 'h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50'
                                    }
                                >
                                    <PaginationLabel label={link.label} />
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

function ContentCardView({
    content,
    compact = false,
}: {
    content: ContentCard;
    compact?: boolean;
}) {
    const minutes = content.duration_seconds
        ? Math.max(1, Math.round(content.duration_seconds / 60))
        : null;

    return (
        <Link
            href={`/student/contents/${content.slug}`}
            className="group block overflow-hidden rounded-[26px] bg-slate-50 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg"
        >
            <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100">
                {content.thumbnail_url ? (
                    <img
                        src={content.thumbnail_url}
                        alt={content.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-5xl">
                        {contentTypeEmoji(content.content_type)}
                    </span>
                )}
                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-slate-600 shadow-sm">
                    {contentTypeLabel(content.content_type)}
                </span>
                {minutes !== null && (
                    <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-black text-white">
                        <Clock className="size-3" />
                        {minutes} mnt
                    </span>
                )}
                {content.completed && (
                    <span className="absolute top-3 right-3 rounded-full bg-emerald-500 p-1.5 text-white shadow-sm">
                        <CheckCircle2 className="size-4" />
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-black text-slate-800 group-hover:text-emerald-600">
                    {content.title}
                </h3>
                {!compact && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed font-semibold text-slate-500">
                        {content.description ?? 'Materi kebaikan untukmu.'}
                    </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {content.indicators
                        .slice(0, compact ? 1 : 2)
                        .map((indicator) => (
                            <span
                                key={indicator.id}
                                className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600"
                            >
                                {indicator.name}
                            </span>
                        ))}
                </div>
            </div>
        </Link>
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
