# System Architecture

## 1. Architecture Style

Gunakan **modular monolith**.

```text
React + Vite
      |
      | HTTP/JSON
      v
Laravel Application
      |
      +-- Auth Module
      +-- Student Module
      +-- Moral Test Module
      +-- Observation Module
      +-- AI Integration Module
      +-- Scoring Module
      +-- Content Module
      +-- Report Module
      +-- Analytics Module
      |
      +--> MySQL
      +--> Local Storage
      +--> Queue Worker
      +--> External STT API
      +--> External LLM API
```

## 2. Recommended Laravel Layers

```text
Controller
↓
Form Request Validation
↓
Application Service / Action
↓
Domain Rules
↓
Repository or Eloquent Model
↓
Database
```

Hindari menaruh semua business logic di controller.

## 3. Frontend Structure

```text
src/
├── app/
├── components/
├── features/
│   ├── auth/
│   ├── students/
│   ├── academic/
│   ├── moral-tests/
│   ├── observations/
│   ├── assessments/
│   ├── dashboard/
│   ├── goodness-tree/
│   ├── contents/
│   └── reports/
├── layouts/
├── pages/
├── routes/
├── services/
├── hooks/
├── stores/
├── types/
└── utils/
```

## 4. Backend Module Structure

```text
app/
├── Domain/
│   ├── Academic/
│   ├── Assessment/
│   ├── Content/
│   ├── Observation/
│   ├── Reporting/
│   ├── Scoring/
│   └── User/
├── Services/
│   ├── AI/
│   ├── Speech/
│   ├── Storage/
│   └── Reporting/
├── Actions/
├── DTOs/
├── Enums/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/
├── Jobs/
├── Policies/
└── Models/
```

## 5. Async Processing

Gunakan queue untuk:

- speech-to-text;
- klasifikasi LLM;
- pembuatan narasi rapor;
- pembuatan PDF berat;
- pemrosesan media bila diperlukan.

```text
Upload audio
↓
Save answer
↓
Dispatch TranscribeAnswerJob
↓
Store transcript
↓
Dispatch ClassifyMoralAnswerJob
↓
Store AI assessment
↓
Notify teacher review queue
```

## 6. File Storage

Gunakan Laravel Filesystem.

Contoh folder:

```text
storage/app/private/
├── student-answers/audio/
├── test-cases/images/
├── test-cases/audio/
├── educational-content/
├── simulation-assets/
└── reports/
```

File privat tidak boleh diakses melalui URL publik langsung. Gunakan authorized download/stream endpoint.

## 7. Configuration

Simpan konfigurasi seperti:

- provider LLM;
- provider speech-to-text;
- model;
- timeout;
- retry;
- max audio size;
- bobot tes;
- bobot observasi;
- threshold pohon;
- threshold warning.

Rahasia API hanya berada di `.env`.

## 8. Deployment Components

```text
Nginx/Apache
PHP-FPM
Laravel App
Queue Worker
Scheduler
MySQL
Node build artifact
Local file storage
Backup process
```
