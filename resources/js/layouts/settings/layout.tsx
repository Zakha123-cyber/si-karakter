import { Link } from '@inertiajs/react';
import type { NavItem } from '@/types';
import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { Settings, User, Shield, Palette } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: Shield,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="min-h-full space-y-6 pb-8">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:p-8">
                <div className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 left-12 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
                <svg className="pointer-events-none absolute top-6 right-8 h-48 w-48 text-white opacity-10" viewBox="0 0 200 200" fill="currentColor" aria-hidden="true">
                    <path d="M100 22l28 14v32l-28 22-28-22V36l28-14zM100 40l-12 6v26l12 9 12-9V46l-12-6z" />
                </svg>
                <div className="relative flex flex-wrap items-center justify-between gap-6">
                    <div className="max-w-3xl min-w-0">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
                            <Settings className="size-4 text-emerald-200" />
                            <span>Pengaturan Akun</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Pengaturan ⚙️
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                            Atur profil, keamanan akun, dan preferensi tampilan Anda.
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[200px_minmax(0,1fr)]">
                {/* Sidebar Nav */}
                <aside className="h-fit rounded-[28px] bg-white p-3 shadow-[0_8px_30px_rgba(16,58,58,0.08)] xl:sticky xl:top-4 xl:self-start">
                    <nav
                        className="flex flex-col space-y-1"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        'w-full justify-start gap-2.5 rounded-xl text-sm font-semibold',
                                        {
                                            'bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100 hover:text-emerald-800':
                                                isCurrentOrParentUrl(item.href),
                                            'text-slate-500 hover:bg-slate-50 hover:text-slate-700':
                                                !isCurrentOrParentUrl(item.href),
                                        },
                                    )}
                                >
                                    <Link href={item.href}>
                                        {Icon && (
                                            <Icon className="size-4" />
                                        )}
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content */}
                <div className="min-w-0 space-y-6">
                    <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                        <div className="max-w-xl space-y-12">
                            {children}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
