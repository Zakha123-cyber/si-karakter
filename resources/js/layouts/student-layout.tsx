import { Link, usePage } from '@inertiajs/react';
import { AudioLines, Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { Auth } from '@/types';

type StudentLayoutProps = {
    children?: React.ReactNode;
};

const NAV_ITEMS = [
    {
        emoji: '🏠',
        label: 'Beranda',
        href: '/student/dashboard',
        color: 'from-emerald-400 to-emerald-500',
        bgActive: 'bg-emerald-500',
        bgHover: 'hover:bg-emerald-50',
    },
    {
        emoji: '🎬',
        label: 'Bioskop Teladan',
        href: '/student/contents',
        color: 'from-sky-400 to-sky-500',
        bgActive: 'bg-sky-500',
        bgHover: 'hover:bg-sky-50',
    },
    {
        emoji: '🛤️',
        label: 'Pilih Jalanmu!',
        href: '/student/tests',
        color: 'from-purple-400 to-purple-500',
        bgActive: 'bg-purple-500',
        bgHover: 'hover:bg-purple-50',
    },
    {
        emoji: '🛡️',
        label: 'Simulasi Berani Menolak',
        href: '/student/simulations',
        color: 'from-rose-400 to-rose-500',
        bgActive: 'bg-rose-500',
        bgHover: 'hover:bg-rose-50',
    },
    {
        emoji: '🌳',
        label: 'Pohon Kebaikan',
        href: '/student/goodness-tree',
        color: 'from-green-400 to-green-500',
        bgActive: 'bg-green-500',
        bgHover: 'hover:bg-green-50',
    },
    {
        emoji: '🏆',
        label: 'Misi Harian',
        href: '/student/dashboard#misi',
        color: 'from-amber-400 to-amber-500',
        bgActive: 'bg-amber-500',
        bgHover: 'hover:bg-amber-50',
    },
    {
        emoji: '🎁',
        label: 'Hadiah',
        href: '/student/dashboard#hadiah',
        color: 'from-pink-400 to-pink-500',
        bgActive: 'bg-pink-500',
        bgHover: 'hover:bg-pink-50',
    },
    {
        emoji: '⚙️',
        label: 'Pengaturan',
        href: '/student/dashboard#pengaturan',
        color: 'from-slate-400 to-slate-500',
        bgActive: 'bg-slate-500',
        bgHover: 'hover:bg-slate-50',
    },
];

export default function StudentLayout({ children }: StudentLayoutProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [drawerOpen, setDrawerOpen] = useState(false);

    const user = auth.user;

    return (
        <div className="min-h-svh bg-[#f0f4fb] font-[family-name:var(--font-display)] text-slate-700">
            <div className="mx-auto flex max-w-[1440px] gap-5 p-4 lg:p-5">
                {/* Desktop sidebar */}
                <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[260px] shrink-0 flex-col rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] lg:flex">
                    <SidebarContent />
                </aside>

                {/* Main */}
                <main className="min-w-0 flex-1">{children}</main>
            </div>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-40 flex items-center justify-between bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md lg:hidden">
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
                    aria-label="Buka menu"
                >
                    <Menu className="size-5" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-lg font-extrabold text-transparent">
                        TeladanKu
                    </span>
                </div>
                <Avatar name={user?.name ?? 'S'} />
            </div>

            {/* Mobile drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="absolute top-0 left-0 flex h-full w-72 flex-col rounded-r-[28px] bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex justify-end">
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-slate-500 transition-colors hover:bg-gray-200"
                                aria-label="Tutup menu"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <SidebarContent />
                    </div>
                </div>
            )}
        </div>
    );
}

function SidebarContent() {
    const { url } = usePage();

    return (
        <>
            {/* Logo */}
            <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 text-2xl shadow-md shadow-emerald-200">
                    🌱
                </div>
                <div>
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-lg font-extrabold text-transparent">
                        TeladanKu
                    </div>
                    <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        Belajar Baik, Hati Makin Baik
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        url === item.href ||
                        (item.href !== '/student/dashboard' &&
                            !item.href.includes('#') &&
                            url.startsWith(item.href));

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                                isActive
                                    ? `${item.bgActive} text-white shadow-lg`
                                    : `text-slate-500 ${item.bgHover} hover:text-slate-700`
                            }`}
                        >
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base leading-none ${
                                    isActive
                                        ? 'bg-white/20'
                                        : `bg-gradient-to-br ${item.color} text-white shadow-sm`
                                }`}
                            >
                                {item.emoji}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}

                <div className="my-2 border-t border-slate-100" />

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-base leading-none">
                        🚪
                    </span>
                    Keluar
                </Link>
            </nav>

            {/* Voice guide mascot */}
            <div className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 p-4">
                <div className="mb-3 flex justify-center">
                    <div className="relative">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 text-3xl shadow-lg shadow-emerald-200">
                            🧒
                        </div>
                        <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                            <AudioLines className="size-3 text-emerald-500" />
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs font-bold text-emerald-700">
                    Dengarkan Panduan Suara
                </p>
                <p className="mt-0.5 text-center text-[10px] text-emerald-500">
                    Klik untuk memutar
                </p>
                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-2.5 text-xs font-bold text-emerald-600 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md">
                    <AudioLines className="size-4" />
                    Putar Panduan
                </button>
            </div>
        </>
    );
}

function Avatar({ name }: { name: string }) {
    const initial = name?.trim().charAt(0)?.toUpperCase() ?? 'S';

    return (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 text-base font-bold text-white shadow-md shadow-emerald-200">
            {initial}
        </div>
    );
}
