# AgroDash — Dashboard de Vendas (Balcão x Campo)

AgroDash é um painel gerencial moderno e de alta performance desenvolvido para analisar a distribuição das vendas entre os canais de **Balcão** (vendas físicas na filial) e **Campo** (vendas realizadas fora da filial por vendedores externos). 

O sistema integra dados geográficos por mesorregiões, permitindo monitorar o faturamento, ticket médio, número de pedidos e o perfil comercial de cada filial e vendedor.

---

## 📂 Estrutura do Projeto

A organização do projeto segue as melhores práticas para aplicações SPA escaláveis:

```text
├── data-sources/            # Arquivos de dados brutos e planilhas originais de referência
│   ├── Pedidos - Localização.csv
│   └── FILIAL - MESOREGIAO v1.xlsx
├── public/                  # Arquivos estáticos disponibilizados diretamente no servidor
│   ├── data/
│   │   └── pedidos-localizacao.csv  # Base de dados (CSV) consumida pelo dashboard em produção
│   └── favicon.svg
├── service/                 # Scripts para implantação da aplicação como Serviço do Windows
│   ├── logs/                # Logs gerados pelo serviço em execução
│   ├── nssm/                # Utilitário NSSM (Non-Sucking Service Manager)
│   ├── 01_instalar_servico.bat
│   ├── 02_iniciar_servico.bat
│   ├── 03_parar_servico.bat
│   ├── 04_reiniciar_servico.bat
│   ├── 05_limpeza_profunda_servidor.bat
│   ├── 06_remover_servico.bat
│   └── 07_status_servico.bat
├── src/                     # Código-fonte da aplicação React
│   ├── assets/              # Imagens, fontes e mídias globais
│   ├── components/          # Componentes reutilizáveis do sistema
│   │   ├── charts/          # Gráficos interativos (Recharts) e análises regionais
│   │   ├── tabs/            # Abas principais (Visão geral, Filiais, Vendedores)
│   │   └── ui/              # Componentes de interface base (cards, tabelas, inputs)
│   ├── hooks/               # Custom React Hooks (gerenciamento e computação de dados)
│   ├── lib/                 # Inicialização e configurações de bibliotecas externas (Tailwind Merge)
│   ├── pages/               # Telas e views principais (Home.tsx)
│   ├── store/               # Gerenciamento de estado global (Zustand)
│   ├── types/               # Tipagem estática do TypeScript
│   └── utils/               # Funções utilitárias (formatações, cálculos estatísticos e parses)
├── index.html               # Ponto de entrada HTML do Vite
├── tailwind.config.js       # Configuração de design system e estilos do TailwindCSS
├── tsconfig.json            # Configuração do compilador TypeScript
└── vite.config.ts           # Configuração de bundler e servidor de desenvolvimento do Vite
```

---

## 🛠️ Tecnologias Utilizadas

- **Core**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- **Estilização**: [TailwindCSS](https://tailwindcss.com/) (Layout e responsividade) + **Glassmorphism** (Efeitos de transparência modernos)
- **Gráficos**: [Recharts](https://recharts.org/) (Gráficos de barra, pizza e radar)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand)
- **Processamento de Dados**: [XLSX (SheetJS)](https://sheetjs.com/) (Leitura e exportação de planilhas nativas)

---

## 🚀 Como Iniciar o Projeto

### Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em sua máquina.

### Passo 1: Instalar as dependências
Execute o comando abaixo na raiz do projeto para instalar todos os pacotes necessários:
```bash
npm install
```

### Passo 2: Rodar em ambiente de desenvolvimento
Para iniciar o servidor local do Vite com Hot Module Replacement (HMR):
```bash
npm run dev
```
O console exibirá o endereço local (geralmente `http://localhost:5173`) para acessar o painel no navegador.

### Passo 3: Build de Produção
Para compilar e otimizar a aplicação para distribuição:
```bash
npm run build
```
Os arquivos gerados serão salvos na pasta `/dist/`.

---

## 🖥️ Implantação como Serviço Windows

O painel inclui um utilitário completo localizado na pasta `/service/` que permite configurar e rodar o build otimizado da aplicação como um **Serviço de Segundo Plano do Windows** de forma profissional e ininterrupta.

Os scripts utilizam o utilitário **NSSM** pré-configurado:

1. **`01_instalar_servico.bat`**: Registra e configura a aplicação como um serviço do sistema Windows.
2. **`02_iniciar_servico.bat`**: Inicia o serviço criado.
3. **`03_parar_servico.bat`**: Interrompe o serviço sem desinstalá-lo.
4. **`04_reiniciar_servico.bat`**: Reinicia o serviço de forma limpa.
5. **`05_limpeza_profunda_servidor.bat`**: Remove arquivos temporários de compilação antigos.
6. **`06_remover_servico.bat`**: Desinstala completamente o serviço do Windows.
7. **`07_status_servico.bat`**: Retorna se o serviço está parado, rodando ou se houve falha.

> 💡 **Nota**: Para instalar, iniciar ou remover o serviço, certifique-se de executar os arquivos `.bat` com **privilégios de Administrador** no Windows.
