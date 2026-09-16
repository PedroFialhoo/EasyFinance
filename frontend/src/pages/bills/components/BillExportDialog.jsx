import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { api } from "@/services/api"
import BillPdfPreview from "./BillPdfPreview"
import { reportPeriod } from "./billReport"

const paymentLabels = {
  PENDING: "Não definida",
  PIX: "PIX",
  MONEY: "Dinheiro",
  CARNE: "Carnê",
  CREDIT: "Cartão de crédito",
  DEBIT: "Cartão de débito",
}

function rowsFromBills(bills, filters) {
  return bills.flatMap(bill => (bill.billInstallments || []).map(installment => ({
    name: bill.name,
    category: bill.category?.name || "Sem categoria",
    payment: bill.typePayment,
    dueDate: installment.dueDate,
    value: installment.value,
    paid: Boolean(installment.paymentDate),
  }))).filter(row =>
    row.name.toLowerCase().includes(filters.name.toLowerCase())
    && (filters.status === "all" || (filters.status === "paid" ? row.paid : !row.paid))
    && (filters.payment === "all" || row.payment === filters.payment),
  ).sort((first, second) => first.dueDate.localeCompare(second.dueDate))
}

export default function BillExportDialog({ open, onOpenChange, categories, initialMonth, initialFilters }) {
  const [periodType, setPeriodType] = useState("month")
  const [month, setMonth] = useState(initialMonth)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [filters, setFilters] = useState({ name: "", category: "all", status: "all", payment: "all", categoryName: "" })
  const [rows, setRows] = useState([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setMonth(initialMonth)
    setFilters({ ...initialFilters, categoryName: categories.find(category => category.id.toString() === initialFilters.category)?.name || "" })
    setRows([])
    setMessage("")
  }, [open, initialMonth, initialFilters, categories])

  const setFilter = (key, value) => setFilters(current => ({ ...current, [key]: value, categoryName: key === "category" ? categories.find(category => category.id.toString() === value)?.name || "" : current.categoryName }))

  const preview = async () => {
    const [year, monthNumber] = month.split("-").map(Number)
    const [startYear, startMonthNumber] = startDate.split("-").map(Number)
    const [endYear, endMonthNumber] = endDate.split("-").map(Number)
    const rangeStart = periodType === "month" && year && monthNumber ? `${month}-01` : startYear && startMonthNumber ? `${startDate}-01` : ""
    const rangeEnd = periodType === "month" && year && monthNumber ? new Date(year, monthNumber, 0).toISOString().slice(0, 10) : endYear && endMonthNumber ? new Date(endYear, endMonthNumber, 0).toISOString().slice(0, 10) : ""
    if (!rangeStart || !rangeEnd || endDate < startDate) {
      setMessage("Informe um período válido para exportar.")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const response = await api.post("/bill/get/byDateRange", { startDate: rangeStart, endDate: rangeEnd, categoryId: filters.category === "all" ? undefined : Number(filters.category) })
      const result = rowsFromBills(response.data, filters)
      setRows(result)
      if (result.length === 0) {
        setMessage("Nenhuma conta corresponde aos filtros selecionados.")
        return
      }
      onOpenChange(false)
      setPreviewOpen(true)
    } catch (error) {
      setMessage(error.response?.data || "Não foi possível gerar a prévia do relatório.")
    } finally {
      setLoading(false)
    }
  }

  const closePreview = (nextOpen) => {
    setPreviewOpen(nextOpen)
    if (!nextOpen) onOpenChange(true)
  }

  return <><AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto"><AlertDialogHeader><AlertDialogTitle>Exportar contas em PDF</AlertDialogTitle></AlertDialogHeader><div className="grid gap-4"><div className="space-y-2"><label htmlFor="export-period-type" className="text-sm font-medium text-green-800">Período</label><Select value={periodType} onValueChange={setPeriodType}><SelectTrigger id="export-period-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="month">Um mês</SelectItem><SelectItem value="range">Intervalo de meses</SelectItem></SelectContent></Select></div>{periodType === "month" ? <div className="space-y-2"><label htmlFor="export-month" className="text-sm font-medium text-green-800">Mês *</label><Input id="export-month" type="month" value={month} onChange={event => setMonth(event.target.value)} /></div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="export-start" className="text-sm font-medium text-green-800">Mês inicial *</label><Input id="export-start" type="month" value={startDate} onChange={event => setStartDate(event.target.value)} /></div><div className="space-y-2"><label htmlFor="export-end" className="text-sm font-medium text-green-800">Mês final *</label><Input id="export-end" type="month" min={startDate || undefined} value={endDate} onChange={event => setEndDate(event.target.value)} /></div></div>}<div className="border-t pt-4"><p className="mb-3 text-sm font-semibold text-green-900">Filtros</p><div className="grid gap-3 sm:grid-cols-2"><Input value={filters.name} placeholder="Buscar por nome" onChange={event => setFilter("name", event.target.value)} /><Select value={filters.category} onValueChange={value => setFilter("category", value)}><SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas as categorias</SelectItem>{categories.map(category => <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>)}</SelectContent></Select><Select value={filters.status} onValueChange={value => setFilter("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as situações</SelectItem><SelectItem value="open">Em aberto</SelectItem><SelectItem value="paid">Pagas</SelectItem></SelectContent></Select><Select value={filters.payment} onValueChange={value => setFilter("payment", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as formas</SelectItem>{Object.entries(paymentLabels).filter(([value]) => value !== "PENDING").map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></div>{message && <p role="alert" className="text-sm text-red-700">{message}</p>}</div><AlertDialogFooter><AlertDialogCancel>Fechar</AlertDialogCancel><Button type="button" disabled={loading} onClick={preview}>{loading ? "Carregando..." : "Visualizar prévia"}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog><BillPdfPreview open={previewOpen} onOpenChange={closePreview} rows={rows} period={reportPeriod(month, startDate, endDate, periodType)} filters={filters} groupByMonth={periodType === "range"} defaultName={`contas-${periodType === "month" ? month : `${startDate}-a-${endDate}`}.pdf`} /></>
}
