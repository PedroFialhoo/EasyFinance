import { api } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Revenue(){
    const [expenses, setExpenses] = useState(0)
    const [revenue, setRevenue] = useState(0)
    const [balance, setBalance] = useState(null)
    const [show, setShow] = useState(false)
    const [loadError, setLoadError] = useState(false)
    const navigate = useNavigate()
    const monthRevenue = revenue - expenses
    useEffect(() => {
        api.get("/user/revenue")
            .then(response => {
                setExpenses(response.data.expenses)
                setRevenue(response.data.revenue)
            })
            .catch(() => setLoadError(true));
        api.get("/balance")
            .then(response => setBalance(response.data.initialized ? response.data.balance : null))
            .catch(() => { setBalance(null); setLoadError(true) })
    }, []);
    return(
        <section className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-5 text-slate-800 shadow-sm lg:p-6">
            <div className="absolute -bottom-24 left-1/3 size-52 rounded-full bg-slate-200/50 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-green-100 p-3">
                        <WalletCards className="size-6 text-green-800" />
                    </div>
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-green-700">Visão mensal</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-green-900">Seu financeiro</h1>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Ocultar valores financeiros" : "Exibir valores financeiros"}
                    aria-pressed={show}
                    className="rounded-lg bg-white p-2.5 text-green-800 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-green-50"
                    title={show ? "Ocultar valores" : "Exibir valores"}
                >
                    {show ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                </button>
            </div>

            <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-green-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Receita mensal</p>
                        <ArrowUpRight className="size-4 text-green-700" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-green-900">
                        {loadError ? "Indisponível" : show ? formatCurrency(revenue) : "R$ •••••"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Valor informado no perfil</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Gastos do mês</p>
                        <ArrowDownRight className="size-4 text-slate-500" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                        {loadError ? "Indisponível" : show ? formatCurrency(expenses) : "R$ •••••"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Contas previstas neste mês</p>
                </div>

                <div className="rounded-xl border border-green-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Saldo projetado</p>
                        <WalletCards className="size-4 text-green-700" />
                    </div>
                    <p className={`mt-3 text-2xl font-semibold tracking-tight ${monthRevenue >= 0 ? "text-green-900" : "text-red-700"}`}>
                        {loadError ? "Indisponível" : show ? formatCurrency(monthRevenue) : "R$ •••••"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Receita menos gastos</p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Saldo disponível</p>
                        <WalletCards className="size-4 text-emerald-700" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-emerald-900">
                        {balance === null ? <button type="button" onClick={() => navigate("/app/balance")} className="text-base underline underline-offset-4">Configurar</button> : show ? formatCurrency(balance) : "R$ •••••"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Valor real informado e atualizado</p>
                </div>
            </div>
            {loadError && <p className="relative mt-4 text-sm text-red-700">Não foi possível atualizar todos os dados financeiros agora.</p>}
        </section>
    )
}
