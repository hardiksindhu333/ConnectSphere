# ConnectSphere Deployment

### 1. Create backend environment file
Copy `backend/.env.example` to `backend/.env` and fill in the real values:
- `MONGODB_URI`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`

### 2. Production readiness improvements
- Replace local MongoDB with managed MongoDB Atlas or another hosted service.
- Store secrets in a secret manager rather than `.env` in production.
- Add monitoring and logging in your production environment.

## Deploying on Render and Vercel

### Backend on Render
- Use Render to deploy the backend service from the `backend` folder.
- Set the build command to `npm ci` and the start command to `node src/index.js`.
- Add the following environment variables in Render:
  - `NODE_ENV=production`
  - `PORT=8000`
  - `MONGODB_URI`
  - `ACCESS_TOKEN_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
  - `CORS_ORIGIN=https://your-frontend.vercel.app`

### Frontend on Vercel
- Deploy the `frontend` folder to Vercel.
- Set the Vercel build command to `npm run build` and the output directory to `dist`.
- Add an environment variable in Vercel:
  - `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`
- If you use cookies for auth, ensure the backend is served over HTTPS and the backend domain is set in `CORS_ORIGIN`.

### Notes
- The frontend will call the backend via `VITE_API_BASE_URL` in production.
- Cookies are configured to use `SameSite=None` and `secure=true` in production for cross-site auth.
- Use MongoDB Atlas or another hosted MongoDB provider rather than local Mongo for production.
