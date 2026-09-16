import { formatCurrency } from "@/lib/utils"

const paymentLabels = {
  PENDING: "Não definida",
  PIX: "PIX",
  MONEY: "Dinheiro",
  CARNE: "Carnê",
  CREDIT: "Cartão de crédito",
  DEBIT: "Cartão de débito",
}

const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR")
const formatMonth = (date) => new Date(`${date.slice(0, 7)}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

function activeFilters(filters) {
  return [
    filters.name && `Nome: ${filters.name}`,
    filters.category !== "all" && `Categoria: ${filters.categoryName}`,
    filters.status !== "all" && `Situação: ${filters.status === "paid" ? "Pagas" : "Em aberto"}`,
    filters.payment !== "all" && `Pagamento: ${paymentLabels[filters.payment]}`,
  ].filter(Boolean)
}

function totals(rows) {
  return {
    paid: rows.filter(row => row.paid).reduce((total, row) => total + Number(row.value), 0),
    open: rows.filter(row => !row.paid).reduce((total, row) => total + Number(row.value), 0),
  }
}

export default function BillReportDocument({ rows, period, filters, groupByMonth }) {
  const { paid, open } = totals(rows)
  const filtersText = activeFilters(filters)
  const rowsByMonth = rows.length === 0 ? [] : groupByMonth ? Object.values(rows.reduce((groups, row) => {
    const key = row.dueDate.slice(0, 7)
    groups[key] = [...(groups[key] || []), row]
    return groups
  }, {})) : [rows]
  return <article className="mx-auto min-h-[1123px] w-[794px] bg-white p-[60px] text-slate-800 shadow-xl print:shadow-none"><header className="border-b border-slate-300 pb-4"><h1 className="text-3xl font-semibold text-green-900">Relatório de contas</h1><p className="mt-2 text-base text-slate-600">Período: {period}</p><p className="text-sm text-slate-500">Emitido em: {new Date().toLocaleString("pt-BR")}</p>{filtersText.length > 0 && <p className="mt-2 text-sm text-slate-600">Filtros: {filtersText.join(" | ")}</p>}</header><section className="my-6 grid grid-cols-3 gap-3"><div className="rounded-lg border border-slate-300 p-3 text-base">Contas<strong className="mt-1 block text-xl text-green-900">{rows.length}</strong></div><div className="rounded-lg border border-slate-300 p-3 text-base">Pagas<strong className="mt-1 block text-xl text-green-900">{formatCurrency(paid)}</strong></div><div className="rounded-lg border border-slate-300 p-3 text-base">Em aberto<strong className="mt-1 block text-xl text-green-900">{formatCurrency(open)}</strong></div></section><table className="w-full border-collapse text-left text-sm"><thead><tr className="border-b border-slate-300 bg-slate-100 text-green-900"><th className="p-2">Vencimento</th><th className="p-2">Conta</th><th className="p-2">Categoria</th><th className="p-2">Pagamento</th><th className="p-2">Situação</th><th className="p-2">Valor</th></tr></thead><tbody>{rowsByMonth.map(monthRows => <><tr key={`month-${monthRows[0].dueDate}`} className={groupByMonth ? "border-b border-green-200 bg-green-100 text-base font-semibold capitalize text-green-900" : "hidden"}><td colSpan="6" className="p-3"><span>{formatMonth(monthRows[0].dueDate)}</span><span className="float-right normal-case">Total do mês: {formatCurrency(monthRows.reduce((total, row) => total + Number(row.value), 0))}</span></td></tr>{monthRows.map((row, index) => <tr key={`${row.name}-${row.dueDate}-${index}`} className="border-b border-slate-200"><td className="p-2">{formatDate(row.dueDate)}</td><td className="p-2">{row.name}</td><td className="p-2">{row.category}</td><td className="p-2">{paymentLabels[row.payment] || row.payment}</td><td className="p-2">{row.paid ? "Paga" : "Em aberto"}</td><td className="p-2">{formatCurrency(row.value)}</td></tr>)}</>)}</tbody></table></article>
}
