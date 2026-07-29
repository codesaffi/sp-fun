# Tech Stack

## Frontend

| Technology | Where | Why It Is Used |
|---|---|---|
| React 19 | `client/src` | Component-based UI for dashboard, profiles, feed, diary, communities, and notifications. |
| Vite 7 | `client/vite.config.js` | Fast local development and production builds. |
| React Router DOM 7 | `client/src/App.jsx` | Client-side routing and protected page composition. |
| Tailwind CSS 4 | `@import "tailwindcss"`, Tailwind utility classes | Utility styling for many page layouts and responsive behavior. |
| Custom CSS | `client/src/index.css` | Main dashboard, profile, diary, community, notification, modal, and responsive design styles. |
| React Icons | `Dashboard.jsx` | Sidebar/dashboard icons. |
| Framer Motion | `MyProfile.jsx` | Profile transitions, animated tabs/cards, and profile cover/avatar motion. |
| Recharts | package dependency | Available for charting, not currently used in source files inspected. |

## Backend

| Technology | Where | Why It Is Used |
|---|---|---|
| Node.js ES modules | `server/package.json` type module | Modern import/export syntax across server files. |
| Express 5 | `server/index.js`, `server/routes` | HTTP API routing and middleware composition. |
| Mongoose 9 | `server/models`, `server/config/db.js` | MongoDB schemas, validation, indexes, references, and queries. |
| Axios | Spotify controllers/services | HTTP requests to Spotify OAuth and Web APIs. |
| JSON Web Token | `auth.middleware.js`, `spotifyCallback.controller.js` | Application session token after Spotify OAuth. |
| dotenv | `server/index.js` | Loads local environment variables. |
| Helmet | `security.middleware.js` | Sets security-related HTTP headers. |
| CORS | `security.middleware.js` | Allows configured frontend origin. |
| compression | `security.middleware.js` | Compresses responses. |
| express-rate-limit | `security.middleware.js` | Limits `/auth` and `/api` traffic. |

## Database

| Technology | Why |
|---|---|
| MongoDB | Stores users, posts, diary entries, communities, memberships, and notifications. Flexible document structure fits embedded comments and Spotify metadata. |
| MongoDB Atlas | Supported deployment target through `MONGO_URI`. |

## Authentication

- Spotify OAuth Authorization Code flow is used for login.
- The backend stores Spotify `accessToken` and `refreshToken` on `User`.
- The app issues its own 7-day JWT for API authentication.
- Client stores JWT in `localStorage`.

## Deployment

| Technology | Where |
|---|---|
| Vercel frontend | `client/vercel.json` rewrites all routes to `index.html`. |
| Vercel backend | `server/vercel.json` routes all requests to `index.js` with `@vercel/node`. |

## Cloud Services

- Spotify Developer Platform for OAuth and Spotify Web API.
- MongoDB Atlas or another MongoDB provider for production database.
- Vercel for frontend/backend deployment based on included configs.

## State Management

- React `useState`, `useEffect`, and `useMemo`.
- `AuthContext` stores JWT and login/logout actions.
- No Redux/Zustand/global server-state library is present.

## Styling

- Hybrid Tailwind utility classes and large custom CSS file.
- Dark theme with lime accent, glass-like panels, music-oriented cards, grids, modals, and responsive media queries.

## Icons And Animation

- `react-icons/fi` and `react-icons/md` are used in dashboard navigation.
- Some UI symbols are literal text characters in JSX/CSS.
- `framer-motion` is used in profile animations.

## Spotify APIs Used

- Accounts authorize endpoint.
- Accounts token endpoint.
- `/v1/me`
- `/v1/me/top/artists`
- `/v1/me/top/tracks`
- `/v1/me/player/recently-played`
- `/v1/search`
- `/v1/tracks/:id`
- `/v1/albums/:id`
- `/v1/artists/:id`
- `/v1/artists?ids=...`
- `/v1/artists/:id/related-artists`
- `/v1/audio-features?ids=...`
- `/v1/recommendations`

## Image Upload

There is no file upload service. Images are stored as URLs from Spotify metadata or user-entered URL strings for community icons/cover images.

## Build Tools And Package Managers

- npm is used for root, client, and server packages.
- Client scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.
- Server scripts: `npm run dev`, `npm start`.
- Root package only contains Tailwind/PostCSS dev dependencies and no app-level scripts.

## Development Tools

- ESLint is configured in `client/eslint.config.js`.
- Nodemon is used for server development.
- No automated test runner is configured.

