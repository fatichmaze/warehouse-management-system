import TransactionsPage from "@/components/transactions/TransactionsPage";

export default async function StaffTransactionsPage({ searchParams }) {
  const params = await searchParams;

  const initialTab =
    params?.type === "outgoing" ? "outgoing" : "incoming";

  return (
    <TransactionsPage
      role="staff"
      initialTab={initialTab}
    />
  );
}
