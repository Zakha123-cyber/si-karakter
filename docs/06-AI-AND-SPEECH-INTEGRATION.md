# AI and Speech Integration

## 1. Goals

- Mengubah rekaman suara menjadi teks.
- Mengklasifikasikan alasan santri.
- Memberikan rekomendasi, bukan keputusan final.
- Menyimpan hasil untuk audit.
- Mendukung pergantian provider.

## 2. Service Contracts

```php
interface SpeechToTextService
{
    public function transcribe(string $audioPath): TranscriptionResult;
}
```

```php
interface MoralAssessmentService
{
    public function assess(MoralAssessmentInput $input): MoralAssessmentResult;
}
```

## 3. Speech-to-Text Input

- Path file.
- MIME type.
- Bahasa utama.
- Metadata durasi.
- Identitas provider dan model.

## 4. Speech-to-Text Output

```json
{
  "text": "Saya memilih mengembalikan uang karena itu milik orang lain.",
  "language": "id",
  "confidence": 0.91,
  "segments": [],
  "provider": "provider-name",
  "model": "model-name"
}
```

## 5. LLM Classification Input

```json
{
  "case": {
    "title": "Menemukan Barang",
    "story": "Cerita lengkap",
    "selected_option": "Menyerahkan kepada ustadz"
  },
  "student_answer": {
    "typed_reason": null,
    "transcript": "Karena uang itu milik orang lain."
  },
  "rubric": {
    "levels": [
      "pre_conventional",
      "conventional",
      "post_conventional"
    ]
  },
  "allowed_indicators": [
    "honesty",
    "empathy",
    "responsibility",
    "peer_pressure_resistance"
  ]
}
```

## 6. Required LLM Output

```json
{
  "moral_level": "post_conventional",
  "confidence": 0.86,
  "indicators": [
    {
      "code": "honesty",
      "score": 0.9
    }
  ],
  "reasoning_summary": "Santri memahami hak kepemilikan orang lain.",
  "warning_signals": [],
  "suggested_intervention": null
}
```

## 7. Guardrails

- Gunakan JSON schema atau structured output.
- Validasi enum.
- Abaikan indikator yang tidak dikenal.
- Jangan meminta LLM melakukan diagnosis.
- Jangan mengirim data pribadi yang tidak diperlukan.
- Prompt tidak boleh menampilkan nama lengkap santri jika tidak dibutuhkan.
- Simpan versi prompt.
- Simpan provider, model, latency, dan raw response.
- Terapkan timeout dan retry terbatas.
- Tandai error dengan jelas.
- Jangan otomatis menetapkan warning final tanpa aturan sistem.

## 8. Human Validation

Ustadz harus dapat melihat:

- cerita;
- pilihan santri;
- audio;
- transkripsi asli;
- transkripsi hasil koreksi;
- level rekomendasi;
- confidence;
- indikator;
- ringkasan alasan;
- warning signals;
- rekomendasi intervensi.

Ustadz dapat:

- approve;
- override;
- memperbaiki transkripsi;
- mengubah indikator;
- menambahkan catatan;
- menjalankan ulang analisis.

## 9. Prompt Versioning

Setiap perubahan prompt harus memiliki versi:

```text
moral-classifier-v1
moral-classifier-v2
report-narrative-v1
```

## 10. Suggested System Prompt

```text
Anda membantu ustadz mengklasifikasikan kualitas penalaran moral anak usia 6–10 tahun.

Klasifikasikan alasan, bukan hanya pilihan tindakan.

Gunakan hanya kategori:
- pre_conventional
- conventional
- post_conventional

Jangan melakukan diagnosis psikologis.
Jangan memberikan label permanen.
Gunakan bahasa netral.
Hasil adalah rekomendasi yang harus dikonfirmasi ustadz.
Kembalikan JSON sesuai schema.
```

## 11. Text-to-Speech (TTS)

### 11.1 Tujuan

- Menghasilkan narasi cerita bahasa Indonesia (6–10 tahun) dari teks `story`.
- Audio disintesis sekali per cerita lalu di-cache agar hemat komputasi.

### 11.2 Arsitektur

- Layanan kecil Python FastAPI di `services/tts/` menjalankan model
  `facebook/mms-tts-ind` (VITS, ~36M parameter, berjalan di CPU).
- Laravel memanggil layanan ini lewat `App\Services\TextToSpeech\MmsTtsService`
  dan menyimpan hasil WAV di disk `local` (private):
  `storage/app/private/tts/stories/{sha1(story)}.wav`.
- Route santri `GET /student/stories/{moralCase}/tts` mengembalikan file
  tersebut sebagai `audio/wav` setelah memvalidasi bahwa cerita milik paket
  published yang terlihat oleh group santri.
- Frontend (`resources/js/pages/student/tests/work.tsx`) memutar audio lewat
  elemen `<audio>`; jika layanan gagal, fallback ke Web Speech API browser.

### 11.3 Service Contract

```php
interface TextToSpeechService
{
    public function synthesize(string $text): TtsResult;
}
```

`TtsResult` berisi: `audio` (bytes WAV), `provider`, `model`, `samplingRate`.

### 11.4 Menjalankan Layanan TTS

```bash
cd services/tts
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001
```

Endpoint: `POST /synthesize` dengan body `{"text": "..."}` -> `audio/wav`.

### 11.5 Konfigurasi Laravel

```env
TTS_PROVIDER=mms
TTS_BASE_URL=http://127.0.0.1:8001
TTS_MODEL=facebook/mms-tts-ind
TTS_TIMEOUT=60
TTS_CACHE_DISK=local
TTS_CACHE_PATH=tts/stories
```

### 11.6 Guardrails

- Cache menggunakan lock atomik agar satu cerita hanya disintesis satu kali.
- File audio disimpan di disk private, tidak pernah di folder public.
- Kegagalan provider menghasilkan 502 dan tidak merusak cache lama.
- Model `facebook/mms-tts-ind` berlisensi **CC-BY-NC 4.0** (non-komersial).
