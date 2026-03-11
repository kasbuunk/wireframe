# Wireframe Viewer

A minimal local web app for iterating on HTML wireframes with an AI coding assistant (e.g., Claude Code).

The viewer is read-only — it displays wireframes rendered in an iframe and shows structured intent metadata alongside them. All edits happen externally: you describe changes to your AI assistant, it modifies the files on disk, and the viewer auto-refreshes via SSE.

## Why

Wireframing with an AI works best when you can see the result immediately and give feedback in plain language. This tool closes that loop: you talk to your assistant, it edits the HTML, the browser updates. No copy-pasting, no manual refreshes, no context switching.

## Quick Start

```bash
npm install
npm start
# Open http://localhost:3000
```

By default the server looks for wireframes in `./wireframes/`. Point it at any directory by creating a `.env` file:

```
WIREFRAMES_DIR=/path/to/your/project/wireframes
PORT=3000
```

## Wireframe Format

Each wireframe is a pair of files:

```
wireframes/
  my-screen.html          # standalone HTML, inline styles only, no external deps
  my-screen.intent.json   # structured metadata
```

The intent JSON captures what each element is for:

```json
{
  "id": "my-screen",
  "title": "My Screen",
  "description": "What this screen does",
  "elements": [
    {
      "element": "submit-button",
      "intent": "Save the form and navigate to confirmation",
      "type": "action",
      "navigates_to": "confirmation"
    }
  ],
  "conversation_history": []
}
```

Cross-wireframe links in HTML use `href="#wireframe:target-id"` — the viewer intercepts these and navigates within the app.

## Workflow with Claude Code

**Iterate on a wireframe:**
```
Open the wireframe [WIREFRAME-ID] in ./wireframes/.

Current feedback: [your feedback in plain language]

Update the HTML and the .intent.json. Append an entry to conversation_history.
```

**Create a new wireframe:**
```
Create a new wireframe called [WIREFRAME-ID] in ./wireframes/.

This wireframe represents: [description]

The HTML should show: [list of information and actions]
```

**Distill a specification from validated wireframes:**
```
Read all .intent.json files in ./wireframes/. Distill a SPECIFICATION.md capturing:
domain model, user workflows, business rules, data requirements.
Technology-agnostic. Sufficient to implement as a backend.
```

## Architecture

- **Backend** (`server.js`): Express with three GET endpoints + SSE for file-change events
- **Frontend** (`public/index.html`): Single HTML file, no build step, vanilla JS
- **File watching**: chokidar broadcasts changes to all connected clients

No POST, no PUT, no DELETE. No database, no auth, no bundler.

## Stack

- Node.js + Express
- chokidar (file watching)
- Plain HTML/CSS/JS (no framework)
