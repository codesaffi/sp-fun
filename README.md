# MusicMatch

MusicMatch is a Spotify-powered social platform built with the MERN stack. Spotify provides identity and listening data; MusicMatch provides the social experience around that data: profiles, feeds, compatibility matching, communities, diary reviews, likes, comments, and notifications.

This is not a Spotify clone and not a music streaming app.

## Features

- Spotify OAuth login.
- JWT-protected dashboard and API.
- Spotify top artists, top tracks, recently played, and derived music insights.
- Music personality, mood, music DNA, and compatibility matching.
- Global feed posts with likes, comments, edits, and deletes.
- Community discovery, creation, membership, admin rules, and community posts.
- Music diary with Spotify search, ratings, reviews, statuses, likes, comments, and sharing to posts.
- Notifications dropdown and full notifications page.
- Responsive dashboard sidebar and mobile bottom navigation.

## Screenshots

Screenshots are not currently committed to the repository. Recommended future captures:

- Landing/login screen.
- Dashboard home.
- Feed.
- Profile.
- Communities.
- Music diary.
- Notifications.

## Tech Stack

- Frontend: React 19, Vite 7, React Router 7, Tailwind CSS 4, custom CSS, React Icons, Framer Motion.
- Backend: Node.js, Express 5, Mongoose 9, Axios, JWT, Helmet, CORS, compression, express-rate-limit.
- Database: MongoDB.
- External API: Spotify OAuth and Spotify Web API.
- Deployment: Vercel-ready client and server configs.

## Project Structure

```text
client/   React/Vite frontend
server/   Express/Mongoose backend
docs/     Full project documentation for humans and AI agents
```

## Installation

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

## Environment Variables

Client `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Server `.env`:

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

## Running Locally

Start the server:

```bash
cd server
npm run dev
```

Start the client:

```bash
cd client
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

## Deployment

The repository includes:

- `client/vercel.json` for SPA route rewrites.
- `server/vercel.json` for Vercel Node routing.

Read [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) before deploying.

## Documentation

Start here:

- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Current Progress](docs/CURRENT_PROGRESS.md)
- [Coding Rules](docs/CODING_RULES.md)
- [AI Context](docs/AI_CONTEXT.md)
- [Database](docs/DATABASE.md)
- [API](docs/API.md)
- [Documentation Index](docs/README.md)

Recommended prompt for future AI agents:

```text
Read the documentation inside the docs folder. Start with PROJECT_OVERVIEW.md, CURRENT_PROGRESS.md, CODING_RULES.md, AI_CONTEXT.md, DATABASE.md, and API.md. Summarize your understanding of the project and wait for my instructions.
```

## Roadmap

Near-term priorities:

- Add automated tests.
- Fix known issues documented in `docs/KNOWN_BUGS.md`.
- Complete friend/follow and Dream Match flows.
- Complete dedicated music taste and match pages.
- Improve feed pagination, notification targeting, and community moderation.

See [docs/TODO.md](docs/TODO.md) for the full roadmap.

## Contributing

Read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) and [docs/CODING_RULES.md](docs/CODING_RULES.md) before contributing.

## License

The server package currently declares `ISC`. No separate root license file is present.
