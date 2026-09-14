import { api } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";

export default function Revenue(){
    const [expenses, setExpenses] = useState(0)
    const [revenue, setRevenue] = useState(0)
    const [show, setShow] = useState(false)
    const monthRevenue = revenue - expenses
    useEffect(() => {
        api.get("/user/revenue")
            .then(response => {
                setExpenses(response.data.expenses)
                setRevenue(response.data.revenue)
            })
            .catch(err => console.log("Erro:", err));
    }, []);
    return(
        <section className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-5 text-slate-800 shadow-sm lg:p-7">
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
                    className="rounded-lg bg-white p-2.5 text-green-800 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-green-50"
                    title={show ? "Ocultar valores" : "Exibir valores"}
                >
                    {show ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                </button>
            </div>

            <div className="relative mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-green-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Receita mensal</p>
                        <ArrowUpRight className="size-4 text-green-700" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-green-900">
                        {show ? formatCurrency(revenue) : "R$ •••••"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Valor informado no perfil</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Gastos do mês</p>
                        <ArrowDownRight className="size-4 text-slate-500" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">
                        {show ? formatCurrency(expenses) : "R$ •••••"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Contas previstas neste mês</p>
                </div>

                <div className="rounded-xl border border-green-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Saldo projetado</p>
                        <WalletCards className="size-4 text-green-700" />
                    </div>
                    <p className={`mt-3 text-2xl font-semibold tracking-tight ${monthRevenue >= 0 ? "text-green-900" : "text-red-700"}`}>
                        {show ? formatCurrency(monthRevenue) : "R$ •••••"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Receita menos gastos</p>
                </div>
            </div>
        </section>
    )
}
