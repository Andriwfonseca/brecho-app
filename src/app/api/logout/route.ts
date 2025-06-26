import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  const response = NextResponse.json({ sucesso: true });

  response.headers.set(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: false,
      path: "/",
      expires: new Date(0),
    })
  );

  return response;
}
