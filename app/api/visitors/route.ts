import { NextRequest, NextResponse } from "next/server";
import { appendVisitor, getVisitors } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const visitors = await getVisitors();
  return NextResponse.json(visitors);
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    ""
  );
}

type Geo = { country: string; region: string; city: string };

// Netlify injects an x-nf-geo header (JSON, sometimes base64-encoded).
function geoFromNetlify(request: NextRequest): Geo | null {
  const raw = request.headers.get("x-nf-geo");
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const geo = JSON.parse(json);
    const country = geo.country?.name ?? geo.country?.code ?? "";
    const region = geo.subdivision?.name ?? geo.subdivision?.code ?? "";
    const city = geo.city ?? "";
    if (!country && !region && !city) return null;
    return { country, region, city };
  } catch {
    return null;
  }
}

function isPrivateIp(ip: string): boolean {
  return (
    !ip ||
    ip === "::1" ||
    /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|fc|fe80)/i.test(ip)
  );
}

async function geoFromIpLookup(ip: string): Promise<Geo | null> {
  if (isPrivateIp(ip)) return null;
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (!data?.success) return null;
    return {
      country: data.country ?? "",
      region: data.region ?? "",
      city: data.city ?? "",
    };
  } catch {
    return null;
  }
}

function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  const u = ua.toLowerCase();

  let device = "Desktop";
  if (/bot|crawler|spider|crawling|lighthouse/.test(u)) device = "Bot";
  else if (/ipad|tablet|android(?!.*mobile)/.test(u)) device = "Tablet";
  else if (/mobile|iphone|ipod|android/.test(u)) device = "Mobile";

  let os = "Unknown";
  if (/iphone|ipad|ipod/.test(u)) os = "iOS";
  else if (/android/.test(u)) os = "Android";
  else if (/windows/.test(u)) os = "Windows";
  else if (/mac os/.test(u)) os = "macOS";
  else if (/linux/.test(u)) os = "Linux";

  let browser = "Unknown";
  if (/edg\//.test(u)) browser = "Edge";
  else if (/opr\/|opera/.test(u)) browser = "Opera";
  else if (/samsungbrowser/.test(u)) browser = "Samsung Internet";
  else if (/chrome|crios/.test(u)) browser = "Chrome";
  else if (/firefox|fxios/.test(u)) browser = "Firefox";
  else if (/safari/.test(u)) browser = "Safari";

  return { device, browser, os };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const path =
    typeof body?.path === "string" ? body.path.slice(0, 200) : "";

  const ua = request.headers.get("user-agent") ?? "";
  const ip = getIp(request);
  const geo =
    geoFromNetlify(request) ??
    (await geoFromIpLookup(ip)) ?? { country: "", region: "", city: "" };
  const { device, browser, os } = parseUserAgent(ua);

  await appendVisitor({
    timestamp: new Date().toISOString(),
    ip,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    device,
    browser,
    os,
    path,
    userAgent: ua.slice(0, 300),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
