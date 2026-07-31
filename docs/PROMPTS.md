# Reusable Prompts For Future AI Agents

Use these prompts to start future sessions. Every prompt instructs the agent to read project documentation before changing code.

## General Onboarding

```text
Read the documentation inside the docs folder. Start with PROJECT_OVERVIEW.md, CURRENT_PROGRESS.md, CODING_RULES.md, AI_CONTEXT.md, DATABASE.md, and API.md. Summarize your understanding of the project and wait for my instructions.
```

## Feature Development

```text
Read docs/PROJECT_OVERVIEW.md, docs/CURRENT_PROGRESS.md, docs/CODING_RULES.md, docs/API.md, and docs/DATABASE.md first. Then inspect the relevant client and server files. Implement the requested feature by extending existing patterns, preserving API compatibility, and updating documentation if any route/model/behavior changes.
```

## Bug Fixing

```text
Read docs/KNOWN_BUGS.md, docs/CODING_RULES.md, docs/API.md, and docs/DATABASE.md first. Reproduce or inspect the bug in the actual code. Make the smallest safe fix, avoid unrelated refactors, run the relevant validation, and update KNOWN_BUGS.md if the issue is resolved.
```

## Refactoring

```text
Read docs/CODING_RULES.md, docs/AI_CONTEXT.md, docs/FOLDER_STRUCTURE.md, and docs/FEATURES.md first. Refactor only the requested area. Preserve behavior, API contracts, route names, model schemas, and UI appearance unless explicitly asked. Run build/lint or explain why not.
```

## Performance Optimization

```text
Read docs/API.md, docs/DATABASE.md, docs/TECH_STACK.md, and docs/CODING_RULES.md first. Identify the exact slow path from code. Prefer query indexes, pagination, caching, or reducing duplicate Spotify/API calls over broad rewrites. Document any API or data-flow changes.
```

## Responsive Improvements

```text
Read docs/UI_GUIDELINES.md, docs/CODING_RULES.md, and inspect client/src/index.css plus the relevant React component. Preserve the existing visual language. Fix desktop and mobile behavior at the existing breakpoints and run a client build.
```

## Security Review

```text
Read docs/SECURITY.md, docs/API.md, docs/DATABASE.md, and docs/CODING_RULES.md first. Review authentication, authorization, token exposure, input validation, CORS, rate limiting, and Spotify token refresh. Return findings ordered by severity with file references and propose targeted fixes.
```

## Database Optimization

```text
Read docs/DATABASE.md and docs/API.md first. Inspect Mongoose models and controller queries. Recommend or implement indexes only for real query patterns. Preserve existing schema contracts unless a migration is explicitly requested.
```

## Deployment Help

```text
Read docs/DEPLOYMENT.md, docs/SECURITY.md, and docs/TECH_STACK.md first. Inspect client/vercel.json, server/vercel.json, environment variable usage, and package scripts. Provide exact deployment steps or fix deployment config without modifying application behavior.
```

## Testing

```text
Read docs/CODING_RULES.md, docs/API.md, and docs/DATABASE.md first. Add a focused test setup that matches this MERN project. Prioritize backend API/controller/service tests for auth, posts, diary, communities, notifications, and matching. Do not rewrite app code just to fit tests.
```

## Documentation Updates

```text
Read the existing docs folder and inspect the code related to the requested change. Update only documentation that is affected. Keep docs factual, based on actual source code, and useful for future AI agents.
```

