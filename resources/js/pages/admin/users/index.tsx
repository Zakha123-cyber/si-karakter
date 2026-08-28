import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Filter,
    KeyRound,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { User } from '@/types';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { dashboard } from '@/routes';

type UserRow = Pick<
    User,
    | 'id'
    | 'name'
    | 'username'
    | 'email'
    | 'role'
    | 'pin_enabled'
    | 'is_active'
    | 'last_login_at'
>;

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedUsers = {
    data: UserRow[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    users: PaginatedUsers;
    filters: {
        search: string;
        role: string;
    };
    roles: User['role'][];
};

export default function AdminUsersIndex({ users, filters, roles }: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const [search, setSearch] = useState(filters.search);
    const [role, setRole] = useState(filters.role);
    const [editingUser, setEditingUser] = useState<UserRow | null>(null);
    const [resetUser, setResetUser] = useState<UserRow | null>(null);
    const [resetType, setResetType] = useState<'password' | 'pin'>('password');
    const [resetValue, setResetValue] = useState('');

    const createForm = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student' as User['role'],
        pin_enabled: false,
        pin: '',
    });

    const editForm = useForm({
        name: '',
        username: '',
        email: '',
        role: 'student' as User['role'],
        pin_enabled: false,
    });    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            '/admin/users',
            { search, role },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setRole('');
        router.get('/admin/users', {}, { preserveState: true });
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();
        const toastId = toast.loading('Menyimpan user baru...');

        createForm.post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User berhasil dibuat.', { id: toastId });
                createForm.reset();
            },
            onError: () => {
                toast.error('User belum bisa dibuat. Periksa kembali form.', {
                    id: toastId,
                });
            },
        });
    };

    const toggleStatus = (user: UserRow) => {
        if (user.is_active) {
            toast.warning(`Nonaktifkan akun ${user.name}?`, {
                description:
                    'User tidak dapat masuk sebelum akun diaktifkan kembali.',
                action: {
                    label: 'Nonaktifkan',
                    onClick: () => updateStatus(user, false),
                },
                cancel: {
                    label: 'Batal',
                    onClick: () => undefined,
                },
                duration: 10000,
            });

            return;
        }

        updateStatus(user, true);
    };

    const updateStatus = (user: UserRow, isActive: boolean) => {
        router.patch(
            `/admin/users/${user.id}/status`,
            { is_active: isActive },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        isActive
                            ? 'User berhasil diaktifkan.'
                            : 'User berhasil dinonaktifkan.',
                    );
                },
                onError: () => {
                    toast.error('Status user belum bisa diperbarui.');
                },
            },
        );
    };

    const startEdit = (user: UserRow) => {
        setResetUser(null);
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            username: user.username,
            email: user.email ?? '',
            role: user.role,
            pin_enabled: user.pin_enabled,
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingUser(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();

        if (!editingUser) {
            return;
        }

        const toastId = toast.loading('Menyimpan perubahan user...');

        editForm.put(`/admin/users/${editingUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User berhasil diperbarui.', { id: toastId });
                cancelEdit();
            },
            onError: () => {
                toast.error(
                    'User belum bisa diperbarui. Periksa kembali form.',
                    {
                        id: toastId,
                    },
                );
            },
        });
    };

    const submitReset = (event: FormEvent) => {
        event.preventDefault();

        if (!resetUser) {
            return;
        }

        router.post(
            `/admin/users/${resetUser.id}/reset-credential`,
            {
                type: resetType,
                value: resetValue,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setResetUser(null);
                    setResetValue('');
                    setResetType('password');
                },
            },
        );
    };

    return (
        <>
            <Head title="User Management" />

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
                                <Users className="size-4 text-emerald-200" />
                                <span>Kelola Akses Pengguna</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Manajemen User 👥
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed font-medium text-emerald-50 sm:text-base">
                                Kelola akun admin, ustadz, dan santri untuk akses awal SI-KARAKTER.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md transition-transform hover:scale-105">
                                <Users className="size-5 text-emerald-100" />
                                <div>
                                    <div className="text-sm leading-none font-extrabold">{users.total}</div>
                                    <div className="text-[10px] font-semibold text-emerald-100">Total User</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {props.flash?.status && (
                    <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 shadow-sm">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Create Form Card */}
                    <section className="h-fit rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                                <Plus className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-800">Tambah User</h2>
                                <p className="text-xs font-medium text-slate-400">Buat akun role awal untuk admin, ustadz, atau santri.</p>
                            </div>
                        </div>
                        <form
                            onSubmit={submitCreate}
                            className="grid gap-4"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-xs font-extrabold text-slate-600">Nama</Label>
                                <Input
                                    id="name"
                                    value={createForm.data.name}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={createForm.errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="username" className="text-xs font-extrabold text-slate-600">Username</Label>
                                <Input
                                    id="username"
                                    value={createForm.data.username}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'username',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={createForm.errors.username}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-extrabold text-slate-600">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Opsional untuk santri"
                                />
                                <InputError
                                    message={createForm.errors.email}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role" className="text-xs font-extrabold text-slate-600">Role</Label>
                                <select
                                    id="role"
                                    className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                    value={createForm.data.role}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'role',
                                            event.target
                                                .value as User['role'],
                                        )
                                    }
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {roleLabel(role)}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={createForm.errors.role}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-xs font-extrabold text-slate-600">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(event) =>
                                        createForm.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={createForm.errors.password}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-xs font-extrabold text-slate-600">
                                    Konfirmasi Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={
                                        createForm.data
                                            .password_confirmation
                                    }
                                    onChange={(event) =>
                                        createForm.setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="pin_enabled"
                                    checked={createForm.data.pin_enabled}
                                    onCheckedChange={(checked) =>
                                        createForm.setData(
                                            'pin_enabled',
                                            checked === true,
                                        )
                                    }
                                />
                                <Label htmlFor="pin_enabled" className="text-xs font-extrabold text-slate-600">
                                    Aktifkan PIN
                                </Label>
                            </div>

                            {createForm.data.pin_enabled && (
                                <div className="grid gap-2">
                                    <Label htmlFor="pin" className="text-xs font-extrabold text-slate-600">PIN</Label>
                                    <Input
                                        id="pin"
                                        value={createForm.data.pin}
                                        onChange={(event) =>
                                            createForm.setData(
                                                'pin',
                                                event.target.value,
                                            )
                                        }
                                        inputMode="numeric"
                                    />
                                    <InputError
                                        message={createForm.errors.pin}
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={createForm.processing}>
                                Simpan User
                            </Button>
                        </form>
                    </section>

                    {/* List Card */}
                    <main className="min-w-0 space-y-6">
                        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">📋</span>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-800">Daftar User</h2>
                                        <p className="text-xs font-medium text-slate-400">
                                            {users.from ?? 0}–{users.to ?? 0} dari {users.total} user
                                        </p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                                    <Filter className="size-4" />
                                    Kelola user
                                </div>
                            </div>

                            <form onSubmit={submitFilters} className="mb-5 flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-3">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
                                    <Input className="h-10 rounded-2xl border-slate-100 bg-white pl-9 text-sm shadow-sm focus-visible:ring-emerald-200" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, username, email" />
                                </div>
                                <select className="h-10 rounded-2xl border border-slate-100 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100" value={role} onChange={(event) => setRole(event.target.value)}>
                                    <option value="">Semua role</option>
                                    {roles.map((role) => (
                                        <option key={role} value={role}>{roleLabel(role)}</option>
                                    ))}
                                </select>
                                <Button type="submit" className="rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:bg-emerald-700"><Search className="mr-1.5 size-3.5" /> Filter</Button>
                                <Button type="button" variant="ghost" onClick={resetFilters} className="rounded-2xl text-xs font-bold text-slate-500 hover:bg-white">Reset</Button>
                            </form>

                            <div className="overflow-x-auto rounded-[24px] border border-slate-100">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                User
                                            </th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">
                                                Login Terakhir
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-t border-slate-100 transition-colors hover:bg-emerald-50/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                                                                user.role ===
                                                                'admin'
                                                                    ? 'bg-gradient-to-br from-rose-400 to-pink-500'
                                                                    : user.role ===
                                                                        'teacher'
                                                                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                                                      : 'bg-gradient-to-br from-sky-400 to-blue-500'
                                                            }`}
                                                        >
                                                            {user.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-slate-800">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                @
                                                                {user.username}
                                                                {user.email
                                                                    ? ` · ${user.email}`
                                                                    : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                            user.role ===
                                                            'admin'
                                                                ? 'bg-rose-100 text-rose-700'
                                                                : user.role ===
                                                                    'teacher'
                                                                  ? 'bg-emerald-100 text-emerald-700'
                                                                  : 'bg-sky-100 text-sky-700'
                                                        }`}
                                                    >
                                                        {roleLabel(
                                                            user.role,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                            user.is_active
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}
                                                    >
                                                        {user.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-500">
                                                    {formatDate(
                                                        user.last_login_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button type="button" size="sm" variant="outline" onClick={() => startEdit(user)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                                                            <Pencil className="size-4" /> Edit
                                                        </Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => toggleStatus(user)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                                                            <ShieldCheck className="size-4" />
                                                            {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => setResetUser(user)} className="rounded-2xl border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                                                        >
                                                            <KeyRound className="size-4" />
                                                            Reset
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-5 flex flex-wrap gap-2">
                                {users.links.map((link) => (
                                    <Button
                                        key={`${link.label}-${link.url}`}
                                        type="button"
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        className={link.active ? 'rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700' : 'rounded-2xl border-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url, {}, { preserveState: true });
                                            }
                                        }}
                                    >
                                        <PaginationLabel label={link.label} />
                                    </Button>
                                ))}
                            </div>
                        </section>
                    </main>
                </div>
            </div>

            {/* Edit User Sheet */}
            <Sheet
                open={editingUser !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        cancelEdit();
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <Pencil className="size-5 text-slate-400" />
                            <SheetTitle className="text-xl font-extrabold text-slate-800">
                                Edit User
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-slate-500">
                            {editingUser
                                ? `${editingUser.name} (@${editingUser.username})`
                                : 'Perbarui data user.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitEdit}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="edit_name" className="text-xs font-extrabold text-slate-600">Nama</Label>
                            <Input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(event) =>
                                    editForm.setData('name', event.target.value)
                                }
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_username" className="text-xs font-extrabold text-slate-600">Username</Label>
                            <Input
                                id="edit_username"
                                value={editForm.data.username}
                                onChange={(event) =>
                                    editForm.setData(
                                        'username',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={editForm.errors.username} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_email" className="text-xs font-extrabold text-slate-600">Email</Label>
                            <Input
                                id="edit_email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(event) =>
                                    editForm.setData(
                                        'email',
                                        event.target.value,
                                    )
                                }
                                placeholder="Opsional untuk santri"
                            />
                            <InputError message={editForm.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit_role" className="text-xs font-extrabold text-slate-600">Role</Label>
                            <select
                                id="edit_role"
                                className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={editForm.data.role}
                                onChange={(event) =>
                                    editForm.setData(
                                        'role',
                                        event.target.value as User['role'],
                                    )
                                }
                            >
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {roleLabel(role)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={editForm.errors.role} />
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="edit_pin_enabled"
                                checked={editForm.data.pin_enabled}
                                onCheckedChange={(checked) =>
                                    editForm.setData(
                                        'pin_enabled',
                                        checked === true,
                                    )
                                }
                            />
                            <Label htmlFor="edit_pin_enabled" className="text-xs font-extrabold text-slate-600">PIN aktif</Label>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                >
                                Simpan Perubahan
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEdit}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Reset Credential Sheet */}
            <Sheet
                open={resetUser !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setResetUser(null);
                        setResetValue('');
                        setResetType('password');
                    }
                }}
            >
                <SheetContent className="w-full overflow-y-auto bg-[#f8fafc] sm:max-w-xl">
                    <SheetHeader>
                        <div className="flex items-center gap-2 pr-8">
                            <UserCog className="size-5 text-slate-400" />
                            <SheetTitle className="text-xl font-extrabold text-slate-800">
                                Reset Kredensial
                            </SheetTitle>
                        </div>
                        <SheetDescription className="text-slate-500">
                            {resetUser
                                ? `${resetUser.name} (@${resetUser.username})`
                                : 'Reset password atau PIN user.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitReset}
                        className="grid gap-4 px-4 pb-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="reset_type" className="text-xs font-extrabold text-slate-600">Jenis Kredensial</Label>
                            <select
                                id="reset_type"
                                className="h-11 rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-medium text-slate-600 shadow-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-[3px] focus-visible:ring-emerald-100"
                                value={resetType}
                                onChange={(event) =>
                                    setResetType(
                                        event.target.value as typeof resetType,
                                    )
                                }
                            >
                                <option value="password">Password</option>
                                <option value="pin">PIN</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reset_value" className="text-xs font-extrabold text-slate-600">
                                {resetType === 'pin'
                                    ? 'PIN Baru'
                                    : 'Password Baru'}
                            </Label>
                            <Input
                                id="reset_value"
                                value={resetValue}
                                onChange={(event) =>
                                    setResetValue(event.target.value)
                                }
                                type={
                                    resetType === 'password'
                                        ? 'password'
                                        : 'text'
                                }
                                inputMode={
                                    resetType === 'pin' ? 'numeric' : 'text'
                                }
                                placeholder={
                                    resetType === 'pin'
                                        ? 'Masukkan PIN baru'
                                        : 'Masukkan password baru'
                                }
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit">
                                Reset
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setResetUser(null);
                                    setResetValue('');
                                    setResetType('password');
                                }}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'User Management',
            href: '/admin/users',
        },
    ],
};

function roleLabel(role: User['role']) {
    return {
        admin: 'Admin',
        teacher: 'Ustadz',
        student: 'Santri',
    }[role];
}

function formatDate(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function PaginationLabel({ label }: { label: string }) {
    if (
        label === '&laquo; Previous' ||
        label === 'pagination.previous' ||
        label.toLowerCase().includes('previous')
    ) {
        return (
            <>
                <ChevronLeft className="size-4" />
                <span className="sr-only">Sebelumnya</span>
            </>
        );
    }

    if (
        label === 'Next &raquo;' ||
        label === 'pagination.next' ||
        label.toLowerCase().includes('next')
    ) {
        return (
            <>
                <ChevronRight className="size-4" />
                <span className="sr-only">Berikutnya</span>
            </>
        );
    }

    return <span>{label}</span>;
}
