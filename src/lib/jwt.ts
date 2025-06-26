import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET não definido");

const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JwtPayload {
  brechoId: string;
  email: string;
  [key: string]: unknown;
}

export async function generateJwt(payload: JwtPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as JwtPayload;
  } catch (error) {
    console.error("Erro ao verificar JWT:", error);
    return null;
  }
}
