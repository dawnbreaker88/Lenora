import { type NextRequest, NextResponse } from "next/server";

const API_BASE = "http://localhost:4000/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

async function handleProxy(req: NextRequest, { path }: { path: string[] }) {
  const targetUrl = `${API_BASE}/${path.join("/")}${req.nextUrl.search}`;
  const forwardHeaders = new Headers();

  req.headers.forEach((val, key) => {
    if (key.toLowerCase() !== "host") {
      forwardHeaders.set(key, val);
    }
  });

  try {
    let body: BodyInit | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.arrayBuffer();
    }

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    const contentType = res.headers.get("Content-Type") || "application/json";
    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("[PROXY ERROR]", error);
    return NextResponse.json(
      { error: "Failed to connect to backend API", details: String(error) },
      { status: 502 }
    );
  }
}
