# SI-KARAKTER Development To-Do List

Status:

- `[ ]` belum dikerjakan
- `[-]` sedang dikerjakan
- `[x]` selesai
- `[!]` terblokir

## Phase 0 — Project Initialization

- [x] Buat repository.
- [x] Inisialisasi Laravel.
- [x] Konfigurasi React + Vite.
- [x] Konfigurasi MySQL.
- [x] Konfigurasi formatter dan linter.
- [x] Buat `.env.example`.
- [x] Konfigurasi test environment.
- [x] Konfigurasi queue database.
- [x] Buat struktur modular awal.
- [x] Tambahkan README setup lokal.

## Phase 1 — Authentication and User Management

- [ ] Buat enum role.
- [ ] Buat migration users.
- [ ] Implement login.
- [ ] Implement logout.
- [ ] Implement current user endpoint.
- [ ] Implement authorization middleware.
- [ ] CRUD user.
- [ ] Aktivasi/nonaktifkan akun.
- [ ] Reset password/PIN.
- [ ] Test authentication.
- [ ] Test authorization.

## Phase 2 — Academic Structure

- [ ] Migration academic years.
- [ ] Migration groups.
- [ ] Migration students.
- [ ] Migration group histories.
- [ ] CRUD tahun ajaran.
- [ ] Aktivasi tahun ajaran.
- [ ] CRUD kelompok.
- [ ] Assign ustadz.
- [ ] CRUD santri.
- [ ] Assign santri ke kelompok.
- [ ] Riwayat perpindahan kelompok.
- [ ] Test seluruh alur.

## Phase 3 — Character Indicators

<<<<<<< Updated upstream
- [ ] Migration character indicators.
- [ ] Seeder indikator dummy.
- [ ] CRUD indikator.
- [ ] Kategori indikator.
- [ ] Flag warning.
- [ ] Test indikator.
=======
- [x] Migration character indicators.
- [x] Seeder indikator dummy.
- [x] CRUD indikator.
- [x] Kategori indikator.
- [x] Flag warning.
- [x] Test indikator.
>>>>>>> Stashed changes

## Phase 4 — Moral Test Management

- [ ] Migration test packages.
- [ ] Migration package-group.
- [ ] Migration moral cases.
- [ ] Migration package-case.
- [ ] Migration case options.
- [ ] Migration case indicators.
- [ ] CRUD paket tes.
- [ ] CRUD kasus.
- [ ] CRUD pilihan dinamis.
- [ ] Upload gambar/audio kasus.
- [ ] Assignment paket ke kelompok.
- [ ] Publish/close paket.
- [ ] Validasi periode aktif.
- [ ] Test manajemen tes.

## Phase 5 — Student Test Experience

- [ ] Daftar paket tersedia.
- [ ] Buat attempt.
- [ ] Validasi attempt limit.
- [ ] Halaman cerita per kasus.
- [ ] Text-to-speech atau pemutaran audio cerita.
- [ ] Pilihan jawaban dinamis.
- [ ] Input alasan teks.
- [ ] UI rekaman suara.
- [ ] Upload audio.
- [ ] Audio preview.
- [ ] Autosave.
- [ ] Progress indicator.
- [ ] Submit attempt.
- [ ] Lock jawaban setelah submit.
- [ ] Test student flow.

## Phase 6 — Speech-to-Text

- [ ] Buat interface STT.
- [ ] Buat DTO hasil transkripsi.
- [ ] Implement provider pertama.
- [ ] Migration audio files.
- [ ] Migration transcriptions.
- [ ] Job transkripsi.
- [ ] Retry policy.
- [ ] Error logging.
- [ ] Simpan raw response.
- [ ] Endpoint retry.
- [ ] Mock test provider.
- [ ] Integration test.

## Phase 7 — LLM Moral Assessment

- [ ] Buat interface assessment.
- [ ] Buat DTO input/output.
- [ ] Definisikan JSON schema.
- [ ] Buat prompt v1.
- [ ] Migration AI assessments.
- [ ] Implement provider pertama.
- [ ] Job klasifikasi.
- [ ] Validasi output.
- [ ] Simpan raw response.
- [ ] Simpan prompt version.
- [ ] Retry policy.
- [ ] Test invalid JSON.
- [ ] Test timeout/rate limit.
- [ ] Integration test.

## Phase 8 — Teacher Validation

