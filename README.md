# EasyFinance

Aplicativo desktop para organizar a vida financeira pessoal. O EasyFinance reúne receitas, contas, cartões, saldos e lembretes em uma única aplicação, com os dados armazenados localmente no computador.

## Recursos

- Painel financeiro com resumo mensal, gráficos por categoria e evolução das receitas.
- Controle de receitas, contas e faturas, com filtros por mês e registro de pagamento.
- Cadastro de categorias para organizar despesas.
- Gestão de cartões de crédito, bancos e titulares, incluindo o acompanhamento das faturas mensais.
- Área de saldo para acompanhar contas fixas e movimentações.
- Calendário com lembretes de vencimento e notificações no desktop.
- Exportação de relatórios de contas em PDF e anexação de arquivos às contas.
- Cadastro, login e gerenciamento de perfil do usuário.

## Tecnologias

- Interface: React 19, Vite, Tailwind CSS e Electron.
- API: Java 21, Spring Boot 3.4 e Spring Data JPA.
- Banco de dados: SQLite.

## Instalação

1. Baixe `EasyFinance.exe` na página de lançamentos.
2. Execute o instalador e conclua as etapas exibidas.
3. Abra o EasyFinance pelo atalho criado no menu Iniciar ou na área de trabalho.

O aplicativo inclui os componentes necessários para executar a API localmente. Os dados são salvos em `${user.home}/easyfinance.db` e permanecem no computador mesmo após atualizar o aplicativo.

## Desenvolvimento

### Pré-requisitos

- Node.js e npm.
- JDK 21 no `PATH`.

Instale as dependências do frontend:

```bat
cd /d frontend
npm ci
```

Em um terminal, inicie a API:

```bat
cd /d backend
mvnw.cmd spring-boot:run
```

Em outro terminal, inicie o frontend:

```bat
cd /d frontend
npm run dev
```

Abra `http://localhost:5173`. A API estará disponível em `http://localhost:8080`.

Para executar pelo Electron durante o desenvolvimento, mantenha o Vite em execução e use outro terminal:

```bat
cd /d frontend
npm run electron
```

## Gerar Distribuição

Para criar o instalador Windows, defina um JRE 21 compatível. Se `EASYFINANCE_JRE_PATH` não for informado, o build usa `C:/Java/jdk-21.0.9+10/jre`.

```bat
set "EASYFINANCE_JRE_PATH=C:\caminho\para\jre"
cd /d frontend
npm run build
```

O comando gera o JAR da API, compila a interface e cria o instalador `EasyFinance.exe` em `frontend/release/`.

Para Linux x64, execute o build em uma máquina Linux usando um JRE 21 para Linux x64:

```bash
cd frontend
npm ci
export EASYFINANCE_JRE_PATH=/caminho/para/jre-21
npm run build:linux
```

O arquivo AppImage é criado em `frontend/release/`.

## Verificação

```bat
cd /d backend
mvnw.cmd test

cd ..\frontend
npm run lint
```
