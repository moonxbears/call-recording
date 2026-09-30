import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Radio, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#090D16] p-6 text-slate-100">
      <div className="flex flex-col items-center text-center max-w-md space-y-6">
        {/* Icon Badge */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Radio className="h-8 w-8 animate-pulse" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-100">
            404 - Signal Lost
          </h1>
          <p className="text-sm text-slate-400">
            The page or recording path you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-1/2 border-[#1E293B] bg-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button
            asChild
            className="w-full sm:w-1/2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}