import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="username"
                                    className="text-sm font-bold text-slate-600 dark:text-slate-600"
                                >
                                    👤 Nama Pengguna (Username)
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Masukkan nama penggunamu"
                                    className="h-11 rounded-2xl border-slate-200/80 px-4 bg-white dark:bg-white text-slate-800 dark:text-slate-800 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 focus-visible:ring-[3px]"
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-bold text-slate-600 dark:text-slate-600"
                                    >
                                        🔑 Password atau PIN
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-600 dark:hover:text-emerald-700"
                                            tabIndex={5}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi/PIN"
                                    className="h-11 rounded-2xl border-slate-200/80 px-4 bg-white dark:bg-white text-slate-800 dark:text-slate-800 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 focus-visible:ring-[3px]"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 py-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded-md border-slate-200/80 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 focus-visible:ring-emerald-500/30"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-xs font-semibold text-slate-500 dark:text-slate-500 select-none cursor-pointer"
                                >
                                    Ingat saya di perangkat ini
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="h-12 w-full mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-base font-black text-white hover:from-emerald-600 hover:to-teal-600 shadow-[0_6px_20px_rgba(16,185,129,0.25)] hover:shadow-lg transition-all disabled:opacity-50"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner className="mr-2 size-4 animate-spin text-white" />
                                ) : null}
                                Masuk ke Petualangan 🚀
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: "Assalamu'alaikum! 👋",
    description:
        'Yuk masuk untuk lanjut belajar jadi anak hebat berakhlak mulia!',
};
