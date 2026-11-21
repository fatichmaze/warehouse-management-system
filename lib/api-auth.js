
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

const MAX_USER_ID = 2147483647;

const DEFAULT_MESSAGES = {
  unauthenticated: "Silakan login terlebih dahulu.",
  forbidden: "Anda tidak memiliki akses.",
  pending: "Akun Anda masih menunggu persetujuan Admin.",
  rejected: "Pendaftaran akun Anda ditolak oleh Admin.",
  invalidStatus: "Status akun tidak valid.",
  server: "Terjadi kesalahan pada server.",
};

function failure(status, text, errorKey) {
  let body;

  if (errorKey === "error") {
    body = { error: text };
  } else if (errorKey === "message") {
    body = { message: text };
  } else {
    body = { error: text, message: text };
  }

  return {
    ok: false,
    response: NextResponse.json(body, { status }),
  };
}

export async function requireApiRole(allowedRoles, options = {}) {
  const errorKey = options.errorKey ?? "both";
  const messages = { ...DEFAULT_MESSAGES, ...(options.messages ?? {}) };

  if (
    !Array.isArray(allowedRoles) ||
    allowedRoles.length === 0 ||
    !allowedRoles.every(
      (role) =>
        typeof role === "string" &&
        role.trim() !== "" &&
        role === role.trim()
    )
  ) {
    console.error("requireApiRole: allowedRoles tidak valid.");
    return failure(500, messages.server, errorKey);
  }

  try {
    const session = await getSession();

    if (!session) {
      return failure(401, messages.unauthenticated, errorKey);
    }

    const userId = session.userId;

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      userId > MAX_USER_ID
    ) {
      return failure(401, messages.unauthenticated, errorKey);
    }

    const result = await pool.query(
      `SELECT id, name, email, role, status, company_name
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return failure(401, messages.unauthenticated, errorKey);
    }

    const user = result.rows[0];

    if (user.status !== "approved") {
      if (user.status === "pending") {
        return failure(403, messages.pending, errorKey);
      }

      if (user.status === "rejected") {
        return failure(403, messages.rejected, errorKey);
      }

      return failure(403, messages.invalidStatus, errorKey);
    }

    if (!allowedRoles.includes(user.role)) {
      return failure(403, messages.forbidden, errorKey);
    }

    return { ok: true, user };
  } catch (error) {
    console.error("requireApiRole error:", error);
    return failure(500, messages.server, errorKey);
  }
}
