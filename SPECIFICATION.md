# Wireframe Viewer — SPECIFICATION

## Purpose

A minimal local web app that serves as a viewer and organizer for HTML wireframes. It exists to support a design-driven development workflow where the user explores and validates UI designs *before* committing to backend implementation.

The user iterates on wireframes using Claude Code in a separate terminal session. This app is purely a viewer — it does not edit wireframes, does not call any AI APIs, and does not process speech. All mutations happen externally via Claude Code modifying files on disk.

## Domain Model

### Wireframe

A wireframe represents a single screen or flow in the application being designed. It consists of:

- **ID**: A short, pronounceable slug used to reference the wireframe in speech (e.g., `customer-list`, `new-order`, `invoice-detail`). This is the filename stem.
- **HTML content**: The rendered wireframe as a standalone HTML file. This is what the user sees.
- **Intent metadata**: A JSON companion file that stores structured intent descriptions for the wireframe and its elements. This metadata is not rendered in the viewer but is the raw material from which formal specifications are later distilled.

### Intent Metadata Structure

Each wireframe has a companion `.intent.json` file with:

```json
{
  "id": "customer-list",
  "title": "Customer List",
  "description": "Overview of all customers with search and filtering",
  "elements": [
    {
      "element": "search-bar",
      "intent": "Filter customers by name, email, or phone number",
      "type": "action"
    },
    {
      "element": "customer-table",
      "intent": "Display all customers with name, email, phone, last order date",
      "type": "information"
    },
    {
      "element": "add-customer-button",
      "intent": "Navigate to the new-customer wireframe",
      "type": "action",
      "navigates_to": "new-customer"
    }
  ],
  "conversation_history": [
    {
      "timestamp": "2026-03-09T14:00:00Z",
      "feedback": "Added search bar, intent: filter customers by name",
      "changes": "Added search input above table"
    }
  ]
}
```

### File Layout

All wireframes live in a single directory (configurable, default `./wireframes/`):

```
wireframes/
  customer-list.html
  customer-list.intent.json
  new-order.html
  new-order.intent.json
  invoice-detail.html
  invoice-detail.intent.json
```

## User Workflows

### 1. Browse wireframes

User opens the app in a browser. They see a list of all wireframes by their ID and title (pulled from intent JSON). They click one to view it.

### 2. View a wireframe

The selected wireframe's HTML is rendered in the main area. The user can see exactly what the screen looks like. Navigation links between wireframes (if present in the HTML) should work within the viewer.

### 3. View intent metadata

The user can toggle visibility of intent metadata for the current wireframe. This shows the description and element intents as an overlay or sidebar — not inline in the wireframe HTML itself.

### 4. Iterate via Claude Code (external)

The user switches to their terminal, runs Claude Code, and says something like: "Open customer-list and add a status column to the table, intent: show whether customer is active or inactive." Claude Code modifies `customer-list.html` and `customer-list.intent.json`. The user refreshes the viewer to see changes.

### 5. Create a new wireframe (external)

The user tells Claude Code: "Create a new wireframe called payment-history." Claude Code creates `payment-history.html` and `payment-history.intent.json`. The user refreshes the viewer to see it in the list.

## What This App Is NOT

- Not an editor. No inline editing, no drag-and-drop, no text inputs for modifying wireframes.
- Not an AI integration. No API calls, no speech processing, no queues.
- Not a design tool. No pixel-perfect layouts, no component libraries, no responsive design concerns.
- Not a spec compiler. It stores intent metadata but does not generate specifications. That's a separate downstream process.

## Navigation Between Wireframes

Wireframe HTML files may contain anchor links to other wireframes. These should use the convention `href="#wireframe:some-id"` which the viewer intercepts and navigates to that wireframe within the app. This enables the user to prototype multi-screen flows.
