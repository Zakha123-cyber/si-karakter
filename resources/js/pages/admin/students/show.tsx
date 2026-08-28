import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, GraduationCap, History, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-red-100 text-red-700',
    graduated: 'bg-sky-100 text-sky-700',
    transferred: 'bg-amber-100 text-amber-700',
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
                {/* Page Header */}
                <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-md">
                            <GraduationCap className="size-5" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-lg font-extrabold text-slate-800">
                                Detail Santri
                            </h1>
                            <p className="text-xs font-medium text-slate-400">
                                {student.name} (@{student.username})
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/students">
                                <ArrowLeft className="mr-1 size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                    {/* Profile Card */}
                    <section className="h-fit rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-lg font-bold text-white">
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-extrabold text-slate-800">
                                    {student.name}
                                </h2>
                                <p className="text-xs font-medium text-slate-400">
                                    @{student.username}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                                <span className="font-medium text-slate-500">
                                    Kode Santri
                                </span>
                                <span className="font-mono font-bold text-slate-800">
                                    {student.student_code}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                                <span className="font-medium text-slate-500">
                                    Status
                                </span>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                        statusColors[student.status] ??
                                        'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {statusLabels[student.status] ||
                                        student.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                                <span className="font-medium text-slate-500">
                                    Akun
                                </span>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                        student.is_active
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {student.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                                <span className="font-medium text-slate-500">
                                    Jenis Kelamin
                                </span>
                                <span className="font-medium text-slate-700">
                                    {student.gender || '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                                <span className="font-medium text-slate-500">
                                    Tanggal Lahir
                                </span>
                                <span className="font-medium text-slate-700">
                                    {formatDate(student.birth_date)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                                <span className="font-medium text-slate-500">
                                    Kelompok Saat Ini
                                </span>
                                <span className="font-medium text-slate-700">
                                    {student.current_group || (
                                        <span className="text-slate-400">
                                            -
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                                <span className="font-medium text-slate-500">
                                    Tanggal Daftar
                                </span>
                                <span className="font-medium text-slate-700">
                                    {formatDate(student.enrollment_date)}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Timeline Card */}
                    <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">
                                <History className="size-4" />
                            </span>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-800">
                                    Riwayat Perpindahan Kelompok
                                </h2>
                                <p className="text-xs font-medium text-slate-400">
                                    Catatan perpindahan kelompok santri selama di
                                    pesantren.
                                </p>
                            </div>
                        </div>

                        {timeline.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                                    📭
                                </div>
                                <h4 className="mt-3 text-base font-extrabold text-slate-800">
                                    Belum ada riwayat
                                </h4>
                                <p className="mt-1 max-w-sm text-xs font-medium text-slate-400">
                                    Belum ada riwayat perpindahan kelompok.
                                </p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute top-0 left-4 h-full w-px bg-slate-200" />
                                <div className="space-y-6">
                                    {timeline.map((item) => (
                                        <div
                                            key={item.id}
                                            className="relative pl-10"
                                        >
                                            <div className="absolute top-1 left-2.5 size-3 rounded-full border-2 border-emerald-500 bg-white" />
                                            <div className="rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50/50">
                                                <p className="font-bold text-slate-800">
                                                    {item.group_name}
                                                </p>
                                                <p className="text-xs font-medium text-slate-400">
                                                    {item.academic_year}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
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
                                                        <span className="ml-1 text-emerald-600 font-bold">
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
                    </section>
                </div>
            </div>
        </>
    );
}

AdminStudentShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Santri', href: '/admin/students' },
        { title: 'Detail', href: '' },
    ],
};
