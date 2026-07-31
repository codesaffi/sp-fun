# AI Context

This file is for future AI coding agents.

## Read Order

Start here:

1. `PROJECT_OVERVIEW.md`
2. `CURRENT_PROGRESS.md`
3. `CODING_RULES.md`
4. `AI_CONTEXT.md`
5. `DATABASE.md`
6. `API.md`

Then read the files related to the requested task.

## Project Identity

MusicMatch is a Spotify-powered social platform. It is not a Spotify clone and not a streaming app. Spotify is the data provider; this project owns social identity, matching, communities, diary reviews, posts, comments, likes, and notifications.

## Architectural Rules

- Preserve the React/Vite client and Express/Mongoose server split.
- Preserve the existing route groups unless a change is explicitly requested.
- Preserve API contracts between client and server.
- Preserve model meanings and indexes.
- Prefer extending services/controllers/components over replacing systems.
- Do not rewrite the project.

## Working Rules

- Search before creating files.
- Reuse existing components.
- Reuse existing services.
- Keep changes focused.
- Avoid unnecessary dependencies.
- Ask before architectural changes.
- Keep frontend/backend compatibility.
- Maintain responsive design.
- Keep everything production-ready.
- Update docs when changing routes, schemas, or important behavior.

## Important Current Facts

- JWT is stored in client `localStorage`.
- Server stores Spotify access and refresh tokens on `User`.
- Spotify requests after login should use `spotifyApiRequest`.
- Comments are embedded in posts/diary entries.
- Reviews are diary entries.
- Music matches are computed, not stored.
- Notifications are stored and deduped with `dedupeKey`.
- Communities use `CommunityMember` for roles.
- Official communities are seeded lazily by community list/detail routes.
- Dashboard has internal `view` state and also navigates to route pages for diary, communities, notifications.

## High-Risk Areas

- Spotify API changes can break advanced/recommendation/audio-feature endpoints.
- Auth/session changes affect both client and server.
- Community authorization must be enforced server-side.
- Notification target routing is currently simple.
- Large files such as `Dashboard.jsx`, `MyProfile.jsx`, and `Communities.jsx` are easy to accidentally disturb.
- Existing UI has garbled symbol text; fix deliberately rather than casually replacing content.

## Good Future-Agent Behavior

- Read docs first.
- Inspect actual code before making claims.
- Name tradeoffs before changing architecture.
- Prefer small, verifiable patches.
- Run `npm run build` inside `client/` after frontend changes.
- Run syntax checks or targeted Node checks after backend changes.
- Avoid touching application code during documentation-only tasks.

