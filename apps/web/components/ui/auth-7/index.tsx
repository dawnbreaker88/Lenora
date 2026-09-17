"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface Auth7Props {
  initialMode?: "login" | "signup";
}

export default function Auth7({ initialMode = "login" }: Auth7Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 320,
        damping: 26,
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
    // Fallback: signIn with google or simulate redirect
    await signIn("google", { callbackUrl: "/" });
  };

  const toggleMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", newMode === "login" ? "/login" : "/signup");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#05070A] text-[#d0d6e0] font-sans antialiased selection:bg-white selection:text-black">
      {/* Left Form Column */}
      <div className="flex w-full flex-col justify-between p-6 sm:p-10 lg:w-[48%] xl:w-[45%] lg:p-12 xl:p-16">
        
        {/* Top Header: Logo & Back Link */}
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-6 h-6 rounded-[5px] bg-white text-black flex items-center justify-center font-mono font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
              L
            </div>
            <span className="text-sm font-semibold tracking-tight text-white group-hover:text-[#d0d6e0] transition-colors">
              LENORA
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#8a8f98] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to site</span>
          </Link>
        </div>

        {/* Form Container: Optically centered & aligned */}
        <div className="my-auto w-full max-w-[400px] mx-auto py-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={mode}
            className="w-full"
          >
            {/* Titles */}
            <motion.div variants={itemVariants} className="mb-7">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B2A4A]/30 border border-[#123D68]/50 mb-3">
                <span className="text-[10px] font-mono font-semibold tracking-wider text-[#c8d9ea] uppercase">
                  {isLogin ? "Student Portal" : "Student Access"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                {isLogin ? "Welcome back" : "Create your Account"}
              </h1>
              <p className="text-xs sm:text-sm text-[#8a8f98] leading-relaxed">
                {isLogin
                  ? "Sign in to access your agentic study workspace and goals."
                  : "Let's get started with your 30-day student trial."}
              </p>
            </motion.div>

            {/* Google Login Button */}
            <motion.div variants={itemVariants} className="mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-[8px] border border-[#23252a] bg-[#0f1011] hover:bg-[#161718] hover:border-[#2e3138] px-5 py-3 text-xs sm:text-sm font-medium text-white transition-all shadow-sm active:scale-[0.99] cursor-pointer"
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
              <span className="px-3 text-xs text-[#62666d] font-mono uppercase tracking-wider">or with email</span>
              <div className="grow border-t border-[#23252a]"></div>
            </motion.div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
                  className="flex items-start gap-2.5 pt-1"
                >
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-[#23252a] bg-[#0f1011] text-[#0B2A4A] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-[#8a8f98] leading-tight">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </motion.div>
              )}

              {/* Submit CTA Button */}
              <motion.div variants={itemVariants} className="mt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary text-xs sm:text-sm font-medium py-3 rounded-[8px] flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <span>{isLoading ? "Signing in..." : isLogin ? "Sign In" : "Create Account"}</span>
                </button>
              </motion.div>
            </form>

            {/* Toggle Mode Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-6 text-center text-xs text-[#8a8f98]"
            >
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleMode("signup")}
                    className="font-medium text-white hover:underline cursor-pointer ml-1"
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
                    className="font-medium text-white hover:underline cursor-pointer ml-1"
                  >
                    Log in
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Footer Muted Security Badge */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#62666d] pt-4 border-t border-[#161718]">
          <span>Protected by Student Auth</span>
          <span>TLS 1.3 Grounded Encryption</span>
        </div>
      </div>

      {/* Right Column: Architectural Image Panel */}
      <div className="hidden lg:block lg:w-[52%] xl:w-[55%] p-3.5">
        <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-[#23252a] bg-[#08090a]">
          {/* Cloudscape Background Image from inspiration */}
          <img
            src="https://assets.watermelon.sh/auth-7.avif"
            alt="Cloudscape background"
            className="h-full w-full object-cover select-none"
          />

          {/* Elegant Dark Linear Vignette & Subtle Atmospheric Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/80 via-transparent to-[#05070A]/30 pointer-events-none" />

          {/* Floating Subtle Showcase Badge in lower corner */}
          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between p-4 rounded-[12px] bg-[#0f1011]/80 backdrop-blur-md border border-[#23252a]/80 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[6px] bg-[#0B2A4A] border border-[#123D68] flex items-center justify-center text-white font-mono text-xs font-bold">
                L
              </div>
              <div>
                <p className="text-xs font-medium text-white">Agentic Learning Harness</p>
                <p className="text-[11px] text-[#8a8f98]">Goal · Planner · Feynman · Grounded RAG</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-[#161718] border border-[#23252a] text-[10px] font-mono text-[#c8d9ea]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
