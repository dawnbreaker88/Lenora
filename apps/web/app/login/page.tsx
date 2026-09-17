import Auth9 from "@/components/ui/auth-9";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Lenora",
  description: "Sign in to access your agentic study workspace and goals.",
};

export default function LoginPage() {
  return <Auth9 initialMode="login" />;
}
