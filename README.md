# Portfolio Platform (React + JDBC Microservices)

This project is now split into:

- `frontend/`: React + Vite application (`/` portfolio, `/admin` editor)
- `backend/auth-service`: Google ID token verification + JWT issuing
- `backend/content-service`: JDBC service storing all portfolio content in PostgreSQL
- `backend/api-gateway`: Routes APIs and protects admin routes with JWT

## Project Structure

```text
/Users/adarsh/Documents/Portfolio
├── frontend/
│   ├── public/
│   │   ├── assets/
│   │   │   ├── documents/
│   │   │   ├── icons/
│   │   │   │   ├── brand/
│   │   │   │   └── skills/
│   │   │   └── images/
│   │   │       └── brand/
│   │   └── site.webmanifest
│   └── src/
├── backend/
│   ├── api-gateway/
│   ├── auth-service/
│   └── content-service/
└── docs/
```

## Tech Stack

- React 18 + Vite
- Spring Boot 3 microservices
- JDBC + Flyway + PostgreSQL
- Google Sign-In (ID token flow)
- API Gateway with JWT validation

## Local Run

### 1) Start database

```bash
cd /Users/adarsh/Documents/Portfolio/backend
docker compose up -d
```

### 2) Configure backend environment

```bash
cd /Users/adarsh/Documents/Portfolio/backend
cp .env.example .env
```

Set:

- `GOOGLE_CLIENT_ID`
- `JWT_SECRET`
- `ADMIN_ALLOWED_EMAILS`

### 3) Start backend services

Run each in a separate terminal:

```bash
cd /Users/adarsh/Documents/Portfolio/backend/auth-service && mvn spring-boot:run
cd /Users/adarsh/Documents/Portfolio/backend/content-service && mvn spring-boot:run
cd /Users/adarsh/Documents/Portfolio/backend/api-gateway && mvn spring-boot:run
```

### 4) Start React frontend

```bash
cd /Users/adarsh/Documents/Portfolio/frontend
npm install
npm run dev
```

Open:

- `http://localhost:5173/` (portfolio)
- `http://localhost:5173/admin` (admin editor)

## Google Sign-In Troubleshooting

If admin Google login fails:

- Verify `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`
- In Google Cloud Console (OAuth client type: Web app), add authorized JavaScript origins:
  - `http://localhost:5173`
  - your deployed domain
- Make sure the Google account email is included in `ADMIN_ALLOWED_EMAILS`
- Confirm `GOOGLE_CLIENT_ID` in backend `.env` matches frontend client id

## Data Stored in DB

All portfolio sections are persisted in SQL tables:

- profile
- stats
- experience + bullets
- skills + tools categories and items
- projects
- education
- certifications
- profile details
- section titles
- custom sections
