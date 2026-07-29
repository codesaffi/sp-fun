# Known Bugs And Issues

This list is based on source inspection, not runtime QA.

## High Severity

### Root health route is likely unreachable

Cause: In `server/index.js`, `app.use(notFoundHandler)` and `app.use(errorHandler)` are registered before `app.get("/")`. Express will hit the not-found handler before the root route.

Possible fix: Move `app.get("/")` before `notFoundHandler`.

Status: Open.

### Diary like notifications are attached to update flow instead of like flow

Cause: `updateDiary` contains notification logic for diary likes and trending reviews, but `toggleDiaryLike` only updates likes and returns counts.

Possible fix: Move diary like/trending notification creation into `toggleDiaryLike` after successful `$addToSet`.

Status: Open.

### Some Spotify advanced endpoints may be unavailable or unstable

Cause: `advancedTest.controller.js` calls Spotify recommendations, audio features, and related artists endpoints. Spotify API availability and behavior can change, and some endpoints have been restricted/deprecated over time.

Possible fix: Verify current Spotify API support, isolate optional calls, return clear warnings without failing the whole endpoint.

Status: Open.

## Medium Severity

### Garbled symbol text appears in JSX/CSS

Cause: Several files contain mojibake such as `â™«`, `Ã—`, `â†’`, and similar sequences where music symbols, arrows, stars, or emoji likely existed.

Possible fix: Replace with proper ASCII labels, React Icons, or valid Unicode consistently.

Status: Open.

### Dashboard internal route state does not reflect external pages

Cause: Dashboard sidebar uses local `view` state for most items and `navigate()` for diary/community/notifications. External pages do not share active state with dashboard view.

Possible fix: Make dashboard nav route-aware or split dashboard views into nested routes.

Status: Open.

### Community admin cannot leave community

Cause: `leaveCommunity` blocks admin users and there is no transfer/delete community feature.

Possible fix: Add ownership transfer or community deletion.

Status: Open.

### `MatchMusicTaste.jsx` and `MyMusicTaste.jsx` are placeholders

Cause: Components exist but do not implement the named feature. `MatchMusicTaste.jsx` is also not routed in `App.jsx`.

Possible fix: Build or remove/rename placeholder pages.

Status: Open.

### Mention detection likely does not match generated handles

Cause: `notifyMentions` searches `User.name` against `@name` tokens, but profile handles are generated visually as lowercased dot-separated names and are not stored as a separate field.

Possible fix: Add a stored unique `handle` field or normalize names and mentions consistently.

Status: Open.

## Low Severity

### `normalise` and `unique` are referenced in `social.controller.js` but not imported or declared there

Cause: `genres` uses `normalise` and `unique`, which are local helpers inside `musicInsights.service.js` but not exported. This will fail if `/api/social/genres` is called.

Possible fix: Export helpers from `musicInsights.service.js`, duplicate small helpers in controller, or refactor genre aggregation into service.

Status: Open.

### Root package has no app scripts

Cause: Root `package.json` only has dev dependencies. Developers must run scripts from `client/` and `server/`.

Possible fix: Add root workspace scripts or document this clearly.

Status: Documented.

### Silent catch blocks hide frontend failures

Cause: Some dashboard fetches catch and ignore errors.

Possible fix: Add user-facing error states or logging strategy.

Status: Open.

### Lint may report unused variables/components

Cause: Examples include `demo` in `Dashboard.jsx` and unused `Posts` helper in `MyProfile.jsx`.

Possible fix: Run client lint and remove unused code.

Status: Open.

## Not Confirmed By Runtime

No full runtime QA or automated test suite was run during documentation generation. The issues above are inspection findings.

