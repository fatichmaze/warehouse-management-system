import RestockOrdersPage from "@/components/restock/RestockOrdersPage";

export default async function WarehouseManagerRestockOrdersPage({
  searchParams,
}) {
  const params = await searchParams;
  const productId = params?.productId || "";

  return (
    <RestockOrdersPage
      role="warehouse_manager"
      initialProductId={productId}
    />
  );
}
