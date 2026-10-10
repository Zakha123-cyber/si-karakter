import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    AudioLines,
    BookOpen,
    BrainCircuit,
    Check,
    ClipboardCheck,
    FileText,
    HeartHandshake,
    Layers,
    Mic,
    ShieldCheck,
    Sparkles,
    Sprout,
    Target,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Section = 'informasi' | 'fitur' | 'peran' | 'alur' | 'visi-misi' | 'ai';
const CONTENT: Record<
    Section,
    { label: string; title: string; description: string }
> = {
    informasi: {
        label: 'Mengenal TeladanKu',
        title: 'Kebaikan kecil hari ini. Karakter kuat esok hari.',
        description:
            'Platform pembinaan akhlak santri yang menyatukan pengalaman belajar, pendampingan ustadz, dan bantuan AI dalam satu perjalanan yang bermakna.',
    },
    fitur: {
        label: 'Ekosistem Fitur',
        title: 'Setiap fitur, satu langkah menuju akhlak baik.',
        description:
            'Belajar dari cerita, berlatih mengambil keputusan, dan melihat kebaikan bertumbuh. Semua terhubung dengan observasi dan pendampingan pembina.',
    },
    peran: {
        label: 'Peran Pengguna',
        title: 'Berbeda peran. Satu tujuan pembinaan.',
        description:
            'Ruang belajar untuk santri, ruang pendampingan untuk ustadz, dan ruang pengelolaan untuk admin. Setiap peran memiliki akses sesuai kebutuhannya.',
    },
    alur: {
        label: 'Alur Pembinaan',
        title: 'Perjalanan yang utuh, dari belajar hingga bertumbuh.',
        description:
            'Aktivitas santri menjadi bahan refleksi. Ustadz menghubungkannya dengan pengamatan sehari-hari untuk menyusun pendampingan yang lebih personal.',
    },
    'visi-misi': {
        label: 'Visi & Misi',
        title: 'Berangkat dari adab. Bergerak untuk masa depan.',
        description:
            'Kami percaya pembinaan karakter tumbuh melalui teladan, latihan, dan pendampingan yang konsisten. Teknologi membantu menjadikan proses itu lebih terarah.',
    },
    ai: {
        label: 'Teknologi AI',
        title: 'Teknologi yang cerdas. Pendampingan yang manusiawi.',
        description:
            'TeladanKu menggunakan kecerdasan buatan untuk membantu memahami alasan santri, mengolah suara, dan menyusun draf laporan. Ustadz tetap memegang keputusan akhir.',
    },
};
const card = 'rounded-3xl border border-emerald-950/10 bg-white p-7 sm:p-8';
const body = 'text-sm leading-7 text-slate-500';
function Label({ children }: { children: ReactNode }) {
    return (
        <p className="mb-4 flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] text-emerald-700 uppercase">
            <span className="h-px w-7 bg-emerald-600" />
            {children}
        </p>
    );
}
function SectionHeading({
    label,
    title,
    children,
}: {
    label: string;
    title: string;
    children?: ReactNode;
}) {
    return (
        <div className="mb-9 max-w-2xl">
            <Label>{label}</Label>
            <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
                {title}
            </h2>
            {children && <p className={`mt-4 ${body}`}>{children}</p>}
        </div>
    );
}
function DetailCard({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    children?: ReactNode;
}) {
    return (
        <article className={card}>
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon className="size-6" />
            </div>
            <h3 className="text-xl font-extrabold text-emerald-950">{title}</h3>
            <p className={`mt-3 ${body}`}>{description}</p>
            {children}
        </article>
    );
}
function Points({ items }: { items: string[] }) {
    return (
        <ul className="mt-5 space-y-3">
            {items.map((item) => (
                <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-slate-600"
                >
                    <Check className="mt-1 size-4 shrink-0 text-emerald-600" />
                    {item}
                </li>
            ))}
        </ul>
    );
}
function GrowthVisual() {
    return (
        <div className="relative mx-auto w-full max-w-lg py-8 lg:py-4">
            <div className="absolute inset-6 rounded-[48%] bg-[#e3edd9]" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-[0_24px_70px_-30px_rgba(6,78,59,0.35)] sm:mx-8 sm:rotate-2">
                <div className="flex items-center justify-between gap-2 px-3 py-3">
                    <span className="text-sm font-extrabold text-emerald-950">
                        Ruang tumbuh santri
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                        Pohon Kebaikan
                    </span>
                </div>
                <img
                    src="/images/dashboard/pohon-kebaikan.png"
                    alt="Ilustrasi Pohon Kebaikan dengan buah kejujuran, berbagi, dan menolong"
                    width="1024"
                    height="1024"
                    className="aspect-square w-full rounded-3xl object-cover"
                />
            </div>
            <div className="absolute bottom-1 left-0 flex max-w-[95%] items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg sm:bottom-5">
                <span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                    <BrainCircuit className="size-5" />
                </span>
                <div>
                    <p className="text-sm font-extrabold text-emerald-950">
                        Didukung AI, didampingi ustadz
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Hasil analisis tetap ditinjau manusia.
                    </p>
                </div>
            </div>
        </div>
    );
}
function Information() {
    return (
        <>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-emerald-950/10 bg-emerald-950/10 sm:grid-cols-3">
                {[
                    {
                        value: '3 peran',
                        text: 'Santri, ustadz, dan admin',
                        icon: Users,
                    },
                    {
                        value: 'Satu ekosistem',
                        text: 'Belajar hingga laporan karakter',
                        icon: Layers,
                    },
                    {
                        value: 'AI + pembina',
                        text: 'Analisis dengan validasi manusia',
                        icon: BrainCircuit,
                    },
                ].map(({ value, text, icon: Icon }) => (
                    <div
                        key={value}
                        className="flex items-center gap-4 bg-[#f1f5ec] p-6 sm:p-7"
                    >
                        <Icon className="size-7 shrink-0 text-emerald-700" />
                        <div>
                            <p className="font-extrabold text-emerald-950">
                                {value}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <section className="grid gap-10 py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
                <SectionHeading
                    label="Tentang Kami"
                    title="Pembinaan yang dekat dengan kehidupan santri."
                >
                    TeladanKu adalah wajah aplikasi SI-KARAKTER, Sistem
                    Informasi Karakter Terpadu Santri. Dirancang untuk mendukung
                    pembinaan santri usia 6–10 tahun di lingkungan sekolah dan
                    pesantren.
                </SectionHeading>
                <div>
                    <p className="text-lg leading-8 font-semibold text-slate-700">
                        Memahami karakter dimulai dari mendengarkan alasan,
                        melihat kebiasaan, dan memberi ruang untuk mencoba lagi.
                    </p>
                    <p className={`mt-5 ${body}`}>
                        Melalui cerita dilema moral, santri belajar menentukan
                        sikap dan menjelaskan alasannya dengan teks atau suara.
                        Pembina kemudian meninjau jawaban bersama hasil analisis
                        AI dan catatan observasi keseharian.
                    </p>
                    <p className={`mt-4 ${body}`}>
                        Perjalanan ini dilengkapi materi teladan, simulasi
                        keberanian, serta gamifikasi positif. Tujuannya adalah
                        membantu pembina melihat perkembangan secara utuh dan
                        merancang pendampingan yang sesuai.
                    </p>
                    <Link
                        href="/about/visi-misi"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-emerald-800"
                    >
                        Kenali visi & misi kami{' '}
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </section>
            <section className="rounded-[2rem] bg-emerald-950 p-8 text-white sm:p-12">
                <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
                    <div>
                        <p className="mb-4 text-xs font-bold tracking-widest text-emerald-300 uppercase">
                            AI di TeladanKu
                        </p>
                        <h2 className="text-3xl leading-tight font-extrabold">
                            Lebih terbantu oleh teknologi.
                            <br />
                            Tetap dekat dengan pembina.
                        </h2>
                        <p className="mt-5 max-w-xl text-sm leading-7 text-emerald-100/80">
                            AI membantu mengolah suara, menganalisis penalaran
                            moral, dan merangkai draf narasi perkembangan.
                            Ustadz memeriksa hasilnya sebelum menjadi penilaian
                            atau laporan final.
                        </p>
                        <Link
                            href="/about/ai"
                            className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#d9efad] px-5 py-3 text-sm font-extrabold text-emerald-950"
                        >
                            Kenali teknologi AI kami{' '}
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {[
                            {
                                icon: Mic,
                                text: 'Suara santri menjadi transkripsi',
                            },
                            {
                                icon: BrainCircuit,
                                text: 'Alasan jawaban menjadi rekomendasi',
                            },
                            {
                                icon: ClipboardCheck,
                                text: 'Ustadz meninjau dan menentukan hasil',
                            },
                        ].map(({ icon: Icon, text }, i) => (
                            <div
                                key={text}
                                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
                            >
                                <Icon className="size-6 shrink-0 text-emerald-300" />
                                <span className="text-sm font-semibold">
                                    {text}
                                </span>
                                <span className="ml-auto text-xs text-emerald-300">
                                    0{i + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="pt-20">
                <SectionHeading
                    label="Jelajahi Lebih Jauh"
                    title="Kenali setiap bagian perjalanan."
                >
                    Temukan bagaimana TeladanKu membantu kegiatan belajar dan
                    pendampingan sehari-hari.
                </SectionHeading>
                <div className="grid gap-5 md:grid-cols-3">
                    {[
                        {
                            href: 'fitur',
                            title: 'Fitur yang saling terhubung',
                            text: 'Dari Pilih Jalanmu sampai laporan karakter.',
                            icon: BookOpen,
                        },
                        {
                            href: 'peran',
                            title: 'Ruang untuk setiap peran',
                            text: 'Kenali pengalaman santri, ustadz, dan admin.',
                            icon: Users,
                        },
                        {
                            href: 'alur',
                            title: 'Pembinaan, langkah demi langkah',
                            text: 'Lihat bagaimana aktivitas menjadi pendampingan.',
                            icon: Sprout,
                        },
                    ].map(({ href, title, text, icon: Icon }) => (
                        <Link
                            href={`/about/${href}`}
                            key={href}
                            className={`${card} group transition-colors hover:border-emerald-500`}
                        >
                            <Icon className="mb-6 size-7 text-emerald-700" />
                            <h3 className="text-lg font-extrabold text-emerald-950">
                                {title}
                            </h3>
                            <p className={`mt-3 ${body}`}>{text}</p>
                            <span className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-700">
                                Jelajahi{' '}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}
const FEATURE_GROUPS = [
    {
        label: '01 / Pengalaman Santri',
        title: 'Belajar melalui pengalaman.',
        items: [
            {
                icon: BookOpen,
                title: 'Pilih Jalanmu',
                description:
                    'Cerita dilema moral mengajak santri memilih tindakan dan menjelaskan alasan. Jawaban dapat disampaikan melalui teks atau rekaman suara.',
                points: [
                    'Paket tes sesuai kelompok dan periode',
                    'Cerita dengan dukungan audio',
                    'Jawaban tersimpan selama pengerjaan',
                ],
            },
            {
                icon: ShieldCheck,
                title: 'Berani Menolak',
                description:
                    'Simulasi situasi sehari-hari untuk berlatih menolak ajakan yang kurang baik dengan cara yang tepat dan tetap menghargai orang lain.',
                points: [
                    'Skenario dan pilihan respons',
                    'Umpan balik setelah berlatih',
                    'Reward positif dari simulasi',
                ],
            },
            {
                icon: Sprout,
                title: 'Pohon Kebaikan',
                description:
                    'Kebaikan divisualisasikan sebagai pohon yang bertumbuh. Misi harian dan hadiah membantu menjaga semangat membangun kebiasaan baik.',
                points: [
                    'Pertumbuhan dari poin kebaikan',
                    'Riwayat reward yang positif',
                    'Poin gamifikasi terpisah dari skor asesmen',
                ],
            },
            {
                icon: AudioLines,
                title: 'Bioskop Teladan',
                description:
                    'Materi edukasi berupa video, gambar, komik, audio, dan cerita membantu santri mengenal nilai karakter melalui teladan yang dekat dengan keseharian.',
                points: [
                    'Materi terkait indikator karakter',
                    'Rekomendasi materi untuk santri',
                    'Respons emotikon setelah belajar',
                ],
            },
        ],
    },
    {
        label: '02 / Ruang Pembina',
        title: 'Memahami perkembangan lebih utuh.',
        items: [
            {
                icon: ClipboardCheck,
                title: 'Asesmen & validasi ustadz',
                description:
                    'Pembina menyusun kasus, indikator, dan paket tes. Hasil analisis AI ditinjau bersama jawaban serta transkripsi sebelum disetujui atau disesuaikan.',
                points: [
                    'Pengelolaan kasus dan paket tes',
                    'Review audio, transkripsi, dan rekomendasi AI',
                    'Penyesuaian dengan catatan pembina',
                ],
            },
            {
                icon: HeartHandshake,
                title: 'Observasi & pendampingan',
                description:
                    'Catatan perilaku sehari-hari melengkapi asesmen. Indikator kebutuhan pendampingan membantu pembina meninjau dan menindaklanjuti pola yang muncul.',
                points: [
                    'Observasi berdasarkan indikator karakter',
                    'Catatan tindak lanjut pendampingan',
                    'Informasi pendampingan hanya untuk pembina dan admin',
                ],
            },
            {
                icon: FileText,
                title: 'Laporan karakter',
                description:
                    'Rekap tes dan observasi dirangkum per periode. AI membantu menyusun draf narasi yang dapat ditinjau dan disempurnakan ustadz sebelum diterbitkan.',
                points: [
                    'Ringkasan perkembangan per santri',
                    'Narasi dan rekomendasi pembina',
                    'Laporan tersedia dalam format PDF',
                ],
            },
            {
                icon: Users,
                title: 'Pengelolaan & pemantauan',
                description:
                    'Admin menata akun, tahun ajaran, kelompok, dan data santri. Dashboard membantu pengguna berwenang melihat ringkasan aktivitas sesuai perannya.',
                points: [
                    'Akun dengan hak akses sesuai peran',
                    'Struktur kelompok dan tahun ajaran',
                    'Pemantauan hasil tes dan aktivitas',
                ],
            },
        ],
    },
];
function Features() {
    return (
        <div className="space-y-16">
            {FEATURE_GROUPS.map((group) => (
                <section key={group.label}>
                    <SectionHeading label={group.label} title={group.title} />
                    <div className="grid gap-5 md:grid-cols-2">
                        {group.items.map((item) => (
                            <DetailCard key={item.title} {...item}>
                                <Points items={item.points} />
                            </DetailCard>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
function Roles() {
    const roles = [
        {
            title: 'Santri',
            subtitle: 'Belajar, mencoba, dan membangun kebiasaan',
            image: 'student-boy.png',
            points: [
                'Belajar dari kisah dan materi Bioskop Teladan.',
                'Memilih tindakan dan menjelaskan alasan melalui teks atau suara.',
                'Berlatih di Simulasi Berani Menolak.',
                'Melihat Pohon Kebaikan, misi harian, dan hadiah.',
            ],
            note: 'Pengalaman dibuat ramah anak dengan dukungan audio dan umpan balik positif. Skor moral mentah dan indikator pendampingan tidak ditampilkan di portal santri.',
        },
        {
            title: 'Ustadz / Pembina',
            subtitle: 'Memahami konteks, mendampingi perkembangan',
            image: 'ustadz-mascot.png',
            points: [
                'Menyiapkan indikator, kasus dilema, paket tes, dan materi edukasi.',
                'Memeriksa transkripsi serta menyetujui atau menyesuaikan rekomendasi AI.',
                'Mencatat observasi dan meninjau hasil simulasi.',
                'Menindaklanjuti pendampingan dan menerbitkan laporan karakter.',
            ],
            note: 'Ustadz menghubungkan data dengan pemahaman terhadap santri. Hasil AI dan draf narasi menjadi bahan bantu yang perlu ditinjau.',
        },
        {
            title: 'Admin',
            subtitle: 'Menjaga pengelolaan tetap tertata',
            image: null,
            points: [
                'Mengelola akun pengguna dan hak akses.',
                'Menata tahun ajaran dan kelompok pembinaan.',
                'Mengelola data serta penempatan santri.',
                'Memantau hasil pengerjaan tes dan ringkasan sistem.',
            ],
            note: 'Akses pengelolaan membantu lembaga menjaga struktur akademik dan data pengguna agar kegiatan pembinaan dapat berjalan dengan tertib.',
        },
    ];

    return (
        <div className="space-y-7">
            {roles.map((role, i) => (
                <article
                    key={role.title}
                    className={`${card} grid gap-8 lg:grid-cols-[0.65fr_1.5fr]`}
                >
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-[#f1f5ec] p-6 text-center">
                        {role.image ? (
                            <img
                                src={`/images/dashboard/${role.image}`}
                                alt={`Ilustrasi ${role.title}`}
                                width="160"
                                height="160"
                                className="size-40 object-contain"
                            />
                        ) : (
                            <Users className="my-10 size-20 text-emerald-700" />
                        )}
                        <p className="mt-4 text-xs font-bold tracking-widest text-emerald-700 uppercase">
                            Peran 0{i + 1}
                        </p>
                        <h2 className="mt-2 text-2xl font-extrabold text-emerald-950">
                            {role.title}
                        </h2>
                    </div>
                    <div className="py-3">
                        <h3 className="text-xl font-extrabold text-emerald-950">
                            {role.subtitle}
                        </h3>
                        <Points items={role.points} />
                        <p
                            className={`mt-6 border-t border-slate-100 pt-5 ${body}`}
                        >
                            {role.note}
                        </p>
                    </div>
                </article>
            ))}
        </div>
    );
}
const STEPS = [
    {
        title: 'Pembina menyiapkan ruang belajar',
        text: 'Ustadz menyusun indikator karakter, cerita dilema, pilihan jawaban, paket tes, dan skenario simulasi. Paket kemudian ditujukan ke kelompok santri sesuai jadwal.',
        result: 'Konten dan kegiatan siap diakses santri.',
    },
    {
        title: 'Santri belajar dan menyampaikan alasan',
        text: 'Santri membaca atau mendengarkan cerita, menentukan pilihan, lalu menjelaskan alasannya. Materi teladan dan simulasi melengkapi latihan pengambilan keputusan.',
        result: 'Jawaban dan aktivitas belajar tercatat.',
    },
    {
        title: 'Sistem membantu mengolah jejak belajar',
        text: 'Rekaman suara ditranskripsikan. AI menganalisis penalaran dari jawaban untuk memberikan rekomendasi. Secara terpisah, aktivitas yang memperoleh reward menumbuhkan Pohon Kebaikan.',
        result: 'Bahan review tersedia, reward positif terkelola.',
    },
    {
        title: 'Ustadz meninjau dan mendampingi',
        text: 'Pembina memeriksa jawaban, audio, transkripsi, dan rekomendasi AI. Hasil dapat disetujui atau disesuaikan. Observasi harian melengkapi pemahaman dan tindak lanjut pendampingan.',
        result: 'Penilaian tervalidasi dan catatan pembinaan.',
    },
    {
        title: 'Perkembangan dirangkum menjadi laporan',
        text: 'Tes dan observasi direkap per periode. Ustadz menulis narasi atau menggunakan draf bantuan AI, meninjau isinya, lalu menerbitkan laporan yang dapat diunduh sebagai PDF.',
        result: 'Laporan perkembangan dengan arahan pembina.',
    },
];
function Workflow() {
    return (
        <section className="mx-auto max-w-4xl">
            <ol>
                {STEPS.map((step, i) => (
                    <li
                        key={step.title}
                        className="relative flex gap-5 pb-9 last:pb-0 sm:gap-8"
                    >
                        {i < STEPS.length - 1 && (
                            <span
                                aria-hidden="true"
                                className="absolute top-14 bottom-0 left-6 w-px bg-emerald-900/15"
                            />
                        )}
                        <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-emerald-900/15 bg-[#e9f0df] text-sm font-extrabold text-emerald-900">
                            0{i + 1}
                        </span>
                        <article className={`${card} w-full`}>
                            <h2 className="text-xl font-extrabold text-emerald-950">
                                {step.title}
                            </h2>
                            <p className={`mt-4 ${body}`}>{step.text}</p>
                            <p className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs leading-6 font-bold text-emerald-800">
                                <Check className="mt-1 size-4 shrink-0" />
                                {step.result}
                            </p>
                        </article>
                    </li>
                ))}
            </ol>
        </section>
    );
}
function Vision() {
    return (
        <>
            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl bg-emerald-950 p-8 text-white sm:p-10">
                    <Target className="mb-8 size-9 text-emerald-300" />
                    <p className="text-xs font-bold tracking-widest text-emerald-300 uppercase">
                        Visi Kami
                    </p>
                    <h2 className="mt-5 text-3xl leading-snug font-extrabold">
                        Menumbuhkan generasi berakhlak mulia yang berpikir
                        mandiri dan berani memilih kebaikan.
                    </h2>
                    <p className="mt-6 text-sm leading-7 text-emerald-100/80">
                        Adab menjadi fondasi. Setiap cerita, latihan, dan
                        catatan pembinaan membantu santri memahami alasan di
                        balik tindakan baik.
                    </p>
                </div>
                <div className={card}>
                    <h2 className="text-2xl font-extrabold text-emerald-950">
                        Misi yang kami jalankan
                    </h2>
                    <Points
                        items={[
                            'Menghadirkan pengalaman belajar akhlak yang menyenangkan, mudah diakses, dan bermakna.',
                            'Melatih penalaran moral melalui dilema serta simulasi situasi sehari-hari.',
                            'Mendukung pendampingan personal melalui asesmen tervalidasi dan observasi keseharian.',
                            'Membantu pembina menyampaikan perkembangan kepada orang tua melalui laporan yang jelas.',
                            'Memanfaatkan AI sebagai alat bantu dengan keputusan akhir tetap berada pada pembina.',
                        ]}
                    />
                </div>
            </section>
            <section className="pt-16">
                <SectionHeading
                    label="Nilai yang Menuntun"
                    title="Kebiasaan baik, dibangun setiap hari."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                        {
                            title: 'Adab',
                            text: 'Menghormati orang lain dalam sikap dan tutur kata.',
                        },
                        {
                            title: 'Kejujuran',
                            text: 'Berani berkata dan bertindak sesuai kenyataan.',
                        },
                        {
                            title: 'Keberanian',
                            text: 'Memilih yang baik, termasuk saat ada tekanan teman.',
                        },
                        {
                            title: 'Kasih sayang',
                            text: 'Memahami perasaan dan peduli terhadap sesama.',
                        },
                        {
                            title: 'Tanggung jawab',
                            text: 'Memahami konsekuensi dan menuntaskan kewajiban.',
                        },
                    ].map((value, i) => (
                        <article
                            key={value.title}
                            className="rounded-2xl border border-emerald-900/10 bg-white p-5"
                        >
                            <span className="text-xs font-bold text-emerald-600">
                                0{i + 1}
                            </span>
                            <h3 className="mt-5 font-extrabold text-emerald-950">
                                {value.title}
                            </h3>
                            <p className="mt-3 text-xs leading-6 text-slate-500">
                                {value.text}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
function Technology() {
    return (
        <>
            <section>
                <SectionHeading
                    label="Bantuan yang Bermakna"
                    title="AI hadir di bagian yang membantu pembinaan."
                >
                    Integrasi AI dan suara digunakan untuk mengurangi pekerjaan
                    pengolahan, sehingga pembina memiliki bahan yang lebih
                    terstruktur untuk ditinjau.
                </SectionHeading>
                <div className="grid gap-5 md:grid-cols-2">
                    <DetailCard
                        icon={Mic}
                        title="Suara menjadi teks"
                        description="Santri dapat menjelaskan alasan lewat rekaman suara. Integrasi speech-to-text menggunakan Groq Whisper membantu mengubahnya menjadi transkripsi untuk ditinjau ustadz."
                    >
                        <Points
                            items={[
                                'Mendukung santri yang belum nyaman mengetik.',
                                'Pembina dapat mendengarkan audio dan memperbaiki transkripsi.',
                            ]}
                        />
                    </DetailCard>
                    <DetailCard
                        icon={BrainCircuit}
                        title="Analisis penalaran moral"
                        description="Integrasi Google Gemini membaca konteks cerita, pilihan, dan alasan jawaban untuk memberikan rekomendasi penalaran moral serta indikator karakter."
                    >
                        <Points
                            items={[
                                'Ringkasan alasan dan tingkat keyakinan membantu review.',
                                'Ustadz dapat menyetujui atau mengubah rekomendasi dengan catatan.',
                            ]}
                        />
                    </DetailCard>
                    <DetailCard
                        icon={FileText}
                        title="Draf narasi perkembangan"
                        description="AI membantu merangkai rekap tes dan observasi menjadi draf narasi laporan. Pembina meninjau, menyunting, dan mengonfirmasi isi sebelum penerbitan."
                    >
                        <Points
                            items={[
                                'Narasi awal dibantu Google Gemini.',
                                'Laporan final mengikuti hasil review pembina.',
                            ]}
                        />
                    </DetailCard>
                    <DetailCard
                        icon={AudioLines}
                        title="Cerita yang dapat didengarkan"
                        description="Dukungan text-to-speech mengubah teks cerita menjadi audio bahasa Indonesia melalui integrasi MMS TTS, dengan dukungan pembacaan browser sebagai cadangan."
                    >
                        <Points
                            items={[
                                'Membantu santri mengikuti cerita melalui suara.',
                                'Audio cerita dapat digunakan kembali saat belajar.',
                            ]}
                        />
                    </DetailCard>
                </div>
                <p className="mt-5 text-xs leading-6 text-slate-500">
                    Ketersediaan layanan AI dan suara mengikuti konfigurasi
                    serta kesiapan layanan pada instalasi aplikasi.
                </p>
            </section>
            <section className="mt-16 rounded-[2rem] border border-emerald-900/10 bg-[#edf3e5] p-7 sm:p-10">
                <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
                    <div>
                        <ShieldCheck className="mb-5 size-9 text-emerald-700" />
                        <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950">
                            AI memberi rekomendasi.
                            <br />
                            Ustadz menentukan hasil.
                        </h2>
                        <p className={`mt-5 ${body}`}>
                            Penilaian karakter membutuhkan konteks dan kedekatan
                            dengan santri. Karena itu, hasil analisis AI
                            diperiksa oleh pembina sebelum digunakan sebagai
                            penilaian final.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white p-6">
                        <h3 className="font-extrabold text-emerald-950">
                            Prinsip penggunaan AI kami
                        </h3>
                        <Points
                            items={[
                                'Pembina dapat memeriksa jawaban, audio, transkripsi, dan hasil AI bersama-sama.',
                                'Rekomendasi AI dapat dikoreksi; alasan perubahan penilaian dicatat.',
                                'Draf narasi laporan ditinjau sebelum diterbitkan.',
                                'Sistem mendukung pembinaan, bukan diagnosis psikologis atau pelabelan permanen anak.',
                            ]}
                        />
                    </div>
                </div>
            </section>
            <section className="pt-16">
                <SectionHeading
                    label="Dari Jawaban ke Pendampingan"
                    title="Alur sederhana, dengan manusia di dalamnya."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        'Santri memberi alasan',
                        'Suara ditranskripsikan jika digunakan',
                        'AI memberi rekomendasi',
                        'Ustadz meninjau dan memvalidasi',
                    ].map((text, i) => (
                        <div key={text} className={card}>
                            <span className="text-sm font-bold text-emerald-600">
                                0{i + 1}
                            </span>
                            <h3 className="mt-4 text-base font-extrabold text-emerald-950">
                                {text}
                            </h3>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
export default function About({
    section = 'informasi',
}: {
    section?: Section;
}) {
    const content = CONTENT[section];
    const isHome = section === 'informasi';

    return (
        <>
            <Head title={isHome ? 'Tentang TeladanKu' : content.label}>
                <meta name="description" content={content.description} />
            </Head>
            <section
                className={`grid items-center gap-10 py-12 sm:py-16 lg:py-20 ${isHome ? 'lg:grid-cols-[1.1fr_1fr]' : 'max-w-4xl'}`}
            >
                <div>
                    <Label>{content.label}</Label>
                    <h1 className="text-4xl leading-[1.13] font-extrabold tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
                        {isHome ? (
                            <>
                                Kebaikan kecil hari ini.
                                <br />
                                <span className="text-emerald-600">
                                    Karakter kuat
                                </span>{' '}
                                esok hari.
                            </>
                        ) : (
                            content.title
                        )}
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-slate-500">
                        {content.description}
                    </p>
                    {isHome && (
                        <>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/about/fitur"
                                    className="inline-flex items-center gap-3 rounded-full bg-emerald-900 px-6 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-emerald-800"
                                >
                                    Jelajahi fitur{' '}
                                    <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    href="/about/alur"
                                    className="inline-flex items-center gap-3 rounded-full border border-emerald-900/20 px-6 py-3.5 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50"
                                >
                                    Cara kerja TeladanKu
                                </Link>
                            </div>
                            <p className="mt-7 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                                <Sparkles className="size-4" /> Belajar baik,
                                hati makin baik.
                            </p>
                        </>
                    )}
                </div>
                {isHome && <GrowthVisual />}
            </section>
            {section === 'informasi' && <Information />}
            {section === 'fitur' && <Features />}
            {section === 'peran' && <Roles />}
            {section === 'alur' && <Workflow />}
            {section === 'visi-misi' && <Vision />}
            {section === 'ai' && <Technology />}
            <section className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-emerald-900/10 pt-10 sm:flex-row sm:items-center">
                <div>
                    <p className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
                        Tumbuh Bersama TeladanKu
                    </p>
                    <h2 className="mt-3 text-2xl font-extrabold text-emerald-950">
                        Mulai langkah baik berikutnya.
                    </h2>
                </div>
                <Link
                    href={isHome ? '/login' : '/about'}
                    className="inline-flex items-center gap-3 rounded-full bg-emerald-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-800"
                >
                    {isHome ? 'Masuk ke aplikasi' : 'Kembali ke informasi'}
                    <ArrowRight className="size-4" />
                </Link>
            </section>
        </>
    );
}
