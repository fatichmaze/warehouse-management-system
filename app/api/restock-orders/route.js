import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { serviceErrorResponse } from "@/lib/api-errors";
import {
  getRestockOrders,
  createRestockOrder,
} from "@/lib/restock-service";

export async function GET(request) {
  try {
    const auth = await requireApiRole([
      "warehouse_manager",
      "supplier",
    ]);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    const filters = {
      status: searchParams.get("status"),
      search: searchParams.get("search"),
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
    };

    const result = await getRestockOrders(
      auth.user,
      filters
    );

    return NextResponse.json(result);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const auth = await requireApiRole([
      "warehouse_manager",
    ]);

    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();

    const result = await createRestockOrder(
      auth.user,
      body
    );

    return NextResponse.json(
      {
        message: "Restock Order berhasil dibuat.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
