import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Bot,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Cloud,
  Compass,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Filter,
  Folder,
  Github,
  Globe,
  GraduationCap,
  Layers,
  Library,
  Lightbulb,
  ListChecks,
  ListOrdered,
  Menu,
  MessageSquare,
  Moon,
  RotateCcw,
  Search,
  Share2,
  Shield,
  Signal,
  Sparkles,
  Sun,
  Target,
  X,
} from "lucide-react";
import IsoDiagram from "./components/IsoDiagram.jsx";
import { CHAPTERS, LESSONS, LEVELS, TAGS, getChapter, getLesson, totalLessons } from "./data/course.js";
import { DIAGRAMS } from "./data/diagrams.js";
import { DRILLS, ui as uiText, tr } from "./data/ui.js";
import roadmap from "./data/roadmap.json";

const REPO_URL = "https://github.com/xuankhanh1612/Awesome-FDE-Roadmap";
const REFERENCE_URL = "https://designed-to-scale.vercel.app/#/";
const lessonById = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
const chapterById = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));

const CHAPTER_ICONS = {
  compass: Compass,
  database: Database,
  cloud: Cloud,
  bot: Bot,
  shield: Shield,
  messages: MessageSquare,
  target: Target,
  file: FileText,
  library: Library,
};

const readJSON = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const parseLocation = () => {
  const match = window.location.hash.match(/^#\/([^/]+)(?:\/(\d+))?/);
  if (!match || !lessonById[match[1]]) return null;
  const lesson = lessonById[match[1]];
  const step = Math.min(lesson.steps.length - 1, Math.max(0, (Number(match[2]) || 1) - 1));
  return { lessonId: lesson.id, stepIndex: step };
};

const initialPosition = () =>
  parseLocation() ||
  (() => {
    const saved = readJSON("fde-last", null);
    if (saved && lessonById[saved.lessonId]) {
      const lesson = lessonById[saved.lessonId];
      return {
        lessonId: lesson.id,
        stepIndex: Math.min(lesson.steps.length - 1, Math.max(0, saved.step || 0)),
      };
    }
    return { lessonId: LESSONS[0].id, stepIndex: 0 };
  })();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const shortLabel = (text) => {
  const words = text.split(/\s+/);
  return words.length > 3 ? `${words.slice(0, 3).join(" ")}…` : text;
};
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

function TopBar({ lang, setLang, theme, setTheme, tab, setTab, onSearch, onMenu, U }) {
  const [langOpen, setLangOpen] = useState(false);
  const tabs = [
    { id: "learn", icon: BookOpen, label: U("tabs")?.learn || "Learn" },
    { id: "practice", icon: Target, label: U("tabs")?.practice || "Practice" },
    { id: "playbook", icon: FileText, label: U("tabs")?.playbook || "Playbook" },
    { id: "library", icon: Library, label: U("tabs")?.library || "Library" },
  ];
  return (
    <header className="topbar">
      <button type="button" className="mobile-menu" onClick={onMenu} aria-label={U("mobileMenu")}>
        <Menu size={18} />
      </button>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
        <span>{U("brand")}</span>
      </div>
      <nav className="modes" aria-label="Sections">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" className={tab === id ? "selected" : ""} onClick={() => setTab(id)}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </nav>
      <button type="button" className="search-button" onClick={onSearch}>
        <Search size={14} />
        <span>{U("search")}</span>
        <kbd>⌘K</kbd>
      </button>
      <div className="language-control">
        <button
          type="button"
          className="language-button"
          onClick={() => setLangOpen(!langOpen)}
          aria-expanded={langOpen}
          title={U("language")}
        >
          <Globe size={13} /> {lang.toUpperCase()} <ChevronDown size={12} />
        </button>
        {langOpen && (
          <div className="language-menu">
            <strong>{U("language")}</strong>
            {["vi", "en"].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setLang(code);
                  setLangOpen(false);
                }}
              >
                <span>{code === "vi" ? "Tiếng Việt" : "English"}</span>
                {lang === code && <Check size={13} />}
              </button>
            ))}
            <p>{U("languageNote")}</p>
          </div>
        )}
      </div>
      <button
        type="button"
        className="icon-only"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={U("theme")}
        aria-label={U("theme")}
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>
      <a className="icon-only" href={REPO_URL} target="_blank" rel="noreferrer" title={U("github")} aria-label={U("github")}>
        <Github size={15} />
      </a>
      <div className="attribution">
        <span className="reference-mark"><Sparkles size={14} /></span>
        <span>
          {U("designedBy")} ·{" "}
          <a href={REFERENCE_URL} target="_blank" rel="noreferrer">{U("credit")}</a>
        </span>
      </div>
    </header>
  );
}

