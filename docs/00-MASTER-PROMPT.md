# Master Prompt Pengembangan SI-KARAKTER

Anda adalah AI coding agent yang membantu mengembangkan **SI-KARAKTER — Sistem Informasi Karakter Terpadu Santri**.

## Tujuan

Bangun aplikasi web untuk satu lembaga yang mendukung:

- manajemen akun admin, ustadz, dan santri;
- manajemen tahun ajaran, kelas/kelompok, dan data santri;
- tes dilema moral interaktif;
- rekaman jawaban suara santri;
- speech-to-text;
- klasifikasi alasan santri menggunakan LLM;
- validasi hasil klasifikasi oleh ustadz;
- jurnal observasi harian;
- skor gabungan hasil tes dan observasi;
- early warning untuk ustadz;
- Pohon Kebaikan sebagai gamifikasi;
- CRUD konten Bioskop Teladan;
- simulasi berani menolak berbasis skenario;
- dashboard analitik;
- rapor karakter dan ekspor PDF.

## Tech Stack Wajib

- Laravel sebagai backend dan API.
- React melalui Vite sebagai frontend.
- MySQL sebagai database.
- Laravel Filesystem dengan local storage.
- Integrasi LLM dan speech-to-text melalui service abstraction.

## Arsitektur

Gunakan **modular monolith**.

Modul utama:

```text
Authentication
User Management
Academic Structure
Student Management
Moral Test
Test Attempt
Audio Recording
Speech-to-Text
LLM Assessment
Teacher Validation
Daily Observation
Character Scoring
Early Warning
Goodness Tree
Educational Content
Assertiveness Simulation
Analytics
Reports
System Settings
Audit Log
```

## Aturan Penting

1. Jangan menggunakan microservices.
2. Jangan menyimpan file audio, video, gambar, atau PDF sebagai BLOB di MySQL.
3. Simpan metadata dan path file di database.
4. Pilihan jawaban tes harus dinamis.
5. Soal tes harus dapat dikelola melalui CRUD.
6. Satu paket tes dapat memiliki banyak kasus.
7. Paket tes memiliki periode aktif dan target kelas/kelompok.
8. Hasil AI selalu berstatus rekomendasi sebelum dikonfirmasi ustadz.
9. Simpan hasil mentah AI untuk audit.
10. Simpan hasil final yang telah divalidasi ustadz secara terpisah.
11. Rekaman audio dan transkripsi harus dapat diakses ustadz.
12. Portal santri hanya menampilkan motivasi dan perkembangan positif.
13. Label level moral dan early warning hanya boleh dilihat pihak berwenang.
14. Bobot awal penilaian:
    - Tes: 60%
    - Observasi: 40%
15. Bobot harus dapat dikonfigurasi.
16. Sistem hanya digunakan oleh satu lembaga.
17. Sistem tetap memiliki tahun ajaran dan kelas/kelompok.
18. Gunakan authorization berbasis role dan policy.
19. Catat perubahan penting dalam audit log.
20. Setiap fitur harus memiliki test minimal untuk alur kritis.

## Cara Bekerja

Sebelum menulis kode:

1. Baca seluruh dokumen proyek.
2. Identifikasi task aktif di `12-TO-DO-LIST.md`.
3. Periksa dependensi task.
4. Jelaskan file yang akan dibuat atau diubah.
5. Jangan mengubah scope tanpa persetujuan.
6. Kerjakan satu modul secara bertahap.
7. Jalankan test.
8. Perbarui `12-TO-DO-LIST.md`.
9. Catat keputusan baru di `13-DECISION-LOG.md`.

## Format Laporan Setelah Menyelesaikan Task

```md
## Task Selesai

### Task
Nama task.

### Perubahan
- File yang dibuat.
- File yang diubah.
- Migration yang ditambahkan.
- Endpoint yang ditambahkan.

### Validasi
- Test yang dijalankan.
- Hasil test.
- Pemeriksaan manual.

### Catatan
- Risiko.
- Asumsi.
- Pekerjaan lanjutan.

### Update TODO
- Checkbox yang diperbarui.
```
