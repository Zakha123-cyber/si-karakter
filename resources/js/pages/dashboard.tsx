import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookMarked,
    BookOpen,
    CalendarDays,
    ClipboardCheck,
    FileText,
    LayoutDashboard,
    TreePine,
    Users,
} from 'lucide-react';
import type { Auth } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    const role = user?.role ?? 'student';
    const cards = getDashboardCards(role);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Dashboard
                        </h1>
                        <Badge variant="secondary">{roleLabel(role)}</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        {dashboardIntro(role, user?.name ?? 'Pengguna')}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map((card) => (
                        <Card key={card.title} className="rounded-lg">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <card.icon className="size-5 text-muted-foreground" />
                                    <CardTitle className="text-base">
                                        {card.title}
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    {card.description}
                                </CardDescription>
                            </CardHeader>
                            {card.href && (
                                <CardContent>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={card.href}>
                                            {card.action}
                                        </Link>
                                    </Button>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

function roleLabel(role: string) {
    return (
        {
            admin: 'Admin',
            teacher: 'Ustadz',
            student: 'Santri',
        }[role] ?? role
    );
}

function dashboardIntro(role: string, name: string) {
    if (role === 'admin') {
        return `${name}, kelola akun, struktur akademik, paket tes, dan pengaturan sistem dari portal admin.`;
    }

    if (role === 'teacher') {
        return `${name}, pantau santri, validasi asesmen, isi observasi, dan siapkan laporan perkembangan.`;
    }

    return `${name}, lanjutkan kegiatan karakter dan lihat perkembangan positifmu di portal santri.`;
}

function getDashboardCards(role: string) {
    if (role === 'admin') {
        return [
            {
                title: 'Tahun Ajaran',
                description: 'Atur tahun ajaran untuk kegiatan akademik.',
                action: 'Kelola tahun ajaran',
                href: '/admin/academic-years',
                icon: CalendarDays,
            },
            {
                title: 'User Management',
                description: 'Kelola akun admin, ustadz, dan santri.',
                action: 'Kelola user',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Santri',
                description: 'Daftar dan kelola data santri.',
                action: 'Kelola santri',
                href: '/admin/students',
                icon: Users,
            },
            {
                title: 'Kelompok',
                description: 'Buat kelompok dan atur penempatan santri.',
                action: 'Kelola kelompok',
                href: '/admin/groups',
                icon: BookMarked,
            },
            {
                title: 'Pengaturan Sistem',
                description:
                    'Bobot, indikator, dan konfigurasi akan dibuka bertahap.',
                icon: ClipboardCheck,
            },
        ];
    }

    if (role === 'teacher') {
        return [
            {
                title: 'Review Santri',
                description:
                    'Antrian validasi asesmen akan tersedia setelah modul tes.',
                icon: ClipboardCheck,
            },
            {
                title: 'Observasi Harian',
                description: 'Form observasi cepat akan tersedia pada Phase 9.',
                icon: FileText,
            },
            {
                title: 'Laporan Karakter',
                description:
                    'Rapor karakter akan tersedia setelah scoring dan report.',
                icon: BookOpen,
            },
        ];
    }

    return [
        {
            title: 'Tes Dilema Moral',
            description: 'Kerjakan paket tes moral yang tersedia untukmu.',
            action: 'Lihat tes',
            href: '/student/tests',
            icon: ClipboardCheck,
        },
        {
            title: 'Bioskop Teladan',
            description:
                'Konten positif akan tersedia pada modul konten edukatif.',
            icon: BookOpen,
        },
        {
            title: 'Pohon Kebaikan',
            description:
                'Perkembangan positif akan ditampilkan sebagai pohon kebaikan.',
            icon: TreePine,
        },
    ];
}
