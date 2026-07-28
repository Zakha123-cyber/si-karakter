import { Head, router, usePage } from '@inertiajs/react';
import { ClipboardCheck } from 'lucide-react';
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

type PackageRow = {
    id: number;
    title: string;
    description: string | null;
    attempt_limit: number;
    cases_count: number;
    active_attempt: {
        id: number;
        status: string;
        attempt_number: number;
    } | null;
    can_start: boolean;
};

type Props = {
    packages: PackageRow[];
};

export default function StudentTestsIndex({ packages }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Tes Dilema Moral" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            Tes Dilema Moral
                        </h1>
                        <Badge variant="secondary">Phase 5</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        {auth.user?.name ?? 'Santri'}, pilih paket yang tersedia
                        dan mulai mengerjakan tes.
                    </p>
                </div>

                <div className="grid gap-4">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} className="rounded-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base">
                                            {pkg.title}
                                        </CardTitle>
                                        <CardDescription>
                                            {pkg.description ??
                                                'Paket tes moral'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">
                                        {pkg.cases_count} kasus
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                    <span>
                                        Batas percobaan: {pkg.attempt_limit}
                                    </span>
                                    {pkg.active_attempt ? (
                                        <span>
                                            Aktif: percobaan{' '}
                                            {pkg.active_attempt.attempt_number}{' '}
                                            ({pkg.active_attempt.status})
                                        </span>
                                    ) : (
                                        <span>Belum ada percobaan</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {pkg.can_start ? (
                                        <Button
                                            onClick={() =>
                                                router.post(
                                                    `/student/tests/${pkg.id}/attempts`,
                                                )
                                            }
                                        >
                                            Mulai Tes
                                        </Button>
                                    ) : (
                                        <Button variant="outline" disabled>
                                            Sedang Berjalan
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {packages.length === 0 && (
                        <Card className="rounded-lg border-dashed">
                            <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-sm text-muted-foreground">
                                <ClipboardCheck className="size-8" />
                                <p>
                                    Belum ada paket tes yang tersedia untuk
                                    kelompok Anda saat ini.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

StudentTestsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Tes Dilema Moral', href: '/student/tests' },
    ],
};
