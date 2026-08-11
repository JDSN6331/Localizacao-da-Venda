@echo off
chcp 65001 >nul

echo ============================================
echo   Limpeza Profunda de Servidor Travado
echo ============================================
echo.

:: Verificar se esta executando como administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como Administrador!
    echo.
    echo Clique com o botao direito no arquivo e selecione
    echo "Executar como administrador"
    echo.
    pause
    exit /b 1
)

set "SERVICE_NAME=LocalizacaoVendaServidor"

echo [INFO] Parando o servico do Windows (se estiver rodando)...
"%~dp0nssm\nssm.exe" stop %SERVICE_NAME% >nul 2>&1

echo [INFO] Matando todos os processos "fantasmas" do Node...
taskkill /F /IM node.exe /T >nul 2>&1

echo [INFO] Aguardando 3 segundos para limpar a memoria...
timeout /t 3 >nul

echo [INFO] Ligando o servidor com o codigo ATUALIZADO...
"%~dp0nssm\nssm.exe" start %SERVICE_NAME%

echo.
echo [OK] Servidor completamente reiniciado!
echo Por favor, atualize sua pagina no navegador.
echo.
pause
