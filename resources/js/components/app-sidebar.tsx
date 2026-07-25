<<<<<<< Updated upstream
import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid } from 'lucide-react';
=======
import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardCheck,
    FileText,
    LayoutGrid,
    Tag,
    TreePine,
    Users,
} from 'lucide-react';
import type { Auth, NavItem } from '@/types';
>>>>>>> Stashed changes
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
<<<<<<< Updated upstream
=======

function getNavItems(role: string): NavItem[] {
    const baseItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (role === 'admin') {
        return [
            ...baseItems,
            {
                title: 'User Management',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Indikator Karakter',
                href: '/admin/character-indicators',
                icon: Tag,
            },
        ];
    }

    if (role === 'teacher') {
        return [
            ...baseItems,
            {
                title: 'Review',
                href: '/dashboard',
                icon: ClipboardCheck,
            },
            {
                title: 'Observasi',
                href: '/dashboard',
                icon: FileText,
            },
        ];
    }

    return [
        ...baseItems,
        {
            title: 'Pilih Jalanmu',
            href: '/dashboard',
            icon: ClipboardCheck,
        },
        {
            title: 'Pohon Kebaikan',
            href: '/dashboard',
            icon: TreePine,
        },
    ];
}
>>>>>>> Stashed changes
