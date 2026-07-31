# Folder Structure

## Tree

```text
sp/
  .gitignore
  package.json
  package-lock.json
  client/
    .env.example
    eslint.config.js
    index.html
    package.json
    package-lock.json
    README.md
    vercel.json
    vite.config.js
    src/
      App.jsx
      index.css
      main.jsx
      components/
        DiaryEntryCard.jsx
        JoinedCommunities.jsx
        Navbar.jsx
        NotificationCenter.jsx
        PostCard.jsx
        ProtectedRoute.jsx
      context/
        AuthContext.jsx
      pages/
        AdvancedTest.jsx
        Communities.jsx
        Dashboard.jsx
        Diary.jsx
        DiaryDetail.jsx
        Home.jsx
        MatchMusicTaste.jsx
        MyMusicTaste.jsx
        MyProfile.jsx
        Notifications.jsx
        OtherUsers.jsx
        RecentlyPlayed.jsx
        Success.jsx
        UserProfile.jsx
      utils/
        notificationUtils.js
  server/
    index.js
    package.json
    package-lock.json
    vercel.json
    config/
      db.js
    controllers/
      advancedTest.controller.js
      auth.controller.js
      community.controller.js
      diary.controller.js
      notification.controller.js
      player.controller.js
      post.controller.js
      social.controller.js
      spotifyCallback.controller.js
      user.controller.js
    middleware/
      asyncHandler.js
      auth.middleware.js
      error.middleware.js
      security.middleware.js
      validateObjectId.js
    models/
      Community.js
      CommunityMember.js
      Diary.js
      Notification.js
      Post.js
      User.js
    routes/
      advancedTest.routes.js
      auth.routes.js
      community.routes.js
      diary.routes.js
      notification.routes.js
      player.routes.js
      post.routes.js
      social.routes.js
      user.routes.js
    services/
      community.service.js
      musicInsights.service.js
      notification.service.js
      spotify.service.js
    utils/
      appError.js
      musicUtils.js
      sanitize.js
  docs/
    AI_CONTEXT.md
    API.md
    CHANGELOG.md
    CODING_RULES.md
    CONTRIBUTING.md
    CURRENT_PROGRESS.md
    DATABASE.md
    DEPLOYMENT.md
    FEATURES.md
    FOLDER_STRUCTURE.md
    KNOWN_BUGS.md
    PROJECT_OVERVIEW.md
    PROMPTS.md
    README.md
    REQUIREMENTS.md
    SECURITY.md
    TECH_STACK.md
    TODO.md
    UI_GUIDELINES.md
```

## Root

The root contains shared metadata only. There are no root `dev`, `build`, or `start` scripts. Use `client/` and `server/` package scripts directly.

## Client

`client/src/App.jsx` defines routes. `client/src/main.jsx` mounts React and wraps the app in `AuthProvider`.

`components/` contains reusable UI/behavior components:

- `ProtectedRoute` guards authenticated pages.
- `Navbar` renders public/authenticated top navigation outside dashboard routes.
- `NotificationCenter` renders notification polling and dropdown.
- `PostCard` renders post interactions.
- `DiaryEntryCard` renders diary interactions.
- `JoinedCommunities` renders profile community cards.

`pages/` contains route-level and dashboard-internal view components. `Dashboard.jsx` is both a page and a large internal view switcher.

`context/` contains application-level auth state.

`utils/` currently contains notification routing helpers.

## Server

`index.js` connects MongoDB, applies security middleware, mounts route groups, installs error handlers, and exports the Express app for Vercel.

`routes/` maps HTTP endpoints to controller functions. Most route files apply `verifyToken` to all routes.

`controllers/` owns request/response behavior, validation checks, and orchestration.

`models/` defines MongoDB collections and schemas.

`services/` contains reusable business and integration logic:

- Spotify OAuth/API helpers.
- Music analysis and compatibility.
- Notification creation and mention detection.
- Official community seeding and slugging.

`middleware/` contains JWT verification, security middleware, async error handling, not-found/error handling, and ObjectId validation.

`utils/` contains small helpers for app errors, music utilities, and sanitization.

## Frontend And Backend Communication

The frontend reads `import.meta.env.VITE_API_URL` and calls backend routes with `fetch`. Protected calls include:

```text
Authorization: Bearer <jwt>
```

The server verifies the JWT, sets `req.user = { id }`, loads data from MongoDB, and calls Spotify as needed using tokens stored on the `User` document.

## Naming Conventions

- React components use PascalCase file names.
- Server route files use `*.routes.js`.
- Server controller files use `*.controller.js`.
- Server services use `*.service.js`.
- Mongoose models use PascalCase singular names.
- Endpoint groups are plural or domain-based: `/api/posts`, `/api/diary`, `/api/communities`, `/api/notifications`, `/api/social`.

