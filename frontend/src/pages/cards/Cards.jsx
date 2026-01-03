import { useState } from "react";
import CreateCard from "./components/CreateCard";
import MyCards from "./components/MyCards";
import EditCard from "./components/EditCard";

export default function Cards() {
  const [isActiveAdd, setIsActiveAdd] = useState(false)
  const [isActiveEdit, setIsActiveEdit] = useState(false)
  const [reload, setReload] = useState(false)
  const [card, setCard] = useState(null)
  const refreshCards = () => setReload(prev => !prev)

  return (
    <div className="p-8 flex flex-col gap-7 relative">

      <MyCards onAdd={() => setIsActiveAdd(true)} onEdit={() => setIsActiveEdit(true)} reload={reload} setCard={setCard}/>

      {isActiveAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-125">
            <CreateCard onClose={() => setIsActiveAdd(false)} onCreated={refreshCards}/>
          </div>
        </div>
      )}

      {isActiveEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-125">
            <EditCard onClose={() => setIsActiveEdit(false)} onCreated={refreshCards} card={card}/>
          </div>
        </div>
      )}

    </div>
  );
}
