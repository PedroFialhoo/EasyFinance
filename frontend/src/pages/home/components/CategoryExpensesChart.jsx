import { formatCurrency } from "@/lib/utils";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#166534", "#4d7c0f", "#64748b", "#94a3b8", "#86efac", "#365314"];

export default function CategoryExpensesChart({ data, isLoading }) {
    const hasData = data.length > 0;

    return (
        <article className="min-h-[360px] rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm lg:p-6">
            <div>
                <p className="text-sm font-medium text-green-700">Mês atual</p>
                <h2 className="mt-1 text-xl font-semibold text-green-900">Gastos por categoria</h2>
                <p className="mt-1 text-sm text-slate-500">Entenda para onde seu dinheiro está indo.</p>
            </div>

            {isLoading ? (
                <div className="mt-10 h-56 animate-pulse rounded-xl bg-slate-200" />
            ) : hasData ? (
                <>
                <div className="mt-6 h-56" aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="category" cx="50%" cy="45%" innerRadius={52} outerRadius={82} paddingAngle={3}>
                                {data.map((entry, index) => (
                                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                            <Legend verticalAlign="bottom" iconType="circle" iconSize={8} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                </>
            ) : (
                <div className="mt-10 flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-8 text-center text-sm text-slate-500">
                    Cadastre contas com vencimento neste mês para visualizar a distribuição por categoria.
                </div>
            )}
        </article>
    );
}
