// Extracts templates, glossary, reading list and discovery checklist from the
// repository README so the UI always reflects the source of truth.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const readmePath = path.join(repoRoot, "README.md");
const outPath = path.join(here, "../src/data/roadmap.json");
const readme = fs.readFileSync(readmePath, "utf8");
const lines = readme.split(/\r?\n/);

const clean = (value) =>
  String(value)
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const sectionFrom = (heading) => {
  const startIndex = lines.findIndex((line) => line === heading || line.startsWith(heading));
  if (startIndex < 0) return "";
  let inCode = false;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (!inCode && /^## /.test(line)) return lines.slice(startIndex, i).join("\n");
  }
  return lines.slice(startIndex).join("\n");
};

const linksIn = (text) =>
  [...text.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map((match) => ({
    title: clean(match[1]),
    url: match[2],
  }));

// 1. Artifact templates (numbered subsections with fenced code blocks).
const artifactSection = sectionFrom("## 📂 Artifact Templates (Copy-Paste)");
const templates = [];
{
  let current = null;
  let inCode = false;
  for (const line of artifactSection.split(/\r?\n/)) {
    if (inCode) {
      if (line.startsWith("```")) {
        inCode = false;
      } else {
        current.code.push(line);
      }
      continue;
    }
    const heading = line.match(/^### (\d+)\. (.+)$/);
    if (heading) {
      current = {
        id: Number(heading[1]),
        title: clean(heading[2]),
        note: "",
        language: "markdown",
        code: [],
      };
      templates.push(current);
      continue;
    }
    if (current && line.startsWith("```")) {
      inCode = true;
      current.language = line.slice(3).trim() || "markdown";
      continue;
    }
    if (current && !current.note && /^\*.+\*$/.test(line.trim())) {
      current.note = clean(line);
    }
  }
  for (const template of templates) template.code = template.code.join("\n").trim();
}

// 2. Glossary terms grouped by subsection.
const glossary = [];
{
  let group = "General";
  for (const line of sectionFrom("## 📖 The FDE Glossary").split(/\r?\n/)) {
    const heading = line.match(/^### (.+)$/);
    if (heading) {
      group = clean(heading[1]);
      continue;
    }
    const item = line.match(/^\*\s+\*\*(.+?)\*\*\s+(.+)$/);
    if (item) {
      const term = clean(item[1]).replace(/:$/, "");
      const definition = clean(item[2]);
      glossary.push({ group, term, definition, links: linksIn(item[2]) });
    }
  }
}

// 3. Reading list grouped by subsection.
const resources = [];
{
  let group = "General";
  for (const line of sectionFrom("## 📖 Comprehensive Reading List").split(/\r?\n/)) {
    const heading = line.match(/^### (.+)$/);
    if (heading) {
      group = clean(heading[1]);
      continue;
    }
    if (!/^\*/.test(line.trim())) continue;
    const link = line.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (!link) continue;
    const note = clean(
      line
        .replace(link[0], "")
        .replace(/^\*\s*/, "")
        .replace(/^[\s:–—\-]+/, "")
    );
    resources.push({ group, title: clean(link[1]), url: link[2], note });
  }
}

// 4. Discovery checklist (the "- [ ]" lines in the Soft Stack section).
const checklist = [];
{
  let group = "General";
  const softSection = sectionFrom('## 🤝 The "Soft Stack": Consulting & Strategy');
  for (const line of softSection.split(/\r?\n/)) {
    const heading = line.match(/^#### (.+)$/);
    if (heading) {
      group = clean(heading[1]);
      continue;
    }
    const item = line.match(/^- \[ \] \*\*(.+?)\*\*\s+(.+)$/);
    if (item) checklist.push({ group, term: clean(item[1]).replace(/:$/, ""), detail: clean(item[2]) });
  }
}

// 5. Top-level section map with link counts.
const sections = [];
for (let i = 0; i < lines.length; i += 1) {
  const heading = lines[i].match(/^## (.+)$/);
  if (!heading) continue;
  const nextIndex = lines.findIndex((line, j) => j > i && /^## /.test(line));
  const body = lines.slice(i + 1, nextIndex < 0 ? lines.length : nextIndex).join("\n");
  const title = clean(heading[1]);
  if (/Table of Contents|Creators|Contributing/.test(title)) continue;
  sections.push({ title, links: linksIn(body).length });
}

const roadmap = {
  source: "README.md",
  templates,
  glossary,
  resources,
  checklist,
  sections,
  stats: {
    templates: templates.length,
    glossary: glossary.length,
    resources: resources.length,
    checklist: checklist.length,
    sections: sections.length,
  },
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(roadmap, null, 2)}\n`, "utf8");
console.log(
  `roadmap.json ← README.md: ${templates.length} templates, ${glossary.length} terms, ${resources.length} resources, ${checklist.length} checks, ${sections.length} sections`
);
