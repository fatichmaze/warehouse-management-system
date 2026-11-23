import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireApiRole } from "@/lib/api-auth";
import {
  updateTransaction,
  deleteTransaction,
} from "@/lib/transaction-service";
import {
  serviceErrorResponse,
  parseRouteId,
} from "@/lib/api-errors";

const invalidId = () =>
  NextResponse.json(
    {
      error: "ID transaksi tidak valid.",
      message: "ID transaksi tidak valid.",
    },
    { status: 400 }
  );

export async function GET(_request, context) {
  const auth = await requireApiRole([
    "staff",
    "warehouse_manager",
  ]);

  if (!auth.ok) return auth.response;

  const id = parseRouteId((await context.params)?.id);

  if (!id) return invalidId();

  try {
    const trx = await pool.query(
      `SELECT
         t.id,
         t.transaction_number,
         t.type,
         to_char(t.transaction_date, 'YYYY-MM-DD') AS transaction_date,
         t.status,
         t.customer_destination,
         t.notes,
         t.rejection_reason,
         t.created_by,
         cu.name AS created_by_name,
         au.name AS approved_by_name,
         t.supplier_id,
         COALESCE(s.company_name, s.name) AS supplier_name,
         t.restock_order_id,
         po.po_number,
         t.created_at
       FROM transactions t
       LEFT JOIN users s ON s.id = t.supplier_id
       LEFT JOIN users cu ON cu.id = t.created_by
       LEFT JOIN users au ON au.id = t.approved_by
       LEFT JOIN restock_orders po ON po.id = t.restock_order_id
       WHERE t.id = $1`,
      [id]
    );

    if (trx.rowCount === 0) {
      return NextResponse.json(
        {
          error: "Transaksi tidak ditemukan.",
          message: "Transaksi tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const items = await pool.query(
      `SELECT
         ti.product_id,
         p.sku,
         p.name,
         p.unit,
         p.current_stock,
         ti.quantity
       FROM transaction_items ti
       INNER JOIN products p ON p.id = ti.product_id
       WHERE ti.transaction_id = $1
       ORDER BY p.name`,
      [id]
    );

    return NextResponse.json({
      data: {
        ...trx.rows[0],
        items: items.rows,
      },
    });
  } catch (error) {
    return serviceErrorResponse(
      error,
      "GET /api/transactions/[id]"
    );
  }
}

export async function PATCH(request, context) {
  const auth = await requireApiRole(["staff"]);

  if (!auth.ok) return auth.response;

  const id = parseRouteId((await context.params)?.id);

  if (!id) return invalidId();

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Format JSON tidak valid.",
        message: "Format JSON tidak valid.",
      },
      { status: 400 }
    );
  }

  try {
    await updateTransaction(auth.user, id, body);

    return NextResponse.json({
      message: "Transaksi berhasil diperbarui.",
    });
  } catch (error) {
    return serviceErrorResponse(
      error,
      "PATCH /api/transactions/[id]"
    );
  }
}

export async function DELETE(_request, context) {
  const auth = await requireApiRole(["staff"]);

  if (!auth.ok) return auth.response;

  const id = parseRouteId((await context.params)?.id);

  if (!id) return invalidId();

  try {
    await deleteTransaction(auth.user, id);

    return NextResponse.json({
      message: "Transaksi berhasil dihapus.",
    });
  } catch (error) {
    return serviceErrorResponse(
      error,
      "DELETE /api/transactions/[id]"
    );
  }
}