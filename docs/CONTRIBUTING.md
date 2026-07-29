# Contributing

## Working Style

- Read the docs before coding.
- Keep changes small and focused.
- Preserve current architecture.
- Update docs when changing APIs, schemas, deployment, or major behavior.
- Do not rewrite working code without a clear reason.

## Branch Strategy

Recommended:

- `main` for stable work.
- Feature branches named `feature/<short-name>`.
- Bug branches named `fix/<short-name>`.
- Documentation branches named `docs/<short-name>`.

## Code Style

- Frontend components use PascalCase.
- Backend files follow `*.routes.js`, `*.controller.js`, `*.service.js`.
- Prefer existing CSS/Tailwind patterns.
- Keep controllers thin and use services for reusable logic.
- Use `asyncHandler` and `AppError` for backend async errors.
- Validate ObjectId params.
- Do not expose Spotify tokens.

## Testing

No test suite is currently configured. Until tests are added:

- Run `npm run build` in `client/` for frontend changes.
- Run `npm run lint` in `client/` when touching frontend code.
- Run targeted Node syntax checks for backend files if needed.
- Manually smoke-test affected flows.

Recommended future setup:

- Backend: Vitest or Jest with Supertest.
- Frontend: Vitest + React Testing Library.
- E2E: Playwright for auth-adjacent mocked flows and responsive UI.

## Pull Requests

Each PR should include:

- Summary of what changed.
- Affected frontend/backend areas.
- Any API or schema changes.
- Validation performed.
- Screenshots for UI changes when possible.
- Documentation updates if needed.

## Review Checklist

- Does the change preserve API compatibility?
- Are authorization checks server-side?
- Are inputs validated/sanitized?
- Are user-facing loading/error states handled?
- Does the UI work on mobile?
- Are database queries indexed or limited when needed?
- Are Spotify calls routed through refresh-aware helpers?
- Are docs updated?

