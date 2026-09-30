import React from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Inbox, Star, Search, Settings, Phone, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "inbox", icon: Inbox, label: "Inbox" },
  { id: "starred", icon: Star, label: "Starred" },
  { id: "search", icon: Search, label: "Search" },
  { id: "archive", icon: Archive, label: "Archive" },
  { id: "calls", icon: Phone, label: "Lines" },
];

export default function IconRail({ active = "inbox", onNavigate }) {
  const navigate = useNavigate();
  return (
    <div className="hidden md:flex w-[72px] shrink-0 flex-col items-center border-r border-[#1E293B] bg-[#0B1118] py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/40 mb-6">
        <Radio className="h-5 w-5 text-amber-400" />
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              title={item.label}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
                isActive ? "bg-amber-500/15 text-amber-400" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <Icon className="h-5 w-5" />
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r bg-amber-500" />
              )}
            </button>
          );
        })}
      </nav>
      <button
        title="Settings"
        onClick={() => navigate("/settings")}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
      >
        <Settings className="h-5 w-5" />
      </button>
    </div>
  );
}