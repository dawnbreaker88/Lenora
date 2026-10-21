import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  // Redirect to the backend calendar callback endpoint
  const redirectUrl = new URL(`/api/calendar/callback${search}`, req.url);
  return NextResponse.redirect(redirectUrl);
}
