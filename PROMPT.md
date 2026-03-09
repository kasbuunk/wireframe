# Wireframe Viewer — BUILD PROMPT

Use this prompt to bootstrap a Claude Code session that builds the wireframe viewer from scratch.

---

## Prompt

```
You are building a minimal local web app called "Wireframe Viewer." Read the SPECIFICATION.md and CONSTRAINTS.md files in this directory before writing any code. These are your source of truth — do not deviate from them.

Build the app in this order:

1. Initialize the project: package.json with Express and chokidar as dependencies. No other dependencies.
2. Create the server (server.js): Express app with the three GET endpoints defined in CONSTRAINTS.md, plus static file serving for the frontend. Add chokidar file watching on the wireframes directory and SSE endpoint at /api/events for pushing change notifications to the frontend.
3. Create the frontend (public/index.html): Single HTML file with embedded CSS and JS. Left sidebar listing wireframes, main iframe area, toggleable intent panel. Hash-based navigation. SSE listener that auto-refreshes on file changes. Intercept iframe navigation for #wireframe: links.
4. Create example wireframes in wireframes/ directory: Create 3 example wireframes (customer-list, new-order, invoice-detail) with both .html and .intent.json files. The HTML should be simple but representative — tables, buttons, form fields, labels. The intent JSON should demonstrate the metadata structure with realistic descriptions. Include at least one #wireframe: cross-link between examples.
5. Verify: Run the app, confirm the wireframe list loads, clicking a wireframe renders it, intent panel toggles, SSE auto-refresh works, and cross-wireframe navigation works.

Key principles:
- This is a READ-ONLY viewer. It never writes files. All editing is done externally.
- Keep it minimal. No build step, no bundler, no framework.
- The wireframe HTML renders in an iframe to isolate styles.
- The example wireframes should demonstrate a comfort management system with inventory, customers, and service orders — this is the actual domain being designed.
```

---

## Prompt for Subsequent Wireframe Iteration

Once the viewer is running, use this prompt pattern in Claude Code to iterate on wireframes:

```
Open the wireframe [WIREFRAME-ID] in ./wireframes/. 

Current feedback: [YOUR FEEDBACK IN PLAIN LANGUAGE]

Update the HTML file to reflect this feedback. Also update the .intent.json file:
- Add or modify element intents as needed
- Append an entry to conversation_history with timestamp, feedback summary, and changes made

Keep the HTML simple — no external dependencies, no complex styling. This is a wireframe, not a finished UI. Use basic HTML elements, tables, simple forms. The goal is to validate information architecture and user flow, not visual design.
```

---

## Prompt for Creating New Wireframes

```
Create a new wireframe called [WIREFRAME-ID] in ./wireframes/.

This wireframe represents: [DESCRIPTION OF WHAT THE SCREEN DOES]

Create both [WIREFRAME-ID].html and [WIREFRAME-ID].intent.json.

The HTML should show: [LIST WHAT INFORMATION AND ACTIONS SHOULD BE ON SCREEN]

For navigation to other wireframes, use href="#wireframe:target-id" convention.

Keep it minimal — basic HTML, inline styles only, no external deps. This is a wireframe for validating intent, not a finished design.
```

---

## Prompt for Distilling Specs from Wireframes

When the design is validated and you're ready to move from wireframes to specifications:

```
Read all .intent.json files in ./wireframes/. These contain the validated design intent for a comfort management system.

From these intent files and the corresponding HTML wireframes, distill a SPECIFICATION.md that captures:
1. The domain model: entities, their attributes, and relationships (derived from what information appears on screens)
2. User workflows: the flows between screens and what actions trigger transitions
3. Business rules: any constraints or validation rules implied by the wireframe structure
4. Data requirements: what data each screen needs to display and what data each action produces

This specification should be technology-agnostic and sufficient for an LLM to compile into any backend implementation. Focus on WHAT the system does, not HOW it does it.
```
