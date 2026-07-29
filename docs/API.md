# API

Base URL in the client is `VITE_API_URL`. API routes generally live under `/api`, while Spotify OAuth routes live under `/auth`.

Protected endpoints require:

```http
Authorization: Bearer <jwt>
```

Common error shape from centralized error middleware:

```json
{ "success": false, "message": "Error message" }
```

Some controllers also return `{ "message": "..." }` directly.

## Auth

### GET /auth/spotify

Authentication: none.

Controller: `spotifyLogin`

Description: Redirects the browser to Spotify authorization.

Query parameters: none.

Response: HTTP redirect to `https://accounts.spotify.com/authorize`.

Errors: propagated through `asyncHandler` if URL construction fails.

Example request:

```http
GET /auth/spotify
```

### GET /auth/spotify/callback

Authentication: Spotify authorization code.

Controller: `spotifyCallback`

Description: Exchanges Spotify authorization code, fetches profile/top data, creates or updates user, signs JWT, redirects to frontend `/success?token=...`.

Query parameters:

| Name | Required | Description |
|---|---:|---|
| `code` | yes | Spotify authorization code. |
| `error` | no | Spotify authorization error. |

Models used: `User`, `Notification`.

Response: Redirect to `${CLIENT_URL}/success?token=<jwt>`.

Errors:

- `400` missing code or Spotify authorization error.
- `500` Spotify login failed.

## User

### GET /api/user/me

Authentication: required.

Controller: `getMe`

Description: Returns the authenticated user without Spotify tokens.

Response example:

```json
{
  "_id": "USER_ID",
  "spotifyId": "spotify-user-id",
  "name": "A Listener",
  "email": "listener@example.com",
  "avatar": "https://...",
  "stats": {},
  "recentlyPlayed": [],
  "bio": ""
}
```

Errors: `404` user not found, `500` server error.

### GET /api/user/all

Authentication: required.

Controller: `getAllUsers`

Description: Lists every user except current user, excluding Spotify tokens.

Response: array of users.

Errors: `500` server error.

### GET /api/user/:userId

Authentication: required.

Controller: `getUserById`

Middleware: `validateObjectId("userId")`

Description: Returns another user's profile without Spotify tokens.

Errors: `400` invalid id, `404` user not found, `500` server error.

## Social

All `/api/social` routes use `verifyToken`.

### GET /api/social/insights

Controller: `myInsights`

Query parameters:

| Name | Required | Description |
|---|---:|---|
| `refresh` | no | When `true`, refreshes Spotify top stats before response. |

Models used: `User`.

Response example:

```json
{
  "user": {
    "_id": "USER_ID",
    "name": "A Listener",
    "avatar": "https://...",
    "country": null,
    "personality": "The Explorer",
    "mood": "Curious",
    "favoriteArtist": "Still listening"
  },
  "personality": "The Explorer",
  "mood": "Curious",
  "topGenres": ["indie"],
  "favoriteArtist": { "name": "Artist", "image": "https://...", "genres": [] },
  "favoriteTrack": { "name": "Track", "artist": "Artist", "image": "https://..." },
  "listeningDiversity": 10,
  "musicDna": { "energy": 52, "danceability": 50 },
  "genreDistribution": [],
  "description": "A the explorer with a curious listening mood."
}
```

Errors: `404` user not found; Spotify errors may propagate.

### GET /api/social/discover

Controller: `discover`

Query parameters:

| Name | Required | Description |
|---|---:|---|
| `q` | no | Case-insensitive filter over serialized user compatibility entries. |

Response: sorted array of public users with `compatibility`.

### GET /api/social/leaderboard

Controller: `leaderboard`

Description: Returns top 10 compatible users and creates match notifications for scores >= 80.

Models used: `User`, `Notification`.

Response: array of public users with compatibility score and breakdown.

### GET /api/social/genres

Controller: `genres`

Description: Counts genre usage across users from stats and analysis.

Response example:

```json
[{ "name": "indie", "users": 3 }]
```

### PATCH /api/social/profile

Controller: `updateProfile`

Request body:

```json
{
  "bio": "Music keeps the memories we forget to save.",
  "country": "US",
  "gender": "other",
  "lookingFor": "everyone"
}
```

Only `bio`, `country`, `gender`, and `lookingFor` are allowed.

Response: public user summary from `publicUser()`.

Errors: `400` could not update profile.

### GET /api/social/compare/:userId

Controller: `compare`

Middleware: `validateObjectId("userId")`

Description: Returns detailed compatibility between current user and target user.

Response example:

