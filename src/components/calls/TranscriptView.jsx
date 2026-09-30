import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { highlightText, formatTimecode, speakerStyle } from "@/lib/callUtils";

export default function TranscriptView({
  transcript = [],
  speakers = [],
  currentTime = 0,
  searchQuery = "",
  onSeek,
  className,
}) {
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  // auto-scroll active segment into view during playback
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const el = activeRef.current;
      const c = containerRef.current;
      const elRect = el.getBoundingClientRect();
      const cRect = c.getBoundingClientRect();
      if (elRect.top < cRect.top + 40 || elRect.bottom > cRect.bottom - 40) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTime]);

  const activeIndex = transcript.findIndex(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  );

  return (
    <div
      ref={containerRef}
      className={cn("scrollbar-thin overflow-y-auto pr-2 space-y-3", className)}
    >
      {transcript.length === 0 && (
        <div className="text-center py-10 text-sm text-slate-600">No transcript available.</div>
      )}
      {transcript.map((seg, i) => {
        const isActive = i === activeIndex;
        const style = speakerStyle(seg.speaker, speakers);
        const parts = highlightText(seg.text, searchQuery);
        return (
          <div
            key={i}
            ref={isActive ? activeRef : null}
            onClick={() => onSeek?.(seg.start)}
            className={cn(
              "group rounded-lg border px-3 py-2.5 cursor-pointer transition-colors",
              isActive
                ? "bg-amber-500/10 border-amber-500/40"
                : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-[#1E293B]"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", style.bg, style.text, style.border)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                {seg.speaker}
              </span>
              <span className="font-mono-data text-[11px] text-slate-600">
                {formatTimecode(seg.start)}
              </span>
              {isActive && (
                <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-signal-blink" />
                  LIVE
                </span>
              )}
            </div>
            <p className={cn("text-sm leading-relaxed", isActive ? "text-slate-100" : "text-slate-400")}>
              {parts.map((p, j) =>
                p.hit ? (
                  <mark key={j} className="bg-amber-400/25 text-amber-200 rounded px-0.5">
                    {p.text}
                  </mark>
                ) : (
                  <React.Fragment key={j}>{p.text}</React.Fragment>
                )
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}