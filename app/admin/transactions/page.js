import { requirePageRole } from "@/lib/page-auth";
import TransactionsClient from "@/components/transactions/TransactionsClient";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
  const user = await requirePageRole(["admin"]);

  return (
    <TransactionsClient
      role={user.role}
      userId={user.id}
      userName={user.name}
      products={[]}
      suppliers={[]}
      receivedOrders={[]}
      initialTab="all"
      readOnly
    />
  );
}