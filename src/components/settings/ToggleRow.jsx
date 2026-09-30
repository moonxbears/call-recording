import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <Label className="text-sm font-medium text-slate-200">{label}</Label>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-slate-700"
      />
    </div>
  );
}