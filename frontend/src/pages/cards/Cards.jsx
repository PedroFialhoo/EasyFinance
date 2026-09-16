import { useState } from "react";
import CreateCard from "./components/CreateCard";
import MyCards from "./components/MyCards";
import EditCard from "./components/EditCard";
import { Button } from "@/components/ui/button";
import { Landmark, User } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function Cards() {
  const [isActiveAdd, setIsActiveAdd] = useState(false);
  const [isActiveEdit, setIsActiveEdit] = useState(false);
  const [reload, setReload] = useState(false);
  const [card, setCard] = useState(null);
  const refreshCards = () => setReload((prev) => !prev);
  const navigate = useNavigate()
  const location = useLocation()
  const bankHolderOpen = location.pathname === "/app/cards/banks-holders";

  return (
    <main className="app-page flex flex-col gap-5 lg:gap-7">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(bankHolderOpen ? '/app/cards' : '/app/cards/banks-holders')}
        >
          <Landmark />
          <User />
          {bankHolderOpen ? 'Fechar bancos e titulares' : 'Bancos e titulares'}
        </Button>
      </div>
      <Outlet />

      <MyCards
        onAdd={() => setIsActiveAdd(true)}
        onEdit={() => setIsActiveEdit(true)}
        reload={reload}
        setCard={setCard}
      />

      {isActiveAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <CreateCard
              onClose={() => setIsActiveAdd(false)}
              onCreated={refreshCards}
            />
          </div>
        </div>
      )}

      {isActiveEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <EditCard
              onClose={() => setIsActiveEdit(false)}
              onCreated={refreshCards}
              card={card}
            />
          </div>
        </div>
      )}
    </main>
  );
}
