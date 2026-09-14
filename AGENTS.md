# EasyFinance Agent Notes

## Layout
- `backend/` is a Spring Boot 3.4 REST API (Java 21) using SQLite. Its entrypoint is `com.easyfinance.EasyfinanceApplication`; controllers, services, repositories, models, and DTOs are organized under `src/main/java/com/easyfinance/`.
- `frontend/` is a JavaScript React 19/Vite app wrapped by Electron. Browser routes use `createHashRouter` in `src/router/Router.jsx`; use the `@/` alias for `src/` imports.
- The frontend API client is fixed to `http://localhost:8080` in `frontend/src/services/api.js`. Backend CORS only permits Vite's `http://localhost:5173` origin.

## Commands
- From `backend/`, use the Maven wrapper: `./mvnw test` (PowerShell: `./mvnw.cmd test`), `./mvnw spring-boot:run`, and `./mvnw -Dtest=EasyfinanceApplicationTests test` for the current focused test.
- From `frontend/`, use npm with the committed lockfile: `npm ci`, `npm run dev`, `npm run lint`, `npm run build:backend`, `npm run electron`, and `npm run build`.
- There is no frontend test or typecheck script. Run `npm run lint` for frontend changes and the relevant Maven test command for backend changes.

## Runtime And Packaging
- SQLite persists at `${user.home}/easyfinance.db`; JPA schema changes are applied automatically (`spring.jpa.hibernate.ddl-auto=update`). Do not expect a repository-local database.
- `frontend/main.cjs` launches `backend/easyfinance.jar` in development and waits for `GET /health` before showing Electron. `npm run electron` and `npm run build` generate and copy this JAR automatically.
- `npm run build` builds the backend, Vite frontend, and Electron installer. It packages the JRE from `EASYFINANCE_JRE_PATH`, defaulting to `C:/Java/jdk-21.0.9+10/jre`.
