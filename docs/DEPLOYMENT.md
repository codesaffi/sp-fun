# Deployment

## Local Development

Install dependencies separately:

```bash
cd client
npm install
```

```bash
cd server
npm install
```

Run the client:

```bash
cd client
npm run dev
```

Run the server:

```bash
cd server
npm run dev
```

The root `package.json` does not define app scripts.

## Environment Variables

### Client `.env`

```env
VITE_API_URL=http://localhost:5000
```

### Server `.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-strong-secret
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://localhost:5000/auth/spotify/callback
```

## Spotify Developer Dashboard Setup

1. Create an app in the Spotify Developer Dashboard.
2. Copy Client ID and Client Secret into server env vars.
3. Add local redirect URI:

```text
http://localhost:5000/auth/spotify/callback
```

4. Add production redirect URI after backend deployment:

```text
https://your-backend-domain/auth/spotify/callback
```

5. Ensure requested scopes match real product needs.

## MongoDB Atlas

1. Create a cluster.
2. Create a database user.
3. Configure network access.
4. Copy connection string into `MONGO_URI`.
5. Ensure the database user has read/write permissions.

## GitHub

Recommended:

- Keep `client/` and `server/` deployable as separate Vercel projects, or configure root directories in Vercel.
- Do not commit `.env` files.
- Keep docs updated with deployment changes.

## Frontend Deployment On Vercel

Project settings:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:

```text
VITE_API_URL=https://your-backend-domain
```

`client/vercel.json` rewrites all routes to `index.html` for React Router.

## Backend Deployment On Vercel

Project settings:

- Root directory: `server`
- Install command: `npm install`
- Build command: none required
- Output: Vercel Node serverless function from `index.js`

Environment variables:

```text
NODE_ENV=production
MONGO_URI=...
CLIENT_URL=https://your-frontend-domain
JWT_SECRET=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=https://your-backend-domain/auth/spotify/callback
```

`server/vercel.json` routes all requests to `index.js`.

## Redirect URIs

Local:

```text
http://localhost:5000/auth/spotify/callback
```

Production:

```text
https://your-backend-domain/auth/spotify/callback
```

The production URI must exactly match:

- Spotify Developer Dashboard redirect URI.
- `SPOTIFY_REDIRECT_URI` server env var.

## Production Checklist

- Client builds successfully.
- Server starts without missing env vars.
- MongoDB connection succeeds.
- `/auth/spotify` redirects to Spotify.
- Spotify callback redirects to frontend `/success`.
- `/success` stores JWT and opens `/dashboard`.
- Dashboard loads insights and feed.
- Communities list loads.
- Diary search works.
- Notifications endpoint works.
- CORS allows only production frontend URL.
- Rate limits are acceptable for expected usage.

## Common Deployment Issues

| Issue | Likely Cause | Fix |
|---|---|---|
| Spotify redirect mismatch | `SPOTIFY_REDIRECT_URI` differs from Spotify dashboard | Make them identical. |
| CORS error | `CLIENT_URL` is wrong | Set backend `CLIENT_URL` to frontend origin. |
| Blank client env | `VITE_API_URL` missing at build time | Set Vercel env and redeploy client. |
| MongoDB connection error | Bad `MONGO_URI` or network access | Check Atlas credentials/IP rules. |
| JWT invalid | `JWT_SECRET` changed or missing | Set stable production secret. |
| SPA route 404 | Missing rewrite | Confirm `client/vercel.json`. |
| Server route 404 | Vercel root directory/config issue | Confirm backend root and `server/vercel.json`. |

## Troubleshooting

- Check Vercel function logs for backend errors.
- Check browser network tab for failed API calls.
- Verify env vars in both client and server deployments.
- Confirm Spotify app is not in a restricted mode that blocks test users.
- Use server logs to inspect Spotify error response data in non-production.

