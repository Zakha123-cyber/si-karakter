@echo off
rem Menjalankan layanan Text-to-Speech (uvicorn) untuk development.
rem Dipanggil dari "composer dev". Jika uvicorn belum terpasang,
rem layanan dilewati dengan pesan peringatan tanpa menghentikan command lain.
setlocal

where uvicorn >nul 2>nul
if %errorlevel%==0 (
    cd /d "%~dp0"
    echo [tts] Memulai uvicorn: http://127.0.0.1:8001
    uvicorn main:app --host 127.0.0.1 --port 8001
) else (
    echo [tts] SKIPPED: uvicorn tidak ditemukan di PATH.
    echo [tts] Install dulu dengan: pip install -r "%~dp0requirements.txt"
    echo [tts] atau aktifkan virtual environment yang berisi uvicorn.
    exit /b 0
)