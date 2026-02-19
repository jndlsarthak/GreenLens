# Troubleshooting Guide

## "Not found" Error on Account Creation/Login

If you're seeing "Not found" errors when trying to register or login, follow these steps:

### 1. Check Backend is Running

The backend must be running before the frontend can connect to it.

**Start the backend:**
```bash
cd backend
npm run dev
```

You should see:
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
```

### 2. Verify Backend Health

Open your browser and visit:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-02-19T...",
  "service": "GreenLens Backend"
}
```

If you get a 404 or connection error, the backend isn't running correctly.

### 3. Check Frontend Environment Variable

Make sure `frontend/.env.local` exists and contains:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important:** 
- No trailing slash
- Must match the port your backend runs on (default: 3000)
- Restart the frontend dev server after changing `.env.local`

### 4. Verify Ports

- **Backend**: Should run on port 3000 (default)
- **Frontend**: Should run on port 3001 (or different from backend)

If backend is on a different port, update `NEXT_PUBLIC_API_URL` accordingly.

### 5. Check CORS Configuration

In `backend/.env`, make sure:
```
CORS_ORIGINS=http://localhost:3001
```

Or leave it default (includes both 3000 and 3001).

### 6. Test API Endpoints Directly

Test the register endpoint directly:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456","name":"Test User"}'
```

If this works but the frontend doesn't, it's a frontend configuration issue.

### 7. Check Browser Console

Open browser DevTools (F12) → Console tab. Look for:
- Network errors (CORS, connection refused)
- 404 errors
- CORS policy errors

### 8. Common Issues

**Issue: "Cannot connect to backend"**
- Backend not running → Start it with `npm run dev` in backend folder
- Wrong port → Check `NEXT_PUBLIC_API_URL` matches backend port

**Issue: "404 Not Found"**
- Backend not running
- Wrong API URL
- Backend routes not accessible

**Issue: CORS errors**
- Add frontend URL to `CORS_ORIGINS` in backend `.env`
- Restart backend after changing `.env`

**Issue: "Backend API URL not configured"**
- Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Restart frontend dev server

### 9. Quick Fix Checklist

- [ ] Backend is running (`cd backend && npm run dev`)
- [ ] Backend health check works (`http://localhost:3000/api/health`)
- [ ] `frontend/.env.local` exists with `NEXT_PUBLIC_API_URL=http://localhost:3000`
- [ ] Frontend dev server restarted after changing `.env.local`
- [ ] No port conflicts (backend on 3000, frontend on 3001)
- [ ] CORS configured in backend `.env`

### 10. Still Not Working?

1. **Check backend logs** - Look for errors in the terminal where backend is running
2. **Check frontend logs** - Look for errors in browser console
3. **Verify database** - Make sure PostgreSQL is running and `DATABASE_URL` is correct
4. **Test with curl** - Use curl to test backend endpoints directly

If issues persist, check:
- Database connection (`DATABASE_URL` in backend `.env`)
- Prisma client generated (`npx prisma generate` in backend)
- Database schema pushed (`npx prisma db push` in backend)
