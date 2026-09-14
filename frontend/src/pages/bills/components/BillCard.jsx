import { formatCurrency } from "@/lib/utils";

export default function BillCard({ bill, onEdit, setBill }) {
  const installments = bill.billInstallments || [];

  const currentInstallment =
    installments.find((i) => !i.paymentDate) ||
    installments[installments.length - 1];

  const installmentNumber = currentInstallment.installmentNumber;
  const totalInstallments = bill.numberInstallments;

  const isPaid = !!currentInstallment.paymentDate;

  const month = new Date(currentInstallment.dueDate).toLocaleDateString(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  );

  const editBill = () => {
    setBill(bill);
    onEdit();
  };

  return (
    <div
      className="mb-3 flex w-full cursor-pointer items-center justify-between rounded-lg bg-slate-100 p-4 shadow transition-discrete hover:-translate-y-2 sm:w-[calc(50%-0.375rem)] xl:w-[calc(33.333%-0.5rem)]"
      onClick={editBill}
    >
      <div>
        <h2 className="font-semibold text-lg">{bill.name}</h2>

        <p className="text-sm text-gray-600 capitalize">
          {bill.category.name} • {month}
        </p>

        {totalInstallments > 1 ? (
          <>
            <p className="text-sm mt-1">
              Parcela{" "}
              <span className="font-semibold">
                {installmentNumber}/{totalInstallments}
              </span>{" "}
              - {formatCurrency(currentInstallment.value)}
            </p>
            <p className="text-sm mt-1">
              Valor Total - {formatCurrency(bill.totalValue)}
            </p>
          </>
        ) : (
          <p className="text-sm mt-1">
            Valor - {formatCurrency(bill.totalValue)}
          </p>
        )}
      </div>

      <span
        className={`text-sm font-semibold px-3 py-1 rounded-full
          ${isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
        `}
      >
        {isPaid ? "Paga" : "Em aberto"}
      </span>
    </div>
  );
}
