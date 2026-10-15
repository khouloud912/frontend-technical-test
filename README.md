# leboncoin messaging – frontend technical test

A messaging interface for leboncoin users, on desktop and mobile:

- list of your conversations, most recent first
- open a conversation, read and send messages
- **Bonus 1:** start a new conversation
- **Bonus 2:** friendly, recoverable errors when the server fails

## Getting started

Node **22.14.0** (`.nvmrc`).

```bash
npm install
npm run start-server   # terminal 1: mock API on http://localhost:3005
npm run dev            # terminal 2: app on http://localhost:3000
```

The logged-in user is mocked: **Thibaut (id 1)**, in `src/utils/getLoggedUserId.ts`.

| Command                                       | Purpose                                                 |
| --------------------------------------------- | ------------------------------------------------------- |
| `npm test`                                    | Unit and integration tests (Jest + Testing Library)     |
| `npm run test:e2e`                            | End-to-end tests (Playwright)                           |
| `npm run lint` / `typecheck` / `format:check` | ESLint (with accessibility rules), TypeScript, Prettier |

Before the first end-to-end run: `npx playwright install chromium`.

## Stack

- **Next.js 15** (Pages Router, kept from the starter), **React 19**, **TypeScript** (strict)
- **TanStack Query** for server state: caching, retries, polling, optimistic updates
- **zod** to validate every API response and the user input
- **SCSS modules** (BEM), colors as CSS variables
- **Jest + Testing Library**, **Playwright**

No UI kit, no state management library, no date or HTTP library: native `fetch` and `Intl` are enough here.

## Architecture

```
Component  →  hook (TanStack Query)  →  API function  →  request()  →  json-server
```

- Components never call `fetch`, hooks never build URLs. One hook per use case.
- A single `fetch` call, in `request()` (`src/api/client.ts`): timeout, status check, typed errors and response validation for every request.
- Desktop shows the list and the thread side by side; mobile shows one screen at a time, with a back button.
- json-server has no push: an open conversation is polled every 5 seconds.

API quirks handled:

- timestamps are UNIX seconds (the swagger says string for messages, the data has numbers)
- the logged-in user can be the sender or the recipient of a conversation
- POST bodies must contain every field (json-server stores them as-is)
- posting a message doesn't update the conversation's last activity, so the app updates it itself
- the provided middleware cached `db.json` at startup, so new conversations never appeared: it now reads the file on each request

## Safety guards

- Every API response is validated at runtime; unexpected data never reaches the UI, and user tokens are stripped.
- Requests time out after 10 seconds. Only network errors and 5xx are retried, never a 4xx; sending is never retried automatically, so a message can't be duplicated.
- Ids from the URL are validated, and a conversation only opens if it belongs to the logged-in user.
- Messages are trimmed, can't be empty, are limited to 1000 characters and can't be sent twice.
- User content is always rendered as text, never as HTML.
- You can't start a conversation with yourself; choosing an existing contact opens the existing conversation.

## Error handling

- Clear messages instead of technical ones ("Connexion impossible…", "Nos serveurs rencontrent un souci…"), each with a **Réessayer** button.
- Short failures are retried silently first.
- Data already on screen stays on screen if a refresh fails.
- A message appears instantly when sent; if sending fails, it stays visible with **Réessayer**.
- If a component crashes, an error screen with a reload button replaces the blank page.
- All errors go through `reportError()`, the place to plug a monitoring tool such as Sentry.

To try it: stop json-server while the app is open, then restart it and click **Réessayer**.

## Accessibility

- Semantic HTML, real links, labelled fields and buttons, visible keyboard focus.
- The new-conversation dialog is a native `<dialog>`: focus stays inside, Esc closes it.
- Errors and new messages are announced to screen readers.
- Colors meet WCAG AA contrast; reduced motion is respected.

## Tests

- **Jest + Testing Library** (`src/__tests__/`, one file per feature): API client, list, thread, sending, new conversation, error states. Tests use the page like a user would (roles, labels, keyboard).
- **Playwright** (`e2e/`): the main journeys in a real browser, with the real API, on desktop and mobile.
- **CI** on every push and pull request: format, lint, typecheck, tests, build, end-to-end tests.

## Limitations and next steps

- Polling would be replaced by WebSockets or Server-Sent Events in production.
- Authentication is mocked; access checks must also be enforced by a real backend.
- The new-conversation dialog loads every user; a real app needs search and pagination.
- Unsent messages and drafts are lost on page reload.
- Next: real-time updates, real authentication, loading older messages, read receipts.
