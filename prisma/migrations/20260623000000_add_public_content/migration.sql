-- CreateTable
CREATE TABLE "programs" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(40) NOT NULL DEFAULT 'Berjalan',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentation" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "accent" VARCHAR(20) NOT NULL DEFAULT 'emerald',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "documentation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "programs_active_idx" ON "programs"("active");

-- CreateIndex
CREATE INDEX "documentation_active_idx" ON "documentation"("active");
