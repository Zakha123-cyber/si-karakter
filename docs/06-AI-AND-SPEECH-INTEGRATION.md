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
