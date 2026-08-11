@echo off
chcp 65001 >nul

echo ============================================
echo   Reiniciar Servico - Localizacao da Venda
echo ============================================
echo.

:: Verificar se esta executando como administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como Administrador!
    echo.
    pause
    exit /b 1
)

set "NSSM_EXE=%~dp0nssm\nssm.exe"
set "SERVICE_NAME=LocalizacaoVendaServidor"

:: Copiar novo arquivo de dados de data-sources se existir
echo [INFO] Sincronizando base de dados a partir de data-sources...
powershell -NoProfile -Command "$src = Get-ChildItem '%~dp0..\data-sources' -Filter '*.csv' | Select-Object -First 1; if ($src) { Copy-Item $src.FullName -Destination '%~dp0..\public\data\pedidos-localizacao.csv' -Force; if (Test-Path '%~dp0..\dist\data') { Copy-Item $src.FullName -Destination '%~dp0..\dist\data\pedidos-localizacao.csv' -Force }; Write-Host '[OK] Base de dados copiada e atualizada com sucesso!' } else { Write-Host '[AVISO] Nenhum arquivo CSV encontrado em data-sources.' }"
echo.

echo [INFO] Parando servico...
"%NSSM_EXE%" stop %SERVICE_NAME%

timeout /t 2 >nul

echo [INFO] Iniciando servico...
"%NSSM_EXE%" start %SERVICE_NAME%

echo.
echo [INFO] Verificando status...
"%NSSM_EXE%" status %SERVICE_NAME%

echo.
echo [OK] Servico reiniciado! As alteracoes no codigo foram aplicadas.
echo.
pause
