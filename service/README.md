# Serviço Windows - Localização da Venda

Este diretório contém os scripts para configurar e gerenciar o painel de Localização da Venda como um Serviço do Windows, permitindo que o notebook funcione como um servidor local na rede.

## 📋 Pré-requisitos

1. **NSSM (Non-Sucking Service Manager)** - Será baixado automaticamente pelo script de instalação.
2. **Node.js e npm** instalados e configurados no PATH.
3. **Permissões de Administrador** para instalar e gerenciar o serviço.

## 🚀 Instalação

### Passo 1: Instalar o serviço
1. Clique com o **botão direito** em `01_instalar_servico.bat`.
2. Selecione **"Executar como administrador"**.
3. Siga as instruções na tela. O serviço será configurado para rodar `npm run dev` na pasta raiz.

### Passo 2: Acessar a aplicação
A aplicação roda por padrão na porta **5173**. Ela poderá ser acessada por qualquer dispositivo na mesma rede local:
- No próprio computador: `http://localhost:5173`
- Em outros computadores/celulares na rede: `http://<IP_DO_NOTEBOOK>:5173`
  *(O IP correto do seu notebook será exibido no final da execução do instalador ou ao abrir o script de status)*

---

## 🎮 Comandos de Gerenciamento

Todos os scripts abaixo devem ser executados como **Administrador** (botão direito -> "Executar como administrador"):

| Arquivo | Função |
|---------|--------|
| `01_instalar_servico.bat` | Instala e inicia o serviço no Windows |
| `02_iniciar_servico.bat` | Inicia o serviço caso esteja parado |
| `03_parar_servico.bat` | Para o serviço temporariamente |
| `04_reiniciar_servico.bat` | Reinicia o serviço |
| `05_limpeza_profunda_servidor.bat` | Para o serviço, mata processos órfãos do Node e religa o servidor |
| `06_remover_servico.bat` | Remove completamente o serviço do Windows |
| `07_status_servico.bat` | Exibe se o serviço está ativo e lista os links de IP para acesso |

---

## ⚠️ Importante

- **Caso o servidor pare de responder**: Execute `05_limpeza_profunda_servidor.bat` para reiniciar o serviço limpando eventuais instâncias travadas do Node.exe da memória.
- **Visualizar Logs**: Os logs de saída e erros estão salvos na pasta `service\logs\stdout.log` e `service\logs\stderr.log`.
