// Guards the hand-authored course data against typos in diagram ids, steps and translations.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LESSONS, CHAPTERS } from "../src/data/course.js";
import { DIAGRAMS } from "../src/data/diagrams.js";
import { UI, DRILLS } from "../src/data/ui.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const errors = [];
const warn = (msg) => errors.push(msg);
const t = (value) => value && typeof value === "object" && ("en" in value || "vi" in value);

const ids = new Set();
for (const lesson of LESSONS) {
  if (ids.has(lesson.id)) warn(`Duplicate lesson id: ${lesson.id}`);
  ids.add(lesson.id);

  const diagram = DIAGRAMS[lesson.diagram];
  if (!diagram) {
    warn(`Lesson ${lesson.id}: unknown diagram "${lesson.diagram}"`);
    continue;
  }
  const nodeIds = new Set(diagram.nodes.map((n) => n.id));
  const edgeIds = new Set(diagram.edges.map((e) => e.id));
  if (lesson.metrics.length !== 4) warn(`Lesson ${lesson.id}: expected 4 metrics, got ${lesson.metrics.length}`);
  if (lesson.goals.length !== 4) warn(`Lesson ${lesson.id}: expected 4 goals, got ${lesson.goals.length}`);
  if (lesson.steps.length < 3) warn(`Lesson ${lesson.id}: needs at least 3 steps`);

  for (const [index, step] of lesson.steps.entries()) {
    const label = `${lesson.id} step ${index + 1}`;
    if (!t(step.title) || !step.title.en || !step.title.vi) warn(`${label}: missing title translation`);
    if (!t(step.body) || !step.body.en || !step.body.vi) warn(`${label}: missing body translation`);
    if (!t(step.idea) || !step.idea.en || !step.idea.vi) warn(`${label}: missing key idea translation`);
    if (step.values.length !== 4) warn(`${label}: expected 4 metric values, got ${step.values.length}`);
    for (const node of step.nodes) if (!nodeIds.has(node)) warn(`${label}: unknown node "${node}"`);
    for (const edge of step.edges) if (!edgeIds.has(edge)) warn(`${label}: unknown edge "${edge}"`);
  }
}

const chapterLessonIds = new Set();
for (const chapter of CHAPTERS) {
  for (const id of chapter.lessonIds) {
    if (!ids.has(id)) warn(`Chapter ${chapter.id}: unknown lesson "${id}"`);
    if (chapterLessonIds.has(id)) warn(`Lesson "${id}" appears in more than one chapter`);
    chapterLessonIds.add(id);
  }
}
for (const id of ids) {
  if (!chapterLessonIds.has(id)) warn(`Lesson "${id}" is not in any chapter`);
}

for (const lesson of LESSONS) {
  for (const value of [lesson.title, lesson.summary, ...lesson.metrics, ...lesson.goals]) {
    if (!t(value) || !value.en || !value.vi) warn(`Lesson ${lesson.id}: incomplete bilingual field`);
  }
}

for (const drill of DRILLS) {
  if (!drill.options[drill.correct]) warn(`Drill ${drill.id}: correct index out of range`);
  if (drill.options.length !== 3) warn(`Drill ${drill.id}: expected 3 options`);
  for (const value of [drill.question, drill.why, ...drill.options]) {
    if (!t(value) || !value.en || !value.vi) warn(`Drill ${drill.id}: incomplete bilingual field`);
  }
}

for (const key of Object.keys(UI.en)) {
  if (!(key in UI.vi)) warn(`UI key "${key}" missing Vietnamese translation`);
}

const roadmapPath = path.join(here, "../src/data/roadmap.json");
if (!fs.existsSync(roadmapPath)) {
  warn("roadmap.json is missing — run `npm run content` first");
} else {
  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, "utf8"));
  for (const key of ["templates", "glossary", "resources", "checklist", "sections"]) {
    if (!Array.isArray(roadmap[key]) || roadmap[key].length === 0) warn(`roadmap.json: "${key}" is empty`);
  }
}

if (errors.length) {
  console.error(`Content validation failed (${errors.length}):`);
  for (const error of errors.slice(0, 40)) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `Content OK: ${LESSONS.length} lessons, ${CHAPTERS.length} chapters, ${LESSONS.reduce((n, l) => n + l.steps.length, 0)} steps, ${Object.keys(DIAGRAMS).length} diagrams, ${DRILLS.length} drills`
);
