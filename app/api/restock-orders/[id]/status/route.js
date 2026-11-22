import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { serviceErrorResponse, parseRouteId } from "@/lib/api-errors";
import { updateRestockOrderStatus } from "@/lib/restock-service";

export async function PATCH(request, { params }) {
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

    const body = await request.json();

    const result = await updateRestockOrderStatus(
      auth.user,
      id,
      body.action,
      body.reason
    );

    return NextResponse.json({
      message: "Status Restock Order berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}