import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://127.0.0.1:4000/api";
const API_FALLBACK = "http://localhost:4000/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

async function handleProxy(req: NextRequest, { path }: { path: string[] }) {
  const forwardHeaders = new Headers();

  req.headers.forEach((val, key) => {
    if (key.toLowerCase() !== "host") {
      forwardHeaders.set(key, val);
    }
  });

  const bodyData = (req.method !== "GET" && req.method !== "HEAD")
    ? await req.arrayBuffer()
    : null;

  const tryFetch = async (baseUrl: string) => {
    const targetUrl = `${baseUrl}/${path.join("/")}${req.nextUrl.search}`;
    return fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: bodyData,
    });
  };

  try {
    let res: Response;
    try {
      res = await tryFetch(API_BASE);
    } catch (primaryErr) {
      // If 127.0.0.1 fails, try localhost fallback
      try {
        res = await tryFetch(API_FALLBACK);
      } catch {
        throw primaryErr;
      }
    }

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