- [ ] Migration teacher validations.
- [ ] Queue review list.
- [ ] Detail review.
- [ ] Audio player.
- [ ] Tampilan transkripsi asli.
- [ ] Edit transkripsi.
- [ ] Tampilan rekomendasi AI.
- [ ] Approve.
- [ ] Override.
- [ ] Wajib alasan override.
- [ ] Audit perubahan.
- [ ] Test authorization kelompok.
- [ ] Test approval/override.

## Phase 9 — Daily Observation

- [ ] Migration observation entries.
- [ ] Migration observation items.
- [ ] Form observasi cepat.
- [ ] Checklist indikator.
- [ ] Sentiment.
- [ ] Assessment score.
- [ ] Reward points.
- [ ] Catatan.
- [ ] Riwayat observasi santri.
- [ ] Edit/delete terotorisasi.
- [ ] Audit log.
- [ ] Test observation flow.

## Phase 10 — Character Scoring

- [ ] Migration scoring configurations.
- [ ] Migration score snapshots.
- [ ] Default weight 60/40.
- [ ] CRUD konfigurasi bobot.
- [ ] Service perhitungan tes.
- [ ] Service perhitungan observasi.
- [ ] Service skor gabungan.
- [ ] Manual adjustment.
- [ ] Wajib alasan adjustment.
- [ ] Snapshot per periode.
- [ ] Unit test perhitungan.

## Phase 11 — Early Warning

- [ ] Migration warning rules.
- [ ] Migration student warnings.
- [ ] Seeder rule dummy.
- [ ] Rule engine awal.
- [ ] Generate warning.
- [ ] Warning dashboard.
- [ ] Review warning.
- [ ] Resolve warning.
- [ ] Gunakan bahasa pendampingan.
- [ ] Pastikan tidak tampil ke santri.
- [ ] Test warning rules.

## Phase 12 — Goodness Tree

- [ ] Migration point transactions.
- [ ] Migration tree levels.
- [ ] Seeder tree levels.
- [ ] Award reward points.
- [ ] Hitung total points.
- [ ] Tentukan level pohon.
- [ ] Halaman pohon santri.
- [ ] Riwayat reward positif.
- [ ] Unit test threshold.
- [ ] Responsive test.

## Phase 13 — Educational Content

- [ ] Migration educational contents.
- [ ] Migration content indicators.
- [ ] Migration interactions.
- [ ] CRUD content.
- [ ] Upload media.
- [ ] Daftar materi santri.
- [ ] Detail materi.
- [ ] Emoticon response.
- [ ] Recommendation mapping.
- [ ] Test access.

## Phase 14 — Assertiveness Simulation

- [ ] Migration scenarios.
- [ ] Migration options.
- [ ] Migration attempts.
- [ ] CRUD scenario.
- [ ] CRUD dynamic options.
- [ ] Feedback per option.
- [ ] Reward points.
- [ ] Student simulation UI.
- [ ] Save attempt.
- [ ] Test simulation.

## Phase 15 — Analytics Dashboard

- [ ] Admin dashboard.
- [ ] Teacher dashboard.
- [ ] Student dashboard.
- [ ] Distribusi level moral.
- [ ] Tren skor.
- [ ] Ringkasan observasi.
- [ ] Pending review.
- [ ] Open warning.
- [ ] Filter periode.
- [ ] Filter kelompok.
- [ ] Empty/loading/error states.
- [ ] Query performance test.

## Phase 16 — Character Reports

- [ ] Migration reports.
- [ ] Generate report draft.
- [ ] Rekap tes.
- [ ] Rekap observasi.
- [ ] Narasi manual.
- [ ] Draft narasi LLM.
- [ ] Validasi ustadz.
- [ ] Publish.
- [ ] Generate PDF.
- [ ] Authorized PDF download.
- [ ] Test PDF.
- [ ] Test report permissions.

## Phase 17 — Security and Audit

- [ ] Migration audit logs.
- [ ] Audit critical actions.
- [ ] Rate limit login.
- [ ] Secure private files.
- [ ] Upload validation.
- [ ] Security headers.
- [ ] Review role permissions.
- [ ] Review PII in AI prompts.
- [ ] Backup plan.
- [ ] Restore test.

## Phase 18 — Finalization

- [ ] End-to-end testing.
- [ ] UAT dengan dosen.
- [ ] UAT dengan ustadz.
- [ ] UAT terbatas dengan santri.
- [ ] Perbaikan UI.
- [ ] Performance optimization.
- [ ] Production configuration.
- [ ] Deployment guide.
- [ ] User manual admin.
- [ ] User manual ustadz.
- [ ] User manual santri.
- [ ] Final database documentation.
- [ ] Final API documentation.
- [ ] Release notes.
