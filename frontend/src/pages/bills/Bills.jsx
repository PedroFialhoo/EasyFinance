import { Button } from "@/components/ui/button"
import { ChartColumnStacked, Edit } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom"
import MyBills from "./components/MyBills"
import { useState } from "react"
import CreateBill from "./components/CreateBill"
import EditBill from "./components/EditBill"

export default function Bills(){
    const navigate = useNavigate()
    const [isActiveAdd, setIsActiveAdd] = useState(false)
    const [isActiveEdit, setIsActiveEdit] = useState(false);
    const [reload, setReload] = useState(false);
    const [bill, setBill] = useState(null);
    const refreshCards = () => setReload((prev) => !prev);
    return(
        <div className="flex flex-col gap-5 p-4 lg:gap-7 lg:p-8">
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

            <MyBills 
                onAdd={() => setIsActiveAdd(true)}
                onEdit={() => setIsActiveEdit(true)}
                reload={reload}
                setBill={setBill}
            />

            {isActiveAdd && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                  <CreateBill
                    onClose={() => setIsActiveAdd(false)}
                    onCreated={refreshCards}
                  />
                </div>
              </div>
            )}

            {isActiveEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                  <EditBill
                    bill={bill}
                    onClose={() => setIsActiveEdit(false)}
                    onCreated={refreshCards}
                  />
                </div>
              </div>
            )}
        </div>
    )
}
