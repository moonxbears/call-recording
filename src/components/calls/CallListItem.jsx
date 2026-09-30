import React from "react";
import { PhoneIncoming as PI, PhoneOutgoing as PO, Star as StarIcon } from "lucide-react";
import { cn as cnUtil } from "@/lib/utils";
import WaveformVisualizer from "./WaveformVisualizer";
import { formatTimestamp, formatDuration, generateWaveform } from "@/lib/callUtils";

export default function CallListItem({ call, active, onSelect, onToggleStar, searchQuery }) {
  const waveform = call.waveform?.length ? call.waveform : generateWaveform(call.id || call.title, 28);
  const DirectionIcon = call.direction === "outgoing" ? PO : PI;

  return (
    <button
      onClick={() => onSelect(call.id)}
      className={cnUtil(
        "group relative w-full text-left px-4 py-3 border-b border-[#1E293B]/60 transition-colors",
        active ? "bg-amber-500/10" : "hover:bg-white/[0.03]"
      )}
    >
      {active && <span className="absolute left-0 top-0 h-full w-0.5 bg-amber-500" />}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <DirectionIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate text-sm font-semibold text-slate-100">
              {call.contact_name || call.title}
            </span>
            {!call.read && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-signal-blink" />}
          </div>
          <div className="mt-0.5 font-mono-data text-xs text-slate-500 truncate">
            {call.phone_number}
          </div>
          <div className="mt-2 h-6 opacity-80">
            <WaveformVisualizer
              samples={waveform}
              height={24}
              barWidth={2}
              gap={1}
              playedColor={active ? "bg-amber-500" : "bg-amber-500/70"}
              upcomingColor="bg-slate-700"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono-data text-[11px] text-slate-500">
              {formatTimestamp(call.intercepted_at || call.created_date)} · {formatDuration(call.duration_sec)}
            </span>
            <div className="flex items-center gap-1.5">
              {call.sentiment === "positive" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              {call.sentiment === "negative" && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar?.(call);
                }}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:text-amber-400 hover:bg-white/5"
              >
                <StarIcon className={cnUtil("h-3.5 w-3.5", call.starred && "fill-amber-400 text-amber-400")} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}