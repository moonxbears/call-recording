// Shared utilities for call recording app

export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatClock(seconds) {
  return formatDuration(seconds);
}

export function formatTimestamp(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatTimecode(seconds) {
  if (!seconds || seconds < 0) return "00:00.0";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${tenths}`;
}

// Deterministic pseudo-random waveform so SSR/CSR match and re-renders are stable
export function generateWaveform(seedStr, count = 64) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed >>> 8) / 0xFFFFFF;
  };
  const out = [];
  for (let i = 0; i < count; i++) {
    const base = 0.25 + 0.6 * Math.sin(i / count * Math.PI * 3);
    const noise = rand() * 0.5;
    out.push(Math.min(1, Math.max(0.08, base + noise * 0.6)));
  }
  return out;
}

export function highlightText(text, query) {
  if (!query || !query.trim()) return [{ text, hit: false }];
  const terms = query.trim().split(/\s+/).filter(Boolean).map(escapeRegex);
  if (!terms.length) return [{ text, hit: false }];
  const re = new RegExp(`(${terms.join("|")})`, "gi");
  const parts = text.split(re);
  return parts.map((p, i) => (i % 2 === 1 ? { text: p, hit: true } : { text: p, hit: false }));
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const SENTIMENT_STYLES = {
  positive: { label: "Positive", dot: "bg-emerald-400", text: "text-emerald-400", chip: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30" },
  neutral: { label: "Neutral", dot: "bg-slate-400", text: "text-slate-400", chip: "bg-slate-400/10 text-slate-300 border-slate-400/30" },
  negative: { label: "Negative", dot: "bg-rose-400", text: "text-rose-400", chip: "bg-rose-400/10 text-rose-400 border-rose-400/30" },
};

export const SPEAKER_COLORS = [
  { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/40", dot: "bg-amber-500" },
  { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/40", dot: "bg-sky-500" },
  { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/40", dot: "bg-violet-500" },
  { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/40", dot: "bg-emerald-500" },
];

export function speakerStyle(speaker, speakers = []) {
  const idx = speakers.indexOf(speaker);
  return SPEAKER_COLORS[((idx < 0 ? 0 : idx) % SPEAKER_COLORS.length + SPEAKER_COLORS.length) % SPEAKER_COLORS.length];
}