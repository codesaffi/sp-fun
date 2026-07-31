# Coding Rules For Future AI Agents

These rules are specific to this project and should be read before changing code.

## Core Rules

- Do not rewrite working systems when a targeted extension will solve the request.
- Read `PROJECT_OVERVIEW.md`, `CURRENT_PROGRESS.md`, `AI_CONTEXT.md`, `DATABASE.md`, and `API.md` before coding.
- Search the codebase before creating new files, routes, models, or components.
- Preserve the current MERN architecture: React/Vite client, Express API, Mongoose models, Spotify service layer.
- Keep frontend and backend contracts compatible.
- Maintain backward compatibility for existing API responses unless the user explicitly approves a breaking change.
- Keep commits and changes focused.

## Frontend Rules

- Reuse existing components such as `PostCard`, `DiaryEntryCard`, `NotificationCenter`, `ProtectedRoute`, and `JoinedCommunities`.
- Preserve the current dashboard/sidebar/mobile navigation structure unless the task is navigation-specific.
- Maintain responsive behavior at 760px, 600px, and 420px breakpoints.
- Use existing CSS classes and Tailwind patterns before inventing new visual systems.
- Do not change the visual identity unnecessarily.
- Add loading, empty, and error states for new data-fetching views.
- Keep authenticated fetches consistent: `Authorization: Bearer ${token}`.
- Keep notification navigation logic centralized in `notificationUtils.js`.

## Backend Rules

- Keep controllers focused on request orchestration, validation, authorization, and response shape.
- Put reusable business logic in `services/`.
- Put reusable small helpers in `utils/`.
- Always validate ObjectId route params with `validateObjectId`.
- Use `asyncHandler` for async route handlers.
- Use `AppError` for consistent propagated errors.
- Exclude Spotify tokens from user-facing responses.
- Validate and sanitize user input, especially strings that become community content, posts, comments, or profile fields.
- Optimize database queries with targeted indexes when adding new high-traffic access patterns.
- Use `populate` consistently for user-facing posts, diary entries, communities, and notifications.

## Database Rules

- Do not add a collection unless it has a clear lifecycle and query reason.
- Comments are currently embedded in `Post` and `Diary`; keep that pattern unless requirements outgrow embedded comments.
- Reviews are diary entries; do not create a separate reviews collection without a product decision.
- Music matches are computed from users; do not persist matches unless adding match history, decisions, or notifications that require it.
- Respect existing unique indexes:
  - `User.spotifyId`
  - `Community.slug`
  - `CommunityMember.community + user`
  - `Diary.user + spotifyId + type`
  - `Notification.recipient + dedupeKey`

## Spotify Rules

- Use `spotifyApiRequest` for Spotify Web API calls after login so token refresh works.
- Use `requestSpotifyAccessToken` for authorization code exchange.
- Do not expose Spotify access or refresh tokens to the client.
- Keep scopes in `auth.controller.js` aligned with actual Spotify API calls.
- Handle Spotify failures gracefully; not all endpoints are reliable for every user/account.

## Notification Rules

- Use `createNotification` for deduped notification creation.
- Use `dedupeKey` for events that should not spam users.
- Do not notify users about their own actions.
- Update `notificationUtils.js` when adding new notification target types.

## Security Rules

- Never log or return secrets or Spotify tokens.
- Preserve Helmet, CORS, compression, body limit, and rate limiting.
- Keep `CLIENT_URL` CORS restrictive in production.
- Prefer explicit authorization checks over UI-only restrictions.
- If moving JWT from `localStorage` to cookies, add CSRF protection and document the migration.

## Style Rules

- Follow existing naming conventions:
  - `*.routes.js`
  - `*.controller.js`
  - `*.service.js`
  - PascalCase React components and Mongoose models.
- Avoid unnecessary dependencies.
- Prefer readable, modular code over clever abstractions.
- Add comments only where they clarify non-obvious logic.
- Keep generated documentation up to date when changing APIs, models, or features.

