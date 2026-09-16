import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import BillCard from "./BillCard";
import BillExportDialog from "./BillExportDialog";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronDown, ChevronUp, FileDown, ReceiptText, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MyBills({ onAdd, reload, onEdit, setBill, targetBillId, targetMonth, targetYear }){
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [bills, setBills] = useState([])
  const [name, setName] = useState("")
  const [billsLoading, setBillsLoading] = useState(true)
  const [billsError, setBillsError] = useState("")
  const [categoriesError, setCategoriesError] = useState("")
  const [exportOpen, setExportOpen] = useState(false)

  const [currentDate, setCurrentDate] = useState(() => {
    if (targetMonth && targetYear) return { month: targetMonth - 1, year: targetYear }
    const now = new Date()
    return { month: now.getMonth(), year: now.getFullYear() }
  })

  const prevMonth = () => {
    setCurrentDate((prev) =>
      prev.month === 0
        ? { month: 11, year: prev.year - 1 }
        : { ...prev, month: prev.month - 1 }
    )
  }

  const nextMonth = () => {
    setCurrentDate((prev) =>
      prev.month === 11
        ? { month: 0, year: prev.year + 1 }
        : { ...prev, month: prev.month + 1 }
    )
  }

  const selectedMonth = `${currentDate.year}-${String(currentDate.month + 1).padStart(2, "0")}`

  const changeMonth = (event) => {
    const [year, month] = event.target.value.split("-").map(Number)
    if (year && month) setCurrentDate({ year, month: month - 1 })
  }

  const filteredBills = bills.filter(bill => {
    const installment = bill.billInstallments?.[0]
    const isPaid = Boolean(installment?.paymentDate)
    return bill.name.toLowerCase().includes(name.toLowerCase())
      && (selectedStatus === "all" || (selectedStatus === "paid" ? isPaid : !isPaid))
      && (selectedPaymentMethod === "all" || bill.typePayment === selectedPaymentMethod)
  })

  const activeFilters = [name, selectedCategory !== "all" && selectedCategory, selectedStatus !== "all" && selectedStatus, selectedPaymentMethod !== "all" && selectedPaymentMethod].filter(Boolean).length

  const clearFilters = () => {
    setName("")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSelectedPaymentMethod("all")
  }

  const loadBills = () => {
    setBillsLoading(true)
    setBillsError("")
    api
      .post("/bill/get/byMonth", {        
          month: currentDate.month + 1,
          year: currentDate.year,
          categoryId:
            selectedCategory && selectedCategory !== "all"
              ? Number(selectedCategory)
              : undefined
      })
      .then((res) => {
        setBills(res.data)
        setBillsError("")
      })
      .catch(() => {
        setBills([])
        setBillsError("Não foi possível carregar as contas deste mês.")
      })
      .finally(() => setBillsLoading(false))
  }

  const loadCategories = () => {
    setCategoriesError("")
    api.get("/category/getAll")
      .then((response) => setCategories(response.data))
      .catch(() => setCategoriesError("Não foi possível carregar as categorias."))
  }

  useEffect(() => {
    api.post("/bill/get/byMonth", {
      month: currentDate.month + 1,
      year: currentDate.year,
      categoryId: selectedCategory && selectedCategory !== "all" ? Number(selectedCategory) : undefined,
    })
      .then((res) => {
        setBills(res.data)
        setBillsError("")
      })
      .catch(() => {
        setBills([])
        setBillsError("Não foi possível carregar as contas deste mês.")
      })
      .finally(() => setBillsLoading(false))
  }, [currentDate, selectedCategory, reload])

  useEffect(() => {
    api
      .get("/category/getAll")
      .then((response) => setCategories(response.data))
      .catch(() => setCategoriesError("Não foi possível carregar as categorias."))
  }, [])

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-green-950/10 bg-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3 text-green-900">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/15"><ReceiptText className="size-6" /></span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Minhas Contas</h1>
            <p className="mt-0.5 text-sm text-green-700">Acompanhe e organize seus vencimentos.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setExportOpen(true)}><FileDown />Exportar PDF</Button><Button className="bg-green-900 text-base font-semibold text-white hover:bg-green-800" onClick={onAdd}>Adicionar conta</Button></div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Período selecionado</p>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-green-900 shadow-sm">
            <button type="button" aria-label="Mês anterior" onClick={prevMonth} className="rounded-lg p-2 transition-colors hover:bg-green-100"><ArrowLeft className="size-5" /></button>
            <label className="relative flex items-center">
              <CalendarDays className="pointer-events-none absolute left-3 size-4 text-green-800" />
              <Input aria-label="Selecionar mês" type="month" value={selectedMonth} onChange={changeMonth} className="h-9 w-50 border-0 bg-transparent pl-9 text-sm font-medium text-green-900 shadow-none" />
            </label>
            <button type="button" aria-label="Próximo mês" onClick={nextMonth} className="rounded-lg p-2 transition-colors hover:bg-green-100"><ArrowRight className="size-5" /></button>
          </div>
        </div>
        <BillExportDialog open={exportOpen} onOpenChange={setExportOpen} categories={categories} initialMonth={selectedMonth} initialFilters={{ name, category: selectedCategory || "all", status: selectedStatus, payment: selectedPaymentMethod }} />
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" aria-expanded={filtersOpen} aria-controls="bill-filters" onClick={() => setFiltersOpen(open => !open)} className="flex items-center gap-2 text-sm font-semibold text-green-900 hover:text-green-700"><SlidersHorizontal className="size-4" />Filtrar contas {activeFilters > 0 && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">{activeFilters}</span>}{filtersOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</button>
            {activeFilters > 0 && <button type="button" onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-700"><X className="size-3.5" />Limpar filtros</button>}
          </div>
          {filtersOpen && <div id="bill-filters" className="mt-4 flex flex-wrap items-end gap-4">
            <div className="w-full flex-1 lg:max-w-xl">
              <label htmlFor="bill-search" className="mb-1.5 block text-sm font-medium text-slate-600">Buscar por nome</label>
              <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" /><Input id="bill-search" value={name} type="text" placeholder="Ex.: internet, mercado..." className="h-11 border-slate-300 bg-slate-50 pl-10 text-base!" onChange={(e) => setName(e.target.value)}/></div>
            </div>
            <div className="w-full sm:w-64">
              <label htmlFor="bill-category-filter" className="mb-1.5 block text-sm font-medium text-slate-600">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="bill-category-filter" className="h-11 w-full capitalize border-slate-300 bg-slate-50">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                      className="capitalize"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="bill-status-filter" className="mb-1.5 block text-sm font-medium text-slate-600">Situação</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="bill-status-filter" className="h-11 w-full border-slate-300 bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="open">Em aberto</SelectItem><SelectItem value="paid">Pagas</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-56">
              <label htmlFor="bill-payment-filter" className="mb-1.5 block text-sm font-medium text-slate-600">Forma de pagamento</label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger id="bill-payment-filter" className="h-11 w-full border-slate-300 bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="PIX">PIX</SelectItem><SelectItem value="MONEY">Dinheiro</SelectItem><SelectItem value="CARNE">Carnê</SelectItem><SelectItem value="CREDIT">Cartão de crédito</SelectItem><SelectItem value="DEBIT">Cartão de débito</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          }
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600"><strong className="text-green-900">{filteredBills.length}</strong> conta{filteredBills.length === 1 ? "" : "s"} encontrada{filteredBills.length === 1 ? "" : "s"}</p>
          {targetBillId && <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-900">Conta do lembrete destacada</span>}
        </div>
        <div className="flex flex-wrap gap-3">
          {billsError && <div role="alert" className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{billsError} <Button type="button" variant="outline" size="sm" className="ml-2" onClick={loadBills}>Tentar novamente</Button></div>}
          {categoriesError && <p role="alert" className="w-full text-sm text-amber-800">{categoriesError} <button type="button" className="font-semibold underline" onClick={loadCategories}>Tentar novamente</button></p>}
          {billsLoading && <p role="status" className="w-full py-8 text-center text-sm text-slate-600">Carregando contas...</p>}
          {!billsLoading && !billsError && filteredBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} onEdit={onEdit} setBill={setBill} isHighlighted={bill.id === targetBillId} />
          ))}
          {!billsLoading && !billsError && filteredBills.length === 0 && <div className="flex w-full flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><ReceiptText className="mb-3 size-9 text-slate-400" /><p className="font-medium text-slate-700">Nenhuma conta encontrada</p><p className="mt-1 text-sm text-slate-500">Altere os filtros ou adicione uma nova conta para este mês.</p></div>}
        </div>
      </div>
    </section>
  )
}
