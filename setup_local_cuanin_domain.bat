@echo off
title Setup Domain cuan.in Lokal
echo ========================================================
echo   CUANIN - AKTIVASI NAMA DOMAIN CUAN.IN DI LAPTOP ANDA
echo ========================================================
echo.

:: Check for Administrator elevation
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Memerlukan izin Administrator untuk mengedit file hosts Windows.
    echo [..] Meminta izin administrator...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

set HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts

findstr /i "cuan.in" "%HOSTS_FILE%" >nul
if %errorLevel% equ 0 (
    echo [INFO] Domain cuan.in sudah terdaftar sebelumnya di file hosts Windows.
) else (
    echo. >> "%HOSTS_FILE%"
    echo # Cuanin Platform Local Domain Mapping >> "%HOSTS_FILE%"
    echo 127.0.0.1 cuan.in >> "%HOSTS_FILE%"
    echo 127.0.0.1 cuanin.com >> "%HOSTS_FILE%"
    echo 127.0.0.1 kopisenja.cuanin.com >> "%HOSTS_FILE%"
    echo 127.0.0.1 butikaisyah.cuanin.com >> "%HOSTS_FILE%"
    echo 127.0.0.1 kriyabambu.cuanin.com >> "%HOSTS_FILE%"
    echo 127.0.0.1 naturaherbal.cuanin.com >> "%HOSTS_FILE%"
    echo 127.0.0.1 gadgetpedia.cuanin.com >> "%HOSTS_FILE%"
    echo 127.0.0.1 kebunkita.cuanin.com >> "%HOSTS_FILE%"
    echo [SUKSES] Berhasil mendaftarkan domain cuan.in dan subdomain toko UMKM!
)

ipconfig /flushdns >nul
echo.
echo ========================================================
echo   SELESAI!
echo   Sekarang Anda bisa mengetik langsung di Google Chrome:
echo   - http://cuan.in
echo   - http://kopisenja.cuanin.com
echo   - http://butikaisyah.cuanin.com
echo ========================================================
echo.
pause
