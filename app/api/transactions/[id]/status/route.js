import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import {
  approveTransaction,
  rejectTransaction,
  markTransactionShipped,
} from "@/lib/transaction-service";
import {
  serviceErrorResponse,
  parseRouteId,
} from "@/lib/api-errors";

const bad = (text, status = 400) =>
  NextResponse.json(
    { error: text, message: text },
    { status }
  );

export async function POST(request, context) {
  const auth = await requireApiRole([
    "staff",
    "warehouse_manager",
  ]);

  if (!auth.ok) return auth.response;

  const id = parseRouteId((await context.params)?.id);

  if (!id) {
    return bad("ID transaksi tidak valid.");
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return bad("Format JSON tidak valid.");
  }

  try {
    switch (body?.action) {
      case "approve": {
        if (auth.user.role !== "warehouse_manager") {
          return bad(
            "Hanya Warehouse Manager yang dapat menyetujui transaksi.",
            403
          );
        }

        const approved = await approveTransaction(auth.user, id);

        return NextResponse.json({
          message:
            approved.type === "incoming"
              ? "Transaksi masuk disetujui. Stok bertambah."
              : "Transaksi keluar disetujui. Siap dikemas dan dikirim.",
        });
      }

      case "reject": {
        if (auth.user.role !== "warehouse_manager") {
          return bad(
            "Hanya Warehouse Manager yang dapat menolak transaksi.",
            403
          );
        }

        await rejectTransaction(auth.user, id, body.reason);

        return NextResponse.json({
          message: "Transaksi ditolak. Stok tidak berubah.",
        });
      }

      case "ship": {
        if (auth.user.role !== "staff") {
          return bad(
            "Hanya Staff Gudang yang dapat menandai Shipped.",
            403
          );
        }

        await markTransactionShipped(auth.user, id);

        return NextResponse.json({
          message: "Transaksi ditandai Shipped. Stok berkurang.",
        });
      }

      default:
        return bad(
          "Action harus approve, reject, atau ship."
        );
    }
  } catch (error) {
    return serviceErrorResponse(
      error,
      "POST /api/transactions/[id]/status"
    );
  }
}