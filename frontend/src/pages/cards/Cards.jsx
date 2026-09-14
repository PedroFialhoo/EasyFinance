import { useState } from "react";
import CreateCard from "./components/CreateCard";
import MyCards from "./components/MyCards";
import EditCard from "./components/EditCard";
import { Button } from "@/components/ui/button";
import { Landmark, User } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

export default function Cards() {
  const [isActiveAdd, setIsActiveAdd] = useState(false);
  const [isActiveEdit, setIsActiveEdit] = useState(false);
  const [reload, setReload] = useState(false);
  const [card, setCard] = useState(null);
  const refreshCards = () => setReload((prev) => !prev);
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-5 p-4 lg:gap-7 lg:p-8">
      <div>
        <Button
          type="button"
          className="bg-green-800 self-start text-lg font-normal hover:bg-green-900 hover:shadow-2xl"
          onClick={() => navigate('/app/cards/banks-holders')}
        >
          <Landmark className="text-white" />
          <User className="text-white" />
          Bancos e titulares
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
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <CreateCard
              onClose={() => setIsActiveAdd(false)}
              onCreated={refreshCards}
            />
          </div>
        </div>
      )}

      {isActiveEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <EditCard
              onClose={() => setIsActiveEdit(false)}
              onCreated={refreshCards}
              card={card}
            />
          </div>
        </div>
      )}
    </div>
  );
}
