import { useEffect, useState } from "react";
import { api } from "@/services/api";
import Revenue from "./components/Revenue";
import MonthlyOverviewChart from "./components/MonthlyOverviewChart";
import CategoryExpensesChart from "./components/CategoryExpensesChart";

export default function Home(){
    const [dashboard, setDashboard] = useState({ monthlySummary: [], expensesByCategory: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get("/user/dashboard")
            .then((response) => setDashboard(response.data))
            .catch(() => setDashboard({ monthlySummary: [], expensesByCategory: [] }))
            .finally(() => setIsLoading(false));
    }, []);

    return(
        <main className="space-y-6 p-4 lg:p-8">
            <Revenue />
            <section className="grid max-w-5xl gap-6 xl:grid-cols-2">
                <MonthlyOverviewChart data={dashboard.monthlySummary} isLoading={isLoading} />
                <CategoryExpensesChart data={dashboard.expensesByCategory} isLoading={isLoading} />
            </section>
        </main>
    )
}
