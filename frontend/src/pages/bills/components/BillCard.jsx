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
      className="bg-slate-100 rounded-lg p-4 mb-3 shadow flex justify-between items-center w-[30%]  hover:-translate-y-2 transition-discrete"
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
              - R$ {currentInstallment.value.toFixed(2)}
            </p>
            <p className="text-sm mt-1">
              Valor Total - R$ {bill.totalValue.toFixed(2)}
            </p>
          </>
        ) : (
          <p className="text-sm mt-1">
            Valor - R$ {bill.totalValue.toFixed(2)}
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
