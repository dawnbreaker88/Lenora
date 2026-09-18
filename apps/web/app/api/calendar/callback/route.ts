import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  // Redirect to the backend calendar callback endpoint or handle it
  const backendUrl = `http://localhost:4000/api/calendar/callback${search}`;
  return NextResponse.redirect(backendUrl);
}
