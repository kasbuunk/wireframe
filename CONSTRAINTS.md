# Wireframe Viewer — CONSTRAINTS

## Stack

- Single-page web app served by a minimal local HTTP server.
- Backend: Node.js with Express (or equivalent minimal server). No framework overhead.
- Frontend: Plain HTML, CSS, vanilla JS. No build step, no bundler, no React.
- No database. Filesystem is the source of truth.

## Architecture

- The server watches the wireframes directory for file changes and exposes a simple REST API.
- The frontend polls or uses server-sent events to detect changes (so the user doesn't have to manually refresh after Claude Code edits a file).
- The wireframe HTML is rendered inside an iframe to isolate its styles from the viewer chrome.

## API Surface

```
GET /api/wireframes          → list all wireframes (id, title, description)
GET /api/wireframes/:id      → get wireframe metadata (intent JSON)
GET /api/wireframes/:id/html → serve the raw HTML file for iframe rendering
```

That's it. No POST, no PUT, no DELETE. This app is read-only.

## File Watching

- Use `fs.watch` or `chokidar` to monitor the wireframes directory.
- On file change, push an SSE event to connected clients so the frontend can auto-refresh the wireframe list and current wireframe view.

## Frontend Behavior

- Left sidebar: list of wireframes by ID and title. Clicking one loads it in the main area.
- Main area: iframe rendering the selected wireframe HTML.
- Intent panel: toggleable right sidebar or overlay showing intent metadata for the current wireframe. Hidden by default.
- No routing library. Use hash-based navigation (`#wireframe-id`) so the browser back button works.
- Intercept `href="#wireframe:some-id"` clicks inside the iframe and navigate the viewer to that wireframe.

## Styling

- Minimal, functional. No design system.
- Use system fonts, neutral colors, clear hierarchy.
- The viewer chrome should be visually distinct from the wireframe content (e.g., light gray sidebar, white main area).
- The wireframe HTML renders unstyled or with whatever styles it contains — the viewer does not impose styles on it.

## Development

- Single `npm start` command to launch.
- Wireframes directory path configurable via environment variable `WIREFRAMES_DIR`, default `./wireframes`.
- Include 2-3 example wireframes so the app works out of the box for demo purposes.

## Constraints on Wireframe HTML Files

- Must be valid standalone HTML fragments or full documents.
- May include inline styles or a `<style>` block.
- Should NOT include external dependencies (no CDN links) to keep things self-contained.
- Navigation links between wireframes use `href="#wireframe:target-id"` convention.

## Non-Goals

- Authentication, multi-user support, deployment.
- Editing capabilities of any kind.
- Mobile responsiveness.
- Tests (this is a throwaway meta-tool, not production software).
