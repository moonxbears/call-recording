import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function SliderRow({ label, description, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div className="px-5 py-3.5">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="min-w-0">
          <Label className="text-sm font-medium text-slate-200">{label}</Label>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        <span className="font-mono-data text-sm text-amber-400 tabular-nums">
          {value}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className="data-[disabled]:opacity-50"
      />
    </div>
  );
}