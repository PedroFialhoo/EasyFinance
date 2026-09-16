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
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character])
const formatMonth = (date) => new Date(`${date.slice(0, 7)}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

export function reportPeriod(month, startMonth, endMonth, periodType) {
  if (periodType === "month") return new Date(`${month}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  const formatMonth = value => new Date(`${value}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  return `${formatMonth(startMonth)} a ${formatMonth(endMonth)}`
}

export function createBillReportHtml({ rows, period, filters, groupByMonth }) {
  const paid = rows.filter(row => row.paid).reduce((total, row) => total + Number(row.value), 0)
  const open = rows.filter(row => !row.paid).reduce((total, row) => total + Number(row.value), 0)
  const filtersText = [filters.name && `Nome: ${filters.name}`, filters.category !== "all" && `Categoria: ${filters.categoryName}`, filters.status !== "all" && `Situação: ${filters.status === "paid" ? "Pagas" : "Em aberto"}`, filters.payment !== "all" && `Pagamento: ${paymentLabels[filters.payment]}`].filter(Boolean).join(" | ")
  const rowHtml = row => `<tr><td>${escapeHtml(formatDate(row.dueDate))}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.category)}</td><td>${escapeHtml(paymentLabels[row.payment] || row.payment)}</td><td>${row.paid ? "Paga" : "Em aberto"}</td><td>${escapeHtml(formatCurrency(row.value))}</td></tr>`
  const tableRows = groupByMonth ? Object.values(rows.reduce((groups, row) => {
    const key = row.dueDate.slice(0, 7)
    groups[key] = [...(groups[key] || []), row]
    return groups
  }, {})).map(monthRows => `<tr class="month"><td colspan="6">${escapeHtml(formatMonth(monthRows[0].dueDate))}<span>Total do mês: ${formatCurrency(monthRows.reduce((total, row) => total + Number(row.value), 0))}</span></td></tr>${monthRows.map(rowHtml).join("")}`).join("") : rows.map(rowHtml).join("")
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de contas</title><style>@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#1f2937;margin:0}h1{color:#14532d;margin:0 0 8px;font-size:26px}p{margin:4px 0;color:#475569;font-size:13px}.summary{display:flex;gap:12px;margin:20px 0}.summary div{border:1px solid #cbd5e1;border-radius:8px;padding:10px;min-width:120px;font-size:13px}.summary strong{display:block;color:#14532d;font-size:17px;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:11px}th,td{border-bottom:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f1f5f9;color:#14532d}.month td{background:#dcfce7;color:#14532d;font-size:13px;font-weight:bold;padding-top:10px;text-transform:capitalize}.month span{float:right;text-transform:none}tr{break-inside:avoid}</style></head><body><h1>Relatório de contas</h1><p>Período: ${escapeHtml(period)}</p><p>Emitido em: ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p>${filtersText ? `<p>Filtros: ${escapeHtml(filtersText)}</p>` : ""}<section class="summary"><div>Contas<strong>${rows.length}</strong></div><div>Pagas<strong>${formatCurrency(paid)}</strong></div><div>Em aberto<strong>${formatCurrency(open)}</strong></div></section><table><thead><tr><th>Vencimento</th><th>Conta</th><th>Categoria</th><th>Pagamento</th><th>Situação</th><th>Valor</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`
}
