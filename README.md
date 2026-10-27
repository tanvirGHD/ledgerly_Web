# Ledgerly — production-ready personal finance website

Ledgerly is a modern personal finance dashboard built with React, Vite, Express, and MongoDB. The app is designed to help users manage salary, expenses, budgets, savings goals, and monthly reporting in a clean, trustworthy interface.

## Project structure
- `backend/` — Express API with JWT auth and Mongoose models
- `frontend/` — Vite + React app with a mobile-first design system

## Quick start

### 1. Install dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables
Copy the example file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` with your real values:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ledgerly
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Run the app
```bash
cd backend
npm run dev
```

In a second terminal:

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Google sign-in setup

The app already includes Google OAuth routes in `backend/routes/auth.js`, but you still need to configure a real Google Cloud OAuth client.

### Step 1: create a Google OAuth app
1. Go to the Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one.
3. Open APIs & Services → Credentials.
4. Create an OAuth 2.0 Client ID.
5. Select "Web application".
6. Add these authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5173/auth` if needed for local testing in some setups

### Step 2: add credentials to the backend
Add these to `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

### Step 3: restart the backend
```bash
cd backend
npm run dev
```

Then click "Continue with Google" from the sign-in page. The backend will redirect to Google, exchange the auth code, and sign the user into Ledgerly using the same JWT flow.

> Important: do not commit real secrets to Git. Keep them in `.env` only or use a secure deployment platform secret store.

## Production deployment notes
- Backend hosting: Render, Railway, DigitalOcean, Fly.io, or any Node/Express host
- Frontend hosting: Vercel or Netlify
- Set environment variables in your deployment platform, not in source code
- Use HTTPS in production and enable secure cookie/session practices where relevant

## Notes on the current app
- Email/password authentication is already working with JWTs.
- Google OAuth support is scaffolded and ready when credentials are added.
- The app is built mobile-first, with a cleaner visual system and improved layout for phones, tablets, and desktops.
