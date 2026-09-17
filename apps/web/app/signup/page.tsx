import Auth9 from "@/components/ui/auth-9";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Lenora",
  description: "Start your 30-day student trial with Lenora's agentic learning harness.",
};

export default function SignUpPage() {
  return <Auth9 initialMode="signup" />;
}
