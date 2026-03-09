# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install   # install dependencies (express, chokidar)
npm start     # start the viewer at http://localhost:3000
```

To use a different port or wireframes directory:
```bash
PORT=3999 npm start
WIREFRAMES_DIR=/path/to/other/wireframes npm start
```

## Architecture

This is a **read-only local wireframe viewer**. It never writes files — all content changes are made externally (e.g., by Claude Code editing wireframe files directly).

**Backend** (`server.js`): Express server with three GET endpoints and an SSE endpoint:
- `GET /api/wireframes` — lists all wireframes by scanning `*.intent.json` files
- `GET /api/wireframes/:id` — returns parsed intent JSON for a wireframe
- `GET /api/wireframes/:id/html` — serves the raw HTML file for iframe rendering
- `GET /api/events` — SSE endpoint; chokidar broadcasts file changes to all connected clients

**Frontend** (`public/index.html`): Single HTML file, no build step. Left sidebar lists wireframes, main area renders the selected wireframe in an iframe (style isolation), toggleable right intent panel. Hash-based navigation (`#wireframe-id`) for back-button support. SSE client auto-refreshes on file change.

**Wireframes** (`wireframes/`): Each wireframe is a pair of files:
- `<id>.html` — standalone HTML with inline styles; no external dependencies
- `<id>.intent.json` — structured metadata: `id`, `title`, `description`, `elements[]` (each with `element`, `intent`, `type`, optional `navigates_to`), and `conversation_history[]`

Cross-wireframe links inside HTML use `href="#wireframe:target-id"` — the viewer intercepts these iframe clicks and navigates the shell accordingly.

## Wireframe Iteration Workflow

To update an existing wireframe:
```
Open the wireframe [WIREFRAME-ID] in ./wireframes/.

Current feedback: [YOUR FEEDBACK IN PLAIN LANGUAGE]

Update the HTML file to reflect this feedback. Also update the .intent.json file:
- Add or modify element intents as needed
- Append an entry to conversation_history with timestamp, feedback summary, and changes made

Keep the HTML simple — no external dependencies, no complex styling.
```

To create a new wireframe:
```
Create a new wireframe called [WIREFRAME-ID] in ./wireframes/.

This wireframe represents: [DESCRIPTION]

Create both [WIREFRAME-ID].html and [WIREFRAME-ID].intent.json.

The HTML should show: [LIST OF INFORMATION AND ACTIONS]

For navigation to other wireframes, use href="#wireframe:target-id".
```

To distill validated wireframes into a specification:
```
Read all .intent.json files in ./wireframes/. From these and the corresponding HTML wireframes,
distill a SPECIFICATION.md capturing: domain model, user workflows, business rules, data requirements.
Technology-agnostic. Sufficient for an LLM to compile into any backend implementation.
```

## Key Constraints

- No POST/PUT/DELETE — read-only API
- No build step, no bundler, no React — plain HTML/CSS/vanilla JS
- Wireframe HTML must not use external CDN dependencies
- No tests (this is a throwaway meta-tool, not production software)
