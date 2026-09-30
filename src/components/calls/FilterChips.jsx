import React from "react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "starred", label: "Starred" },
];

export default function FilterChips({ active, onChange, counts = {} }) {
  return (
    <div className="flex items-center gap-2">
      {FILTERS.map((f) => {
        const isActive = active === f.id;
        const count = counts[f.id] ?? 0;
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={cn(
              "flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium border transition-colors",
              isActive
                ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                : "bg-transparent border-[#1E293B] text-slate-400 hover:text-slate-200 hover:border-slate-600"
            )}
          >
            {f.label}
            {count > 0 && (
              <span className={cn("font-mono-data text-[10px]", isActive ? "text-amber-500/80" : "text-slate-600")}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}