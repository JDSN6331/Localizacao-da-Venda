@echo off
chcp 65001 >nul

echo ============================================
echo   Status do Servico - Localizacao da Venda
echo ============================================
echo.

set "NSSM_EXE=%~dp0nssm\nssm.exe"
set "SERVICE_NAME=LocalizacaoVendaServidor"

if not exist "%NSSM_EXE%" (
    echo [ERRO] NSSM nao encontrado. O servico ainda nao foi instalado.
    echo Execute primeiro: 01_instalar_servico.bat
    pause
    exit /b 1
)

echo [INFO] Status do servico:
"%NSSM_EXE%" status %SERVICE_NAME%

echo.
echo ============================================
echo   Informacoes do Servico
echo ============================================
echo.
echo Nome do Servico: %SERVICE_NAME%
echo.
echo Enderecos de acesso:
echo   - Local:  http://localhost:5173
echo   - Rede:
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | ForEach-Object { Write-Host '             http://' + $_.IPAddress + ':5173' }"
echo.
echo Logs disponiveis em:
echo   %~dp0logs\
echo.

pause
