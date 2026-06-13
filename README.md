# Property Walkthrough — Tooensure LLC

Field-grade property preservation inspection tool. Mobile-first PWA.

**Live:** https://shawndelainebellazanloop.github.io/Property-Preservation/

## Features

- 📋 20-item grouped checklist (Exterior / Interior / Compliance)
- 📷 Camera + Gallery photo capture with IndexedDB persistence
- 🗒️ Timestamped field notes
- 📤 Export: Text report (.txt) + JSON backup (.json)
- 🔗 Share walkthrough via URL (checklist + notes, no photos)
- 🧭 Google Maps + Apple Maps navigation per stop
- ⚡ Offline-capable, zero server dependencies

## Stack

React 18 · TypeScript · Vite · Tailwind CSS v3 · IndexedDB

## Local dev

```bash
npm install
npm run dev
```

## Deploy

Push to `main` → GitHub Actions builds and deploys automatically.
