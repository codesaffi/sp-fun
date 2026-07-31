# Requirements

Status values: `Implemented`, `Partial`, `Planned`, `Future`.

## Authentication

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Spotify OAuth login | Redirect users to Spotify authorization and handle callback. | Implemented | Spotify app, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI` | Critical |
| JWT session | Issue 7-day JWT after Spotify callback. | Implemented | `JWT_SECRET`, `jsonwebtoken` | Critical |
| Protected frontend routes | Prevent unauthenticated users from accessing dashboard, diary, communities, notifications, and detail pages. | Implemented | `AuthContext`, `ProtectedRoute` | Critical |
| Protected API routes | Require bearer token for user, player, advanced, social, posts, diary, communities, notifications. | Implemented | `verifyToken` middleware | Critical |
| Logout | Clear local storage and client token state. | Implemented | `AuthContext` | High |
| Refresh Spotify access token | Refresh expired Spotify token on 401 and retry the request. | Implemented | Spotify refresh token, `spotify.service.js` | Critical |

## Profiles

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Current user profile | Return authenticated user without Spotify tokens. | Implemented | `User` model | Critical |
| All users | List all users except current user. | Implemented | `User` model | High |
| User detail | View another user's stats, posts, and diary. | Implemented | `User`, `Post`, `Diary` | High |
| Profile bio editing | Update current user's bio. | Implemented | `PATCH /api/social/profile` | High |
| Gender and preference fields | Store `gender` and `lookingFor`. | Partial | `User` model fields exist, UI is limited | Medium |
| Friends | Store friend references. | Planned | `User.friends` exists, no routes/controllers | High |

## Spotify Statistics

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Top artists | Fetch and store short, medium, and long term top artists on login and refresh. | Implemented | Spotify top artists endpoint | Critical |
| Top tracks | Fetch and store short, medium, and long term top tracks on login and refresh. | Implemented | Spotify top tracks endpoint | Critical |
| Music personality | Infer personality from stats and analysis. | Implemented | `musicInsights.service.js` | High |
| Mood | Infer mood from analysis or listening signals. | Implemented | `musicInsights.service.js`, advanced analysis | High |
| Music DNA | Estimate energy, danceability, positivity, acousticness, instrumentalness, and tempo. | Implemented | `musicInsights.service.js` | High |
| Advanced Spotify insights | Fetch top items, audio features, recommendations, related artists, albums. | Partial | Spotify endpoints; some calls may fail depending on Spotify API availability/scopes | Medium |

## Recently Played

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Fetch recently played | Retrieve up to 20 recently played tracks from Spotify. | Implemented | `user-read-recently-played` scope | High |
| Persist recently played | Overwrite `user.recentlyPlayed` with latest tracks. | Implemented | `User` model | High |
| Display recently played | Show recent tracks in dashboard library/profile. | Implemented | `RecentlyPlayed`, `MyProfile` | Medium |

## Communities

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Official communities | Seed official genre/artist communities on listing/detail. | Implemented | `ensureOfficialCommunities` | High |
| Community discovery | Return suggested, trending, newest, official, and user communities. | Implemented | `Community`, `CommunityMember` | High |
| Community search | Text search name, description, tags, genre. | Implemented | MongoDB text index | High |
| Create community | Create public/private community and make creator admin. | Implemented | `Community`, `CommunityMember` | High |
| Join/leave community | Join public communities and leave as non-admin. | Implemented | membership model | High |
| Private communities | Block private community access for non-members. | Partial | Privacy is enforced, invitations are not implemented | Medium |
| Admin management | Edit details, rules, remove non-admin members. | Implemented | role checks | High |
| Moderators | Role enum includes moderator. | Partial | Schema supports it, no promotion UI/routes | Medium |

## Posts

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Global feed | List latest posts sorted newest first. | Implemented | `Post` model | Critical |
| Create post | Create top artist/song/profile/mood/genres/recent/custom posts. | Implemented | `POST /api/posts` | Critical |
| Community posts | Create and list posts scoped to a community. | Implemented | `Post.community`, membership checks | High |
| Edit own posts | Update caption for posts owned by current user. | Implemented | `PATCH /api/posts/:postId` | High |
| Delete post | Owner or community admin can delete. | Implemented | role check | High |
| Music attachment | Community post composer can attach song, album, or artist metadata. | Implemented | diary Spotify search | Medium |

## Comments

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Post comments | Add embedded comments to posts. | Implemented | `Post.comments` | High |
| Diary comments | Add embedded comments to diary entries. | Implemented | `Diary.comments` | High |
| Comment validation | Reject empty comments and cap at 500 chars. | Implemented | Mongoose validation and controller checks | High |
| Comment editing/deletion | Allow comment owners to edit/delete. | Planned | new routes needed | Medium |

## Likes

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Post likes | Toggle likes with atomic MongoDB operators. | Implemented | `Post.likes` | High |
| Diary likes | Toggle diary entry likes. | Implemented | `Diary.likes` | High |
| Like notifications | Notify post owners. | Implemented for posts | Notification model | Medium |
| Diary like notifications | Notify diary owners. | Partial | Notification logic is not in the diary like endpoint | Medium |

## Notifications

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| List notifications | Paginate notifications with unread count. | Implemented | `Notification` model | High |
| Mark read | Mark a notification read. | Implemented | `PATCH /api/notifications/:id/read` | High |
| Mark all read | Mark all unread notifications read. | Implemented | `PATCH /api/notifications/read-all` | Medium |
| Delete notification | Delete individual notification. | Implemented | `DELETE /api/notifications/:id` | Medium |
| Clear all | Delete all notifications for current user. | Implemented | `DELETE /api/notifications` | Medium |
| Polling dropdown | Fetch latest notifications every 30 seconds. | Implemented | `NotificationCenter` | Medium |
| Real-time notifications | Push notifications through WebSocket/SSE. | Future | real-time service | Medium |

## Music Match

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Leaderboard | Rank other users by compatibility. | Implemented | `compatibility()` | High |
| Compare user | Return detailed compatibility breakdown and reasons. | Implemented | `GET /api/social/compare/:userId` | High |
| Match notifications | Notify high compatibility users at bucketed thresholds. | Implemented | `leaderboard` controller | Medium |
| Music match page | Dedicated page exists as placeholder only. | Partial | `MatchMusicTaste.jsx` not routed | Low |

## Dream Match

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Dream match concept | Match users by deeper compatibility and preference fields. | Planned | `gender`, `lookingFor`, friends, matching UX | Medium |
| Preferences | Data fields exist on `User`. | Partial | no complete UX | Medium |

## Diary And Reviews

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Spotify search | Search songs, albums, artists with limit 10. | Implemented | Spotify search endpoint | High |
| Spotify details | Fetch detailed track/album/artist metadata. | Implemented | Spotify details endpoints | High |
| Save review | Create unique diary entry per user, Spotify item, and type. | Implemented | `Diary` unique index | High |
| Rating | Store rating 1-5. | Implemented | Mongoose min/max | High |
| Review text | Store review up to 2000 chars. | Implemented | `Diary.review` | High |
| Status | Store favorite/listening/listened/want_to_listen/revisited. | Implemented | enum | Medium |
| Share as post | Create custom post from diary review. | Implemented | `POST /api/posts` | Medium |

## Search

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| User discovery search | Filter serialized user match entries by query. | Implemented | `discover` controller | Medium |
| Community search | MongoDB text search over community fields. | Implemented | community text index | High |
| Spotify diary search | Search Spotify metadata. | Implemented | Spotify API | High |
| Full-text feed search | Search posts/comments. | Planned | text indexes/routes | Low |

## Feed

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Global feed display | Dashboard feed view lists posts. | Implemented | `Dashboard`, `PostCard` | Critical |
| Optimistic likes/comments | Likes and comments update optimistically. | Partial | implemented, but response shape can make likes less precise | Medium |
| Empty states | Show empty feed/profile/diary/community states. | Implemented | CSS/components | Medium |

## Responsive Design

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Desktop sidebar | Fixed dashboard sidebar. | Implemented | `index.css` | High |
| Mobile navigation | Dashboard rail becomes bottom navigation. | Implemented | CSS media queries | High |
| Responsive cards/grids | Profile, community, feed, diary grids adapt to viewport. | Implemented | Tailwind utilities and CSS | High |
| Polish all mobile text/layout | Ensure all labels fit cleanly. | Partial | some labels/icons need cleanup | Medium |

## Security

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| CORS restriction | Restrict origin to `CLIENT_URL`. | Implemented | `cors` | Critical |
| Helmet | Apply HTTP security headers. | Implemented | `helmet` | High |
| Compression | Compress responses. | Implemented | `compression` | Medium |
| Rate limiting | Limit auth and API traffic. | Implemented | `express-rate-limit` | High |
| Token exclusion | Exclude Spotify tokens from user API responses. | Implemented | Mongoose `select` | Critical |
| Input sanitization | Sanitize community strings. | Partial | not applied consistently everywhere | High |

## Performance

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Limited feed queries | Limit posts to 100 and community posts to 50. | Implemented | MongoDB limits | Medium |
| Indexes | Index user/post/community/notification access patterns. | Implemented | Mongoose indexes | High |
| Spotify refresh de-dupe | Prevent duplicate token refreshes per user. | Implemented | `refreshesInFlight` map | High |
| Client bundle optimization | Vite production build. | Implemented | Vite | Medium |
| Pagination beyond notifications | Add cursor pagination to feeds. | Planned | API changes | Medium |

## Deployment

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Client deployment | Vercel SPA rewrite. | Implemented | `client/vercel.json` | High |
| Backend deployment | Vercel Node serverless routing. | Implemented | `server/vercel.json` | High |
| MongoDB Atlas | Production MongoDB connection. | Supported | `MONGO_URI` | Critical |
| Spotify redirect URIs | Configure local and production callbacks. | Required setup | Spotify dashboard | Critical |

## Future Features

| Requirement | Description | Current Status | Dependencies | Priority |
|---|---|---:|---|---:|
| Friend/follow system | User relationships, requests, activity filtering. | Planned | user routes/models | High |
| Real-time chat | Private or community messaging. | Future | WebSocket/SSE provider | Medium |
| Achievements | Replace static badges with persisted progress. | Planned | new model/service | Medium |
| Playlist sharing | Share playlists from Spotify or local metadata. | Future | Spotify playlist scopes/routes | Medium |
| Admin dashboard | Moderation, analytics, and user/community management. | Future | role model | Medium |
| Testing suite | Unit, integration, and frontend tests. | Planned | Vitest/Jest/Playwright/Supertest | Critical |

