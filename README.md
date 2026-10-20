# Packing Checklist

Trip packing planner: trip tabs, categorized checklists, reusable category archive, progress ring.

- `index.html` — the whole app (vanilla JS, data in browser localStorage)
- `netlify/functions/sync.mjs` — optional cross-device sync (Netlify Blobs), keyed by a secret sync code
- Sync: in the app click "Sync", enter the same code (8+ chars) on each device.
