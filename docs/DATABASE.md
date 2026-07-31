# Database

MongoDB is accessed through Mongoose. The application defines six collections:

- `users`
- `posts`
- `diaries`
- `communities`
- `communitymembers`
- `notifications`

There is no separate `comments`, `reviews`, or `musicmatches` collection. Post comments and diary comments are embedded. Reviews are diary entries. Music matches are computed from user listening data.

## Relationship Diagram

```text
User
  1 -> many Post
  1 -> many Diary
  many -> many Community through CommunityMember
  1 -> many Notification as recipient
  1 -> many Notification as sender

Community
  1 -> many CommunityMember
  1 -> many Post
  1 -> many Notification

Post
  embeds comments[]
  references User as author
  optionally references Community
  referenced by Notification

Diary
  embeds comments[]
  references User as owner
  referenced by Notification
```

## Users

Model: `server/models/User.js`

Purpose: Stores Spotify identity, application profile, Spotify tokens, cached Spotify stats, recently played tracks, and derived analysis.

Fields:

| Field | Type | Validation/Default | Usage |
|---|---|---|---|
| `spotifyId` | String | required, unique | Primary OAuth identity lookup. |
| `name` | String | none | Display name and mention target source. |
| `email` | String | none | Profile display. |
| `avatar` | String | none | Spotify profile image. |
| `country` | String | none | Profile metadata. |
| `gender` | String | enum male/female/nonbinary/other/empty, default empty | Planned Dream Match/preferences. |
| `lookingFor` | String | enum male/female/everyone/empty, default everyone | Planned Dream Match/preferences. |
| `friends` | ObjectId[] ref User | none | Planned friend system. |
| `accessToken` | String | none | Spotify API calls. |
| `refreshToken` | String | none | Spotify token refresh. |
| `stats.shortTerm.topArtists` | Array | none | Top artists from Spotify. |
| `stats.shortTerm.topTracks` | Array | none | Top tracks from Spotify. |
| `stats.mediumTerm.*` | Array | none | Medium-term top items. |
| `stats.longTerm.*` | Array | none | Long-term top items. |
| `recentlyPlayed` | Array | none | Recently played track cache. |
| `bio` | String | default empty | Profile bio. |
| `analysis` | Object | mixed nested fields | Mood, music profile, top genres, favorites, average features, personality, genre distribution. |
| timestamps | Date | automatic | Created/updated profile dates. |

Spotify data stored locally:

- Top artists store `name`, `image`, and `genres`.
- Top tracks store `name`, `artist`, and `image`.
- Recently played stores `name`, `artist`, `image`, and `playedAt`.
- Analysis stores derived data and sometimes raw Spotify favorite artist/song objects from advanced insights.

Indexes:

- `spotifyId` unique index from schema field.

Security note: user API controllers use `.select("-accessToken -refreshToken")` for user-facing responses.

## Posts

Model: `server/models/Post.js`

Purpose: Feed and community music moments.

Fields:

| Field | Type | Validation/Default | Usage |
|---|---|---|---|
| `user` | ObjectId ref User | required, indexed | Post author. |
| `community` | ObjectId ref Community | indexed | Optional community scope. |
| `caption` | String | required, trim, maxlength 1000 | Main post text. |
| `type` | String | enum top_artist/top_song/profile/mood/genres/recent/custom, default custom | Template/category. |
| `artist` | Mixed | none | Attached artist or top artist. |
| `song` | Mixed | none | Attached song or top song. |
| `album` | Mixed | none | Attached album. |
| `genres` | String[] | none | Attached genres. |
| `musicProfile` | String | none | Profile-derived post metadata. |
| `mood` | String | none | Mood metadata. |
| `images` | String[] | none | Image URLs. |
| `likes` | ObjectId[] ref User | none | Users who liked. |
| `comments` | embedded comment[] | text required maxlength 500 | Post comments. |
| timestamps | Date | automatic | Sort feed by newest. |

Embedded comment fields:

- `user`: required ObjectId ref User.
- `text`: required trimmed string, max 500.
- timestamps.

Relationships:

- A post belongs to one user.
- A post may belong to one community.
- Notifications may reference a post.

Indexes:

- `user`
- `community`

## Diaries

Model: `server/models/Diary.js`

Purpose: User music reviews and listening memories.

Fields:

