# Testing Plan

## 1. Unit Tests

- Perhitungan skor.
- Penentuan level pohon.
- Evaluasi warning rule.
- Mapping output LLM.
- Validasi structured output.
- Permission helper.
- Report summary builder.

## 2. Feature Tests

### Authentication

- Login setiap role.
- Login gagal.
- Akun nonaktif.
- Authorization endpoint.

### Test Management

- CRUD paket.
- CRUD kasus.
- Pilihan dinamis.
- Publish paket.
- Assignment kelompok.

### Student Attempt

- Membuat attempt.
- Attempt limit.
- Autosave jawaban.
- Upload audio.
- Submit.
- Tidak dapat mengubah setelah submit.

### AI Pipeline

- Job transkripsi.
- Job klasifikasi.
- Retry.
- Provider failure.
- Invalid output.
- Pending review.

### Teacher Validation

- Approve.
- Override.
- Wajib alasan override.
- Edit transcript.
- Akses hanya untuk kelompok yang sah.

### Observation

- Input observasi.
- Reward points.
- Perhitungan observasi.
- Edit dan audit.

### Report

- Generate draft.
- Review.
- Publish.
- Download PDF terotorisasi.

## 3. Frontend Tests

- Form validation.
- Loading state.
- Error state.
- Responsive layout.
- Recording UI.
- Audio playback.
- Test navigation.
- Prevent accidental submit.
- Dashboard filters.

## 4. Integration Tests

Mock provider untuk:

- STT success.
- STT timeout.
- LLM success.
- LLM invalid JSON.
- LLM rate limit.
- LLM timeout.

## 5. User Acceptance Testing

### Santri

- Dapat login.
- Memahami navigasi.
- Dapat memutar cerita.
- Dapat memilih jawaban.
- Dapat merekam suara.
- Tidak bingung saat submit.

### Ustadz

- Dapat menginput observasi dengan cepat.
- Dapat memahami hasil AI.
- Dapat mendengar audio.
- Dapat melakukan override.
- Dapat membuat rapor.

### Admin

- Dapat mengatur struktur data.
- Dapat membuat paket tes.
- Dapat mengelola indikator.
- Dapat mengubah bobot.

## 6. Quality Gate

Task tidak dianggap selesai sebelum:

- migration berhasil;
- test terkait lulus;
- authorization diperiksa;
- validasi request tersedia;
- error state frontend tersedia;
- dokumentasi diperbarui;
- TODO diperbarui.
