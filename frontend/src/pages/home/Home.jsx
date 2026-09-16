import { useEffect, useState } from "react";
import { api } from "@/services/api";
import Revenue from "./components/Revenue";
import MonthlyOverviewChart from "./components/MonthlyOverviewChart";
import CategoryExpensesChart from "./components/CategoryExpensesChart";
import { Button } from "@/components/ui/button";

export default function Home(){
    const [dashboard, setDashboard] = useState({ monthlySummary: [], expensesByCategory: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = () => {
        setIsLoading(true);
        setError("");
        api.get("/user/dashboard")
            .then((response) => {
                setDashboard(response.data);
                setError("");
            })
            .catch(() => {
                setDashboard({ monthlySummary: [], expensesByCategory: [] });
                setError("Não foi possível carregar os dados do painel.");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        api.get("/user/dashboard")
            .then((response) => {
                setDashboard(response.data);
                setError("");
            })
            .catch(() => {
                setDashboard({ monthlySummary: [], expensesByCategory: [] });
                setError("Não foi possível carregar os dados do painel.");
            })
            .finally(() => setIsLoading(false));
    }, []);

    return(
        <main className="app-page space-y-6">
            <Revenue />
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} <Button type="button" variant="outline" size="sm" className="ml-2" onClick={loadDashboard}>Tentar novamente</Button></div>}
            <section className="grid gap-6 xl:grid-cols-2">
                <MonthlyOverviewChart data={dashboard.monthlySummary} isLoading={isLoading} />
                <CategoryExpensesChart data={dashboard.expensesByCategory} isLoading={isLoading} />
            </section>
        </main>
    )
}
