-- AlterTable
ALTER TABLE "documentation" ADD COLUMN     "image_id" INTEGER;

-- CreateTable
CREATE TABLE "media_assets" (
    "id" SERIAL NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documentation" ADD CONSTRAINT "documentation_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
