import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { jsonError } from "@/src/lib/api/errors";
import { generateBoxQrDataUrl } from "@/src/lib/qr";
import { prisma } from "@/src/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { response } = await requireApiPermission(permissions.coinBoxesRead);
  if (response) return response;

  try {
    const { id } = await params;

    if (!/^\d+$/.test(id)) {
      return Response.json({ error: "ID tidak valid." }, { status: 400 });
    }

    const box = await prisma.coinBox.findFirst({
      where: { id: Number(id), deletedAt: null }
    });

    if (!box) {
      return Response.json({ error: "Kaleng tidak ditemukan." }, { status: 404 });
    }

    const qrDataUrl = await generateBoxQrDataUrl(box.id, box.boxNumber);
    return Response.json({ qrDataUrl, boxNumber: box.boxNumber });
  } catch (error) {
    return jsonError(error);
  }
}
