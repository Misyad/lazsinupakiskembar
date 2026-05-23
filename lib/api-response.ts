import { NextResponse } from "next/server";

const allowedOrigins = new Set([
  "http://127.0.0.1:3003",
  "http://localhost:3003",
  "https://lazisnupakem.projecthasan.com",
  "https://api.lazisnupakem.projecthasan.com"
]);

export function apiJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("access-control-allow-credentials", "true");
  response.headers.set("access-control-allow-headers", "content-type");
  response.headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
  return response;
}

export function corsPreflight(request: Request) {
  const response = new NextResponse(null, { status: 204 });
  applyCorsOrigin(response, request);
  response.headers.set("access-control-allow-credentials", "true");
  response.headers.set("access-control-allow-headers", "content-type");
  response.headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
  return response;
}

export function applyCorsOrigin(response: NextResponse, request: Request) {
  const origin = request.headers.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    response.headers.set("access-control-allow-origin", origin);
    response.headers.set("vary", "Origin");
  }
  return response;
}

