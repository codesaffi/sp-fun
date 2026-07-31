# Project Overview

## What This Project Is

MusicMatch is a Spotify-powered social platform built with the MERN stack. Spotify provides identity, listening history, top artists, top tracks, and music metadata. MusicMatch provides the social product around that data: profiles, feeds, compatibility matching, communities, diary reviews, notifications, and discovery.

This is not a Spotify clone.

This is not a music streaming app.

It is a Spotify-powered social platform where Spotify provides listening data while this platform provides the social experience.

## Why It Exists

The application turns private Spotify listening signals into social context. Instead of streaming music, it helps users answer questions like:

- Who has a similar music taste?
- What does my listening history say about me?
- Which communities match my favorite artists or genres?
- What music moments do I want to remember, review, or share?

## Main Goals

- Authenticate users through Spotify OAuth.
- Persist user profiles, Spotify stats, and local social activity in MongoDB.
- Build a social feed around music moments.
- Let users like, comment on, and share posts and diary entries.
- Calculate music compatibility between users.
- Provide music communities around genres and artists.
- Provide a music diary for reviews, ratings, and listening memories.
- Notify users about relevant social activity.
- Stay responsive across desktop and mobile.

## Long-Term Vision

The codebase points toward a full social network for music identity rather than a streaming product. Natural future directions include friendships, private messaging, real-time community activity, playlist sharing, achievements backed by real data, stronger recommendation systems, admin tooling, and richer matchmaking.

## What Users Can Do Today

- Sign in with Spotify.
- View a personalized dashboard.
- View music personality, mood, genres, music DNA, top artist, top track, and match summary.
- Discover other users and compare compatibility.
- View all users and other user profiles.
- Create feed posts from music insights or custom captions.
- Like, unlike, comment on, edit, and delete posts where allowed.
- Search Spotify for songs, albums, and artists.
- Save diary entries with ratings, reviews, status, and dates.
- Like, comment on, edit, delete, and share diary entries.
- Discover, create, join, leave, and manage communities.
- Post inside joined communities.
- Add community rules and edit community details as admin.
- View notifications and mark them read or delete them.
- View recently played Spotify tracks.
- View an advanced Spotify insights diagnostic page.

## What Makes It Different

The differentiator is the combination of Spotify-derived taste data and local social features. Spotify data is used as an input to social identity, discovery, and matching, while MusicMatch owns the feed, profiles, communities, diary, comments, likes, and notifications.

## Overall Architecture

```text
React/Vite client
  -> JWT stored in localStorage
  -> fetch calls with Authorization: Bearer <token>
  -> Express API
  -> Mongoose models
  -> MongoDB
  -> Spotify Web API for OAuth, profile, top items, search, details, recently played, recommendations, and artist metadata
```

## Current Maturity Level

The project is an active production-scale MVP. It has meaningful feature coverage, a deployed-friendly Vercel shape, authentication, rate limiting, protected APIs, reusable server services, and social database models. It does not yet have automated tests, TypeScript, full friend/chat systems, robust admin tools, or complete polish on every placeholder page.

## Deployment

The client is a Vite React app with a `client/vercel.json` SPA rewrite. The server exports an Express app and includes `server/vercel.json` for Vercel Node deployment. MongoDB is expected through `MONGO_URI`, and Spotify OAuth requires redirect URIs configured in the Spotify Developer Dashboard.

## Future Direction

Immediate future work should strengthen reliability, polish, and product completeness:

- Add automated tests for authentication, posts, diary, communities, notifications, and matching.
- Fix documented bugs in `KNOWN_BUGS.md`.
- Add friend/follow relationships on top of the existing `friends` field.
- Build real-time chat or notifications.
- Add moderation and admin dashboards.
- Improve search and recommendation ranking.
- Complete placeholder music taste and match pages.
- Continue responsive UI cleanup.

