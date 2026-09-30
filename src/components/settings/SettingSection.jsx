import React from "react";
import { cn } from "@/lib/utils";

export default function SettingSection({ icon: Icon, title, description, children, className }) {
  return (
    <section className={cn("rounded-xl border border-[#1E293B] bg-[#111827] overflow-hidden", className)}>
      <header className="flex items-start gap-3 px-5 py-4 border-b border-[#1E293B]/70">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Icon className="h-4 w-4 text-amber-400" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-slate-100">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      </header>
      <div className="divide-y divide-[#1E293B]/60">{children}</div>
    </section>
  );
}