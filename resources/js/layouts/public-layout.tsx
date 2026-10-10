import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Menu, Sprout } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

export const PROFILE_NAV = [
    { label: 'Informasi', href: '/about' },
    { label: 'Fitur', href: '/about/fitur' },
    { label: 'Peran', href: '/about/peran' },
    { label: 'Alur Pembinaan', href: '/about/alur' },
    { label: 'Visi & Misi', href: '/about/visi-misi' },
    { label: 'Teknologi AI', href: '/about/ai' },
];

export default function PublicLayout({ children }: { children?: ReactNode }) {
    const { url } = usePage();
    const path = url.split('?')[0].replace(/\/$/, '');
    const [open, setOpen] = useState(false);
    const navigation = PROFILE_NAV.map((item) => (
        <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={path === item.href ? 'page' : undefined}
            className={`rounded-full px-3 py-2.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 ${path === item.href ? 'bg-emerald-100/70 text-emerald-800' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'}`}
        >
            {item.label}
        </Link>
    ));

    return (
        <div className="min-h-svh bg-[#fafbf7] font-[family-name:var(--font-display)] text-slate-700 selection:bg-emerald-200">
            <a
                href="#profile-content"
                className="sr-only z-50 rounded-lg bg-white p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
            >
                Langsung ke konten
            </a>
            <header className="sticky top-0 z-40 border-b border-emerald-950/5 bg-[#fafbf7]/95 backdrop-blur-xl">
                <div className="mx-auto flex min-h-22 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
                    <Link
                        href="/about"
                        className="flex shrink-0 items-center gap-2.5"
                        aria-label="TeladanKu — Informasi"
                    >
                        <img
                            src="/images/logo-teladanku.png"
                            alt=""
                            className="size-11 object-contain"
                        />
                        <span className="text-xl font-extrabold tracking-tight text-emerald-950">
                            TeladanKu<span className="text-emerald-500">.</span>
                        </span>
                    </Link>
                    <nav
                        aria-label="Navigasi profil"
                        className="hidden items-center gap-0.5 xl:flex"
                    >
                        {navigation}
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                        >
                            Masuk <ArrowUpRight className="size-4" />
                        </Link>
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <button
                                    type="button"
                                    aria-label="Buka navigasi profil"
                                    className="rounded-full border border-emerald-900/15 p-2.5 xl:hidden"
                                >
                                    <Menu className="size-5" />
                                </button>
                            </SheetTrigger>
                            <SheetContent className="overflow-y-auto border-emerald-100 bg-[#fafbf7] p-6 text-slate-700">
                                <SheetTitle className="mt-8 text-xl text-emerald-950">
                                    Jelajahi TeladanKu
                                </SheetTitle>
                                <SheetDescription className="text-slate-500">
                                    Kenali platform dan perjalanan pembinaan
                                    kami.
                                </SheetDescription>
                                <nav
                                    aria-label="Navigasi profil seluler"
                                    className="mt-4 flex flex-col gap-2"
                                >
                                    {navigation}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
            <main
                id="profile-content"
                className="mx-auto max-w-7xl px-5 pb-16 lg:px-8"
            >
                {children}
            </main>
            <footer className="border-t border-emerald-900/10 bg-white">
                <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
                    <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
                        <div>
                            <div className="flex items-center gap-2 text-xl font-extrabold text-emerald-950">
                                <Sprout className="size-6 text-emerald-700" />{' '}
                                TeladanKu.
                            </div>
                            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
                                Belajar baik, hati makin baik. Menghubungkan
                                teknologi dan pendampingan untuk menumbuhkan
                                karakter santri.
                            </p>
                        </div>
                        <nav
                            aria-label="Navigasi footer"
                            className="grid grid-cols-2 content-start gap-x-6 gap-y-4"
                        >
                            {PROFILE_NAV.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm font-semibold text-slate-600 hover:text-emerald-700"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500">
                        <p>
                            © {new Date().getFullYear()} TeladanKu. Seluruh hak
                            cipta dilindungi.
                        </p>
                        <p>Teknologi membantu. Pembina mendampingi.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
