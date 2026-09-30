import React from "react";
import { cn } from "@/lib/utils";
import CallListItem from "./CallListItem";
import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";
import { Radio } from "lucide-react";

export default function CallListPanel({
  calls,
  selectedId,
  onSelect,
  onToggleStar,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
  loading,
}) {
  return (
    <div className="flex flex-col w-full md:w-[360px] shrink-0 border-r border-[#1E293B] bg-[#0B1118] h-full">
      <div className="px-4 pt-4 pb-3 space-y-3 border-b border-[#1E293B]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/15 border border-amber-500/40">
              <Radio className="h-3.5 w-3.5 text-amber-400" />
            </span>
            <h2 className="font-display text-base font-bold text-slate-100 tracking-tight">Intercept Log</h2>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-signal-blink" />
            LIVE
          </span>
        </div>
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <FilterChips active={activeFilter} onChange={onFilterChange} counts={counts} />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="px-4 py-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : calls.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-600">
            No calls match your filters.
          </div>
        ) : (
          calls.map((call) => (
            <CallListItem
              key={call.id}
              call={call}
              active={call.id === selectedId}
              onSelect={onSelect}
              onToggleStar={onToggleStar}
              searchQuery={searchQuery}
            />
          ))
        )}
      </div>
    </div>
  );
}