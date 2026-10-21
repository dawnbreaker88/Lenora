import Auth9 from "@/components/ui/auth-9";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in — Lenora",
  description: "Sign in to access your agentic study workspace and goals.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Failed to load server session in LoginPage:", error);
  }

  if (session?.user) {
    redirect("/");
  }
  return <Auth9 initialMode="login" />;
}
