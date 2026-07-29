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

- [x] Buat enum role.
- [x] Buat migration users.
- [x] Implement login.
- [x] Implement logout.
- [x] Implement current user endpoint.
- [x] Implement authorization middleware.
- [x] CRUD user.
- [x] Aktivasi/nonaktifkan akun.
- [x] Reset password/PIN.
- [x] Test authentication.
- [x] Test authorization.
- [x] Frontend login berbasis username.
- [x] Frontend dashboard berbasis role.
- [x] Frontend user management admin.

## Phase 2 — Academic Structure

- [x] Migration academic years.
- [x] Migration groups.
- [x] Migration students.
- [x] Migration group histories.
- [x] CRUD tahun ajaran.
- [x] Aktivasi tahun ajaran.
- [x] CRUD kelompok.
- [x] Assign ustadz.
- [x] CRUD santri.
- [x] Assign santri ke kelompok.
- [x] Riwayat perpindahan kelompok.
- [x] Test seluruh alur.

## Phase 3 — Character Indicators (Ustadz)

- [x] Migration character indicators.
- [x] Seeder indikator dummy.
- [x] CRUD indikator (dipindahkan dari role Admin ke role Ustadz, lihat D-018).
- [x] Kategori indikator.
- [x] Flag warning.
- [x] Test indikator.

## Phase 4 — Moral Test Management

- [x] Migration test packages.
- [x] Migration package-group.
- [x] Migration moral cases.
- [x] Migration package-case.
- [x] Migration case options.
- [x] Migration case indicators.
- [x] CRUD paket tes.
- [x] CRUD kasus.
- [x] CRUD pilihan dinamis.
- [x] Upload gambar/audio kasus.
- [x] Assignment paket ke kelompok.
- [x] Publish/close paket.
- [x] Validasi periode aktif.
- [x] Test manajemen tes.

## Phase 5 — Student Test Experience

- [x] Daftar paket tersedia.
- [x] Buat attempt.
- [x] Validasi attempt limit.
- [x] Halaman cerita per kasus.
- [x] Text-to-speech atau pemutaran audio cerita.
- [x] Pilihan jawaban dinamis.
- [x] Input alasan teks.
- [x] UI rekaman suara.
- [x] Upload audio.
- [x] Audio preview.
- [x] Autosave.
- [x] Progress indicator.
- [x] Submit attempt.
- [x] Lock jawaban setelah submit.
- [x] Test student flow.

## Phase 6 — Speech-to-Text

- [x] Buat interface STT.
- [x] Buat DTO hasil transkripsi.
- [x] Implement provider pertama.
- [x] Migration audio files.
- [x] Migration transcriptions.
- [x] Job transkripsi.
- [x] Retry policy.
- [x] Error logging.
- [x] Simpan raw response.
- [x] Endpoint retry.
- [x] Mock test provider.
- [x] Integration test.

## Phase 7 — LLM Moral Assessment

- [x] Buat interface assessment.
- [x] Buat DTO input/output.
- [x] Definisikan JSON schema.
- [x] Buat prompt v1.
- [x] Migration AI assessments.
- [x] Implement provider pertama.
- [x] Job klasifikasi.
- [x] Validasi output.
- [x] Simpan raw response.
- [x] Simpan prompt version.
- [x] Retry policy.
- [x] Test invalid JSON.
- [x] Test timeout/rate limit.
- [x] Integration test.

## Phase 8 — Teacher Validation

- [x] Migration teacher validations.
- [x] Queue review list.
- [x] Detail review.
- [x] Audio player.
- [x] Tampilan transkripsi asli.
- [x] Edit transkripsi.
- [x] Tampilan rekomendasi AI.
- [x] Approve.
- [x] Override.
- [x] Wajib alasan override.
- [x] Audit perubahan.
- [x] Test authorization kelompok.
- [x] Test approval/override.

## Phase 9 — Daily Observation

- [x] Migration observation entries.
- [x] Migration observation items.
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

## Phase 10 — Character Scoring (Ustadz)

- [x] Migration scoring configurations.
- [x] Migration score snapshots.
- [ ] Default weight 60/40.
- [ ] CRUD konfigurasi bobot (kewenangan Ustadz, lihat D-018).
- [ ] Service perhitungan tes.
- [ ] Service perhitungan observasi.
- [ ] Service skor gabungan.
- [ ] Manual adjustment.
- [ ] Wajib alasan adjustment.
- [ ] Snapshot per periode.
- [ ] Unit test perhitungan.

## Phase 11 — Early Warning

- [x] Migration warning rules.
- [x] Migration student warnings.
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

- [x] Migration point transactions.
- [x] Migration tree levels.
- [ ] Seeder tree levels.
- [ ] Award reward points.
- [ ] Hitung total points.
- [ ] Tentukan level pohon.
- [ ] Halaman pohon santri.
- [ ] Riwayat reward positif.
- [ ] Unit test threshold.
- [ ] Responsive test.

## Phase 13 — Educational Content

- [x] Migration educational contents.
- [x] Migration content indicators.
- [x] Migration interactions.
- [ ] CRUD content.
- [ ] Upload media.
- [ ] Daftar materi santri.
- [ ] Detail materi.
- [ ] Emoticon response.
- [ ] Recommendation mapping.
- [ ] Test access.

## Phase 14 — Assertiveness Simulation

- [x] Migration scenarios.
- [x] Migration options.
- [x] Migration attempts.
- [ ] CRUD scenario.
- [ ] CRUD dynamic options.
- [ ] Feedback per option.
- [ ] Reward points.
- [ ] Student simulation UI.
- [ ] Save attempt.
- [ ] Test simulation.

## Phase 15 — Analytics Dashboard

- [x] Halaman admin hasil pengerjaan test.
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

- [x] Migration reports.
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

- [x] Migration audit logs.
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
