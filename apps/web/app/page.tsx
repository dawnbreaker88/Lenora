import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { RagDashboard } from "./rag-dashboard";
import { LandingPage } from "@/components/LandingPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Failed to load server session in Home:", error);
  }

  if (session?.user) {
    return <RagDashboard />;
  }

  return <LandingPage />;
}