function Sidebar({
  lang, U, L, lessonId, stepIndex, completed, expanded, setExpanded, navigate,
  drawerOpen, setDrawerOpen, resetProgress,
}) {
  const chapter = getChapter(getLesson(lessonId));
  const percent = Math.round((completed.length / totalLessons) * 100);
  return (
    <>
      {drawerOpen && <button type="button" className="drawer-backdrop" aria-label={U("closeMenu")} onClick={() => setDrawerOpen(false)} />}
      <aside className={`sidebar${drawerOpen ? " drawer-open" : ""}`}>
        <div className="course-heading">
          <BookMarked size={16} />
          <strong>{U("curriculum")}</strong>
          <small>{totalLessons} {U("lessonsUnit")}</small>
          <button type="button" className="close-drawer icon-only" onClick={() => setDrawerOpen(false)} aria-label={U("closeMenu")}>
            <X size={15} />
          </button>
        </div>
        <nav>
          {CHAPTERS.map((item) => {
            const Icon = CHAPTER_ICONS[item.icon] || Folder;
            const isOpen = expanded.has(item.id);
            const done = item.lessonIds.filter((id) => completed.includes(id)).length;
            return (
              <div className={`chapter${isOpen ? " expanded" : ""}`} key={item.id}>
                <button
                  type="button"
                  className="chapter-title"
                  onClick={() => setExpanded(item.id)}
                  aria-expanded={isOpen}
                >
                  <ChevronRight size={11} className="disclosure" />
                  <Folder size={16} fill={item.color} stroke="var(--ink)" strokeWidth={1.3} />
                  <span>{item.num}. {L(item.title)}</span>
                  <small>{done}/{item.lessonIds.length}</small>
                </button>
                {isOpen && (
                  <ul>
                    {item.lessonIds.map((id, index) => {
                      const lesson = getLesson(id);
                      const current = id === lessonId;
                      const isDone = completed.includes(id);
                      return (
                        <li key={id}>
                          <a
                            href={`#/${id}/${current ? stepIndex + 1 : 1}`}
                            className={current ? "current" : ""}
                            onClick={(event) => {
                              event.preventDefault();
                              navigate(id, current ? stepIndex : 0);
                            }}
                          >
                            {isDone ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                            <span>{L(lesson.title)}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
        <details className="progress" open>
          <summary>
            <span>{U("progress")} · {completed.length}/{totalLessons}</span>
            <ChevronRight size={11} />
          </summary>
          <div className="progress-bar"><span style={{ width: `${percent}%` }} /></div>
          <div className="progress-detail">
            <div><span>{U("progressDetail")}</span><b>{completed.length}</b></div>
            <div><span>{chapter.num}. {L(chapter.title)}</span><b>{chapter.lessonIds.filter((id) => completed.includes(id)).length}/{chapter.lessonIds.length}</b></div>
            <button type="button" className="reset-button" onClick={resetProgress}>
              <RotateCcw size={11} /> {U("reset")}
            </button>
          </div>
        </details>
      </aside>
    </>
  );
}

function LessonView({
  lang, U, L, lesson, stepIndex, navigate, goNext, goBack, completed,
  paused, setPaused, replayKey, setReplayKey, zoom, setZoom, diagramOpen, setDiagramOpen,
  selectedNode, setSelectedNode, showNotice,
}) {
  const chapter = getChapter(lesson);
  const step = lesson.steps[stepIndex];
  const lessonNumber = LESSONS.findIndex((l) => l.id === lesson.id) + 1;
  const nextLesson = LESSONS[(lessonNumber) % LESSONS.length];
  const activeNodes = step.nodes.map((id) => DIAGRAMS[lesson.diagram].nodes.find((n) => n.id === id)).filter(Boolean);
  const diagramProps = {
    diagram: DIAGRAMS[lesson.diagram],
    lesson,
    stepIndex,
    lang,
    ui: U,
    paused,
    setPaused,
    replayKey,
    onReplay: () => {
      setReplayKey((k) => k + 1);
      setPaused(false);
    },
    zoom,
    setZoom,
    onExpand: () => setDiagramOpen(true),
    selectedNode,
    setSelectedNode,
  };

  return (
    <main className="lesson-main">
      <div className="lesson-heading">
        <div className="breadcrumb">
          {chapter.num}. {L(chapter.title)} <span>/</span> {U("lessonLabel")} {chapter.lessonIds.indexOf(lesson.id) + 1} {U("of")} {chapter.lessonIds.length}
        </div>
        <div className="title-row">
          <h1>{L(lesson.title)}</h1>
          <div className="badges">
            <span><Clock3 size={11} /> {lesson.minutes} {U("min")}</span>
            <span><BarChart3 size={11} /> {L(LEVELS[lesson.level])}</span>
            <span><ListOrdered size={11} /> {lesson.steps.length} {U("steps")}</span>
          </div>
        </div>
        <p>{L(lesson.summary)}</p>
      </div>

      <IsoDiagram {...diagramProps} />

      <div className="timeline">
        <div>
          <b>{U("inThisLesson")}</b>
          <span>{U("stepOf")} {stepIndex + 1} {U("of")} {lesson.steps.length}</span>
        </div>
        <ol>
          {lesson.steps.map((item, index) => (
            <li key={index} className={`${index < stepIndex ? "visited" : ""} ${index === stepIndex ? "active" : ""}`}>
              <button type="button" onClick={() => navigate(lesson.id, index)} title={L(item.title)}>
                <span className="step-dot">{index + 1}</span>
                <span className="step-label">{shortLabel(L(item.title))}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

function Guide({
  lang, U, L, lesson, stepIndex, goNext, goBack, nextLesson, showNotice, completed,
}) {
  const step = lesson.steps[stepIndex];
  const isLast = stepIndex === lesson.steps.length - 1;
  const copyLink = async () => {
    const link = `${window.location.origin}${window.location.pathname}#/${lesson.id}/${stepIndex + 1}`;
    await copyText(link);
    showNotice(U("copied"));
  };
  return (
    <aside className="guide">
      <section className="step-card">
        <div className="step-meta">
          <span>{U("stepOf")} {stepIndex + 1} / {lesson.steps.length}</span>
          <span className={`step-tag ${step.tag.toLowerCase()}`}>{L(TAGS[step.tag])}</span>
        </div>
        <div className="step-prose">
          <h2>{L(step.title)}</h2>
          <p>{L(step.body)}</p>
          <div className="idea">
            <Lightbulb size={14} />
            <div>
              <b>{U("keyIdea")}</b>
              <p>{L(step.idea)}</p>
            </div>
          </div>
          <div className="active-list">
            <b>{U("whatChanged")}</b>
            <div>
              {step.nodes.map((id) => {
                const node = DIAGRAMS[lesson.diagram].nodes.find((n) => n.id === id);
                return node ? <span key={id}>{L(node.label)}</span> : null;
              })}
            </div>
          </div>
        </div>
        <div className="step-navigation">
          <button type="button" onClick={goBack} disabled={stepIndex === 0}>
            <ArrowLeft size={13} /> {U("back")}
          </button>
          <button type="button" className="primary" onClick={goNext}>
            <span>{isLast ? `${U("nextLesson")}: ${L(nextLesson.title)}` : `${U("next")}: ${L(lesson.steps[stepIndex + 1].title)}`}</span>
            <ArrowRight size={14} />
          </button>
        </div>
        <button type="button" className="share-link" onClick={copyLink}>
          <Share2 size={12} /> {U("share")}
        </button>
        <p className="keyboard-hint">{U("keyboardHint")}</p>
      </section>
      <section className="goals">
        <b>{U("youWillLearn")}</b>
        <ul>
          {lesson.goals.map((goal, index) => {
            const checked = index <= stepIndex || completed.includes(lesson.id);
            return (
              <li key={index}>
                <span className={`goal-check${checked ? " checked" : ""}`}><Check size={10} /></span>
                <span>{L(goal)}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}

function SearchDialog({ lang, U, L, query, setQuery, cursor, setCursor, results, onClose, onPick }) {
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-label={U("searchTitle")} onMouseDown={(e) => e.stopPropagation()}>
        <div className="search-field">
          <Search size={17} />
          <input
            ref={inputRef}
            value={query}
            placeholder={U("searchTitle")}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(results.length - 1, c + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(0, c - 1));
              }
              if (e.key === "Enter" && results[cursor]) onPick(results[cursor].id);
            }}
          />
          <kbd>esc</kbd>
        </div>
        <ul className="search-results">
          {results.length === 0 && <li className="empty">{U("searchEmpty")}</li>}
          {results.map((lesson, index) => {
            const chapter = getChapter(lesson);
            return (
              <li key={lesson.id} aria-selected={index === cursor}>
                <a
                  href={`#/${lesson.id}/1`}
                  onMouseEnter={() => setCursor(index)}
                  onClick={(e) => {
                    e.preventDefault();
                    onPick(lesson.id);
                  }}
                >
                  <span className="result-index">{chapter.num}</span>
                  <span>
                    <strong>{L(lesson.title)}</strong>
                    <small>{L(lesson.summary)}</small>
                  </span>
                  <span className="result-meta">{lesson.steps.length} {U("steps")}</span>
                </a>
              </li>
            );
          })}
        </ul>
        <footer>{U("searchHint")} · {U("sourceNote")}</footer>
      </div>
    </div>
  );
}

function PracticeView({ lang, U, L }) {
  const [answers, setAnswers] = useState({});
  const score = DRILLS.filter((d) => answers[d.id]?.checked && answers[d.id]?.selected === d.correct).length;
  const choose = (id, index) => setAnswers((prev) => ({ ...prev, [id]: { selected: index, checked: false } }));
  const check = (id) => setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], checked: true } }));
  return (
    <div className="page-view">
      <div className="page-head">
        <div>
          <span className="eyebrow"><Target size={12} /> {U("tabs").practice}</span>
          <h1>{U("practiceTitle")}</h1>
          <p>{U("practiceSub")}</p>
        </div>
        <div className="score-card">
          <span>{U("score")}</span>
          <b>{score}/{DRILLS.length}</b>
          <button type="button" onClick={() => setAnswers({})}><RotateCcw size={12} /> {U("restart")}</button>
        </div>
      </div>
      <div className="drill-grid">
        {DRILLS.map((drill, index) => {
          const answer = answers[drill.id] || {};
          const correct = answer.checked && answer.selected === drill.correct;
          const wrong = answer.checked && answer.selected !== drill.correct;
          return (
            <section className="drill-card" key={drill.id}>
              <div className="drill-meta"><span>{U("drill")} {String(index + 1).padStart(2, "0")}</span><span>{drill.chapter}</span></div>
              <h2>{L(drill.question)}</h2>
              <p className="drill-prompt">{U("choose")}</p>
              <div className="options">
                {drill.options.map((option, optionIndex) => (
                  <button
                    type="button"
                    key={optionIndex}
                    className={`option${answer.selected === optionIndex ? " picked" : ""}${answer.checked && optionIndex === drill.correct ? " right" : ""}`}
                    onClick={() => choose(drill.id, optionIndex)}
                  >
                    <span className="option-dot">{String.fromCharCode(65 + optionIndex)}</span>
                    <span>{L(option)}</span>
                    {answer.checked && optionIndex === drill.correct && <Check size={14} />}
                  </button>
                ))}
              </div>
              <button type="button" className="check-button" disabled={answer.selected === undefined || answer.checked} onClick={() => check(drill.id)}>
                {U("check")} <ArrowRight size={13} />
              </button>
              {answer.checked && (
                <div className={`drill-feedback${correct ? " good" : ""}`}>
                  <b>{correct ? U("correct") : U("incorrect")}</b>
                  <p><em>{U("why")}:</em> {L(drill.why)}</p>
                </div>
              )}
            </section>
          );
        })}
      </div>
      {score === DRILLS.length && <div className="finish-banner"><CheckCircle2 size={18} /> {U("finished")} · {score}/{DRILLS.length}</div>}
    </div>
  );
}

function PlaybookView({ U, showNotice }) {
  const groups = [...new Set(roadmap.checklist.map((item) => item.group))];
  const onCopy = async (template) => {
    await copyText(template.code);
    showNotice(`${U("copyDone")} · ${template.title}`);
  };
  return (
    <div className="page-view">
      <div className="page-head">
        <div>
          <span className="eyebrow"><FileText size={12} /> {U("tabs").playbook}</span>
          <h1>{U("playbookTitle")}</h1>
          <p>{U("playbookSub")}</p>
        </div>
        <div className="source-chip"><Layers size={13} /> {U("source")}</div>
      </div>
      <div className="template-grid">
        {roadmap.templates.map((template) => (
          <section className="template-card" key={template.id}>
            <div className="template-head">
              <span className="template-number">{String(template.id).padStart(2, "0")}</span>
              <div>
                <h2>{template.title}</h2>
                <p>{template.note}</p>
              </div>
              <button type="button" onClick={() => onCopy(template)}><Copy size={12} /> {U("copy")}</button>
            </div>
            <pre><code>{template.code}</code></pre>
            <span className="template-lang">{template.language}</span>
          </section>
        ))}
      </div>
      <section className="checklist-card">
        <div className="checklist-head">
          <ListChecks size={17} />
          <div><h2>{U("checklistTitle")}</h2><p>{U("checklistSub")}</p></div>
        </div>
        <div className="checklist-groups">
          {groups.map((group) => (
            <div key={group}>
              <h3>{group}</h3>
              <ul>
                {roadmap.checklist.filter((item) => item.group === group).map((item) => (
                  <li key={item.term}><span className="checkbox" /><div><b>{item.term}</b><span>{item.detail}</span></div></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LibraryView({ U, lang }) {
  const [mode, setMode] = useState("glossary");
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const items = mode === "glossary" ? roadmap.glossary : roadmap.resources;
  const groups = [...new Set(items.map((item) => item.group))];
  const filtered = items.filter((item) => {
    if (group !== "all" && item.group !== group) return false;
    const haystack = `${item.term || item.title} ${item.definition || item.note} ${item.group}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  return (
    <div className="page-view">
      <div className="page-head">
        <div>
          <span className="eyebrow"><Library size={12} /> {U("tabs").library}</span>
          <h1>{U("libraryTitle")}</h1>
          <p>{U("librarySub")}</p>
        </div>
        <div className="source-chip"><Layers size={13} /> {U("source")}</div>
      </div>
      <div className="library-toolbar">
        <div className="segmented">
          <button type="button" className={mode === "glossary" ? "selected" : ""} onClick={() => { setMode("glossary"); setGroup("all"); }}><BookMarked size={13} /> {U("glossary")} <small>{roadmap.glossary.length}</small></button>
          <button type="button" className={mode === "resources" ? "selected" : ""} onClick={() => { setMode("resources"); setGroup("all"); }}><ExternalLink size={13} /> {U("resources")} <small>{roadmap.resources.length}</small></button>
        </div>
        <div className="library-search"><Search size={14} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={U("search")} /></div>
      </div>
      <div className="filter-row">
        <Filter size={13} />
        <button type="button" className={group === "all" ? "selected" : ""} onClick={() => setGroup("all")}>{U("all")}</button>
        {groups.map((item) => (
          <button type="button" key={item} className={group === item ? "selected" : ""} onClick={() => setGroup(item)}>{item}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">{U("noResults")}</div>
      ) : mode === "glossary" ? (
        <div className="glossary-grid">
          {filtered.map((item, index) => (
            <article className="term-card" key={`${item.term}-${index}`}>
              <span className="term-group">{item.group}</span>
              <h2>{item.term}</h2>
              <p>{item.definition}</p>
              {item.links?.length > 0 && <a href={item.links[0].url} target="_blank" rel="noreferrer">{item.links[0].title} <ExternalLink size={11} /></a>}
            </article>
          ))}
        </div>
      ) : (
        <div className="resource-list">
          {filtered.map((item, index) => (
            <article className="resource-card" key={`${item.title}-${index}`}>
              <span className="term-group">{item.group}</span>
              <div><h2>{item.title}</h2><p>{item.note}</p></div>
              <a href={item.url} target="_blank" rel="noreferrer">{U("visit")} <ExternalLink size={12} /></a>
            </article>
          ))}
        </div>
      )}
      <section className="repo-map">
        <h2><Layers size={14} /> README sections</h2>
        <div>{roadmap.sections.map((section) => <span key={section.title}>{section.title} <b>{section.links}</b></span>)}</div>
      </section>
    </div>
  );
}

export default function App() {
  const initial = useMemo(initialPosition, []);
  const [lang, setLang] = useState(() => localStorage.getItem("fde-lang") || "vi");
  const [theme, setTheme] = useState(() => localStorage.getItem("fde-theme") || "light");
  const [tab, setTab] = useState("learn");
  const [lessonId, setLessonId] = useState(initial.lessonId);
  const [stepIndex, setStepIndex] = useState(initial.stepIndex);
  const [completed, setCompleted] = useState(() => readJSON("fde-completed", []));
  const [expanded, setExpanded] = useState(() => new Set([getChapter(getLesson(initial.lessonId)).id]));
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchCursor, setSearchCursor] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false);
  const [replayKey, setReplayKey] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  const U = useCallback((key) => uiText(lang, key), [lang]);
  const L = useCallback((value) => tr(lang, value), [lang]);
  const lesson = getLesson(lessonId);
  const nextLesson = LESSONS[(LESSONS.findIndex((l) => l.id === lesson.id) + 1) % LESSONS.length];

  const showNotice = useCallback((message) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 2200);
  }, []);

  const navigate = useCallback((id, index, push = true) => {
    const target = lessonById[id] || LESSONS[0];
    const next = clamp(index, 0, target.steps.length - 1);
    setLessonId(target.id);
    setStepIndex(next);
    setSelectedNode(null);
    setReplayKey((k) => k + 1);
    setPaused(false);
    setDrawerOpen(false);
    setExpanded((prev) => new Set(prev).add(getChapter(target).id));
    const hash = `#/${target.id}/${next + 1}`;
    if (push && window.location.hash !== hash) window.history.pushState({ lessonId: target.id, step: next }, "", hash);
    try { localStorage.setItem("fde-last", JSON.stringify({ lessonId: target.id, step: next })); } catch { /* storage optional */ }
  }, []);

  const goNext = useCallback(() => {
    if (stepIndex < lesson.steps.length - 1) navigate(lesson.id, stepIndex + 1);
    else navigate(nextLesson.id, 0);
  }, [lesson, stepIndex, navigate, nextLesson.id]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) navigate(lesson.id, stepIndex - 1);
  }, [lesson, stepIndex, navigate]);

  const resetProgress = useCallback(() => {
    setCompleted([]);
    showNotice(U("resetDone"));
  }, [showNotice, U]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = lang === "vi" ? "vi" : "en";
    try {
      localStorage.setItem("fde-theme", theme);
      localStorage.setItem("fde-lang", lang);
    } catch { /* storage optional */ }
  }, [theme, lang]);

  useEffect(() => {
    try { localStorage.setItem("fde-completed", JSON.stringify(completed)); } catch { /* storage optional */ }
  }, [completed]);

  useEffect(() => {
    if (stepIndex === lesson.steps.length - 1) {
      setCompleted((prev) => (prev.includes(lesson.id) ? prev : [...prev, lesson.id]));
    }
  }, [lesson.id, lesson.steps.length, stepIndex]);

  useEffect(() => {
    const onPop = () => {
      const position = parseLocation();
      if (position) {
        setLessonId(position.lessonId);
        setStepIndex(position.stepIndex);
        setSelectedNode(null);
        setExpanded((prev) => new Set(prev).add(getChapter(getLesson(position.lessonId)).id));
      }
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, []);

  useEffect(() => {
    const handler = (event) => {
      const typing = ["INPUT", "TEXTAREA"].includes(event.target.tagName) || event.target.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setDiagramOpen(false);
        setDrawerOpen(false);
        return;
      }
      if (typing) return;
      if (event.key === "/" && !searchOpen) {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (tab !== "learn" || searchOpen || diagramOpen) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBack();
      } else if (event.key === " ") {
        event.preventDefault();
        setPaused((p) => !p);
      } else if (event.key.toLowerCase() === "r") {
        setReplayKey((k) => k + 1);
        setPaused(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tab, searchOpen, diagramOpen, goNext, goBack]);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LESSONS.slice(0, 8);
    return LESSONS.filter((item) => {
      const haystack = [
        item.title.en, item.title.vi, item.summary.en, item.summary.vi,
        getChapter(item).title.en, getChapter(item).title.vi,
        ...item.steps.flatMap((s) => [s.title.en, s.title.vi, s.body.en, s.body.vi, s.idea.en, s.idea.vi]),
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    }).slice(0, 8);
  }, [query]);

  const toggleChapter = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const diagramProps = {
    diagram: DIAGRAMS[lesson.diagram],
    lesson,
    stepIndex,
    lang,
    ui: U,
    paused,
    setPaused,
    replayKey,
    onReplay: () => { setReplayKey((k) => k + 1); setPaused(false); },
    zoom,
    setZoom,
    onExpand: () => setDiagramOpen(true),
    selectedNode,
    setSelectedNode,
  };

  return (
    <div className="app-shell">
      <TopBar
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        tab={tab}
        setTab={setTab}
        onSearch={() => setSearchOpen(true)}
        onMenu={() => setDrawerOpen(true)}
        U={U}
      />

      {tab === "learn" ? (
        <div className="workspace">
          <Sidebar
            lang={lang}
            U={U}
            L={L}
            lessonId={lessonId}
            stepIndex={stepIndex}
            completed={completed}
            expanded={expanded}
            setExpanded={toggleChapter}
            navigate={navigate}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            resetProgress={resetProgress}
          />
          <LessonView
            lang={lang}
            U={U}
            L={L}
            lesson={lesson}
            stepIndex={stepIndex}
            navigate={navigate}
            goNext={goNext}
            goBack={goBack}
            completed={completed}
            paused={paused}
            setPaused={setPaused}
            replayKey={replayKey}
            setReplayKey={setReplayKey}
            zoom={zoom}
            setZoom={setZoom}
            diagramOpen={diagramOpen}
            setDiagramOpen={setDiagramOpen}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            showNotice={showNotice}
          />
          <Guide
            lang={lang}
            U={U}
            L={L}
            lesson={lesson}
            stepIndex={stepIndex}
            goNext={goNext}
            goBack={goBack}
            nextLesson={nextLesson}
            showNotice={showNotice}
            completed={completed}
          />
        </div>
      ) : (
        <div className="page-scroll">
          {tab === "practice" && <PracticeView lang={lang} U={U} L={L} />}
          {tab === "playbook" && <PlaybookView U={U} showNotice={showNotice} />}
          {tab === "library" && <LibraryView U={U} lang={lang} />}
        </div>
      )}

      {searchOpen && (
        <SearchDialog
          lang={lang}
          U={U}
          L={L}
          query={query}
          setQuery={setQuery}
          cursor={searchCursor}
          setCursor={setSearchCursor}
          results={searchResults}
          onClose={() => setSearchOpen(false)}
          onPick={(id) => {
            navigate(id, 0);
            setTab("learn");
            setSearchOpen(false);
            setQuery("");
          }}
        />
      )}

      {diagramOpen && (
        <div className="modal-overlay diagram-overlay" onMouseDown={() => setDiagramOpen(false)}>
          <div className="diagram-modal" role="dialog" aria-modal="true" aria-label={U("expand")} onMouseDown={(e) => e.stopPropagation()}>
            <div className="diagram-modal-head">
              <span><Boxes size={14} /> {L(lesson.title)} · {U("stepOf")} {stepIndex + 1}</span>
              <button type="button" className="icon-only" onClick={() => setDiagramOpen(false)} aria-label={U("close")}><X size={15} /></button>
            </div>
            <IsoDiagram {...diagramProps} expanded />
          </div>
        </div>
      )}

      {notice && <div className="notice visible"><Signal size={13} /> {notice}</div>}
    </div>
  );
}
