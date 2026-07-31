# Roadmap

## Critical

- Add automated backend tests for auth, posts, diary, communities, notifications, and social matching.
- Add frontend smoke tests for login redirect, protected routes, dashboard rendering, diary flow, communities flow, and notifications page.
- Fix root health route ordering in `server/index.js`.
- Move diary like notification logic into `toggleDiaryLike`.
- Audit Spotify endpoints used in `advancedTest.controller.js` against the current Spotify Web API and gracefully disable unavailable calls.
- Add production environment validation on server startup for required env vars.

## High

- Normalize garbled icon/text strings in JSX and CSS.
- Add robust error/loading states to dashboard social fetches.
- Add cursor pagination for global feed and community feed.
- Add comment delete and edit for post and diary comments.
- Add private community invitation flow.
- Add community owner transfer or community deletion flow so admins are not trapped.
- Add notification target routing for post-specific and diary-specific destinations.
- Complete friend/follow system using existing `User.friends` as a starting point or a more explicit relationship model.
- Add moderation permissions for `moderator` role.

## Medium

- Complete `MyMusicTaste.jsx` with dedicated top artist/top track/genre/DNA views.
- Route and complete `MatchMusicTaste.jsx`.
- Add Dream Match preferences UI and backend matching logic.
- Add image rendering for post `images`.
- Add profile privacy settings.
- Add debounced search for diary/community/discover.
- Add admin dashboard for users, communities, posts, and reports.
- Add persisted achievements model.
- Add notification preferences.

## Low

- Split large files such as `Dashboard.jsx`, `MyProfile.jsx`, and `Communities.jsx` into smaller components.
- Consolidate duplicate CSS media query blocks.
- Replace literal symbol UI with icon components where appropriate.
- Add charting with existing `recharts` dependency or remove unused dependency.
- Improve root/client README consistency after every major feature.

## Future

- Real-time chat.
- Real-time notifications through WebSocket or SSE.
- Voice rooms or listening parties.
- Playlist sharing and playlist compatibility.
- Event pages.
- Recommendation engine backed by user/community activity.
- Mobile app shell.

