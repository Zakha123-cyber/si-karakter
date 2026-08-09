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

## D-019 - Character Indicator and Scoring Configuration Ownership

- Date: 2026-07-28
- Status: Accepted
- Context: `01-PROJECT-CONTEXT.md` semula menempatkan "mengelola indikator dan bobot penilaian" sebagai tanggung jawab Admin, dan implementasi awal (Phase 3) menaruh CRUD Character Indicators di bawah role Admin (`/admin/character-indicators`). Ustadz adalah pengguna yang benar-benar memakai indikator karakter untuk observasi dan validasi asesmen, sehingga kepemilikan di Admin dinilai salah tempat.
- Decision: CRUD Character Indicators dan konfigurasi bobot penilaian (test/observation weight, Phase 10) dipindahkan menjadi kewenangan Ustadz, bukan Admin. Route web pindah dari `/admin/character-indicators` ke `/teacher/character-indicators`, endpoint API pindah dari grup middleware `role:admin` ke `role:teacher`.
- Consequences: `01-PROJECT-CONTEXT.md`, `05-API-CONTRACT.md`, `07-UI-UX-GUIDELINES.md`, dan `12-TO-DO-LIST.md` diperbarui. Controller, halaman React, sidebar nav, dan test terkait dipindahkan dari namespace/direktori Admin ke Teacher.
- Approved By: User

## D-020 — Backend Audit 2026-08-05 dan Perbaikan Aman

- Date: 2026-08-05
- Status: Accepted
- Context: Audit menyeluruh backend (struktur, DB, API, role-permission, integrasi, keamanan, performa, test). Baseline: 254 test pass, Pint pass, PHPStan 0 error.
- Temuan utama (dilaporkan, tidak diubah tanpa persetujuan):
  - Scoring pipeline tidak terhubung: `CharacterScoreSnapshotService::generateForStudent`, `TestScoreCalculator::calculateAttempt`, `ScoreAdjustmentService` tidak pernah dipanggil controller/command/job mana pun.
  - Status `test_attempts` tidak pernah transisi ke `completed`; `completed_at` diisi saat submit.
  - Frontend SPA tidak memakai endpoint `/api/v1/*` (duplikasi controller web vs API).
  - UI review memakai label Kohlberg ("Tahap 1-6") sedangkan domain scoring hanya mengenal `pre_conventional|conventional|post_conventional`.
- Perbaikan aman yang diterapkan (backward compatible):
  - BUG-1: Hapus blok validasi duplikat `submitted` di `Student\TestController::storeAnswer`.
  - BUG-2: `is_active` kasus/opsi moral dipertahankan saat update bila field tidak dikirim.
  - BUG-3: `is_active` konfigurasi bobot dipertahankan saat update (web + API).
  - BUG-4: Validasi kepemilikan `selected_option_id` terhadap `moral_case_id` pada penyimpanan jawaban.
  - BUG-5: Guard hapus santri — tolak jika ada riwayat tes/observasi/reward/warning (hindari 500 FK); relasi baru ditambahkan di model Student.
  - BUG-6: `TestReviewSeeder` diselaraskan (gender `male/female`, key `category`, `internal_value` kanonikal).
  - BUG-7: Rate limit `throttle:5,1` pada `POST /api/v1/auth/login`.
  - BUG-8: Middleware `role`/`active` mengembalikan JSON hanya untuk route `/api/*`, `abort(403)` untuk web.
  - BUG-9: Sanitasi nama file pada header `Content-Disposition` (3 endpoint audio).
  - BUG-10: Cap `per_page` API maksimal 100.
  - Konsistensi domain: `TestScoreCalculator::LEVEL_SCORES` kini mengakui label Kohlberg (Tahap 1-2→0, 3-4→50, 5-6→100) selain level kanonikal.
  - Factory baru: `MoralCaseOptionFactory`, `TeacherValidationFactory`; trait `HasFactory` ditambahkan ke model `TeacherValidation`.
  - Test regresi baru: `tests/Feature/Audit/BackendAuditFixesTest.php` (11 test).
- Consequences: Total test 265, semuanya hijau; Pint & PHPStan lulus. Item rekomendasi (wiring scoring, transisi status attempt, refactor duplikasi web/API, guard self-lockout admin, revoke sesi saat ganti password) menunggu persetujuan sebelum dikerjakan.
- Approved By: Implementation

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
