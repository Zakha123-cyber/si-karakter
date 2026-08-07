import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ResolvedComponent } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AuthLayout from '@/layouts/auth-layout';
import DynamicLayout from '@/layouts/dynamic-layout';
import SettingsLayout from '@/layouts/settings/layout';
import StudentLayout from '@/layouts/student-layout';
import TeacherLayout from '@/layouts/teacher-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent<{ default: ResolvedComponent }>(
            `./pages/${name}.tsx`,
            import.meta.glob<{ default: ResolvedComponent }>(
                './pages/**/*.tsx',
            ),
        ).then((page) => page.default),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [DynamicLayout, SettingsLayout];
            case name.startsWith('student/'):
                return StudentLayout;
            case name === 'dashboard' ||
                name.startsWith('teacher/') ||
                name.startsWith('admin/'):
                return TeacherLayout;
            default:
                return DynamicLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
