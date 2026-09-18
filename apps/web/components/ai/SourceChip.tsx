"use client";

import React from "react";
import { FileText } from "lucide-react";

interface SourceChipProps {
  label: string;
  onClick?: () => void;
}

export function SourceChip({ label, onClick }: SourceChipProps) {
  return (
    <div
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#121316] border border-[#23252a] text-[11px] font-mono text-[#8a8f98] hover:text-white hover:border-[#383b3f] transition-all cursor-pointer select-none"
    >
      <FileText className="w-3 h-3 text-[#62666d]" />
      <span className="truncate max-w-xs">{label}</span>
    </div>
  );
}
