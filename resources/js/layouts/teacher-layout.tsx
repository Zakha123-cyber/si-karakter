import { Link, usePage } from '@inertiajs/react';
import { ClipboardCheck, Menu, Settings, X } from 'lucide-react';
import { useState } from 'react';
import type { Auth } from '@/types';

type TeacherLayoutProps = {
    children?: React.ReactNode;
    breadcrumbs?: any;
};

const getNavItems = (role?: string) => {
    if (role === 'admin') {
        return [
            { emoji: '🏠', label: 'Dashboard', href: '/dashboard' },
            {
                emoji: '📅',
                label: 'Tahun Ajaran',
                href: '/admin/academic-years',
            },
            {
                emoji: '🏫',
                label: 'Kelompok',
                href: '/admin/groups',
            },
            {
                emoji: '🎓',
                label: 'Data Santri',
                href: '/admin/students',
            },
            {
                emoji: '👥',
                label: 'Manajemen User',
                href: '/admin/users',
            },
            { emoji: '⚙️', label: 'Pengaturan', href: '/settings/profile' },
        ];
    }

    return [
        { emoji: '🏠', label: 'Beranda', href: '/dashboard' },
        { emoji: '📋', label: 'Review Asesmen', href: '/teacher/reviews' },
        {
            emoji: '📦',
            label: 'Paket Tes Moral',
            href: '/teacher/test-packages',
        },
        { emoji: '🧭', label: 'Kasus Dilema', href: '/teacher/moral-cases' },
        {
            emoji: '🌱',
            label: 'Indikator Karakter',
            href: '/teacher/character-indicators',
        },
        {
            emoji: '⚖️',
            label: 'Konfigurasi Scoring',
            href: '/teacher/scoring-configurations',
        },
        {
            emoji: '📝',
            label: 'Observasi Harian',
            href: '/teacher/observations',
        },
        {
            emoji: '🌸',
            label: 'Pendampingan Santri',
            href: '/teacher/warnings',
        },
        {
            emoji: '📄',
            label: 'Laporan Karakter',
            href: '/teacher/reports',
        },
        {
            emoji: '🎬',
            label: 'Materi Edukasi',
            href: '/teacher/educational-contents',
        },
        {
            emoji: '🛡️',
            label: 'Simulasi Berani Menolak',
            href: '/teacher/simulation-scenarios',
        },
        { emoji: '⚙️', label: 'Pengaturan', href: '/settings/profile' },
    ];
};

export default function TeacherLayout({ children }: TeacherLayoutProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [drawerOpen, setDrawerOpen] = useState(false);

    const user = auth.user;

    return (
        <div className="min-h-svh bg-[#f4f6fb] font-[family-name:var(--font-display)] text-slate-700">
            <div className="mx-auto flex max-w-[1440px] gap-5 p-4 lg:p-6">
                {/* Desktop sidebar */}
                <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] lg:flex">
                    <SidebarContent />
                </aside>

                {/* Main */}
                <main className="min-w-0 flex-1">{children}</main>
            </div>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-40 flex items-center justify-between bg-[#f4f6fb] px-4 py-3 lg:hidden">
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm"
                    aria-label="Buka menu"
                >
                    <Menu className="size-5" />
                </button>
                <span className="text-lg font-extrabold text-[#0f766e]">
                    TeladanKu
                </span>
                <Avatar name={user?.name ?? 'U'} />
            </div>

            {/* Mobile drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="absolute top-0 left-0 h-full w-72 rounded-r-[28px] bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex justify-end">
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
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
    const { url, props } = usePage<{ auth: Auth }>();
    const user = props.auth.user;
    const role = user?.role ?? 'teacher';
    const navItems = getNavItems(role);

    return (
        <>
            {/* Logo */}
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xl text-white shadow-sm">
                    🌱
                </div>
                <div>
                    <div className="text-lg font-extrabold text-slate-800">
                        TeladanKu
                    </div>
                    <div className="text-[11px] font-medium text-slate-400">
                        {role === 'admin'
                            ? 'Portal Admin Sistem'
                            : 'Portal Pembinaan Akhlak'}
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-1 [scrollbar-color:rgb(148_163_184)_transparent] flex-col gap-1 overflow-y-auto overscroll-y-contain [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
                {navItems.map((item) => {
                    const isActive =
                        url === item.href ||
                        (item.href !== '/dashboard' &&
                            url.startsWith(item.href));

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                                isActive
                                    ? 'bg-emerald-500 text-white shadow-[0_6px_18px_rgba(16,185,129,0.35)]'
                                    : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                        >
                            <span className="text-lg leading-none">
                                {item.emoji}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50"
                >
                    <span className="text-lg leading-none">🚪</span>
                    Keluar
                </Link>
            </nav>

            {/* Mascot + Assistant Card matching Student Dashboard */}
            <div className="mt-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                <div className="mb-2 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl text-white shadow-inner">
                        👳‍♂️
                    </div>
                </div>
                <p className="text-center text-xs font-extrabold text-emerald-700">
                    {role === 'admin' ? 'Admin TeladanKu' : 'Ustadz Pembimbing'}
                </p>
                <p className="mt-0.5 text-center text-[11px] font-medium text-emerald-600">
                    {role === 'admin'
                        ? 'Siap mengelola sistem!'
                        : 'Siap membina santri!'}
                </p>
                <Link
                    href={
                        role === 'admin'
                            ? '/settings/profile'
                            : '/teacher/reviews'
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-2.5 text-xs font-bold text-emerald-600 shadow-sm transition-transform hover:scale-[1.02]"
                >
                    {role === 'admin' ? (
                        <Settings className="size-4" />
                    ) : (
                        <ClipboardCheck className="size-4" />
                    )}
                    {role === 'admin' ? 'Pengaturan Akun' : 'Antrian Review'}
                </Link>
            </div>
        </>
    );
}

function Avatar({ name }: { name: string }) {
    const initial = name?.trim().charAt(0)?.toUpperCase() ?? 'U';

    return (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-base font-bold text-white shadow-sm">
            {initial}
        </div>
    );
}
