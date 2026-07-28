# API Contract

Base path:

```text
/api/v1
```

Format respons sukses:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

Format error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field": ["Error message"]
  }
}
```

## Authentication

```text
POST   /auth/login
POST   /auth/logout
GET    /auth/me
POST   /auth/change-password
```

## Users

```text
GET    /users
POST   /users
GET    /users/{id}
PUT    /users/{id}
PATCH  /users/{id}/status
POST   /users/{id}/reset-credential
```

## Academic Years

```text
GET    /academic-years
POST   /academic-years
GET    /academic-years/{id}
PUT    /academic-years/{id}
DELETE /academic-years/{id}
PATCH  /academic-years/{id}/activate
```

## Groups

```text
GET    /groups
POST   /groups
GET    /groups/{id}
PUT    /groups/{id}
DELETE /groups/{id}
POST   /groups/{id}/students
DELETE /groups/{id}/students/{studentId}
```

## Students

```text
GET    /students
POST   /students
GET    /students/{id}
PUT    /students/{id}
PATCH  /students/{id}/status
GET    /students/{id}/timeline
GET    /students/{id}/scores
GET    /students/{id}/warnings
```

## Character Indicators

```text
GET    /character-indicators
POST   /character-indicators
GET    /character-indicators/{id}
PUT    /character-indicators/{id}
DELETE /character-indicators/{id}
```

## Test Packages

```text
GET    /test-packages
POST   /test-packages
GET    /test-packages/{id}
PUT    /test-packages/{id}
DELETE /test-packages/{id}
POST   /test-packages/{id}/publish
POST   /test-packages/{id}/close
POST   /test-packages/{id}/groups
POST   /test-packages/{id}/cases
```

## Moral Cases

```text
GET    /moral-cases
POST   /moral-cases
GET    /moral-cases/{id}
PUT    /moral-cases/{id}
DELETE /moral-cases/{id}
POST   /moral-cases/{id}/options
PUT    /moral-cases/{id}/options/{optionId}
DELETE /moral-cases/{id}/options/{optionId}
POST   /moral-cases/{id}/media
```

## Student Test Flow

```text
GET    /student/test-packages/available
POST   /student/test-packages/{id}/attempts
GET    /student/attempts/{id}
PUT    /student/attempts/{id}/answers/{caseId}
POST   /student/attempts/{id}/answers/{caseId}/audio
DELETE /student/attempts/{id}/answers/{caseId}/audio
POST   /student/attempts/{id}/submit
GET    /student/attempts/{id}/status
```

## Teacher Review

```text
GET    /teacher/reviews
GET    /teacher/reviews/{answerId}
POST   /teacher/reviews/{answerId}/approve
POST   /teacher/reviews/{answerId}/override
POST   /teacher/reviews/{answerId}/retry-transcription
POST   /teacher/reviews/{answerId}/retry-assessment
PUT    /teacher/reviews/{answerId}/transcript
GET    /teacher/reviews/{answerId}/audio
```

## Observations

```text
GET    /observations
POST   /observations
GET    /observations/{id}
PUT    /observations/{id}
DELETE /observations/{id}
GET    /students/{id}/observations
```

## Scoring

```text
GET    /scoring/configurations
POST   /scoring/configurations
PATCH  /scoring/configurations/{id}/activate
POST   /students/{id}/scores/calculate
POST   /students/{id}/scores/{scoreId}/adjust
```

## Early Warning

```text
GET    /warning-rules
POST   /warning-rules
PUT    /warning-rules/{id}
DELETE /warning-rules/{id}
GET    /warnings
GET    /warnings/{id}
POST   /warnings/{id}/review
POST   /warnings/{id}/resolve
```

## Goodness Tree

```text
GET    /student/goodness-tree
GET    /students/{id}/goodness-points
POST   /students/{id}/goodness-points
GET    /goodness-tree-levels
POST   /goodness-tree-levels
PUT    /goodness-tree-levels/{id}
```

## Educational Content

```text
GET    /educational-contents
POST   /educational-contents
GET    /educational-contents/{id}
PUT    /educational-contents/{id}
DELETE /educational-contents/{id}

GET    /student/educational-contents
GET    /student/educational-contents/{id}
POST   /student/educational-contents/{id}/interactions
```

## Simulations

```text
GET    /simulation-scenarios
POST   /simulation-scenarios
GET    /simulation-scenarios/{id}
PUT    /simulation-scenarios/{id}
DELETE /simulation-scenarios/{id}

GET    /student/simulations
POST   /student/simulations/{id}/attempts
```

## Dashboard

```text
GET    /dashboard/admin
GET    /dashboard/teacher
GET    /dashboard/student
```

## Reports

```text
GET    /reports
POST   /reports/generate
GET    /reports/{id}
PUT    /reports/{id}
POST   /reports/{id}/generate-narrative
POST   /reports/{id}/review
POST   /reports/{id}/publish
GET    /reports/{id}/pdf
```

## Authorization

- Admin: seluruh master data dan konfigurasi, kecuali indikator karakter dan bobot penilaian.
- Ustadz: santri dalam kelompok yang menjadi tanggung jawabnya, serta indikator karakter dan bobot penilaian.
- Santri: data dan aktivitas miliknya sendiri.
- Endpoint file harus memeriksa hak akses.
