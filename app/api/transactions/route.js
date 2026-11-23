import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireApiRole } from "@/lib/api-auth";
import { createTransaction } from "@/lib/transaction-service";
import { serviceErrorResponse } from "@/lib/api-errors";

const READ_ROLES = ["staff", "warehouse_manager"];

const SORT_MAP = {
  date_desc: "t.transaction_date DESC, t.id DESC",
  date_asc: "t.transaction_date ASC, t.id ASC",
  number_asc: "t.transaction_number ASC",
  number_desc: "t.transaction_number DESC",
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request) {
  const auth = await requireApiRole(READ_ROLES);

  if (!auth.ok) return auth.response;

  try {
    const sp = new URL(request.url).searchParams;
    const conditions = [];
    const params = [];

    const add = (value) => {
      params.push(value);
      return `$${params.length}`;
    };

    const type = sp.get("type");

    if (type === "incoming" || type === "outgoing") {
      conditions.push(`t.type = ${add(type)}`);
    }

    const status = sp.get("status");

    if (
      ["Pending", "Approved", "Rejected", "Shipped"].includes(status)
    ) {
      conditions.push(`t.status = ${add(status)}`);
    }

    const dateFrom = sp.get("date_from");

    if (dateFrom && DATE_RE.test(dateFrom)) {
      conditions.push(
        `t.transaction_date >= ${add(dateFrom)}::date`
      );
    }

    const dateTo = sp.get("date_to");

    if (dateTo && DATE_RE.test(dateTo)) {
      conditions.push(
        `t.transaction_date <= ${add(dateTo)}::date`
      );
    }

    const party = (sp.get("party") ?? "").trim();

    if (party) {
      const like = `%${party.replace(/[\\%_]/g, "\\$&")}%`;
      const p = add(like);

      conditions.push(
        `(t.customer_destination ILIKE ${p} ESCAPE '\\'
          OR s.company_name ILIKE ${p} ESCAPE '\\'
          OR s.name ILIKE ${p} ESCAPE '\\')`
      );
    }

    const orderBy =
      SORT_MAP[sp.get("sort")] ?? SORT_MAP.date_desc;

    const pageSize = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(sp.get("page_size") ?? "10", 10) || 10
      )
    );

    const page = Math.max(
      1,
      Number.parseInt(sp.get("page") ?? "1", 10) || 1
    );

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const limitP = add(pageSize);
    const offsetP = add((page - 1) * pageSize);

    const result = await pool.query(
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
         COALESCE(s.company_name, s.name) AS supplier_name,
         po.po_number,
         (SELECT COUNT(*)::int
          FROM transaction_items ti
          WHERE ti.transaction_id = t.id) AS item_count,
         (SELECT COALESCE(SUM(ti.quantity), 0)::int
          FROM transaction_items ti
          WHERE ti.transaction_id = t.id) AS total_quantity,
         COUNT(*) OVER()::int AS total_count
       FROM transactions t
       LEFT JOIN users s ON s.id = t.supplier_id
       LEFT JOIN users cu ON cu.id = t.created_by
       LEFT JOIN restock_orders po ON po.id = t.restock_order_id
       ${where}
       ORDER BY ${orderBy}
       LIMIT ${limitP} OFFSET ${offsetP}`,
      params
    );

    const total = result.rows[0]?.total_count ?? 0;

    return NextResponse.json({
      data: result.rows.map(({ total_count, ...row }) => row),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    return serviceErrorResponse(
      error,
      "GET /api/transactions"
    );
  }
}

export async function POST(request) {
  const auth = await requireApiRole(["staff"]);

  if (!auth.ok) return auth.response;

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
    const created = await createTransaction(auth.user, body);

    return NextResponse.json(
      {
        message: "Transaksi berhasil dibuat.",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return serviceErrorResponse(
      error,
      "POST /api/transactions"
    );
  }
}