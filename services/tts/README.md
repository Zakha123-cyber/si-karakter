# TeladanKu Text-to-Speech Service

Server FastAPI kecil yang menghasilkan narasi cerita bahasa Indonesia
menggunakan model [facebook/mms-tts-ind](https://huggingface.co/facebook/mms-tts-ind)
dari Hugging Face Transformers (VITS, ~36M parameter, berjalan di CPU).

Output berupa berkas WAV yang kemudian di-*cache* oleh aplikasi Laravel per cerita
(`storage/app/private/tts/stories/{sha1(story)}.wav`).

## Menjalankan

Disarankan Python 3.10+.

```bash
# (opsional) gunakan virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --host 127.0.0.1 --port 8001
```

> Jika `uvicorn` sudah ada di PATH, layanan ini otomatis ikut berjalan saat
> `composer dev` dijalankan (via `services/tts/dev.cmd`).

> **Catatan torch (CPU / Windows):** jika instalasi `torch` dari PyPI terlalu
> besar atau gagal, pasang build CPU saja:
> `pip install torch --index-url https://download.pytorch.org/whl/cpu`

## Endpoint

| Metode | Path          | Deskripsi                                            |
| ------ | ------------- | ---------------------------------------------------- |
| GET    | `/health`     | Pengecekan kesehatan layanan.                        |
| POST   | `/synthesize` | Body `{"text": "..."}` -> respons `audio/wav`.       |

Contoh:

```bash
curl -X POST http://127.0.0.1:8001/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Selamat pagi, adik-adik."}' \
  -o cerita.wav
```

## Integrasi dengan Laravel

Aplikasi utama memanggil layanan ini melalui `App\Services\TextToSpeech\MmsTtsService`.
Konfigurasi endpoint di `.env`:

```
TTS_PROVIDER=mms
TTS_BASE_URL=http://127.0.0.1:8001
TTS_MODEL=facebook/mms-tts-ind
TTS_TIMEOUT=60
```

## Lisensi

Model `facebook/mms-tts-ind` dilisensikan di bawah
[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/), sehingga
hanya dapat digunakan untuk keperluan **non-komersial**.