```json
{
  "user": { "_id": "USER_ID", "name": "A Listener" },
  "score": 86,
  "breakdown": {
    "topArtists": 50,
    "topSongs": 20,
    "genres": 80,
    "mood": 100,
    "personality": 48,
    "listeningHistory": 0
  },
  "reasons": ["You both mostly listen to indie."],
  "sharedArtists": [],
  "sharedTracks": [],
  "sharedGenres": ["indie"],
  "sharedRecent": [],
  "personality": "The Explorer",
  "mood": "Curious",
  "reason": "You both mostly listen to indie."
}
```

Errors: `400` invalid id, `404` user not found.

## Posts

All `/api/posts` routes use `verifyToken`.

### GET /api/posts

Controller: `listPosts`

Description: Returns up to 100 newest posts populated with author, community, and comment users.

Response: array of posts.

Errors: `500` could not load feed.

### GET /api/posts/user/:userId

Controller: `listPostsByUser`

Middleware: `validateObjectId("userId")`

Description: Returns posts by a specific user.

### POST /api/posts

Controller: `createPost`

Request body:

```json
{
  "caption": "My current favorite song is on repeat.",
  "type": "custom",
  "artist": { "name": "Artist" },
  "song": { "name": "Song" },
  "album": { "name": "Album" },
  "genres": ["indie"],
  "musicProfile": "The Explorer",
  "mood": "Curious",
  "images": ["https://..."],
  "community": "community-slug"
}
```

Models used: `Post`, `Community`, `CommunityMember`, `Notification`.

Behavior:

- Caption is required.
- If `community` is provided, it must exist and the user must be a member.
- Community posts notify other members and mention targets.

Response: `201` populated post.

Errors: `400`, `403`, `404`.

### PATCH /api/posts/:postId

Controller: `updatePost`

Middleware: `validateObjectId("postId")`

Request body:

```json
{ "caption": "Updated caption" }
```

Behavior: only post owner can update.

Response: populated post.

Errors: `404` post not found, `400` could not update.

### DELETE /api/posts/:postId

Controller: `deletePost`

Behavior: owner can delete; community admin can delete community posts.

Response: `204 No Content`.

Errors: `403`, `404`, `400`.

### POST /api/posts/:postId/like

Controller: `toggleLike`

Behavior: toggles like atomically. Community posts require membership. Creates post-like and popular-post notifications.

Response example:

```json
{ "liked": true, "likes": 4 }
```

### POST /api/posts/:postId/comments

Controller: `addComment`

Request body:

```json
{ "text": "Great pick." }
```

Behavior: rejects empty comments. Community posts require membership. Creates comment notifications and mention notifications for community posts.

Response: `201` populated post.

## Diary

All `/api/diary` routes use `verifyToken`.

### GET /api/diary/search

Controller: `searchSpotify`

Query parameters:

| Name | Required | Description |
|---|---:|---|
| `q` | yes | Search query. |
| `type` | no | `song`, `album`, or `artist`. Defaults to `song`. |

Spotify limit: 10.

Response: array of formatted Spotify items.

Errors: `400` invalid query/type, Spotify errors.

### GET /api/diary/details/:type/:spotifyId

Controller: `spotifyDetails`

Description: Fetches detailed metadata for a song, album, or artist.

Response includes base fields and may include:

- `tracks` for albums.
- `related` for artists.
- `genres` for songs based on first artist lookup.

### GET /api/diary/me

Controller: `listMyDiary`

Response: current user's diary entries sorted newest first.

### GET /api/diary/user/:userId

Controller: `listUserDiary`

Middleware: `validateObjectId("userId")`

Response: target user's diary entries sorted newest first.

### POST /api/diary

Controller: `createDiary`

Request body:

```json
{
  "spotifyId": "spotify-id",
  "type": "song",
  "title": "Song",
  "artist": "Artist",
  "album": "Album",
  "image": "https://...",
  "rating": 5,
  "review": "Loved it.",
  "status": "listened",
  "entryDate": "2026-07-29"
}
```

Response: `201` populated diary entry.

Errors: `400` missing details, `409` duplicate user/item/type.

### PUT /api/diary/:entryId

Controller: `updateDiary`

Allowed body fields: `rating`, `review`, `status`, `entryDate`.

Behavior: only owner can update.

Response: populated diary entry.

### DELETE /api/diary/:entryId

Controller: `deleteDiary`

Behavior: only owner can delete.

Response: `204 No Content`.

### POST /api/diary/:entryId/like

Controller: `toggleDiaryLike`

Response example:

```json
{ "liked": true, "likes": 2 }
```

### POST /api/diary/:entryId/comments

Controller: `addDiaryComment`

Request body:

```json
{ "text": "This review convinced me." }
```

Response: `201` populated diary entry.

## Communities

