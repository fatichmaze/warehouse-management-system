import { NextResponse } from "next/server";
import { ServiceError } from "@/lib/transaction-service";

export function serviceErrorResponse(error, label = "API") {
  if (error instanceof ServiceError) {
    return NextResponse.json(
      {
        error: error.message,
        message: error.message,
      },
      { status: error.status }
    );
  }

  if (error?.code === "23514" || error?.code === "23503") {
    const text = "Data melanggar aturan validasi database.";

    return NextResponse.json(
      { error: text, message: text },
      { status: 400 }
    );
  }

  if (error?.code === "23505") {
    const text = "Data duplikat. Silakan coba lagi.";

    return NextResponse.json(
      { error: text, message: text },
      { status: 409 }
    );
  }

  console.error(`${label} error:`, error);

  const text = "Terjadi kesalahan pada server.";

  return NextResponse.json(
    { error: text, message: text },
    { status: 500 }
  );
}

export function parseRouteId(rawId) {
  const str = String(rawId ?? "").trim();

  if (!/^\d+$/.test(str)) return null;

  const id = Number(str);

  return Number.isSafeInteger(id) &&
    id > 0 &&
    id <= 2147483647
    ? id
    : null;
}