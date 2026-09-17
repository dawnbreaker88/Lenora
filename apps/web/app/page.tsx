import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AuthButton } from "./auth-button";
import { RagDashboard } from "./rag-dashboard";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    return <RagDashboard />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 font-sans text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-xl backdrop-blur">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/30">
          L
        </div>
        <p className="text-xs font-semibold tracking-[0.24em] text-indigo-400 uppercase">Lenora Study AI</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Welcome to Lenora</h1>
        <p className="mt-2 text-xs text-slate-400">
          Sign in with your student Google account to test document ingestion, semantic vector retrieval, and grounded Q&A.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthButton />
        </div>
      </section>
    </main>
  );
}
