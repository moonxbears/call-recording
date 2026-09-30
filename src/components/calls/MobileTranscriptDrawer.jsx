import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Play, Pause, SkipBack, SkipForward, X, Star, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import WaveformVisualizer from "./WaveformVisualizer";
import TranscriptView from "./TranscriptView";
import { formatDuration, formatTimecode, formatTimestamp, generateWaveform, SENTIMENT_STYLES } from "@/lib/callUtils";

export default function MobileTranscriptDrawer({
  call,
  open,
  onClose,
  isPlaying,
  currentTime,
  onPlayPause,
  onSeek,
  onSkip,
  onToggleStar,
  searchQuery,
}) {
  if (!call) return null;
  const duration = call.duration_sec || 0;
  const progress = duration > 0 ? currentTime / duration : 0;
  const waveform = call.waveform?.length ? call.waveform : generateWaveform(call.id || call.title, 60);
  const DirectionIcon = call.direction === "outgoing" ? PhoneOutgoing : PhoneIncoming;
  const sentiment = SENTIMENT_STYLES[call.sentiment] || SENTIMENT_STYLES.neutral;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[92vh] p-0 bg-[#090D16] border-[#1E293B] border-b-0 rounded-t-2xl flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-[#1E293B]/60 shrink-0">
          <div className="flex items-start justify-between">
            <SheetTitle className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <DirectionIcon className="h-4 w-4 text-amber-400" />
                <span className="font-display text-lg font-bold text-slate-100">
                  {call.contact_name || call.title}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono-data text-[11px] text-slate-500 font-normal">
                <span>{call.phone_number}</span>
                <span className="text-slate-700">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(call.intercepted_at || call.created_date)}
                </span>
              </div>
            </SheetTitle>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleStar?.(call)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border",
                  call.starred
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                    : "bg-transparent border-[#1E293B] text-slate-500"
                )}
              >
                <Star className={cn("h-4 w-4", call.starred && "fill-amber-400")} />
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </SheetHeader>

        <div className="px-4 py-3 border-b border-[#1E293B]/60 shrink-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium", sentiment.chip)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", sentiment.dot)} />
              {sentiment.label}
            </span>
            {(call.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full border border-[#1E293B] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
          <div className="h-12 mb-2">
            <WaveformVisualizer
              samples={waveform}
              progress={progress}
              height={48}
              barWidth={3}
              gap={2}
              live={isPlaying}
              onSeek={(r) => onSeek(r * duration)}
              playedColor="bg-amber-500"
              upcomingColor="bg-slate-700"
              liveColor="bg-amber-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono-data text-[11px] text-amber-400">{formatTimecode(currentTime)}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => onSkip(-10)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E293B] text-slate-400">
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={onPlayPause}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-[#090D16]"
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
              </button>
              <button onClick={() => onSkip(10)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E293B] text-slate-400">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
            <span className="font-mono-data text-[11px] text-slate-500">{formatTimecode(duration)}</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 px-4 pt-3 pb-4 overflow-hidden flex flex-col">
          <h3 className="font-display text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Transcript
          </h3>
          <TranscriptView
            transcript={call.transcript || []}
            speakers={call.speakers || []}
            currentTime={currentTime}
            searchQuery={searchQuery}
            onSeek={onSeek}
            className="flex-1 pb-4"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}