# Backend Microservices (JDBC + API Gateway)

This folder contains 3 Spring Boot services:

- `api-gateway` (port `8080`): public entrypoint, routes `/api/*`, enforces JWT for admin content APIs.
- `auth-service` (port `8081`): verifies Google ID token and issues JWT.
- `content-service` (port `8082`): JDBC + PostgreSQL persistence for all portfolio sections.

## 1) Start PostgreSQL

```bash
cd /Users/adarsh/Documents/Portfolio/backend
docker compose up -d
```

## 2) Configure environment variables

Copy and edit:

```bash
cd /Users/adarsh/Documents/Portfolio/backend
cp .env.example .env
```

Required:

- `JWT_SECRET` (same value for `auth-service` and `api-gateway`)
- `GOOGLE_CLIENT_ID`
- `ADMIN_ALLOWED_EMAILS`

## 3) Run services

Open 3 terminals.

### Terminal A: auth-service

```bash
cd /Users/adarsh/Documents/Portfolio/backend/auth-service
source /Users/adarsh/Documents/Portfolio/backend/.env
mvn spring-boot:run
```

### Terminal B: content-service

```bash
cd /Users/adarsh/Documents/Portfolio/backend/content-service
source /Users/adarsh/Documents/Portfolio/backend/.env
mvn spring-boot:run
```

### Terminal C: api-gateway

```bash
cd /Users/adarsh/Documents/Portfolio/backend/api-gateway
source /Users/adarsh/Documents/Portfolio/backend/.env
mvn spring-boot:run
```

## Google Sign-In checklist (to fix admin login)

In Google Cloud Console (OAuth Client for Web app):

- Authorized JavaScript origins should include:
  - `http://localhost:5173`
  - your deployed frontend origin (for example your GitHub Pages URL)

No redirect URI is required for this popup ID-token flow.

## API Endpoints via gateway

- `POST /api/auth/google`
- `GET /api/content/public`
- `GET /api/content/admin` (Bearer token required)
- `PUT /api/content/admin` (Bearer token required)

## Data persisted in SQL

`content-service` stores all sections in normalized tables:

- profile
- stats
- experience + experience bullets
- skill groups + skill items (includes tools)
- projects
- education
- certifications
- profile details
- section titles
- custom sections + lines
