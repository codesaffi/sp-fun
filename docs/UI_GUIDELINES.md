# UI Guidelines

## Theme

The app uses a dark social-music theme with high-contrast cards, lime accent color, soft panel borders, and music-oriented visual motifs. The visual language is closer to a social dashboard than a streaming player.

Primary visual tokens observed:

| Purpose | Values |
|---|---|
| App background | `#0e0c12`, `#09090d` |
| Panels/cards | `#151219`, `#16131b`, `#19151d`, `#1a161e`, `#211a27` |
| Borders | `#2d2830`, `#302a33`, `#37313b`, white with low opacity |
| Primary accent | `#d8fa61`, `#d9fa60` |
| Text | `#f7f4f7`, `#fff`, muted `#a39ba7`, `#b5acb9` |
| Error | `#ff8c8c` |

## Typography

The root CSS uses `Inter, ui-sans-serif, system-ui, sans-serif`. Headings are bold and compact. Many custom CSS headings use negative letter spacing; future work should normalize this if visual polish is prioritized.

Guidelines:

- Use compact headings inside dashboard/profile panels.
- Keep body text muted and readable.
- Avoid adding oversized landing-page type inside application views.

## Spacing

The application uses:

- Large dashboard padding on desktop.
- Compact card padding between 13px and 28px.
- Grid gaps between 9px and 16px.
- Mobile-specific padding reductions.

When extending UI, follow the local component area instead of introducing a new spacing scale.

## Cards And Panels

Common card classes:

- `feed-post`
- `match-card`
- `glass-section`
- `hero-card`
- `profile-summary article`
- `person-row`
- `community-grid article`

Cards use dark backgrounds, subtle borders, and medium-to-large border radii. Do not nest cards unnecessarily; existing code sometimes does, but future work should keep repeated items as cards and page sections as plain layouts.

## Buttons

Primary buttons generally use lime background and dark text. Secondary buttons often use dark panels or transparent `text-button`.

Observed button patterns:

- `.feed-share` for prominent dashboard/community actions.
- `.text-button` for low-emphasis navigation/actions.
- `.nav-item` for dashboard sidebar and mobile bottom nav.
- `.search button` for search submit.

Guidelines:

- Preserve lime for primary action.
- Use `text-button` for subtle actions.
- Keep destructive actions visibly separate if adding new UI.

## Animations

Framer Motion is used in `MyProfile` for profile cover, avatar, tabs, cards, timelines, and achievements. CSS also includes hover translations and keyframe shimmer/float effects.

Guidelines:

- Use animation sparingly for identity and state transitions.
- Keep feed/community interactions fast and predictable.
- Avoid adding heavy animation to core controls.

## Responsive Behavior

Key breakpoints:

- `760px`: dashboard sidebar changes behavior and many grids collapse.
- `600px`: diary detail head becomes column.
- `420px`: extra small dashboard/layout adjustments.

Dashboard navigation:

- Desktop: fixed left sidebar.
- Mobile: fixed bottom navigation with wrapped items.

Guidelines:

- Test dashboard, profile, diary, communities, and notifications on mobile.
- Ensure nav labels do not overflow.
- Avoid wide-only layouts in new pages.

## Navigation

Public/authenticated non-dashboard pages use `Navbar`.

Dashboard uses an internal sidebar with:

- Home
- Feed
- Search
- Matches
- Notifications
- Library
- Music Diary
- Community
- Logout

Route-based pages:

- `/`
- `/dashboard`
- `/success`
- `/diary`
- `/:type/:id`
- `/communities`
- `/communities/:slug`
- `/notifications`

## Profile Layout

`MyProfile` is tab-driven:

- Overview
- Posts
- Music Diary
- Communities
- Stats
- Recently Played
- Top Artists
- Top Songs
- Music DNA
- Achievements
- Settings

Use profile tabs for dense personal data. Keep profile cards compact, not landing-page scale.

## Community Layout

Community discovery uses sectioned grids: suggested, trending, newest, official, user. Community detail uses header, tabs, composer, member list, and about/rules.

Guidelines:

- Admin-only actions should remain visually close to About or Members.
- Community post composer should stay disabled when not a member.

## Feed Layout

Feed posts use `PostCard`:

- byline
- art/type block
- caption or edit form
- metadata chips
- actions
- comments

Guidelines:

- Reuse `PostCard` for global and community posts.
- Add new post metadata through existing chips.

## Diary Layout

Diary search uses a search bar, tabs for song/album/artist, and grid results. Diary details use item metadata plus review form. Diary entries use `DiaryEntryCard`.

Guidelines:

- Reuse diary card for profile and other user diary displays.
- Respect rating/status enums.

## Notification Layout

Notifications appear in two forms:

- `NotificationCenter` dropdown with unread badge and polling.
- `/notifications` full list with read/delete/clear actions.

Guidelines:

- Keep notification routing in `notificationUtils.js`.
- Add target logic there when new notification types are introduced.

## Loading, Empty, Error States

Observed patterns:

- Loading text blocks for users, profiles, recent tracks, advanced data.
- Skeleton blocks for profile loading.
- Empty states with `empty-state` or `profile-empty`.
- Error text in red.

Guidelines:

- Every new fetch view should include loading, empty, and error states.
- Avoid silent catch blocks in new code unless UX intentionally ignores the failure.

## Modern Design Principles Followed

- Clear authenticated shell.
- Reusable social cards.
- Mobile-first collapse behavior for data grids.
- Strong contrast between foreground and panels.
- Domain-specific copy around listening, matches, communities, and diary.

