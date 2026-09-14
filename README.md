# EasyFinance

Aplicação desktop para controle financeiro pessoal, construída com React, Electron, Spring Boot e SQLite.

## Funcionalidades

- Cadastro, login, logout e recuperação da sessão do usuário.
- Atualização de perfil, receita mensal, e-mail, nome de usuário e senha.
- Resumo de receita no painel inicial.
- Cadastro, edição, exclusão e consulta de contas/faturas, incluindo pagamento e filtro mensal.
- Cadastro, edição e exclusão de categorias.
- Cadastro, edição, exclusão, consulta e pagamento de cartões; verificação de faturas mensais.
- Cadastro, edição e exclusão de bancos e titulares de cartões.

## Tecnologias

- Frontend: React 19, Vite, Tailwind CSS e Electron.
- Backend: Java 21, Spring Boot 3.4, Spring Data JPA e SQLite.

## Pré-requisitos

- Node.js e npm.
- JDK 21, disponível no `PATH` para executar o backend.
- Para gerar instaladores, um JRE compatível com o sistema de destino. Defina `EASYFINANCE_JRE_PATH` para seu diretório; sem essa variável, o build usa `C:/Java/jdk-21.0.9+10/jre`.

## Rodar Em Desenvolvimento

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

Em outro terminal, inicie o Vite:

```bat
cd /d frontend
npm run dev
```

Abra `http://localhost:5173`. A API é exposta em `http://localhost:8080`, e os dados são persistidos em `${user.home}/easyfinance.db`.

## Rodar Pelo Electron

Em um terminal, mantenha o Vite em execução:

```bat
cd /d frontend
npm run dev
```

Em outro terminal, abra o aplicativo Electron:

```bat
cd /d frontend
npm run electron
```

O comando gera e copia automaticamente o JAR do backend para o Electron.

## Gerar Uma Nova Versão

1. Instale as dependências com `npm ci` em `frontend/`.
2. Defina o JRE a ser incluído no instalador, caso ele não esteja no caminho padrão.

```bat
set "EASYFINANCE_JRE_PATH=C:\caminho\para\jre"
```

3. Gere o pacote completo:

```bat
cd /d frontend
npm run build
```

O instalador NSIS e os demais artefatos são criados em `frontend/release/`. O comando `npm run build` gera o JAR do backend, o frontend e o instalador Electron.

## Gerar Instaladores Linux

Execute o build em uma máquina Linux x64. O JRE definido em `EASYFINANCE_JRE_PATH` também deve ser Linux x64 e compatível com Java 21; um JRE do Windows não funciona no pacote Linux.

```bash
cd frontend
npm ci
export EASYFINANCE_JRE_PATH=/caminho/para/jre-21
npm run build:linux
```

Os arquivos `AppImage` e `.deb` são gerados em `frontend/release/`.

## Verificação

```bat
cd /d backend
mvnw.cmd test

cd ..\frontend
npm run lint
```
