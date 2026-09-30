import React from "react";
import { PhoneIncoming, PhoneOutgoing, Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import WaveformVisualizer from "./WaveformVisualizer";
import { formatTimestamp, formatDuration, generateWaveform, SENTIMENT_STYLES } from "@/lib/callUtils";

export default function CallCard({ call, onOpen, onToggleStar, searchQuery }) {
  const waveform = call.waveform?.length ? call.waveform : generateWaveform(call.id || call.title, 40);
  const DirectionIcon = call.direction === "outgoing" ? PhoneOutgoing : PhoneIncoming;
  const sentiment = SENTIMENT_STYLES[call.sentiment] || SENTIMENT_STYLES.neutral;
  const preview = (call.transcript || [])[0]?.text || "No transcript preview available.";

  return (
    <div
      onClick={() => onOpen(call.id)}
      className="rounded-xl border border-[#1E293B] bg-[#111827] p-3.5 active:bg-white/[0.03] transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <DirectionIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="truncate text-sm font-semibold text-slate-100">
              {call.contact_name || call.title}
            </span>
            {!call.read && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-signal-blink" />}
          </div>
          <div className="mt-0.5 font-mono-data text-[11px] text-slate-500">
            {call.phone_number} · {formatTimestamp(call.intercepted_at || call.created_date)} · {formatDuration(call.duration_sec)}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar?.(call);
          }}
          className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:text-amber-400"
        >
          <Star className={cn("h-4 w-4", call.starred && "fill-amber-400 text-amber-400")} />
        </button>
      </div>

      <div className="mt-3 h-9">
        <WaveformVisualizer
          samples={waveform}
          height={36}
          barWidth={2}
          gap={1}
          playedColor="bg-amber-500/80"
          upcomingColor="bg-slate-700"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[#090D16]">
          <Play className="h-4 w-4 fill-current ml-0.5" />
        </div>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{preview}</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", sentiment.chip)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", sentiment.dot)} />
          {sentiment.label}
        </span>
        {(call.tags || []).slice(0, 2).map((tag) => (
          <span key={tag} className="inline-flex items-center rounded-full border border-[#1E293B] px-2 py-0.5 text-[10px] font-medium text-slate-500">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}