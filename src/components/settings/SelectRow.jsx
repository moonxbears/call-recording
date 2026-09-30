import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SelectRow({ label, description, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <Label className="text-sm font-medium text-slate-200">{label}</Label>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="w-[150px] h-9 bg-[#0B1118] border-[#1E293B] text-slate-200 text-sm focus:border-amber-500/60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#111827] border-[#1E293B] text-slate-200">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={String(opt.value)}
              className="focus:bg-amber-500/15 focus:text-amber-400"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}