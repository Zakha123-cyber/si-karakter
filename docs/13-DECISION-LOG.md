# Decision Log

Gunakan dokumen ini untuk mencatat keputusan produk dan teknis.

## D-001 — Technology Stack

- Status: Accepted
- Decision:
  - Laravel
  - React + Vite
  - MySQL
- Reason: Sesuai kemampuan tim dan kebutuhan aplikasi CRUD, dashboard, AI integration, serta reporting.

## D-002 — Architecture

- Status: Accepted
- Decision: Modular monolith.
- Reason: Sistem digunakan oleh satu lembaga dan belum membutuhkan kompleksitas microservices.

## D-003 — Roles

- Status: Accepted
- Decision:
  - Admin
  - Ustadz
  - Santri

## D-004 — Student Authentication

- Status: Accepted
- Decision: Username dengan password atau PIN.

## D-005 — Institution Scope

- Status: Accepted
- Decision: Single institution.

## D-006 — Academic Structure

- Status: Accepted
- Decision:
  - Tahun ajaran
  - Kelas/kelompok
  - Ustadz pendamping
  - Santri

## D-007 — Test Structure

- Status: Accepted
- Decision:
  - Paket tes
  - Banyak kasus
  - Pilihan dinamis
  - Periode aktif
  - Target kelompok
  - Attempt limit

## D-008 — AI Assessment

- Status: Accepted
- Decision: LLM memberikan rekomendasi terstruktur dan harus divalidasi ustadz.

## D-009 — Speech-to-Text

- Status: Accepted
- Decision:
  - Audio diproses menjadi teks.
  - Audio asli tetap disimpan.
  - Ustadz dapat mendengar audio dan memeriksa transkripsi.

## D-010 — File Storage

- Status: Accepted
- Decision: Local storage server melalui Laravel Filesystem.

## D-011 — Scoring

- Status: Initial
- Decision:
  - Tes 60%.
  - Observasi 40%.
  - Bobot dapat dikonfigurasi.
  - Ustadz dapat melakukan adjustment dengan alasan.

## D-012 — Goodness Tree

- Status: Accepted
- Decision: Poin gamifikasi dipisahkan dari skor asesmen karakter.

## D-013 — Early Warning

- Status: Initial
- Decision:
  - Menggunakan indikator dummy pada fase awal.
  - Hanya tampil kepada admin/ustadz.
  - Bahasa harus berorientasi pendampingan.

## D-014 — WhatsApp

- Status: Deferred
- Decision: Tidak ada integrasi otomatis pada fase awal. Ustadz mengirim laporan secara manual.

## D-015 — Reports

- Status: Accepted
- Decision:
  - Rentang periode fleksibel.
  - Narasi dapat dibantu LLM.
  - Ustadz wajib mengonfirmasi sebelum PDF diterbitkan.

## D-016 - Documentation Directory

- Date: 2026-07-22
- Status: Accepted
- Context: Root project akan diisi Laravel skeleton sehingga dokumen perencanaan berisiko tertimpa.
- Decision: Semua dokumen perencanaan project disimpan di folder `docs/`.
- Consequences: AI agent dan developer membaca dokumen acuan dari `docs/`. README utama di root akan dibuat ulang setelah Laravel skeleton tersedia.
- Approved By: User

## D-017 - Phase 1 Session API Authentication

- Date: 2026-07-22
- Status: Accepted
- Context: Project menggunakan Laravel starter kit dengan session-based authentication, sementara API contract membutuhkan endpoint `/api/v1/auth/*`.
- Decision: Endpoint auth fase awal menggunakan session Laravel pada route `/api/v1`, login memakai `username` dan menerima password untuk semua role atau PIN untuk santri yang `pin_enabled`.
- Consequences: API dapat dipakai frontend monolith tanpa token package tambahan. Akun nonaktif ditolak saat login dan saat mengakses endpoint terproteksi.
- Approved By: Implementation

## D-018 — Phase 2 Academic Structure Implementation

- Date: 2026-07-28
- Status: Accepted
- Context: Phase 2 requires CRUD for academic years, groups, students, and their relationships (assign ustadz to group, assign students to group, group history timeline).
- Decision:
  - AcademicYearController handles CRUD + activate endpoint that deactivates other active years.
  - GroupController handles CRUD + assignStudents (POST with student_ids array) + removeStudent (DELETE).
  - StudentController handles CRUD (no destroy) + updateStatus + timeline (group history).
  - All endpoints placed under admin role middleware.
  - Group assignment automatically creates GroupStudentHistory records and updates current_group_id.
- Consequences: API contract for Phase 2 is fully implemented. Tests cover all CRUD and assignment flows.

## Template Decision Baru

```md
## D-XXX — Judul

- Date:
- Status: Proposed / Accepted / Rejected / Deferred
- Context:
- Decision:
- Consequences:
- Approved By:
```
