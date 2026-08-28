import { Form, Head, Link } from '@inertiajs/react';
import { Check, LogOut } from 'lucide-react';
import { useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';

type Props = {
    student: {
        name: string;
        username: string;
        group: string | null;
        student_code: string | null;
        pin_enabled: boolean;
    };
    password_rules: string;
};

const APPEARANCE_MODES: { value: Appearance; label: string; emoji: string }[] =
    [
        { value: 'light', label: 'Terang', emoji: '☀️' },
        { value: 'dark', label: 'Gelap', emoji: '🌙' },
        { value: 'system', label: 'Sistem', emoji: '🖥️' },
    ];

export default function StudentSettings({
    student,
    password_rules,
}: Props) {
    const { appearance, updateAppearance } = useAppearance();
    const [showForm, setShowForm] = useState(false);

    return (
        <>
            <Head title="Pengaturan" />

            {/* Hero */}
            <section className="relative mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 p-6 text-white shadow-[0_12px_40px_rgba(14,165,233,0.35)] sm:p-8">
                <div className="pointer-events-none absolute -top-8 -right-8 text-[120px] opacity-25 select-none">
                    ⚙️
                </div>
                <div className="relative">
                    <h1 className="text-3xl font-extrabold sm:text-4xl">
                        Pengaturan
                    </h1>
                    <p className="mt-2 max-w-md text-sm font-medium text-white/90">
                        Atur profilmu, password, dan tampilan aplikasi di sini.
                    </p>
                </div>
            </section>

            <div className="space-y-5">
                {/* Profile */}
                <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-700">
                        <span>🪪</span>
                        Profil Saya
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-teal-400 text-2xl font-extrabold text-white shadow-md">
                            {student.name.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-base font-extrabold text-slate-700">
                                {student.name}
                            </p>
                            <p className="text-xs font-medium text-slate-400">
                                @{student.username}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-sky-50 p-3.5">
                            <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                                Kelas
                            </p>
                            <p className="mt-0.5 text-sm font-extrabold text-slate-700">
                                {student.group ?? 'Belum ada kelas'}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-teal-50 p-3.5">
                            <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                                Kode Santri
                            </p>
                            <p className="mt-0.5 text-sm font-extrabold text-slate-700">
                                {student.student_code ?? '-'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Password */}
                <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-700">
                                <span>🔑</span>
                                Ganti Password
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Gunakan password baru yang mudah kamu ingat,
                                tapi sulit ditebak orang lain.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm((v) => !v)}
                            className="rounded-2xl bg-sky-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_6px_18px_rgba(14,165,233,0.28)] transition-transform hover:scale-[1.03]"
                        >
                            {showForm ? 'Tutup' : 'Ganti Password'}
                        </button>
                    </div>

                    {showForm && (
                        <Form
                            {...SecurityController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            className="mt-5 space-y-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="current_password"
                                            className="text-xs font-extrabold text-slate-600"
                                        >
                                            Password / PIN saat ini
                                        </label>
                                        <PasswordInput
                                            id="current_password"
                                            name="current_password"
                                            className="block w-full rounded-2xl"
                                            autoComplete="current-password"
                                            placeholder="Password / PIN saat ini"
                                        />
                                        <InputError
                                            message={errors.current_password}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="password"
                                            className="text-xs font-extrabold text-slate-600"
                                        >
                                            Password baru
                                        </label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            className="block w-full rounded-2xl"
                                            autoComplete="new-password"
                                            placeholder="Password baru"
                                            passwordrules={password_rules}
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="password_confirmation"
                                            className="text-xs font-extrabold text-slate-600"
                                        >
                                            Ulangi password baru
                                        </label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            className="block w-full rounded-2xl"
                                            autoComplete="new-password"
                                            placeholder="Ulangi password baru"
                                            passwordrules={password_rules}
                                        />
                                        <InputError
                                            message={errors.password_confirmation}
                                        />
                                    </div>

                                    <button
                                        disabled={processing}
                                        className="rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-[0_6px_18px_rgba(14,165,233,0.28)] transition-transform hover:scale-[1.03] disabled:opacity-60"
                                    >
                                        Simpan Password 💾
                                    </button>
                                </>
                            )}
                        </Form>
                    )}
                </section>

                {/* Appearance */}
                <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-700">
                        <span>🎨</span>
                        Tampilan
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                        Pilih warna aplikasi yang paling nyaman untuk matamu.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {APPEARANCE_MODES.map((mode) => {
                            const active = appearance === mode.value;

                            return (
                                <button
                                    key={mode.value}
                                    onClick={() => updateAppearance(mode.value)}
                                    className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                                        active
                                            ? 'bg-sky-500 text-white shadow-[0_6px_18px_rgba(14,165,233,0.28)]'
                                            : 'bg-gray-50 text-slate-500 hover:bg-sky-50 hover:text-sky-600'
                                    }`}
                                >
                                    <span className="text-base">
                                        {mode.emoji}
                                    </span>
                                    {mode.label}
                                    {active && <Check className="size-4" />}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Help + Logout */}
                <section className="rounded-[28px] bg-gradient-to-br from-amber-100 to-rose-100 p-5 shadow-[0_8px_30px_rgba(16,58,58,0.08)] sm:p-6">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-amber-800">
                        <span>🙋</span>
                        Butuh Bantuan?
                    </h2>
                    <p className="mt-1 text-xs font-medium text-amber-700">
                        {student.pin_enabled
                            ? 'Ingin mengganti PIN atau lupa password? Minta bantuan ustadz/ustadzah ya!'
                            : 'Lupa password? Minta bantuan ustadz/ustadzah ya!'}
                    </p>
                    <LinkLogout />
                </section>
            </div>
        </>
    );
}

function LinkLogout() {
    return (
        <Link
            href="/logout"
            method="post"
            as="button"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-[0_6px_18px_rgba(244,63,94,0.28)] transition-transform hover:scale-[1.03]"
        >
            <LogOut className="size-4" />
            Keluar
        </Link>
    );
}
