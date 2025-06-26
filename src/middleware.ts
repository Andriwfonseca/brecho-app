import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";

const rotasProtegidas = ["/", "/categorias", "/pecas", "/vendas"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const precisaAuth = rotasProtegidas.some((rota) => pathname.startsWith(rota));

  const token = request.cookies.get("token")?.value;
  if (precisaAuth && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    const payload = await verifyJwt(token);
    if (!payload || !payload.brechoId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/categorias/:path*", "/pecas/:path*", "/vendas/:path*"],
};
