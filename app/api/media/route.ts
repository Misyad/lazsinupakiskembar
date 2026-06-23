import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";
import { jsonError, BusinessRuleError } from "@/src/lib/api/errors";
import { prisma } from "@/src/lib/db/prisma";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.settingsManage);
  if (response || !user) return response;

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      throw new BusinessRuleError("NO_FILE", "File foto tidak ditemukan.");
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new BusinessRuleError("INVALID_MIME", "Format harus PNG, JPG, WEBP, atau GIF.");
    }
    if (file.size > MAX_BYTES) {
      throw new BusinessRuleError("FILE_TOO_LARGE", "Ukuran foto maksimal 2 MB.");
    }

    const data = Buffer.from(await file.arrayBuffer());
    const asset = await prisma.mediaAsset.create({
      data: { mimeType: file.type, sizeBytes: data.length, data }
    });

    await writeAuditLog({
      actorId: user.id,
      action: "media.upload",
      entityType: "MediaAsset",
      entityId: asset.id,
      ipAddress: requestIp(request)
    });

    return Response.json({ id: asset.id, mimeType: asset.mimeType, sizeBytes: asset.sizeBytes }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
