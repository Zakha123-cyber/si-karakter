import { Head, router, useForm, usePage } from '@inertiajs/react';
import { KeyRound, Plus, Search, ShieldCheck, UserCog } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import type { User } from '@/types';

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

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/admin/users',
            { search, role },
            { preserveState: true, replace: true },
        );
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();

        createForm.post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
            },
        });
    };

    const toggleStatus = (user: UserRow) => {
        router.patch(
            `/admin/users/${user.id}/status`,
            { is_active: !user.is_active },
            { preserveScroll: true },
        );
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

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-normal">
                            User Management
                        </h1>
                        <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        Kelola akun admin, ustadz, dan santri untuk akses awal
                        SI-KARAKTER.
                    </p>
                </div>

                {props.flash?.status && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {props.flash.status}
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Card className="h-fit rounded-lg">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Plus className="size-5 text-muted-foreground" />
                                <CardTitle className="text-base">
                                    Tambah User
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Buat akun role awal untuk admin, ustadz, atau
                                santri.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitCreate}
                                className="grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama</Label>
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
                                    <Label htmlFor="username">Username</Label>
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
                                    <Label htmlFor="email">Email</Label>
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
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        id="role"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                    <Label htmlFor="password">Password</Label>
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
                                    <Label htmlFor="password_confirmation">
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
                                    <Label htmlFor="pin_enabled">
                                        Aktifkan PIN
                                    </Label>
                                </div>

                                {createForm.data.pin_enabled && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="pin">PIN</Label>
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
                                    disabled={createForm.processing}
                                >
                                    Simpan User
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex min-w-0 flex-col gap-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Search className="size-5 text-muted-foreground" />
                                    <CardTitle className="text-base">
                                        Daftar User
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    {users.from ?? 0}-{users.to ?? 0} dari{' '}
                                    {users.total} user
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <form
                                    onSubmit={submitFilters}
                                    className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
                                >
                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Cari nama, username, email"
                                    />
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        value={role}
                                        onChange={(event) =>
                                            setRole(event.target.value)
                                        }
                                    >
                                        <option value="">Semua role</option>
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {roleLabel(role)}
                                            </option>
                                        ))}
                                    </select>
                                    <Button type="submit" variant="outline">
                                        Filter
                                    </Button>
                                </form>

                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-muted/50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">
                                                    User
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Role
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 font-medium">
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
                                                    className="border-t"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            @{user.username}
                                                            {user.email
                                                                ? ` - ${user.email}`
                                                                : ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline">
                                                            {roleLabel(
                                                                user.role,
                                                            )}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={
                                                                user.is_active
                                                                    ? 'secondary'
                                                                    : 'destructive'
                                                            }
                                                        >
                                                            {user.is_active
                                                                ? 'Aktif'
                                                                : 'Nonaktif'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {formatDate(
                                                            user.last_login_at,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    toggleStatus(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                <ShieldCheck className="size-4" />
                                                                {user.is_active
                                                                    ? 'Nonaktifkan'
                                                                    : 'Aktifkan'}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setResetUser(
                                                                        user,
                                                                    )
                                                                }
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

                                <div className="flex flex-wrap gap-2">
                                    {users.links.map((link) => (
                                        <Button
                                            key={`${link.label}-${link.url}`}
                                            type="button"
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.visit(link.url, {
                                                        preserveScroll: true,
                                                    });
                                                }
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {resetUser && (
                            <Card className="rounded-lg">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <UserCog className="size-5 text-muted-foreground" />
                                        <CardTitle className="text-base">
                                            Reset Kredensial
                                        </CardTitle>
                                    </div>
                                    <CardDescription>
                                        {resetUser.name} (@{resetUser.username})
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={submitReset}
                                        className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto_auto]"
                                    >
                                        <select
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            value={resetType}
                                            onChange={(event) =>
                                                setResetType(
                                                    event.target
                                                        .value as typeof resetType,
                                                )
                                            }
                                        >
                                            <option value="password">
                                                Password
                                            </option>
                                            <option value="pin">PIN</option>
                                        </select>
                                        <Input
                                            value={resetValue}
                                            onChange={(event) =>
                                                setResetValue(
                                                    event.target.value,
                                                )
                                            }
                                            type={
                                                resetType === 'password'
                                                    ? 'password'
                                                    : 'text'
                                            }
                                            inputMode={
                                                resetType === 'pin'
                                                    ? 'numeric'
                                                    : 'text'
                                            }
                                            placeholder={
                                                resetType === 'pin'
                                                    ? 'PIN baru'
                                                    : 'Password baru'
                                            }
                                        />
                                        <Button type="submit">Reset</Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setResetUser(null)}
                                        >
                                            Batal
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
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
