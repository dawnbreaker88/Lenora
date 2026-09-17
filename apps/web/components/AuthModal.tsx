"use client";

import React, { useEffect } from "react";
import Auth9 from "./ui/auth-9";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white animate-fadeIn">
      <div className="min-h-screen w-full relative">
        <Auth9 onClose={onClose} />
      </div>
    </div>
  );
}
