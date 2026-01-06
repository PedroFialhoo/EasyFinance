import { Button } from "@/components/ui/button"
import { ChartColumnStacked } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom"

export default function Bills(){
    const navigate = useNavigate()
    return(
        <div className="p-8 flex flex-col gap-7">
            <div>
                <Button
                type="button"
                className="bg-green-800 self-start text-lg font-normal hover:bg-green-900 hover:shadow-2xl"
                onClick={() => navigate('/app/bills/categories')}
                >
                <ChartColumnStacked />
                Categorias
                </Button>
            </div>
            <Outlet />
        </div>
    )
}