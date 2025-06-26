import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const { nome, email, senha } = await req.json();

  const brechoExistente = await db.brecho.findUnique({
    where: { email },
  });

  if (brechoExistente) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const novoBrecho = await db.brecho.create({
    data: {
      nome,
      email,
      senhaHash,
    },
  });

  return NextResponse.json(novoBrecho, { status: 201 });
}
