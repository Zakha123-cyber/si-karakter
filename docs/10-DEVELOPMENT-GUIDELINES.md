# Development Guidelines

## 1. Git Workflow

Branch:

```text
main
develop
feat/<module-name>
fix/<issue-name>
refactor/<scope>
docs/<scope>
```

Commit convention:

```text
feat: add moral test package management
fix: prevent duplicate test attempt
refactor: extract assessment service
test: add teacher validation feature tests
docs: update API contract
```

## 2. Laravel Rules

- Gunakan Form Request.
- Gunakan API Resource.
- Gunakan Policy.
- Gunakan Enum untuk status penting.
- Gunakan transaction pada operasi multi-table.
- Gunakan Job untuk proses AI.
- Gunakan service abstraction untuk provider.
- Hindari query N+1.
- Tambahkan index.
- Gunakan pagination.
- Controller tipis.
- Business logic berada pada service/action.

## 3. React Rules

- Organisasi berbasis feature.
- Komponen reusable.
- API client terpusat.
- Type definitions.
- Loading, empty, dan error state.
- Hindari logic kompleks di component.
- Gunakan form library dan schema validation bila disepakati.
- Jaga aksesibilitas.

## 4. Environment

`.env.example` minimal:

```env
APP_NAME=SI-KARAKTER
APP_ENV=local
APP_KEY=
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=si_karakter
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database

AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
AI_TIMEOUT=60

STT_PROVIDER=
STT_API_KEY=
STT_MODEL=
STT_TIMEOUT=120

FILESYSTEM_DISK=local
```

## 5. Definition of Done

- Requirement terpenuhi.
- Authorization benar.
- Validasi tersedia.
- Test lulus.
- UI memiliki error state.
- Tidak ada secret di repository.
- Migration reversible.
- Dokumentasi diperbarui.
- TODO diperbarui.
- Keputusan baru dicatat.
