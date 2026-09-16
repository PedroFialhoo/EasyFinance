import { formatCurrency } from "@/lib/utils";

export default function BillCard({ bill, onEdit, setBill, isHighlighted = false }) {
  const installments = bill.billInstallments || [];

  const currentInstallment =
    installments.find((i) => !i.paymentDate) ||
    installments[installments.length - 1];

  if (!currentInstallment) return null;
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
  const dueDate = new Date(`${currentInstallment.dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const urgency = !isPaid && dueDate < today ? "Atrasada" : !isPaid && dueDate.getTime() === today.getTime() ? "Vence hoje" : "A vencer";
  const showsDueDate = !isPaid || bill.typePayment === "CARNE" || bill.typePayment === "CREDIT";

  return (
    <button
      type="button"
      aria-label={`Editar conta ${bill.name}, ${isPaid ? "paga" : urgency}`}
      className={`mb-3 flex w-full cursor-pointer items-center justify-between rounded-lg bg-white p-4 text-left shadow transition-discrete hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 sm:w-[calc(50%-0.375rem)] xl:w-[calc(33.333%-0.5rem)] ${isHighlighted ? "ring-2 ring-yellow-500 ring-offset-2" : ""}`}
      onClick={editBill}
    >
      <div>
        <h2 className="font-semibold text-lg">{bill.name}</h2>

        <p className="text-sm text-gray-600 capitalize">
          {bill.category?.name} • {month}
        </p>

        {bill.fixedRecurring ? (
          <>
            <p className="text-sm mt-1">Conta fixa mensal - {formatCurrency(currentInstallment.value)}</p>
            {bill.recurrenceEndDate && <p className="text-sm mt-1 text-slate-600">Até {new Date(`${bill.recurrenceEndDate}T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>}
          </>
        ) : totalInstallments > 1 ? (
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
        {showsDueDate && <p className="mt-2 text-sm font-medium text-slate-700">Vencimento: {dueDate.toLocaleDateString("pt-BR")} {!isPaid && <span className={urgency === "Atrasada" ? "text-red-700" : urgency === "Vence hoje" ? "text-amber-700" : "text-green-700"}>({urgency})</span>}</p>}
      </div>

      <span
        className={`text-sm font-semibold px-3 py-1 rounded-full
          ${isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
        `}
      >
        {isPaid ? "Paga" : "Em aberto"}
      </span>
    </button>
  );
}
