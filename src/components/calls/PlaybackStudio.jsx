import React from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Download, 
  Share2, FileText, Star, PhoneIncoming, PhoneOutgoing, Clock 
} from "lucide-react";
import { cn } from "@/lib/utils";
import WaveformVisualizer from "./WaveformVisualizer";
import TranscriptView from "./TranscriptView";
import { 
  formatDuration, formatTimecode, formatTimestamp, 
  generateWaveform, SENTIMENT_STYLES, speakerStyle 
} from "@/lib/callUtils";
import { toast } from "@/components/ui/use-toast";

export default function PlaybackStudio({
  call,
  isPlaying,
  currentTime,
  onPlayPause,
  onSeek,
  onSkip,
  onToggleStar,
  searchQuery,
}) {
  // Schema fallbacks for Supabase field names
  const duration = call?.duration ?? call?.duration_sec ?? 0;
  const createdAt = call?.created_at ?? call?.intercepted_at ?? call?.created_date;

  // React hooks MUST be called at the top level before any early return
  const parsedTranscript = React.useMemo(() => {
    if (!call?.transcript) return [];
    if (Array.isArray(call.transcript)) return call.transcript;
    if (typeof call.transcript === "string") {
      try {
        const parsed = JSON.parse(call.transcript);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [{ speaker: "Speaker 1", text: call.transcript, start: 0, end: duration }];
      }
    }
    return [];
  }, [call?.transcript, duration]);

  // Early return for empty state (now placed AFTER all hooks)
  if (!call) {
    return (
      <div className="flex-1 hidden md:flex items-center justify-center bg-[#090D16]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.03] border border-[#1E293B]">
            <Play className="h-6 w-6 text-slate-600" />
          </div>
          <p className="text-sm text-slate-600">Select a call to open the playback studio</p>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? currentTime / duration : 0;
  const waveform = call.waveform?.length ? call.waveform : generateWaveform(call.id || call.title, 80);
  const DirectionIcon = call.direction === "outgoing" ? PhoneOutgoing : PhoneIncoming;
  const sentiment = SENTIMENT_STYLES[call.sentiment] || SENTIMENT_STYLES.neutral;

  // Export: Download Audio File from Supabase Storage
  const handleDownloadAudio = () => {
    if (!call.audio_url) {
      toast({ title: "No Audio Available", description: "This call record has no audio file associated with it." });
      return;
    }
    const link = document.createElement("a");
    link.href = call.audio_url;
    link.download = `${call.contact_name || "call-recording"}-${call.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export: Generate and Download Transcript .txt File
  const handleDownloadTranscript = () => {
    if (!parsedTranscript.length) {
      toast({ title: "No Transcript", description: "No transcript data available to export." });
      return;
    }

    const textContent = parsedTranscript
      .map((t) => `[${formatTimecode(t.start || 0)}] ${t.speaker || "Speaker"}: ${t.text}`)
      .join("\n\n");

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript-${call.contact_name || call.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export: Copy Link to Clipboard
  const handleShare = async () => {
    try {
      const shareUrl = call.audio_url || window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link Copied", description: "Call link copied to clipboard." });
    } catch {
      toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#090D16] h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1E293B]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <DirectionIcon className="h-4 w-4 text-amber-400" />
              <h1 className="font-display text-2xl font-bold text-slate-100 truncate">
                {call.contact_name || call.title || "Unknown Contact"}
              </h1>
            </div>
            <div className="flex items-center gap-3 font-mono-data text-xs text-slate-500">
              <span>{call.phone_number || "No number"}</span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(createdAt)}
              </span>
              <span className="text-slate-700">·</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleStar?.(call)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                call.starred
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-transparent border-[#1E293B] text-slate-500 hover:text-slate-300"
              )}
            >
              <Star className={cn("h-4 w-4", call.starred && "fill-amber-400")} />
            </button>
          </div>
        </div>
      </div>

      {/* Metadata rail */}
      <div className="px-6 py-3 border-b border-[#1E293B]/60 flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium", sentiment.chip)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", sentiment.dot)} />
          {sentiment.label} sentiment
        </span>
        {(call.tags || []).map((tag) => (
          <span key={tag} className="inline-flex items-center rounded-full border border-[#1E293B] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-400">
            #{tag}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="font-mono-data text-[11px] text-slate-600 uppercase tracking-wider">Speakers</span>
          <div className="flex items-center -space-x-1.5">
            {(call.speakers || []).map((sp) => {
              const st = speakerStyle(sp, call.speakers);
              return (
                <span key={sp} className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#090D16] text-[10px] font-semibold", st.bg, st.text)}>
                  {sp.replace("Speaker ", "S")}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrubber + transport */}
      <div className="px-6 py-4 border-b border-[#1E293B]/60">
        <div className="h-16 mb-3">
          <WaveformVisualizer
            samples={waveform}
            progress={progress}
            height={56}
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
          <span className="font-mono-data text-xs text-amber-400">{formatTimecode(currentTime)}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSkip(-10)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E293B] text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors"
              title="Back 10s"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={onPlayPause}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-[#090D16] hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => onSkip(10)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E293B] text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors"
              title="Forward 10s"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
          <span className="font-mono-data text-xs text-slate-500">{formatTimecode(duration)}</span>
        </div>
      </div>

      {/* Export actions */}
      <div className="px-6 py-3 border-b border-[#1E293B]/60 flex items-center gap-2">
        <span className="font-mono-data text-[11px] uppercase tracking-wider text-slate-600 mr-1">Export</span>
        <ExportButton icon={FileText} label="Transcript" onClick={handleDownloadTranscript} />
        <ExportButton icon={Download} label="Audio" onClick={handleDownloadAudio} />
        <ExportButton icon={Share2} label="Share" onClick={handleShare} />
      </div>

      {/* Transcript */}
      <div className="flex-1 min-h-0 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Synchronized Transcript
          </h3>
          {searchQuery && (
            <span className="font-mono-data text-[11px] text-amber-400">
              filtering: "{searchQuery}"
            </span>
          )}
        </div>
        <TranscriptView
          transcript={parsedTranscript}
          speakers={call.speakers || []}
          currentTime={currentTime}
          searchQuery={searchQuery}
          onSeek={onSeek}
          className="h-full"
        />
      </div>
    </div>
  );
}

function ExportButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#1E293B] bg-white/[0.02] text-xs font-medium text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}