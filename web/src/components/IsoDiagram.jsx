import { useId, useMemo } from "react";
import {
  RotateCcw,
  Pause,
  Play,
  Maximize2,
  Minus,
  Plus,
  X,
  MoveRight,
} from "lucide-react";
import { EDGE_COLORS, EDGE_NAMES } from "../data/diagrams.js";
import { tr } from "../data/ui.js";

const TONE_VARS = {
  tan: "var(--tone-tan)",
  green: "var(--tone-green)",
  orange: "var(--tone-orange)",
  purple: "var(--tone-purple)",
  blue: "var(--tone-blue)",
  pink: "var(--tone-pink)",
  teal: "var(--tone-teal)",
};

const widthFor = (text) => Math.max(98, Math.min(190, text.length * 7.4 + 30));

const IsoNode = ({ node, lang, active, onSelect }) => {
  const label = tr(lang, node.label);
  const lw = widthFor(label);
  const tone = TONE_VARS[node.tone] || TONE_VARS.tan;
  return (
    <g
      className={`iso-node${active ? " active" : ""}`}
      onClick={() => onSelect(node.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(node.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={label}
    >
      <ellipse cx={node.x} cy={node.y + 34} rx="66" ry="19" className="node-shadow" />
      {active && <ellipse cx={node.x} cy={node.y + 6} rx="78" ry="43" className="node-halo" />}
      <path
        d={`M ${node.x - 58} ${node.y} L ${node.x} ${node.y + 26} L ${node.x} ${node.y + 40} L ${node.x - 58} ${node.y + 14} Z`}
        className="iso-left"
      />
      <path
        d={`M ${node.x + 58} ${node.y} L ${node.x} ${node.y + 26} L ${node.x} ${node.y + 40} L ${node.x + 58} ${node.y + 14} Z`}
        className="iso-right"
      />
      <path
        d={`M ${node.x} ${node.y - 26} L ${node.x + 58} ${node.y} L ${node.x} ${node.y + 26} L ${node.x - 58} ${node.y} Z`}
        className="iso-top"
      />
      <rect x={node.x - 31} y={node.y - 46} width="62" height="34" rx="5" className="node-screen" />
      <rect x={node.x - 25} y={node.y - 40} width="50" height="14" rx="2" style={{ fill: tone }} />
      <line x1={node.x - 25} y1={node.y - 21} x2={node.x + 12} y2={node.y - 21} className="node-screen-line" />
      <line x1={node.x - 25} y1={node.y - 16} x2={node.x + 4} y2={node.y - 16} className="node-screen-line" />
      <rect x={node.x - 23} y={node.y - 2} width="46" height="19" rx="9" className="node-badge" style={{ fill: tone }} />
      <text x={node.x} y={node.y + 11} textAnchor="middle" className="node-badge-text">
        {node.badge}
      </text>
      <rect x={node.x - lw / 2} y={node.y - 88} width={lw} height="24" rx="12" className="node-label-bg" />
      <text x={node.x} y={node.y - 71} textAnchor="middle" className="node-label-text">
        {label}
      </text>
    </g>
  );
};

export default function IsoDiagram({
  diagram,
  lesson,
  stepIndex,
  lang,
  ui,
  paused,
  setPaused,
  replayKey,
  onReplay,
  zoom,
  setZoom,
  onExpand,
  selectedNode,
  setSelectedNode,
  expanded = false,
}) {
  const uid = useId().replace(/:/g, "");
  const step = lesson.steps[stepIndex];
  const activeNodes = new Set(step.nodes);
  const activeEdges = new Set(step.edges);
  const nodeById = useMemo(() => Object.fromEntries(diagram.nodes.map((n) => [n.id, n])), [diagram]);

  const pathFor = (edge) => {
    const a = nodeById[edge.from];
    const b = nodeById[edge.to];
    if (!a || !b) return { d: "", cx: 0, cy: 0 };
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const cx = Math.abs(dx) < 20 ? mx + 95 : mx;
    const cy = Math.abs(dx) > Math.abs(dy) ? my - 58 : my - 26;
    return {
      d: `M ${a.x} ${a.y - 24} Q ${cx} ${cy} ${b.x} ${b.y - 24}`,
      cx,
      cy,
    };
  };

  const selected = selectedNode ? nodeById[selectedNode] : null;
  const connected = selected
    ? diagram.edges.filter((edge) => edge.from === selectedNode || edge.to === selectedNode)
    : [];

  return (
    <div className={`simulation${expanded ? " expanded-simulation" : ""}`} data-paused={paused ? "true" : "false"}>
      <div className="readouts">
        {lesson.metrics.map((metric, index) => (
          <div className="readout" key={`${metric.en}-${index}`}>
            <span>{tr(lang, metric)}</span>
            <b>{step.values[index] ?? "—"}</b>
          </div>
        ))}
      </div>

      <div className="playback">
        <button type="button" onClick={onReplay} title={ui("replay")}>
          <RotateCcw size={13} /> {ui("replay")}
        </button>
        <button type="button" onClick={() => setPaused(!paused)} title={paused ? ui("play") : ui("pause")}>
          {paused ? <Play size={13} /> : <Pause size={13} />} {paused ? ui("play") : ui("pause")}
        </button>
        {!expanded && (
          <button type="button" className="icon-only" onClick={onExpand} title={ui("expand")} aria-label={ui("expand")}>
            <Maximize2 size={13} />
          </button>
        )}
      </div>

      <svg
        className="diagram-svg"
        viewBox="0 0 900 460"
        preserveAspectRatio="xMidYMid meet"
        style={{ transform: `scale(${zoom})` }}
        role="img"
        aria-label={tr(lang, lesson.title)}
      >
        <defs>
          {Object.entries(EDGE_COLORS).map(([kind, color]) => (
            <marker
              id={`${uid}-arrow-${kind}`}
              key={kind}
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill={color} />
            </marker>
          ))}
        </defs>

        <g className="edges">
          {diagram.edges.map((edge) => {
            const { d, cx, cy } = pathFor(edge);
            const active = activeEdges.has(edge.id);
            const label = tr(lang, edge.label);
            const lw = Math.min(120, label.length * 6.4 + 16);
            return (
              <g key={edge.id} className={`edge-group${active ? " active" : ""}`}>
                <path
                  id={`${uid}-path-${edge.id}`}
                  d={d}
                  className={`flow-line ${edge.kind}`}
                  markerEnd={`url(#${uid}-arrow-${edge.kind})`}
                />
                {active && !paused && (
                  <circle key={`${edge.id}-dot-${replayKey}`} r="4.5" className={`flow-dot ${edge.kind}`}>
                    <animateMotion dur="2.6s" repeatCount="indefinite" path={d} />
                  </circle>
                )}
                {active && (
                  <g className="edge-label" transform={`translate(${cx}, ${cy})`}>
                    <rect x={-lw / 2} y={-9} width={lw} height="17" rx="8" />
                    <text textAnchor="middle" y={3}>
                      {label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        <g className="nodes">
          {diagram.nodes.map((node) => (
            <IsoNode
              key={node.id}
              node={node}
              lang={lang}
              active={activeNodes.has(node.id)}
              onSelect={setSelectedNode}
            />
          ))}
        </g>
      </svg>

      <div className="legend">
        {Object.keys(EDGE_NAMES).map((kind) => (
          <span key={kind} className={kind}>
            {tr(lang, EDGE_NAMES[kind])}
          </span>
        ))}
      </div>

      <div className="zoom-controls">
        <button type="button" onClick={() => setZoom(Math.max(0.75, +(zoom - 0.15).toFixed(2)))} aria-label="Zoom out">
          <Minus size={12} />
        </button>
        <button type="button" onClick={() => setZoom(1)} title={ui("fit")}>
          {ui("fit")}
        </button>
        <button type="button" onClick={() => setZoom(Math.min(1.6, +(zoom + 0.15).toFixed(2)))} aria-label="Zoom in">
          <Plus size={12} />
        </button>
      </div>

      {selected && (
        <div className="component-note">
          <button type="button" className="note-close" onClick={() => setSelectedNode(null)} aria-label={ui("close")}>
            <X size={13} />
          </button>
          <b>{tr(lang, selected.label)}</b>
          <span>
            {lang === "vi" ? "Thành phần trong sơ đồ" : "Component in this deployment"} · {selected.badge}
          </span>
          {connected.length > 0 && (
            <ul>
              {connected.slice(0, 4).map((edge) => (
                <li key={edge.id}>
                  <MoveRight size={11} /> {tr(lang, edge.label)} · {tr(lang, EDGE_NAMES[edge.kind])}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