All `/api/communities` routes use `verifyToken`.

### GET /api/communities

Controller: `listCommunities`

Query parameters:

| Name | Required | Description |
|---|---:|---|
| `q` | no | MongoDB text search query. |

Behavior: ensures official communities exist before listing.

Response:

```json
{
  "communities": [],
  "trending": [],
  "newest": [],
  "active": [],
  "official": [],
  "user": [],
  "suggested": []
}
```

### GET /api/communities/mine

Controller: `listMyCommunities`

Response: communities joined by current user with member counts.

### POST /api/communities

Controller: `createCommunity`

Request body:

```json
{
  "name": "Dream Pop",
  "description": "For dreamy pop listeners.",
  "icon": "music",
  "coverImage": "https://...",
  "genre": "Dream Pop",
  "tags": ["dream pop", "indie"],
  "privacy": "public"
}
```

Behavior: creates slug, rejects duplicate slug, creates admin membership.

Response: `201` serialized community.

### GET /api/communities/:slug

Controller: `getCommunity`

Behavior: ensures official communities exist, blocks private communities for non-members, includes admin user.

Response: serialized community with `admin`.

### PATCH /api/communities/:slug

Controller: `updateCommunity`

Authz: admin only.

Allowed fields: `description`, `coverImage`, `icon`, `genre`, `privacy`, `tags`.

Response: serialized community.

### POST /api/communities/:slug/join

Controller: `joinCommunity`

Behavior: public communities only. Creates member role if not already joined. Notifies admin and milestone counts.

Response: serialized community.

### DELETE /api/communities/:slug/members/me

Controller: `leaveCommunity`

Behavior: user must be a member; admin cannot leave without transfer/delete flow.

Response: `204 No Content`.

### DELETE /api/communities/:slug/members/:userId

Controller: `removeMember`

Middleware: `validateObjectId("userId")`

Authz: admin only.

Behavior: cannot remove admin.

Response: `204 No Content`.

### POST /api/communities/:slug/rules

Controller: `addRule`

Authz: admin only.

Request body:

```json
{ "title": "Be kind", "description": "Respect other listeners." }
```

Response: serialized community.

### GET /api/communities/:slug/posts

Controller: `listCommunityPosts`

Behavior: blocks private community posts for non-members.

Response: up to 50 populated posts.

### GET /api/communities/:slug/members

Controller: `listCommunityMembers`

Behavior: blocks private members list for non-members.

Response: up to 200 populated memberships.

## Notifications

All `/api/notifications` routes use `verifyToken`.

### GET /api/notifications

Controller: `listNotifications`

Query parameters:

| Name | Required | Description |
|---|---:|---|
| `limit` | no | Clamped 1-50, default 30. |
| `before` | no | Cursor date, returns older notifications. |

Response:

```json
{
  "notifications": [],
  "unread": 0,
  "next": null
}
```

### PATCH /api/notifications/read-all

Controller: `markAllRead`

Response: `204 No Content`.

### DELETE /api/notifications

Controller: `clearNotifications`

Response: `204 No Content`.

### PATCH /api/notifications/:notificationId/read

Controller: `markRead`

Middleware: `validateObjectId("notificationId")`

Response: updated notification.

### DELETE /api/notifications/:notificationId

Controller: `deleteNotification`

Response: `204 No Content`.

## Player

### GET /api/player/recently-played

Authentication: required.

Controller: `getRecentlyPlayed`

Description: Fetches recently played tracks from Spotify, saves normalized list to user, returns tracks.

Response:

```json
[
  {
    "name": "Track",
    "artist": "Artist",
    "image": "https://...",
    "playedAt": "2026-07-29T00:00:00.000Z"
  }
]
```

## Advanced

### GET /api/advanced/advanced

Authentication: required.

Controller: `advancedSpotifyTest`

Description: Diagnostic/advanced Spotify insights endpoint. Fetches top tracks/artists, artist details, genres, audio features, recommendations, related artists, albums, updates `user.analysis`, and returns warnings.

Response includes:

- `favoriteArtist`
- `favoriteTrack`
- `topGenres`
- `topGenreNames`
- `genreSummary`
- `avgAudioFeatures`
- `musicProfile`
- `mood`
- `moodDescription`
- `moodMetrics`
- `audioFeatures`
- `recommendations`
- `artistDetails`
- `relatedArtists`
- `albums`
- `warnings`

## Root Health

### GET /

Authentication: none.

Defined in: `server/index.js`

Response:

```json
{ "status": "Backend Running" }
```

Note: This route is declared after the not-found and error handlers in `server/index.js`, which likely prevents it from being reached. See `KNOWN_BUGS.md`.

