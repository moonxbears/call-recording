import React from "react";
import { cn } from "@/lib/utils";

// Renders a waveform from samples (0-1) or a generated one.
// progress: 0-1 played portion; height in px; live animates the bars.
export default function WaveformVisualizer({
  samples = [],
  progress = 0,
  height = 40,
  barWidth = 3,
  gap = 2,
  live = false,
  onSeek,
  className,
  playedColor = "bg-amber-500",
  upcomingColor = "bg-slate-600",
  liveColor = "bg-amber-400",
}) {
  const count = samples.length || 64;
  const bars = samples.length ? samples : Array.from({ length: count }, () => 0.3);

  const handleClick = (e) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, ratio)));
  };

  return (
    <div
      className={cn("flex items-center gap-px w-full select-none", onSeek && "cursor-pointer", className)}
      style={{ height, gap }}
      onClick={handleClick}
    >
      {bars.map((amp, i) => {
        const played = i / bars.length <= progress;
        const isLiveEdge = live && Math.abs(i / bars.length - progress) < 0.04;
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors",
              isLiveEdge ? liveColor : played ? playedColor : upcomingColor,
              live && isLiveEdge && "animate-waveform"
            )}
            style={{
              height: `${Math.max(8, amp * 100)}%`,
              minWidth: barWidth,
              maxWidth: barWidth + 2,
              transformOrigin: "center",
            }}
          />
        );
      })}
    </div>
  );
}