# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install   # install dependencies (express, chokidar)
npm start     # start the viewer at http://localhost:3000
```

## Configuration

The server auto-loads `.env` from the repo root on startup. This file is gitignored — edit it to point at any wireframes directory:

```
WIREFRAMES_DIR=/path/to/your/project/wireframes
PORT=3000
```

**Always read `.env` to find the active `WIREFRAMES_DIR` before creating or editing wireframe files.** Do not assume wireframes live in `./wireframes/`.

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

Keep it minimal — basic HTML, inline styles only, no external deps. This is a wireframe, not a
finished UI. Use basic HTML elements, tables, simple forms. The goal is to validate information
architecture and user flow, not visual design.
```

To create a new wireframe:
```
Create a new wireframe called [WIREFRAME-ID] in ./wireframes/.

This wireframe represents: [DESCRIPTION]

Create both [WIREFRAME-ID].html and [WIREFRAME-ID].intent.json.

The HTML should show: [LIST OF INFORMATION AND ACTIONS]

For navigation to other wireframes, use href="#wireframe:target-id".

Keep it minimal — basic HTML, inline styles only, no external deps. This is a wireframe for
validating intent, not a finished design.
```

To distill validated wireframes into a specification:
```
Read all .intent.json files in ./wireframes/ and the corresponding HTML wireframes.
Distill a SPECIFICATION.md that captures:
1. Domain model: entities, their attributes, and relationships (derived from what information appears on screens)
2. User workflows: the flows between screens and what actions trigger transitions
3. Business rules: any constraints or validation rules implied by the wireframe structure
4. Data requirements: what data each screen needs to display and what data each action produces

Technology-agnostic. Focus on WHAT the system does, not HOW. Sufficient for an LLM to compile
into any backend implementation.
```

## Key Constraints

- No POST/PUT/DELETE — read-only API
- No build step, no bundler, no React — plain HTML/CSS/vanilla JS
- Wireframe HTML must not use external CDN dependencies
- No tests (this is a throwaway meta-tool, not production software)
