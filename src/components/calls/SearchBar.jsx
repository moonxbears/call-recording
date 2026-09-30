import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchBar({ value, onChange, placeholder = "Search transcripts, contacts, numbers…", className }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-lg bg-[#0B1118] border border-[#1E293B] pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-white/5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}