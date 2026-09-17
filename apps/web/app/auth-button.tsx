"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();
  if (status === "loading") return <span className="text-sm text-slate-500">Checking your session…</span>;
  if (session?.user) return <div className="flex flex-col items-center gap-4 sm:flex-row"><div className="text-center sm:text-right"><p className="font-medium text-slate-900">{session.user.name ?? "Signed in"}</p><p className="text-sm text-slate-500">{session.user.email}</p></div><button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => signOut()} type="button">Sign out</button></div>;
  return <button className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700" onClick={() => signIn("google", { callbackUrl: "/" })} type="button">Continue with Google</button>;
}
