import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, History, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type StudentDetail = {
    id: number;
    user_id: number;
    student_code: string;
    name: string;
    username: string;
    birth_date: string | null;
    gender: string | null;
    current_group_id: number | null;
    current_group: string | null;
    enrollment_date: string | null;
    status: string;
    is_active: boolean;
};

type TimelineItem = {
    id: number;
    group_name: string;
    academic_year: string;
    joined_at: string;
    left_at: string | null;
};

type Props = {
    student: StudentDetail;
    timeline: TimelineItem[];
};

const statusLabels: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    graduated: 'Lulus',
    transferred: 'Pindah',
};

export default function AdminStudentShow({ student, timeline }: Props) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) {
return '-';
}

        return new Date(dateStr).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <Head title={`Detail Santri - ${student.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/students">
                            <ArrowLeft className="mr-1 size-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                    <User className="size-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">
                                        {student.name}
                                    </CardTitle>
                                    <CardDescription>
                                        @{student.username}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-muted-foreground">
                                    Kode Santri
                                </span>
                                <span className="font-mono font-medium">
                                    {student.student_code}
                                </span>

                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                <span>
                                    <Badge
                                        className={
                                            student.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : ''
                                        }
                                    >
                                        {statusLabels[student.status] ||
                                            student.status}
                                    </Badge>
                                </span>

                                <span className="text-muted-foreground">
                                    Akun
                                </span>
                                <span>
                                    {student.is_active ? (
                                        <Badge className="bg-green-100 text-green-700">
                                            Aktif
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Nonaktif
                                        </Badge>
                                    )}
                                </span>

                                <span className="text-muted-foreground">
                                    Jenis Kelamin
                                </span>
                                <span>{student.gender || '-'}</span>

                                <span className="text-muted-foreground">
                                    Tanggal Lahir
                                </span>
                                <span>{formatDate(student.birth_date)}</span>

                                <span className="text-muted-foreground">
                                    Kelompok Saat Ini
                                </span>
                                <span>
                                    {student.current_group || (
                                        <span className="text-muted-foreground">
                                            -
                                        </span>
                                    )}
                                </span>

                                <span className="text-muted-foreground">
                                    Tanggal Daftar
                                </span>
                                <span>
                                    {formatDate(student.enrollment_date)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <History className="size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    Riwayat Perpindahan Kelompok
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Catatan perpindahan kelompok santri selama di
                                pesantren.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {timeline.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Belum ada riwayat perpindahan kelompok.
                                </p>
                            ) : (
                                <div className="relative">
                                    <div className="absolute top-0 left-4 h-full w-px bg-border" />
                                    <div className="space-y-6">
                                        {timeline.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative pl-10"
                                            >
                                                <div className="absolute top-1 left-2.5 size-3 rounded-full border-2 border-primary bg-background" />
                                                <div>
                                                    <p className="font-medium">
                                                        {item.group_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.academic_year}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Bergabung:{' '}
                                                        {formatDate(
                                                            item.joined_at,
                                                        )}
                                                        {item.left_at && (
                                                            <>
                                                                {' '}
                                                                — Keluar:{' '}
                                                                {formatDate(
                                                                    item.left_at,
                                                                )}
                                                            </>
                                                        )}
                                                        {!item.left_at && (
                                                            <span className="ml-1 text-green-600">
                                                                (Aktif)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
