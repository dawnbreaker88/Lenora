"use client";

import React, { useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  BookOpen,
} from "lucide-react";

interface DocItem {
  _id: string;
  title: string;
  fileName: string;
  mimeType: string;
  size?: number;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

interface ResourcesViewProps {
  documents: DocItem[];
  loadingDocs: boolean;
  uploading: boolean;
  uploadMessage: { text: string; isError?: boolean } | null;
  onFileUpload: (file: File) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export function ResourcesView({
  documents,
  loadingDocs,
  uploading,
  uploadMessage,
  onFileUpload,
  onNavigateTab,
}: ResourcesViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Learning Materials
          </h1>
          <p className="text-sm text-[#8a8f98]">
            Notes, syllabi, and reference documents indexed for Feynman's Socratic tutoring.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.md"
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B2A4A] hover:bg-[#123D68] disabled:opacity-50 border border-[#123D68] rounded-[6px] transition-colors cursor-pointer shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "Ingesting Document..." : "Upload Material"}</span>
          </button>
        </div>
      </div>

      {uploadMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-mono border ${
            uploadMessage.isError
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          {uploadMessage.text}
        </div>
      )}

      {/* Materials Table Card */}
      <div className="rounded-xl bg-[#0f1011] border border-[#23252a] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#23252a] flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8a8f98]">
            Your Materials ({documents.length})
          </span>
          <span className="text-xs font-mono text-[#62666d]">PDF, TXT, MD</span>
        </div>

        {loadingDocs ? (
          <div className="p-8 text-center text-xs font-mono text-[#8a8f98]">
            Loading learning materials...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#8a8f98] mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-white">
                Your knowledge starts here
              </h3>
              <p className="text-xs text-[#8a8f98] leading-relaxed">
                Upload lecture slides, syllabus outlines, or textbooks. Feynman uses your actual course material to teach and construct tests.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-[5px] bg-[#161718] hover:bg-[#23252a] text-white border border-[#23252a] transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Select File</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#1c1e22]">
            {documents.map((doc) => {
              const isReady = doc.processingStatus === "completed";
              return (
                <div
                  key={doc._id}
                  className="p-4 flex items-center justify-between hover:bg-[#161718]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#8a8f98] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {doc.title || doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#62666d] mt-0.5">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>·</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {isReady ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ready · Used by Feynman</span>
                        </div>
                      ) : doc.processingStatus === "failed" ? (
                        <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Processing failed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-[#e4f222] font-mono">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing embeddings...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
