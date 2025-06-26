import { db } from "@/lib/prisma";

export async function buscarBrechoPorId(id: string) {
  return db.brecho.findUnique({
    where: { id },
  });
}
