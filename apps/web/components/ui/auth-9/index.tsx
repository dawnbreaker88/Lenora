"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { signIn } from "next-auth/react";
import { ArrowLeft, Check, Lock, Mail, User } from "lucide-react";

// Google SVG Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface Auth9Props {
  initialMode?: "login" | "signup";
  onClose?: () => void;
}

export default function Auth9({ initialMode = "login", onClose }: Auth9Props) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === "login";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const toggleMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", newMode === "login" ? "/login" : "/signup");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#05070A] font-sans text-[#d0d6e0] antialiased selection:bg-[#0B2A4A] selection:text-white lg:flex-row">
      
      {/* Left Visual Artwork Panel (Inspired by Auth9 layout & assets.watermelon.sh/auth-9.avif) */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden p-8 sm:p-10 md:p-12 lg:p-14 lg:w-1/2 min-h-[46vh] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-[#23252a]">
        
        {/* Artwork Image */}
        <img
          src="https://assets.watermelon.sh/auth-9.avif"
          alt="Abstract blue atmospheric artwork"
          className="absolute inset-0 h-full w-full object-cover select-none"
        />

        {/* Ambient Dark Gradient Overlays for Lenora Dark System */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/35 to-[#05070A]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070A]/60 via-transparent to-[#05070A]/80 pointer-events-none" />

        {/* Top Header: Brand & Back to Website */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded-[5px] bg-white text-black flex items-center justify-center font-mono font-bold text-xs shadow-md group-hover:scale-105 transition-transform">
              L
            </div>
            <span className="text-base font-semibold tracking-tight text-white group-hover:text-[#d0d6e0] transition-colors">
              LENORA
            </span>
          </Link>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90 transition-colors hover:text-white bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90 transition-colors hover:text-white bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </Link>
          )}
        </div>

        {/* Bottom Content: Agentic Thesis Callout */}
        <div className="relative z-10 mt-16 lg:mt-0 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0B2A4A]/60 border border-[#123D68]/80 mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#c8d9ea] uppercase">
              Agentic Learning Harness
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-medium leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Where Ambition
            <br />
            Meets Mastery.
          </h1>

          <p className="max-w-md text-xs sm:text-sm text-[#d0d6e0]/90 leading-relaxed">
            Lenora empowers students to build adaptive study loops, ground course materials with RAG, and master complex concepts with Socratic dialogue.
          </p>

          {/* System status pill */}
          <div className="mt-6 flex items-center gap-4 text-[11px] font-mono text-white/60">
            <span>Goal · Plan · Learn · Test · Adapt</span>
            <span>·</span>
            <span>TLS 1.3 Encrypted</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel: Perfectly Scaled & Centered */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-10 md:p-12 lg:w-1/2 lg:p-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={mode}
          className="w-full max-w-md md:max-w-lg"
        >
          {/* Titles */}
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="mb-2 text-2xl sm:text-3xl font-medium tracking-tight text-white">
              {isLogin ? "Welcome back" : "Create your Account"}
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8f98]">
              {isLogin
                ? "Sign in to resume your study loops and Feynman sessions."
                : "Let's get started with your 30 days free student trial."}
            </p>
          </motion.div>

          {/* Google Login Button */}
          <motion.div variants={itemVariants} className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-[8px] border border-[#23252a] bg-[#0f1011] py-3 px-4 text-xs sm:text-sm font-medium text-white transition-all hover:bg-[#161718] hover:border-[#2e3138] active:scale-[0.99] cursor-pointer shadow-sm"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="relative mb-5 flex items-center"
          >
            <div className="grow border-t border-[#23252a]"></div>
            <span className="px-3 text-xs text-[#62666d] font-mono uppercase tracking-wider">or with credentials</span>
            <div className="grow border-t border-[#23252a]"></div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-1.5"
              >
                <label
                  htmlFor="name"
                  className="text-xs font-medium text-[#d0d6e0]"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#62666d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-[8px] border border-[#23252a] bg-[#0f1011] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#4a4d54] focus:border-[#4285F4] focus:outline-none focus:ring-1 focus:ring-[#4285F4]/40 transition-colors"
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-1.5"
            >
              <label
                htmlFor="email"
                className="text-xs font-medium text-[#d0d6e0]"
              >
                Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#62666d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full rounded-[8px] border border-[#23252a] bg-[#0f1011] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#4a4d54] focus:border-[#4285F4] focus:outline-none focus:ring-1 focus:ring-[#4285F4]/40 transition-colors"
                />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-[#d0d6e0]"
                >
                  Password
                </label>
                {isLogin && (
                  <a
                    href="#"
                    className="text-[11px] text-[#8a8f98] hover:text-white transition-colors"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#62666d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-[8px] border border-[#23252a] bg-[#0f1011] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#4a4d54] focus:border-[#4285F4] focus:outline-none focus:ring-1 focus:ring-[#4285F4]/40 transition-colors"
                />
              </div>
            </motion.div>

            {/* Checkbox for Signup */}
            {!isLogin && (
              <motion.div
                variants={itemVariants}
                className="mt-1 flex items-start gap-2.5"
              >
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-[#23252a] bg-[#0f1011] text-[#0B2A4A] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-[#8a8f98] leading-tight">
                  I agree to all Terms, Privacy Policy and Student Honor Code
                </label>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 px-4 text-xs sm:text-sm font-medium rounded-[8px] shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? "Signing in..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </motion.div>
          </form>

          {/* Footer Toggle */}
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center text-xs sm:text-sm text-[#8a8f98]"
          >
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("signup")}
                  className="font-semibold text-white hover:underline cursor-pointer ml-1"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("login")}
                  className="font-semibold text-white hover:underline cursor-pointer ml-1"
                >
                  Log in
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
