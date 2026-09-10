import { Link } from '@inertiajs/react';
import type { AuthLayoutProps } from '@/types';
import { home } from '@/routes';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-[#f4f6fb] to-sky-50 font-[family-name:var(--font-display)] p-4 sm:p-6 md:p-10">
            {/* Background Image with blur and opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 filter blur-[4px] pointer-events-none select-none"
                style={{
                    backgroundImage: 'url("/images/background-sikarakter.png")',
                }}
            />

            {/* Floating Icons for Playful Vibe */}
            <div
                className="absolute top-10 left-10 animate-bounce text-3xl opacity-30 hidden sm:block"
                style={{ animationDuration: '3s' }}
            >
                🌙
            </div>
            <div className="absolute bottom-12 right-12 animate-pulse text-4xl opacity-30 hidden sm:block">
                🌱
            </div>
            <div
                className="absolute top-20 right-1/4 animate-bounce text-2xl opacity-20 hidden lg:block"
                style={{ animationDuration: '4s' }}
            >
                ⭐
            </div>
            <div className="absolute bottom-20 left-1/4 animate-pulse text-3xl opacity-25 hidden lg:block">
                ✨
            </div>

            <div className="relative w-full max-w-md">
                {/* Playful Header Logo */}
                <div className="mb-6 flex flex-col items-center justify-center">
                    <Link
                        href={home()}
                        className="transition-transform hover:scale-105"
                    >
                        <img
                            src="/images/logo-teladanku.png"
                            alt="TeladanKu — Belajar Baik, Hati Makin Baik"
                            className="h-44 w-auto object-contain drop-shadow-[0_8px_24px_rgba(16,185,129,0.25)] sm:h-52"
                        />
                    </Link>
                </div>

                {/* Main Auth Card */}
                <div className="overflow-hidden rounded-[32px] border-4 border-emerald-100/30 bg-white p-6 shadow-[0_12px_40px_rgba(16,185,129,0.06)] sm:p-10">
                    <div className="mb-6 space-y-2 text-center">
                        <h1 className="text-2xl font-black text-slate-800">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm font-semibold text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
