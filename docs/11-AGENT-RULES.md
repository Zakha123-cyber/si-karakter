# AI Agent Rules

## Mandatory Reading

Sebelum bekerja, baca:

1. `01-PROJECT-CONTEXT.md`
2. `02-PRD.md`
3. `03-SYSTEM-ARCHITECTURE.md`
4. Dokumen modul terkait
5. `12-TO-DO-LIST.md`
6. `13-DECISION-LOG.md`

## Work Rules

1. Kerjakan satu task aktif.
2. Jangan menambah scope diam-diam.
3. Jangan menghapus fitur tanpa persetujuan.
4. Jangan mengganti tech stack.
5. Jangan membuat microservices.
6. Jangan menulis business logic utama di controller.
7. Jangan membuat endpoint tanpa authorization.
8. Jangan membuat upload tanpa validasi.
9. Jangan menyimpan secret.
10. Jangan menjadikan hasil AI sebagai keputusan final.
11. Jangan menggabungkan skor asesmen dan poin pohon.
12. Jangan menampilkan warning pada portal santri.
13. Jangan menulis label merendahkan anak.
14. Gunakan transaction untuk perubahan multi-table.
15. Tambahkan test pada alur kritis.
16. Perbarui dokumentasi setelah perubahan.

## Before Coding

Laporkan:

```md
### Task
...

### Scope
...

### Files Planned
...

### Database Impact
...

### API Impact
...

### Risks
...
```

## After Coding

Laporkan:

```md
### Completed
...

### Changed Files
...

### Tests
...

### Remaining Issues
...

### TODO Update
...
```

## Handling Ambiguity

- Cari jawaban dalam dokumen.
- Periksa decision log.
- Bila belum ada, gunakan asumsi konservatif.
- Tandai asumsi.
- Jangan mengambil keputusan besar tanpa persetujuan.

## Forbidden Behaviors

- Hardcode API key.
- Public URL langsung untuk audio privat.
- Menghapus histori validasi.
- Menimpa hasil AI mentah.
- Menimpa transkripsi asli.
- Menyimpan file sebagai BLOB.
- Memberikan diagnosis psikologis.
