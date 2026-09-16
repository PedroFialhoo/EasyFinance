import { formatCurrency } from "@/lib/utils";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function formatMonth(month) {
    return new Intl.DateTimeFormat("pt-BR", { month: "short" })
        .format(new Date(`${month}-01T12:00:00`))
        .replace(".", "");
}

export default function MonthlyOverviewChart({ data, isLoading }) {
    return (
        <article className="min-h-[360px] rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm lg:p-6">
            <div>
                <p className="text-sm font-medium text-green-700">Últimos 6 meses</p>
                <h2 className="mt-1 text-xl font-semibold text-green-900">Receita e gastos</h2>
                <p className="mt-1 text-sm text-slate-500">Compare sua renda mensal com as contas previstas.</p>
            </div>

            {isLoading ? (
                <div className="mt-10 h-56 animate-pulse rounded-xl bg-slate-200" />
            ) : (
                <>
                <div className="mt-6 h-56" aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickFormatter={formatMonth} tickLine={false} axisLine={false} tick={{ fill: "#788291", fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => `R$ ${value}`} tickLine={false} axisLine={false} tick={{ fill: "#788291", fontSize: 12 }} width={62} />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={formatMonth}
                                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                            />
                            <Legend iconType="circle" iconSize={8} />
                            <Bar dataKey="expenses" name="Gastos" fill="#788291" radius={[5, 5, 0, 0]} />
                            <Line dataKey="revenue" name="Receita" type="monotone" stroke="#166534" strokeWidth={3} dot={{ fill: "#166534", r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                </>
            )}
        </article>
    );
}
