# Features

## Spotify Login

Purpose: Authenticate users with Spotify and seed their profile with listening data.

Frontend flow: `Home.jsx` redirects to `${VITE_API_URL}/auth/spotify`. `Success.jsx` reads `token` from the callback URL, stores it through `AuthContext`, and navigates to `/dashboard`.

Backend flow: `spotifyLogin` builds the Spotify authorize URL. `spotifyCallback` exchanges the authorization code, loads `/v1/me`, loads top artists/tracks for short, medium, and long ranges, creates or updates the `User`, stores analysis, creates a welcome notification for new users, signs a JWT, and redirects to the client.

Database usage: `User.spotifyId`, profile fields, Spotify tokens, `stats`, and `analysis`.

API usage: Spotify Accounts API, `/v1/me`, `/v1/me/top/artists`, `/v1/me/top/tracks`.

Future improvements: PKCE, refresh-token health UI, stricter state parameter validation, and richer onboarding.

## Dashboard

Purpose: Main authenticated experience and navigation hub.

Frontend flow: `Dashboard.jsx` fetches `/api/social/insights?refresh=true`, `/api/social/leaderboard`, and `/api/posts`. It renders internal views: home, feed, discover/search, matches, library, profile, users, taste, recent, and advanced test.

Backend flow: Social controllers refresh stats when requested, compute analysis and compatibility, and return public user summaries.

Database usage: `User`, `Post`, `Notification` through leaderboard notifications.

Future improvements: split dashboard views into separate routes/components, add better loading/error states, and make nav active state route-aware for external pages.

## Stats, Top Artists, Top Tracks

Purpose: Display Spotify-derived listening identity.

Frontend flow: `MyProfile.jsx`, `UserProfile.jsx`, and dashboard cards read `user.stats` and social insight responses.

Backend flow: stats are fetched on Spotify callback and via `refreshSpotifyStats` when `/api/social/insights?refresh=true` is called.

Database usage: `User.stats.shortTerm`, `mediumTerm`, `longTerm`.

API usage: Spotify top artists and top tracks endpoints.

Future improvements: cache invalidation policy, user-selected time range on dashboard, and chart visualizations.

## Recently Played

Purpose: Show recent listening history and improve compatibility signals.

Frontend flow: `RecentlyPlayed.jsx` calls `/api/player/recently-played`; `MyProfile` also displays `user.recentlyPlayed`.

Backend flow: `getRecentlyPlayed` calls Spotify recently played, normalizes tracks, stores them on `User.recentlyPlayed`, and returns them.

Database usage: `User.recentlyPlayed`.

API usage: Spotify `/v1/me/player/recently-played?limit=20`.

Future improvements: periodic refresh, pagination, and deduped listening timeline.

## User Profiles And Other User Profiles

Purpose: Give users a music identity page and let them inspect others.

Frontend flow: `MyProfile` aggregates profile data, posts, diary entries, communities, and matches. `OtherUsers` lists users and opens `UserProfile`, which shows another user's stats, posts, and diary.

Backend flow: `user.controller.js` returns current user, all users, or a specific user without Spotify tokens.

Database usage: `User`, `Post`, `Diary`, `CommunityMember`, `Community`.

Future improvements: public profile URLs, follow/friend actions, privacy controls, and editable avatar/country/preferences UI.

## Music Matching

Purpose: Rank and compare users by listening compatibility.

Frontend flow: dashboard match cards call `/api/social/compare/:userId`; discover and leaderboard views show scores.

Backend flow: `compatibility()` compares top artists, tracks, genres, mood, personality, and recently played overlap. `leaderboard` also creates notifications for high matches.

Database usage: no match collection; computed from `User.stats`, `User.analysis`, and `User.recentlyPlayed`.

Future improvements: persist match snapshots, add preference-aware Dream Match, explain weighting in UI.

## Dream Match

Purpose: Planned deeper matching experience.

