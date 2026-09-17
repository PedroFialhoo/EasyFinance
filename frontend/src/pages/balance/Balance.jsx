import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/utils"
import { api } from "@/services/api"
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Pencil, Plus, WalletCards } from "lucide-react"
import { useEffect, useState } from "react"
import Feedback from "@/components/Feedback"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

const entryLabels = {
  INITIAL_BALANCE: "Saldo inicial",
  MONTHLY_REVENUE: "Receita mensal",
  BILL_PAYMENT: "Pagamento de conta",
  BILL_PAYMENT_REVERSAL: "Estorno de pagamento",
  MANUAL_ADJUSTMENT: "Ajuste manual",
}

export default function Balance() {
  const [data, setData] = useState({ initialized: false, balance: 0, entries: [] })
  const [initialBalance, setInitialBalance] = useState("")
  const [adjustedBalance, setAdjustedBalance] = useState("")
  const [amountToAdd, setAmountToAdd] = useState("")
  const [monthlyRevenue, setMonthlyRevenue] = useState("")
  const [paymentDay, setPaymentDay] = useState("")
  const [description, setDescription] = useState("")
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editingRevenue, setEditingRevenue] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pendingAdjustment, setPendingAdjustment] = useState(null)

  const loadBalance = () => {
    setLoading(true)
    api.get("/balance")
      .then(response => setData(response.data))
      .catch(() => {
        setMessage("Não foi possível carregar o saldo")
        setError(true)
      }).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBalance()
    window.addEventListener("balance-updated", loadBalance)
    return () => window.removeEventListener("balance-updated", loadBalance)
  }, [])

  const submitInitialBalance = async (event) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const response = await api.post("/balance/initialize", { balance: parseCurrencyInput(initialBalance), description })
      setData(response.data)
      setDescription("")
      setMessage("Saldo inicial salvo")
      setError(false)
    } catch (requestError) {
      setMessage(requestError.response?.data || "Não foi possível salvar o saldo")
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const submitAdjustment = async (event) => {
    event.preventDefault()
    if (!adjustedBalance) return
    setPendingAdjustment("adjustment")
  }

  const saveAdjustment = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const response = await api.put("/balance/adjust", { balance: parseCurrencyInput(adjustedBalance), description })
      setData(response.data)
      setDescription("")
      setEditing(false)
      setMessage("Ajuste manual registrado no histórico")
      setError(false)
    } catch (requestError) {
      setMessage(requestError.response?.data || "Não foi possível ajustar o saldo")
      setError(true)
    } finally {
      setSubmitting(false)
      setPendingAdjustment(null)
    }
  }

  const submitAddition = async (event) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const response = await api.post("/balance/add", { amount: parseCurrencyInput(amountToAdd), description })
      setData(response.data)
      setAmountToAdd("")
      setDescription("")
      setAdding(false)
      setMessage("Valor adicionado ao saldo")
      setError(false)
    } catch (requestError) {
      setMessage(requestError.response?.data || "Não foi possível adicionar o valor")
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const saveRevenue = async (event) => {
    event.preventDefault()
    const day = Number(paymentDay)
    if (submitting || monthlyRevenue === "" || !Number.isInteger(day) || day < 1 || day > 31) return
    setSubmitting(true)
    try {
      const response = await api.put("/balance/revenue", { revenue: parseCurrencyInput(monthlyRevenue), paymentDay: day })
      setData(response.data)
      setEditingRevenue(false)
      setMessage("Receita mensal atualizada")
      setError(false)
      window.dispatchEvent(new Event("balance-updated"))
    } catch (requestError) {
      setMessage(requestError.response?.data || "Não foi possível atualizar a receita")
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (!data.initialized) {
    return (
      <main className="app-page">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-green-100"><WalletCards className="text-green-800" /></div>
          <h1 className="mt-5 text-2xl font-semibold text-green-900">Configure seu saldo</h1>
          <p className="mt-2 text-sm text-slate-600">Informe o valor disponível hoje na sua conta. A partir dele, receitas e pagamentos serão registrados automaticamente.</p>
          <form className="mt-6 space-y-4" onSubmit={submitInitialBalance}>
            <label htmlFor="initial-balance" className="text-sm font-medium text-green-800">Saldo atual *</label><Input id="initial-balance" value={initialBalance} required type="text" inputMode="decimal" placeholder="Saldo atual" onChange={(event) => setInitialBalance(formatCurrencyInput(event.target.value))} />
            <label htmlFor="initial-description" className="text-sm font-medium text-green-800">Observação</label><Input id="initial-description" value={description} type="text" maxLength="120" placeholder="Observação opcional" onChange={(event) => setDescription(event.target.value)} />
            <Button type="submit" disabled={initialBalance === "" || submitting}>{submitting ? "Salvando..." : "Salvar saldo inicial"}</Button>
          </form>
          <Feedback message={message} error={error} />
        </section>
      </main>
    )
  }

  return (
    <main className="app-page space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-green-900 p-6 text-white shadow-sm lg:p-8">
        <CircleDollarSign className="absolute -right-5 -top-5 size-36 text-white/10" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm font-medium uppercase tracking-[0.18em] text-green-200">Saldo disponível</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{formatCurrency(data.balance)}</h1><p className="mt-2 text-sm text-green-100">Atualizado com receitas e contas efetivamente pagas.</p></div>
          <div className="flex flex-wrap gap-2"><Button type="button" className="bg-white text-green-900 hover:bg-green-50" onClick={() => { setAmountToAdd(""); setDescription(""); setAdding(true); setEditing(false) }}><Plus />Adicionar valor</Button><Button type="button" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={() => { setAdjustedBalance(formatCurrency(data.balance)); setDescription(""); setEditing(true); setAdding(false) }}><Pencil />Ajustar saldo</Button></div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-green-900">Receita mensal</h2><p className="mt-1 text-sm text-slate-600">O valor integral será adicionado ao saldo no dia de pagamento.</p></div><Button type="button" variant="outline" onClick={() => { setMonthlyRevenue(data.monthlyRevenue == null ? "" : formatCurrency(data.monthlyRevenue)); setPaymentDay(data.revenuePaymentDay == null ? "" : String(data.revenuePaymentDay)); setEditingRevenue(!editingRevenue) }}>{editingRevenue ? "Cancelar" : data.monthlyRevenue == null ? "Configurar" : "Editar"}</Button></div>
        {!editingRevenue && data.monthlyRevenue != null && <p className="mt-4 text-sm text-slate-700"><span className="font-semibold text-green-800">{formatCurrency(data.monthlyRevenue)}</span> todo dia <span className="font-semibold text-green-800">{data.revenuePaymentDay}</span>.</p>}
        {!editingRevenue && data.monthlyRevenue == null && <p className="mt-4 text-sm text-slate-500">Nenhuma receita mensal configurada.</p>}
        {editingRevenue && <form className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]" onSubmit={saveRevenue}><div><label htmlFor="monthly-revenue" className="text-sm font-medium text-green-800">Valor mensal *</label><Input id="monthly-revenue" value={monthlyRevenue} required inputMode="decimal" placeholder="0,00" onChange={event => setMonthlyRevenue(formatCurrencyInput(event.target.value))} /></div><div><label htmlFor="payment-day" className="text-sm font-medium text-green-800">Dia do pagamento *</label><Input id="payment-day" value={paymentDay} required type="number" min="1" max="31" onChange={event => setPaymentDay(event.target.value)} /></div><Button type="submit" className="self-end" disabled={monthlyRevenue === "" || !paymentDay || submitting}>{submitting ? "Salvando..." : "Salvar receita"}</Button></form>}
      </section>

      {editing && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-green-900">Ajustar saldo</h2><p className="mt-1 text-sm text-slate-600">O valor informado será o novo saldo final e a diferença ficará registrada no histórico.</p><form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submitAdjustment}><label htmlFor="adjusted-balance" className="sr-only">Novo saldo *</label><Input id="adjusted-balance" value={adjustedBalance} required type="text" inputMode="decimal" onChange={(event) => setAdjustedBalance(formatCurrencyInput(event.target.value))} /><label htmlFor="adjustment-description" className="sr-only">Motivo</label><Input id="adjustment-description" value={description} maxLength="120" placeholder="Motivo opcional" onChange={(event) => setDescription(event.target.value)} /><Button type="submit">Salvar ajuste</Button><Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button></form></section>}

      {adding && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-green-900">Adicionar valor</h2><p className="mt-1 text-sm text-slate-600">Registre uma entrada como sobra de salário, venda, serviço extra ou outro recebimento.</p><form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submitAddition}><label htmlFor="addition-amount" className="sr-only">Valor a adicionar *</label><Input id="addition-amount" value={amountToAdd} required type="text" inputMode="decimal" placeholder="Valor a adicionar" onChange={(event) => setAmountToAdd(formatCurrencyInput(event.target.value))} /><label htmlFor="addition-description" className="sr-only">Origem ou observação</label><Input id="addition-description" value={description} maxLength="120" placeholder="Origem ou observação" onChange={(event) => setDescription(event.target.value)} /><Button type="submit" disabled={!amountToAdd || submitting}>{submitting ? "Adicionando..." : "Adicionar"}</Button><Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancelar</Button></form></section>}

      <Feedback message={message} error={error} />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-green-900">Histórico do saldo</h2></div><div className="divide-y divide-slate-100">{loading ? <p className="px-5 py-10 text-center text-sm text-slate-500">Carregando histórico...</p> : error && !data.entries.length ? <div className="px-5 py-10 text-center text-sm text-red-700">Não foi possível carregar o saldo.<Button variant="link" onClick={loadBalance}>Tentar novamente</Button></div> : data.entries.length === 0 ? <p className="px-5 py-10 text-center text-sm text-slate-500">Nenhuma movimentação registrada.</p> : data.entries.map(entry => <div key={entry.id} className="flex items-center gap-3 px-5 py-4"><div className={entry.amount >= 0 ? "rounded-lg bg-green-100 p-2 text-green-800" : "rounded-lg bg-red-50 p-2 text-red-700"}>{entry.amount >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-800">{entry.description || entryLabels[entry.type]}</p><p className="text-xs text-slate-500">{new Date(`${entry.entryDate}T00:00:00`).toLocaleDateString("pt-BR")} · {entryLabels[entry.type]}</p></div><div className="text-right"><p className={entry.amount >= 0 ? "text-sm font-semibold text-green-700" : "text-sm font-semibold text-red-700"}>{entry.amount >= 0 ? "+" : ""}{formatCurrency(entry.amount)}</p><p className="text-xs text-slate-500">Saldo: {formatCurrency(entry.balanceAfter)}</p></div></div>)}</div></section>
      <AlertDialog open={pendingAdjustment === "adjustment"} onOpenChange={open => !open && setPendingAdjustment(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar ajuste de saldo?</AlertDialogTitle><AlertDialogDescription>Esta alteração financeira será registrada no histórico.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={saveAdjustment} disabled={submitting}>{submitting ? "Salvando..." : "Confirmar ajuste"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </main>
  )
}
