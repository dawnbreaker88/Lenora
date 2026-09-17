import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { RagDashboard } from "./rag-dashboard";
import { LandingPage } from "@/components/LandingPage";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    return <RagDashboard />;
  }

  return <LandingPage />;
}

