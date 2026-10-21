"use client";

import React, { useEffect } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#05070A] text-[#d0d6e0] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full p-8 rounded-xl bg-[#0f1011] border border-[#23252a] text-center space-y-5 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-[#0B2A4A]/30 border border-[#123D68]/60 text-white flex items-center justify-center mx-auto text-lg font-mono font-bold">
          !
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white tracking-tight">Something went wrong</h2>
          <p className="text-xs text-[#8a8f98] leading-relaxed">
            An unexpected error occurred while loading this view. You can reload or return to the home screen.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-[#62666d]">Error Digest: {error.digest}</p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
          <Link
            href="/"
            className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
