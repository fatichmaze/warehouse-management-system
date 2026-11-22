import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { serviceErrorResponse, parseRouteId } from "@/lib/api-errors";
import { getRestockOrder } from "@/lib/restock-service";

export async function GET(request, { params }) {
  try {
    const auth = await requireApiRole([
      "warehouse_manager",
      "supplier",
    ]);

    if (!auth.ok) {
      return auth.response;
    }

    const { id: rawId } = await params;
    const id = parseRouteId(rawId);

    if (!id) {
      return NextResponse.json(
        { message: "ID Restock Order tidak valid." },
        { status: 400 }
      );
    }

    const result = await getRestockOrder(
      auth.user,
      id
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
