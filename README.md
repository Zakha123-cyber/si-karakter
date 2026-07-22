# SI-KARAKTER

SI-KARAKTER adalah Sistem Informasi Karakter Terpadu Santri untuk asesmen, observasi, validasi ustadz, gamifikasi positif, dan pelaporan perkembangan karakter santri.

Dokumen perencanaan utama ada di [docs/README.md](docs/README.md). Baca dokumen tersebut sebelum mengerjakan task pengembangan.

## Tech Stack

- Backend: Laravel
- Frontend: React + Vite
- Database: MySQL
- Queue: Laravel database queue
- Storage: Laravel local filesystem

## Setup Lokal

1. Pastikan PHP, Composer, Node.js, npm, dan MySQL sudah tersedia.
2. Salin `.env.example` menjadi `.env`.
3. Buat database MySQL bernama `si_karakter`.
4. Sesuaikan kredensial database pada `.env`.
5. Jalankan perintah berikut setelah dependency tersedia:

```bash
composer install
npm install
php artisan key:generate
php artisan migrate
npm run build
```

6. Jalankan development server:

```bash
composer run dev
```

Jika dependency sudah terpasang, perintah utama untuk validasi adalah:

```bash
composer test
npm run types:check
npm run lint:check
```

## Catatan Pengembangan

- Jangan menyimpan file audio, gambar, video, atau PDF sebagai BLOB di database.
- Gunakan private storage dan endpoint terotorisasi untuk file sensitif.
- Gunakan service abstraction untuk integrasi AI dan speech-to-text.
- Hasil AI adalah rekomendasi dan wajib divalidasi ustadz sebelum menjadi hasil final.
