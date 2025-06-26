import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET não definido");

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function getBrechoIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload?.brechoId as string;
  } catch (error) {
    console.error("Erro ao verificar token no cookie:", error);
    return null;
  }
}
