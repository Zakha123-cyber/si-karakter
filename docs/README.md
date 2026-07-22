# SI-KARAKTER — Dokumentasi Pengembangan

SI-KARAKTER adalah **Sistem Informasi Karakter Terpadu Santri** untuk mendukung asesmen, observasi, intervensi edukatif, pemantauan, dan pelaporan perkembangan karakter santri usia 6–10 tahun.

Dokumentasi ini disiapkan agar pengembangan menggunakan AI coding agent tetap:

- terarah;
- konsisten;
- dapat dipantau;
- tidak keluar dari kebutuhan sistem;
- mudah dilanjutkan oleh agent atau developer lain.

## Tech Stack

- Backend: Laravel
- Frontend: React + Vite
- Database: MySQL
- File Storage: Local storage server melalui Laravel Filesystem
- Authentication: Laravel-based authentication
- AI Classification: LLM melalui API
- Speech-to-Text: layanan STT melalui API atau provider yang dapat diganti
- PDF Report: Laravel PDF library
- Deployment awal: single server / VPS

## Peran Pengguna

1. Admin
2. Ustadz/Pengelola
3. Santri

## Daftar Dokumen

Semua dokumen perencanaan berada di folder `docs/` agar tidak tertimpa saat Laravel skeleton dipasang di root project.

1. `00-MASTER-PROMPT.md`
2. `01-PROJECT-CONTEXT.md`
3. `02-PRD.md`
4. `03-SYSTEM-ARCHITECTURE.md`
5. `04-DATABASE-DESIGN.md`
6. `05-API-CONTRACT.md`
7. `06-AI-AND-SPEECH-INTEGRATION.md`
8. `07-UI-UX-GUIDELINES.md`
9. `08-SECURITY-AND-PRIVACY.md`
10. `09-TESTING-PLAN.md`
11. `10-DEVELOPMENT-GUIDELINES.md`
12. `11-AGENT-RULES.md`
13. `12-TO-DO-LIST.md`
14. `13-DECISION-LOG.md`

## Urutan Penggunaan

Agent AI sebaiknya membaca dokumen dengan urutan berikut:

```text
README.md
↓
00-MASTER-PROMPT.md
↓
01-PROJECT-CONTEXT.md
↓
02-PRD.md
↓
03-SYSTEM-ARCHITECTURE.md
↓
04-DATABASE-DESIGN.md
↓
05-API-CONTRACT.md
↓
06-AI-AND-SPEECH-INTEGRATION.md
↓
07-UI-UX-GUIDELINES.md
↓
08-SECURITY-AND-PRIVACY.md
↓
09-TESTING-PLAN.md
↓
10-DEVELOPMENT-GUIDELINES.md
↓
11-AGENT-RULES.md
↓
12-TO-DO-LIST.md
↓
13-DECISION-LOG.md
```
