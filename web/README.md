# FDE Field Manual — front end

An interactive front end for the [Awesome FDE Roadmap](../README.md). It turns the repository's curriculum, artifact templates, glossary and reading list into a step-by-step learning workspace.

## Design study

The visual direction follows the reference at [designed-to-scale.vercel.app](https://designed-to-scale.vercel.app/#/) by Dilum Sanjaya:

- warm "notebook" cream palette with thin ink outlines and soft shadows;
- JetBrains Mono throughout, uppercase micro-labels and pill badges;
- a three-pane desktop workspace: chapter tree, lesson canvas, step guide;
- cross-hatched diagram canvas with isometric node tiles and animated request / response / handshake paths;
- metric readouts, playback controls, a numbered step timeline and a "You'll learn" checklist.

All course prose, SVG artwork, icons and application code here are independently authored. The reference is credited in the header; the educational content comes from this repository's `README.md`.

## Run

```sh
cd web
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). The dev server binds to `0.0.0.0` so it also works in a remote preview.

```sh
npm run content   # regenerate src/data/roadmap.json from ../README.md
npm run check     # validate every lesson, diagram id, translation and extracted file
npm run build     # production build into web/dist
npm run preview   # serve the production build
```

`npm run dev` and `npm run build` regenerate `roadmap.json` automatically. The generated JSON is committed so static hosting works without Node at runtime.

## What is inside

- **Learn** — 21 lessons in 9 chapters, 84 bilingual (EN/VI) steps, each with its own animated diagram state, metrics, key idea and learning goals. Deep links use `#/<lesson-id>/<step>`.
- **Practice** — four field-drill judgment calls with feedback, adapted from the Interview Blackbook.
- **Playbook** — the four copy-paste artifact templates and the discovery checklist, extracted from `README.md`.
- **Library** — searchable glossary and reading list, also extracted from `README.md`, with links to the original resources.

Interface: English / Vietnamese toggle, light / dark theme, `localStorage` progress and last position, `Ctrl/⌘+K` or `/` search, `←` / `→` steps, `Space` pause, `R` replay, `Esc` close, expandable diagram, zoom, and a mobile curriculum drawer.

## Project map

| Path | Purpose |
| --- | --- |
| `src/data/course.js` | Bilingual chapters, lessons, steps, metrics and goals |
| `src/data/diagrams.js` | Isometric SVG board layouts and flow definitions |
| `src/data/ui.js` | Interface translations and practice drills |
| `src/data/roadmap.json` | Generated from the root `README.md` |
| `src/components/IsoDiagram.jsx` | Isometric renderer, animation and readouts |
| `src/App.jsx` | Workspace, navigation, tabs, search and state |
| `src/styles.css` | Design tokens and responsive layout |
| `scripts/build-content.mjs` | README → JSON extractor |
| `scripts/validate-content.mjs` | Content invariants |