| Field | Type | Validation/Default | Usage |
|---|---|---|---|
| `user` | ObjectId ref User | required, indexed | Diary owner. |
| `spotifyId` | String | required | Spotify track/album/artist id. |
| `type` | String | enum song/album/artist, required | Spotify item type. |
| `title` | String | required, trim | Item title/name. |
| `artist` | String | default empty | Artist string. |
| `album` | String | default empty | Album string for songs. |
| `image` | String | default empty | Artwork URL. |
| `rating` | Number | min 1, max 5 | Review rating. |
| `review` | String | trim, maxlength 2000, default empty | Review text. |
| `status` | String | enum favorite/listening/listened/want_to_listen/revisited, default listened | Listening status. |
| `entryDate` | Date | default Date.now | User-selected diary date. |
| `likes` | ObjectId[] ref User | none | Users who liked the entry. |
| `comments` | embedded comment[] | text required maxlength 500 | Diary comments. |
| timestamps | Date | automatic | Sort diary entries. |

Indexes:

- `user`
- unique compound `{ user: 1, spotifyId: 1, type: 1 }`

Relationships:

- Diary belongs to user.
- Notifications may reference diary entries.

## Communities

Model: `server/models/Community.js`

Purpose: Genre/artist/user-created listening spaces.

Fields:

| Field | Type | Validation/Default | Usage |
|---|---|---|---|
| `name` | String | required, trim, maxlength 80 | Community name. |
| `slug` | String | required, unique, lowercase, indexed | URL identifier. |
| `description` | String | required, trim, maxlength 500 | Community description. |
| `coverImage` | String | default empty | Header image URL. |
| `icon` | String | default music symbol, maxlength 500 | Icon text or URL. |
| `tags` | String[] | trim, maxlength 40 | Search and categorization. |
| `genre` | String | trim, maxlength 60, default empty | Genre/category. |
| `privacy` | String | enum public/private, default public | Access rules. |
| `official` | Boolean | default false, indexed | Seeded official communities. |
| `createdBy` | ObjectId ref User | required | Creator or seeding owner. |
| `rules` | embedded rule[] | title/description required | Community rules. |
| timestamps | Date | automatic | Newest sorting. |

Embedded rule fields:

- `title`: required, trim, max 80.
- `description`: required, trim, max 500.

Indexes:

- unique `slug`
- `official`
- text index on `name`, `description`, `tags`, `genre`

## Community Members

Model: `server/models/CommunityMember.js`

Purpose: Many-to-many join table between users and communities, with roles.

Fields:

| Field | Type | Validation/Default | Usage |
|---|---|---|---|
| `community` | ObjectId ref Community | required, indexed | Joined community. |
| `user` | ObjectId ref User | required, indexed | Member. |
| `role` | String | enum admin/moderator/member, default member | Permissions. |
| timestamps | Date | automatic | Member ordering. |

Indexes:

- unique compound `{ community: 1, user: 1 }`

Role usage:

- `admin` can edit community, add rules, remove non-admin members, and moderate/delete community posts.
- `moderator` exists in schema but is not currently used in controller role checks.
- `member` can post, like, and comment in joined communities.

## Notifications

Model: `server/models/Notification.js`

Purpose: Activity notifications for welcome, matches, posts, community activity, mentions, diary comments, and milestones.

Fields:

| Field | Type | Validation/Default | Usage |
|---|---|---|---|
| `recipient` | ObjectId ref User | required, indexed | Receiver. |
| `sender` | ObjectId ref User | default null | Actor. |
| `type` | String | required, indexed | Notification category. |
| `title` | String | required, maxlength 120 | Notification title. |
| `message` | String | required, maxlength 500 | Notification body. |
| `post` | ObjectId ref Post | optional | Related post. |
| `comment` | ObjectId | optional | Embedded comment id if needed. |
| `diary` | ObjectId ref Diary | optional | Related diary entry. |
| `community` | ObjectId ref Community | optional | Related community. |
| `relatedUser` | ObjectId ref User | optional | User used in match notifications. |
| `isRead` | Boolean | default false, indexed | Read state. |
| `dedupeKey` | String | optional | Prevents duplicate notification creation. |
| timestamps | Date | automatic | Notification ordering and pagination. |

Indexes:

- `{ recipient: 1, createdAt: -1 }`
- unique sparse `{ recipient: 1, dedupeKey: 1 }`
- `recipient`, `type`, `isRead`

## Music Matches

There is no collection. Matches are computed on demand in `musicInsights.service.js` using:

- top artists
- top tracks
- genres
- mood
- personality
- recently played overlap

If match history, explanations, or user decisions become product requirements, add a dedicated model rather than overloading `User.analysis`.

