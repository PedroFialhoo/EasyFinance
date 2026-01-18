import { api } from "@/services/api";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
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
        <div className="bg-slate-200 rounded-xl w-[30%] p-6">
            <div className="flex justify-between">
                <h1 className="font-bold text-4xl text-green-800 flex items-center gap-3">
                    Receita <TrendingUp size={45}/>
                </h1>   
                {
                    show
                    ? (<Eye className="text-green-800 hover:text-green-950" size={35} onClick={() => setShow(!show)}/>)
                    : (<EyeOff className="text-green-800 hover:text-green-950" size={35} onClick={() => setShow(!show)}/>)
                }
            </div>            
            <div className="mt-4">
                <p className="text-lg text-slate-700">Total (fixo)</p>
                <span className="text-2xl font-bold text-green-900">
                R$ { show ? `${(revenue ?? 0).toFixed(2)}` : "✱✱✱✱✱"}
                </span>
            </div>
            <div className="mt-4">
                <p className="text-lg text-slate-700">Gastos</p>
                <span className="text-2xl font-bold text-red-700">
                R$ { show ? `${(expenses ?? 0).toFixed(2)}` : "✱✱✱✱✱"}
                </span>
            </div>   
            <div className="mt-4">
                <p className="text-lg text-slate-700">Mês atual</p>
                <span className={`text-2xl font-bold ${monthRevenue > 0 ? "text-green-900" : "text-red-700"}`}>
                R$ { show ? `${(monthRevenue ?? 0).toFixed(2)}` : "✱✱✱✱✱"}
                </span>
            </div>        
        </div>
    )
}