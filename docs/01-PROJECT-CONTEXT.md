# Project Context

## Nama Sistem

**SI-KARAKTER — Sistem Informasi Karakter Terpadu Santri**

## Latar Belakang

Sistem dikembangkan untuk mendukung kegiatan penguatan kapasitas adaptif remaja dan santri dalam menghadapi era digital. Fokus aplikasi berada pada pemantauan dan penguatan karakter santri usia 6–10 tahun melalui asesmen dilema moral, observasi perilaku, intervensi edukatif, serta pelaporan perkembangan.

## Sasaran Pengguna

### Admin

- Mengelola akun.
- Mengelola tahun ajaran.
- Mengelola kelas/kelompok.
- Mengelola pengaturan sistem.
- Mengelola paket tes dan konten.
- Melihat data global.
- Mengelola indikator dan bobot penilaian.

### Ustadz/Pengelola

- Melihat santri pada kelompok yang dikelola.
- Mengisi jurnal observasi.
- Mendengarkan rekaman suara.
- Memeriksa transkripsi.
- Memeriksa hasil klasifikasi LLM.
- Mengonfirmasi atau mengubah penilaian.
- Melihat dashboard.
- Melihat early warning.
- Membuat rapor karakter.

### Santri

- Login menggunakan username dan password/PIN.
- Mengerjakan tes interaktif.
- Memberikan jawaban melalui pilihan dinamis.
- Menjelaskan alasan melalui teks atau suara.
- Mengakses Bioskop Teladan.
- Mengikuti Simulasi Berani Menolak.
- Melihat Pohon Kebaikan.
- Melihat reward positif.

## Konsep Penilaian Moral

### Pra-Konvensional

Anak melakukan tindakan baik karena takut terhadap hukuman atau konsekuensi langsung.

### Konvensional

Anak melakukan tindakan berdasarkan penerimaan sosial, pujian, atau tekanan teman sebaya.

### Pasca-Konvensional

Anak memahami nilai seperti empati, kejujuran, tanggung jawab, hak orang lain, dan nilai universal.

## Prinsip Human-in-the-Loop

LLM hanya memberikan rekomendasi:

```text
Jawaban santri
↓
Transkripsi
↓
Klasifikasi LLM
↓
Rekomendasi level, indikator, dan confidence
↓
Validasi ustadz
↓
Penilaian final
```

## Ruang Lingkup Awal

- Satu lembaga.
- Tiga role.
- Penyimpanan file lokal.
- Tes dinamis.
- Speech-to-text.
- LLM classifier.
- Validasi manusia.
- Observasi harian.
- Dashboard.
- Early warning awal menggunakan indikator dummy.
- Rapor PDF.
- Tidak ada integrasi WhatsApp otomatis pada fase awal.

## Batasan

- Sistem bukan alat diagnosis psikologis.
- Hasil AI tidak boleh menjadi keputusan final.
- Early warning adalah indikator pendampingan, bukan label permanen.
- Sistem tidak mengirim rapor melalui WhatsApp secara otomatis.
- Konten edukasi dibuat oleh tim pengembang dan dikelola melalui CRUD.
