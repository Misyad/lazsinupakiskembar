import { prisma } from "@/src/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

// Public: serves the stored image bytes so the landing page can display them.
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const assetId = Number(id);
  if (!Number.isInteger(assetId) || assetId <= 0) {
    return new Response("Not found", { status: 404 });
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(Buffer.from(asset.data), {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(asset.sizeBytes),
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
