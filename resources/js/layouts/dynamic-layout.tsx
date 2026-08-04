import { usePage } from '@inertiajs/react';
import React from 'react';
import type { Auth, BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import StudentLayout from '@/layouts/student-layout';
import TeacherLayout from '@/layouts/teacher-layout';

type DynamicLayoutProps = {
    children?: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export default function DynamicLayout({
    children,
    breadcrumbs = [],
}: DynamicLayoutProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = (auth?.user?.role as string) ?? 'student';

    if (role === 'teacher' || role === 'admin') {
        return (
            <TeacherLayout breadcrumbs={breadcrumbs}>
                {children}
            </TeacherLayout>
        );
    }

    if (role === 'student') {
        return <StudentLayout>{children}</StudentLayout>;
    }

    return <AppLayout breadcrumbs={breadcrumbs}>{children}</AppLayout>;
}
