import { Link, usePage } from '@inertiajs/react';
import {
    BookOpenCheck,
    ClipboardCheck,
    ClipboardList,
    FileText,
    LayoutGrid,
    Tag,
    TreePine,
    Users,
} from 'lucide-react';
import type { Auth, NavItem } from '@/types';
import AppLogo from '@/components/app-logo';
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

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = (auth.user?.role as string) ?? 'student';
    const mainNavItems = getNavItems(role);

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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

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
                title: 'Paket Tes',
                href: '/teacher/test-packages',
                icon: ClipboardList,
            },
            {
                title: 'Kasus Moral',
                href: '/teacher/moral-cases',
                icon: BookOpenCheck,
            },
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
