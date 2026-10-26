@echo off
title Cuanin - Live Presentation Launcher
echo ========================================================
echo   CUANIN - PLATFORM WEBSITE UMKM & REKBER ESCROW
echo   Live Public Presentation Launcher
echo ========================================================
echo.

:: 1. Check if Node.js server is already running on port 4000
netstat -ano | findstr :4000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] Backend server Cuanin sudah aktif di http://127.0.0.1:4000
) else (
    echo [..] Menjalankan server backend Cuanin...
    start /B node src/server.js
    timeout /t 3 /nobreak >nul
    echo [OK] Backend server Cuanin berhasil dijalankan di http://127.0.0.1:4000
)

echo.
echo ========================================================
echo   Membuka Tunnel Publik HTTPS Cloudflare...
echo   (Gratis, Tanpa Kartu Kredit, 100%% Fitur Lengkap)
echo ========================================================
echo.

"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:4000
pause
