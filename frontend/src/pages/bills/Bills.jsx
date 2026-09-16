import { Button } from "@/components/ui/button"
import { ChartColumnStacked, Edit } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import MyBills from "./components/MyBills"
import { useState } from "react"
import CreateBill from "./components/CreateBill"
import EditBill from "./components/EditBill"

export default function Bills(){
    const navigate = useNavigate()
    const location = useLocation()
    const [isActiveAdd, setIsActiveAdd] = useState(false)
    const [isActiveEdit, setIsActiveEdit] = useState(false);
    const [reload, setReload] = useState(false);
    const [bill, setBill] = useState(null);
    const refreshCards = () => setReload((prev) => !prev);
    const categoriesOpen = location.pathname === "/app/bills/categories";
    return(
        <main className="app-page flex flex-col gap-5 lg:gap-7">
            <div className="flex justify-end">
                <Button
                type="button"
                variant="outline"
                onClick={() => navigate(categoriesOpen ? '/app/bills' : '/app/bills/categories')}
                >
                <ChartColumnStacked />
                {categoriesOpen ? 'Fechar categorias' : 'Categorias'}
                </Button>
            </div>
            <Outlet />

            <MyBills
                key={location.search}
                onAdd={() => setIsActiveAdd(true)}
                onEdit={() => setIsActiveEdit(true)}
                reload={reload}
                setBill={setBill}
                targetBillId={Number(new URLSearchParams(location.search).get("billId")) || null}
                targetMonth={Number(new URLSearchParams(location.search).get("month")) || null}
                targetYear={Number(new URLSearchParams(location.search).get("year")) || null}
            />

            {isActiveAdd && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <CreateBill
                    onClose={() => setIsActiveAdd(false)}
                    onCreated={refreshCards}
                  />
                </div>
              </div>
            )}

            {isActiveEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <EditBill
                    bill={bill}
                    onClose={() => setIsActiveEdit(false)}
                    onCreated={refreshCards}
                  />
                </div>
              </div>
            )}
        </main>
    )
}
