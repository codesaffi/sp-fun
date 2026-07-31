# Security

## Authentication Flow

1. User clicks sign in on the client.
2. Client redirects to `/auth/spotify`.
3. Server redirects to Spotify authorization with configured scopes.
4. Spotify redirects back to `/auth/spotify/callback?code=...`.
5. Server exchanges code for Spotify access and refresh tokens.
6. Server fetches Spotify profile and stats.
7. Server creates or updates `User`.
8. Server signs a JWT with `{ id: user._id }` and 7-day expiry.
9. Server redirects to `${CLIENT_URL}/success?token=<jwt>`.
10. Client stores JWT in `localStorage`.
11. Protected client routes and API calls use that token.

## JWT

Location:

- Signed in `spotifyCallback.controller.js`.
- Verified in `auth.middleware.js`.
- Stored in browser `localStorage` by `AuthContext`.

Current strengths:

- Server-side verification on protected API routes.
- 7-day expiry.

Risks:

- `localStorage` token is exposed to XSS.
- No refresh/revocation flow for the app JWT.

Recommendations:

- Consider httpOnly secure cookie sessions in production.
- Add token revocation or short-lived JWT plus refresh strategy.
- If cookies are introduced, add CSRF protection.

## Spotify OAuth

Scopes requested:

```text
user-read-email
user-top-read
user-read-recently-played
user-read-playback-state
playlist-read-private
user-library-read
user-read-currently-playing
user-follow-read
```

Current strengths:

- Access and refresh tokens are stored server-side only.
- User API responses exclude `accessToken` and `refreshToken`.
- Expired Spotify access tokens are refreshed server-side.

Risks:

- OAuth `state` parameter is not implemented.
- Token storage is plain fields in MongoDB.

Recommendations:

- Add OAuth state validation.
- Consider encrypting Spotify tokens at rest.
- Periodically review scopes and remove unused scopes.

## Environment Variables

Server:

- `MONGO_URI`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `PORT`
- `NODE_ENV`

Client:

- `VITE_API_URL`

Recommendations:

- Validate required env vars on startup.
- Never commit `.env` files.
- Use distinct local/staging/production Spotify redirect URIs.

## Protected Routes

Frontend:

- `/dashboard`
- `/diary`
- `/:type/:id`
- `/communities`
- `/communities/:slug`
- `/notifications`

Backend:

- All `/api/user` routes.
- `/api/player/recently-played`.
- `/api/advanced/advanced`.
- All `/api/social`.
- All `/api/posts`.
- All `/api/diary`.
- All `/api/communities`.
- All `/api/notifications`.

## Authorization

Implemented checks:

- Post update requires owner.
- Post delete allows owner or community admin.
- Community post/like/comment requires membership.
- Private community detail/posts/members require membership.
- Community updates/rules/member removal require admin.
- Admin cannot leave their community.
- Diary update/delete requires owner.
- Notification read/delete/clear requires recipient.

Gaps:

- Moderator role exists but has no meaningful permissions.
- Comment edit/delete permissions do not exist because routes do not exist.
- Profile privacy controls are not implemented.

## Validation And Sanitization

Implemented:

- ObjectId route param validation.
- Mongoose validation for schema fields.
- Community string sanitization.
- Comment/caption non-empty checks in controllers.
- Request body size limit of 10 MB.

Gaps:

- Sanitization is not applied uniformly to posts, comments, profile bio, or diary review.
- Some controllers catch broad errors and return generic messages.

## Security Middleware

Implemented in `security.middleware.js`:

- `helmet()`
- `compression()`
- `express.json({ limit: "10mb" })`
- `cors({ origin: CLIENT_URL || "http://localhost:5173" })`
- `/auth` rate limit: 100 requests per 15 minutes.
- `/api` rate limit: 120 requests per minute.

## Potential Vulnerabilities

| Area | Risk | Recommendation |
|---|---|---|
| OAuth | Missing `state` validation | Add signed state token/session. |
| Client JWT | XSS can steal `localStorage` token | Consider httpOnly cookies or harden CSP. |
| Token storage | Spotify tokens stored unencrypted | Encrypt at rest if production risk requires it. |
| Input | Inconsistent sanitization | Centralize validation/sanitization per route. |
| CORS | Misconfigured `CLIENT_URL` can block or expose app | Strict production env management. |
| Mentions | Regex over user names may behave unexpectedly | Add stored handles. |
| Advanced Spotify calls | API failures may surface to users | Isolate optional calls. |

## Production Checklist

- Strong `JWT_SECRET`.
- Production `CLIENT_URL`.
- Production `SPOTIFY_REDIRECT_URI`.
- MongoDB Atlas IP/network rules configured.
- `.env` not committed.
- OAuth redirect URI matches backend deployment URL.
- Rate limits verified for expected usage.
- Error logs monitored.
- Known security gaps triaged.

