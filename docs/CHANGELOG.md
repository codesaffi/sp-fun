# Changelog

This changelog combines available Git history with current source inspection. Commit history was available through:

```text
61476a5 notif
fc50cc9 community
9ca7620 review
3259260 post intraction
96616f4 design fix
068ef0b vercel.json in client
9344df6 Prepare backend for Vercel deploymentfff
540a39d Prepare backend for Vercel deployment
963304f Prepare backend for Vercel deployment
20bc61a first commit22
d079687 first commit
```

## Current State

- Notifications system exists with model, routes, controllers, services, dropdown, full page, and dashboard sidebar access.
- Communities exist with discovery, official seeding, user-created communities, membership, admin management, rules, and community posts.
- Reviews/music diary exists with Spotify search/details, ratings, statuses, comments, likes, and sharing to posts.
- Posts support creation, listing, editing, deletion, likes, comments, community scope, and notifications.
- Backend includes Vercel deployment support.
- Client includes Vercel SPA routing support.
- Dashboard and profile UI have responsive design work.

## Major Milestones

### Initial MERN/Spotify Foundation

- React/Vite client and Express/Mongoose server established.
- Spotify OAuth login implemented.
- User model stores Spotify identity, tokens, stats, and analysis.
- JWT-based protected API flow added.

### Backend Deployment Preparation

- Express app exported for serverless use.
- `server/vercel.json` added.
- Environment-variable based deployment shape established.

### Client Deployment Preparation

- `client/vercel.json` added to rewrite SPA routes to `index.html`.

### Design And Responsive Improvements

- Dashboard, profile, feed, diary, community, notification, and navigation styles added.
- Mobile dashboard bottom navigation introduced.

### Post Interaction Milestone

- Feed posts added with likes and comments.
- Edit/delete permissions added.
- Community post support added.

### Review / Diary Milestone

- Music diary search and detail pages added.
- Diary entry model added with ratings, reviews, statuses, likes, comments.
- Diary entries can be shared as posts.

### Community Milestone

- Community and membership models added.
- Official community seeding added.
- Discovery sections, search, create, join/leave, admin rules, member management, and community feeds added.

### Notification Milestone

- Notification model/API added.
- Notification service with dedupe keys added.
- Post, community, match, welcome, mention, and diary comment notification creation paths added.
- Notification dropdown and full notifications page added.
- Dashboard sidebar includes notifications access.

