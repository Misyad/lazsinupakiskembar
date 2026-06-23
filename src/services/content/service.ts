import { prisma } from "@/src/lib/db/prisma";
import type {
  CreateDocumentationInput,
  CreateProgramInput,
  UpdateDocumentationInput,
  UpdateProgramInput
} from "@/src/lib/validations/content";

/* ----------------------------- Programs ----------------------------- */

export async function listProgramsAdmin() {
  return prisma.program.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }]
  });
}

export async function createProgram(input: CreateProgramInput) {
  return prisma.program.create({
    data: {
      title: input.title,
      amount: input.amount,
      status: input.status,
      sortOrder: input.sortOrder,
      active: input.active ?? true
    }
  });
}

export async function updateProgram(id: number, input: UpdateProgramInput) {
  const existing = await prisma.program.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new Error("NOT_FOUND");

  return prisma.program.update({
    where: { id },
    data: {
      title: input.title,
      amount: input.amount,
      status: input.status,
      sortOrder: input.sortOrder,
      active: input.active
    }
  });
}

export async function deleteProgram(id: number) {
  const existing = await prisma.program.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new Error("NOT_FOUND");

  return prisma.program.update({
    where: { id },
    data: { active: false, deletedAt: new Date() }
  });
}

export function serializeProgram(program: Awaited<ReturnType<typeof listProgramsAdmin>>[number]) {
  return {
    id: program.id,
    title: program.title,
    amount: program.amount,
    status: program.status,
    sortOrder: program.sortOrder,
    active: program.active
  };
}

/* --------------------------- Documentation -------------------------- */

export async function listDocumentationAdmin() {
  return prisma.documentation.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }]
  });
}

export async function createDocumentation(input: CreateDocumentationInput) {
  return prisma.documentation.create({
    data: {
      title: input.title,
      description: input.description,
      accent: input.accent,
      sortOrder: input.sortOrder,
      active: input.active ?? true
    }
  });
}

export async function updateDocumentation(id: number, input: UpdateDocumentationInput) {
  const existing = await prisma.documentation.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new Error("NOT_FOUND");

  return prisma.documentation.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      accent: input.accent,
      sortOrder: input.sortOrder,
      active: input.active
    }
  });
}

export async function deleteDocumentation(id: number) {
  const existing = await prisma.documentation.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new Error("NOT_FOUND");

  return prisma.documentation.update({
    where: { id },
    data: { active: false, deletedAt: new Date() }
  });
}

export function serializeDocumentation(doc: Awaited<ReturnType<typeof listDocumentationAdmin>>[number]) {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    accent: doc.accent,
    sortOrder: doc.sortOrder,
    active: doc.active
  };
}
