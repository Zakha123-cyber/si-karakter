# Security and Privacy

## 1. Sensitive Context

Sistem menyimpan data anak, suara, penilaian karakter, observasi, dan laporan. Data ini harus diperlakukan sebagai data terbatas.

## 2. Authentication

- Password di-hash.
- PIN juga di-hash.
- Rate limit login.
- Session regeneration setelah login.
- Logout menghapus session.
- Akun dapat dinonaktifkan.
- Reset credential oleh admin.

## 3. Authorization

- Gunakan Policy atau Gate Laravel.
- Ustadz hanya mengakses santri yang menjadi kewenangannya.
- Santri hanya mengakses data sendiri.
- File audio dan rapor tidak boleh memiliki public URL permanen.
- Semua download melalui controller terotorisasi.

## 4. Upload Security

- Validasi MIME.
- Validasi ekstensi.
- Batasi ukuran.
- Batasi durasi audio.
- Gunakan nama file acak.
- Jangan percaya nama file asli.
- Simpan di private disk.
- Pertimbangkan antivirus scanning saat deployment produksi.

## 5. AI Privacy

- Kirim data minimum.
- Hindari nama lengkap dalam prompt.
- Jangan kirim data lain yang tidak relevan.
- Catat provider yang digunakan.
- Dokumentasikan kebijakan retensi provider.
- Sediakan mekanisme menghapus data sesuai kebijakan lembaga.

## 6. Audit

Wajib mencatat:

- override hasil AI;
- perubahan transkripsi;
- perubahan skor;
- publikasi laporan;
- perubahan rule warning;
- perubahan konfigurasi bobot;
- akses administratif penting.

## 7. Backup

- Backup database.
- Backup storage.
- Jadwal backup.
- Retensi.
- Uji restore.
- Lindungi backup dari akses publik.

## 8. Language Safety

Gunakan:

- “membutuhkan pendampingan”;
- “perlu penguatan indikator”;
- “hasil sementara”;
- “rekomendasi sistem”.

Hindari:

- “anak bermasalah”;
- “calon pencuri”;
- “rawan amoral” pada tampilan operasional;
- label permanen yang merendahkan.
