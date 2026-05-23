import { ZodError } from "zod";

export class BusinessRuleError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 422
  ) {
    super(message);
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(
      { error: "Validasi gagal.", details: error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  if (error instanceof Response) {
    return error;
  }

  if (error instanceof Error) {
    if (error instanceof BusinessRuleError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status });
    }
    if (error.message === "NOT_FOUND") {
      return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }
    if (error.message === "INVALID_RELATION") {
      return Response.json({ error: "Relasi data tidak valid." }, { status: 422 });
    }
    if (error.message === "INVALID_STATUS") {
      return Response.json({ error: "Status data tidak valid." }, { status: 422 });
    }
  }

  return Response.json({ error: "Terjadi kesalahan server." }, { status: 500 });
}
