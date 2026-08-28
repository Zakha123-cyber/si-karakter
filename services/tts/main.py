"""TeladanKu Text-to-Speech service powered by facebook/mms-tts-ind.

Runs a small HTTP server that synthesizes Indonesian speech from text and
returns it as a WAV file. The Laravel app calls this service to generate
story narration for students and caches the resulting audio.

Run locally:

    pip install -r requirements.txt
    uvicorn main:app --host 127.0.0.1 --port 8001

Endpoints:
    GET  /health        -> service health check
    POST /synthesize    -> {"text": "..."} -> audio/wav response
"""

from io import BytesIO

import numpy as np
import scipy.io.wavfile as wavfile
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="TeladanKu TTS Service", version="1.0.0")

# The pipeline is built at import time so the ~36M param model is loaded once
# and reused across requests. The model speaks Indonesian by default.
tts_pipeline = pipeline("text-to-speech", model="facebook/mms-tts-ind")


class SynthesizeRequest(BaseModel):
    text: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/synthesize")
def synthesize(request: SynthesizeRequest) -> Response:
    text = request.text.strip()

    if not text:
        raise HTTPException(status_code=422, detail="text must not be empty")

    try:
        output = tts_pipeline(text)
        audio = np.asarray(output["audio"], dtype=np.float32)
        sampling_rate = int(output["sampling_rate"])
    except Exception as exc:  # noqa: BLE001 - report provider errors to caller
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    buffer = BytesIO()
    wavfile.write(buffer, sampling_rate, audio)

    return Response(
        content=buffer.getvalue(),
        media_type="audio/wav",
        headers={"X-Sampling-Rate": str(sampling_rate)},
    )