Current state: `User` has `gender` and `lookingFor`, but there are no complete routes or UI for Dream Match. `MatchMusicTaste.jsx` exists as a placeholder and is not routed in `App.jsx`.

Future improvements: design matching preferences, consent/privacy controls, match requests, and friend/follow conversion.

## Posts, Likes, Comments

Purpose: Social feed for music moments.

Frontend flow: `Dashboard` creates posts from insight templates. `PostCard` renders posts, likes, comments, edit, and delete actions. Community detail also uses `PostCard`.

Backend flow: `post.controller.js` lists posts, creates posts, updates owner captions, deletes by owner or community admin, toggles likes atomically, and adds comments.

Database usage: `Post` with embedded comments and user/community references.

Notifications: post likes, comments, popular post milestones, community posts, and mentions.

Future improvements: comment moderation, image rendering for `images`, cursor pagination, edit history, and feed filters.

## Communities And Community Roles

Purpose: Group users around genres/artists and let them post together.

Frontend flow: `Communities.jsx` shows discovery sections, create modal, detail page, posts/members/about tabs, community post composer, member removal, rule creation, and details editing.

Backend flow: `community.controller.js` seeds official communities, searches/list communities, creates communities, joins/leaves, enforces admin role for edits/removal/rules, and lists posts/members.

Database usage: `Community`, `CommunityMember`, `Post`, `Notification`.

Roles: `admin`, `moderator`, `member`. Admin is enforced. Moderator exists in schema but has no dedicated UI flow.

Future improvements: invitations, moderator permissions, community deletion/transfer, community analytics.

## Notifications

Purpose: Surface relevant social activity.

Frontend flow: `NotificationCenter` polls every 30 seconds and shows a dropdown. `Notifications.jsx` shows a full notification list with mark-all-read, clear-all, and delete.

Backend flow: `notification.controller.js` lists, marks read, marks all read, deletes one, and clears all. `notification.service.js` creates deduped notifications and mention notifications.

Database usage: `Notification` with indexes for recipient/time and recipient/dedupeKey.

Future improvements: real-time delivery, richer target routing for posts/diary details, notification preferences.

## Music Diary, Reviews, Review Ratings

Purpose: Let users save listening memories and reviews tied to Spotify metadata.

Frontend flow: `Diary.jsx` searches Spotify by song/album/artist. `DiaryDetail.jsx` shows metadata and review form. `DiaryEntryCard` renders saved entries with likes/comments/edit/delete/share.

Backend flow: `diary.controller.js` searches Spotify, fetches details, creates unique entries, updates owner fields, deletes owner entries, toggles likes, and adds comments.

Database usage: `Diary` with unique `{ user, spotifyId, type }` index.

API usage: Spotify search, track/album/artist details, artist related artists, artist genre lookup for tracks.

Future improvements: dedicated diary detail route, review feeds, tag filters, diary privacy.

## Search

Purpose: Find users, communities, and Spotify metadata.

Frontend flow: dashboard discover searches users; communities search by query; diary searches Spotify.

Backend flow: user discovery filters serialized compatibility entries, community search uses MongoDB text search, diary search calls Spotify.

Future improvements: debounced search, ranked feed search, autocomplete, and server-side user search fields.

## Responsive UI

Purpose: Keep the app usable on desktop and mobile.

Frontend flow: `index.css` defines fixed dashboard sidebar on desktop and bottom dashboard navigation on mobile. Tailwind utility classes are used heavily in older/profile pages.

Future improvements: reduce duplicate media query blocks, normalize typography, and fix garbled symbol text.

## Authentication, Token Refresh, Protected Routes

Purpose: Secure user-specific data and keep Spotify API access alive.

Frontend flow: token is stored in `localStorage`; protected routes check token presence.

Backend flow: JWT is verified on protected APIs. Spotify API requests refresh the access token and retry once when Spotify returns 401.

Future improvements: move JWT storage to httpOnly cookies, add token revocation, add CSRF strategy if cookies are introduced.

