# GreenLens (Full Stack)

Frontend and backend live in `frontend/` and `backend/`. Here’s how to run and connect them.

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # set DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Backend runs at **http://localhost:3000** by default.

Optional: set `CORS_ORIGINS` in `.env` to the frontend URL (e.g. `http://localhost:3001`) if you use a different port.

## 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=3001 npm run dev
```

Frontend runs at **http://localhost:3001** so it doesn’t clash with the backend on 3000.

## 3. Connect them

- In **frontend** `.env.local`:  
  `NEXT_PUBLIC_API_URL=http://localhost:3000`  
  (or whatever port the backend uses.)

- In **backend** `.env` (optional):  
  `CORS_ORIGINS=http://localhost:3001`  
  so the browser can call the API from the frontend origin.

Then:

1. Open the frontend (e.g. http://localhost:3001).
2. Register or log in — these hit the backend and store a token.
3. Scan a barcode — frontend calls backend product lookup and records the scan.

## Auth

- **Register**: `POST /api/auth/register` (email, password, name).
- **Login**: `POST /api/auth/login` (email, password) → returns `{ token, user }`.  
  The frontend stores the token and sends `Authorization: Bearer <token>` on API requests.
