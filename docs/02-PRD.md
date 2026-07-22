# Product Requirements Document

## 1. Product Vision

Menyediakan sistem terpadu untuk asesmen karakter santri, pemantauan perilaku, rekomendasi intervensi, dan pelaporan perkembangan yang mudah digunakan oleh santri dan ustadz.

## 2. Product Goals

- Mendigitalisasi tes dilema moral.
- Mengurangi hambatan mengetik melalui rekaman suara.
- Membantu ustadz mengklasifikasikan alasan santri.
- Menjaga keputusan akhir tetap berada pada ustadz.
- Menggabungkan asesmen dan observasi.
- Menyediakan visualisasi perkembangan yang ramah anak.
- Menyediakan laporan yang mudah dipahami orang tua.

## 3. Non-Goals Fase Awal

- Multi-lembaga.
- WhatsApp Business API.
- Diagnosis psikologis.
- Mode offline penuh.
- Game 3D atau game kompleks.
- Penilaian AI tanpa validasi manusia.
- Penyimpanan file di cloud sebagai default.

## 4. Functional Requirements

### FR-01 Authentication

- Admin, ustadz, dan santri dapat login.
- Santri dapat menggunakan password atau PIN.
- Akun dapat dinonaktifkan.
- Admin dapat reset kredensial.

### FR-02 Academic Structure

- CRUD tahun ajaran.
- CRUD kelas/kelompok.
- Menentukan ustadz pendamping.
- Menempatkan santri ke kelompok.

### FR-03 Student Management

- CRUD data santri.
- Identitas minimal: nama, username, tanggal lahir opsional, jenis kelamin opsional, kelompok, status.
- Riwayat perpindahan kelompok sebaiknya dapat dilacak.

### FR-04 Test Package

- CRUD paket tes.
- Paket memiliki judul, deskripsi, periode aktif, target kelompok, status, dan jumlah percobaan.
- Paket dapat dipublikasikan atau dinonaktifkan.

### FR-05 Moral Dilemma Cases

- CRUD kasus.
- Kasus memiliki cerita, media, audio, urutan, indikator, dan pilihan dinamis.
- Pilihan tidak dibatasi A/B.
- Setiap pilihan dapat memiliki label internal.

### FR-06 Test Attempt

- Santri hanya mengerjakan paket aktif yang ditujukan kepadanya.
- Sistem menyimpan waktu mulai, selesai, status, dan attempt ke berapa.
- Jawaban tersimpan otomatis.
- Santri dapat memberikan alasan melalui teks atau suara.

### FR-07 Audio Recording

- Rekaman dapat dimulai, dihentikan, diputar ulang, dan diunggah.
- Validasi format, ukuran, dan durasi.
- Rekaman dapat diputar oleh ustadz.

### FR-08 Speech-to-Text

- Rekaman diproses menjadi transkripsi.
- Status proses: pending, processing, completed, failed.
- Transkripsi dapat diperbaiki oleh ustadz tanpa menghapus hasil asli.

### FR-09 LLM Assessment

- LLM menerima cerita, pilihan, jawaban, transkripsi, rubrik, dan indikator.
- Output harus terstruktur.
- Simpan confidence, reasoning summary, warning signals, dan rekomendasi.
- Kegagalan API dapat diulang.

### FR-10 Teacher Validation

- Ustadz melihat audio, transkripsi, hasil LLM, dan konteks soal.
- Ustadz dapat menyetujui atau mengubah level.
- Ustadz dapat mengubah indikator.
- Ustadz wajib memberikan catatan jika override.
- Status: pending_review, approved, overridden.

### FR-11 Daily Observation

- Ustadz dapat memilih santri.
- Memilih indikator perilaku.
- Menambahkan status positif/negatif/netral.
- Menentukan poin reward.
- Menambahkan catatan.
- Menentukan tanggal observasi.

### FR-12 Character Scoring

- Skor gabungan awal:
  - Tes 60%.
  - Observasi 40%.
- Bobot dapat dikonfigurasi.
- Ustadz dapat melakukan final adjustment dengan alasan.
- Skor asesmen dan poin gamifikasi dipisahkan.

### FR-13 Early Warning

- Sistem mendeteksi kombinasi indikator dummy yang bernilai negatif.
- Hanya admin dan ustadz yang dapat melihat.
- Gunakan bahasa “membutuhkan pendampingan”.
- Ustadz dapat menandai warning sebagai reviewed.

### FR-14 Goodness Tree

- Poin positif menumbuhkan pohon virtual.
- Level pohon berdasarkan threshold poin.
- Santri hanya melihat representasi positif.
- Tidak mengurangi martabat anak saat poin rendah.

### FR-15 Educational Content

- CRUD video, komik, gambar, audio, dan cerita.
- Materi memiliki kategori indikator.
- Materi dapat direkomendasikan berdasarkan hasil asesmen.
- Santri dapat memberikan respons emotikon.

### FR-16 Assertiveness Simulation

- CRUD skenario percakapan.
- Pilihan respons dinamis.
- Setiap respons dapat memiliki feedback.
- Reward bintang untuk respons yang tepat.

### FR-17 Analytics Dashboard

- Distribusi level moral.
- Tren perkembangan.
- Ringkasan observasi.
- Daftar pending validation.
- Daftar warning.
- Filter periode, kelompok, dan santri.

### FR-18 Character Report

- Pilih santri dan periode.
- Rekap tes.
- Rekap observasi.
- Narasi perkembangan.
- Catatan dan rekomendasi ustadz.
- Draft narasi dapat dibantu LLM.
- Ustadz harus mengonfirmasi sebelum PDF dibuat.
- Ekspor PDF.

### FR-19 Audit Log

- Catat login penting.
- Catat perubahan penilaian.
- Catat override LLM.
- Catat perubahan konfigurasi bobot.
- Catat publikasi tes dan laporan.

## 5. Non-Functional Requirements

- Responsif pada komputer, tablet, dan ponsel.
- Antarmuka santri ramah anak.
- API memiliki validasi.
- Authorization diterapkan pada server.
- File upload aman.
- Proses AI tidak memblokir request utama.
- Dukungan retry.
- Database memiliki index pada kolom pencarian utama.
- Backup data dan file direncanakan.
- Logging error tersedia.
