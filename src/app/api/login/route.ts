import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { generateJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  const { email, senha } = await req.json();

  const brecho = await db.brecho.findUnique({
    where: { email },
  });

  if (!brecho || !(await bcrypt.compare(senha, brecho.senhaHash))) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const token = await generateJwt({
    brechoId: brecho.id,
    email: brecho.email,
  });

  const response = NextResponse.json({ sucesso: true });

  response.headers.set(
    "Set-Cookie",
    serialize("token", token, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  );

  return response;
}
