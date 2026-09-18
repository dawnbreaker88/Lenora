import Auth9 from "@/components/ui/auth-9";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in — Lenora",
  description: "Sign in to access your agentic study workspace and goals.",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/");
  }
  return <Auth9 initialMode="login" />;
}
