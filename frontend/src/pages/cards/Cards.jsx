import { useState } from "react";
import CreateCard from "./components/CreateCard";
import MyCards from "./components/MyCards";

export default function Cards() {
  const [isActive, setIsActive] = useState(false)
  const [reload, setReload] = useState(false)
  const refreshCards = () => setReload(prev => !prev)

  return (
    <div className="p-8 flex flex-col gap-7 relative">

      <MyCards onAdd={() => setIsActive(true)} reload={reload}/>

      {isActive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-125">
            <CreateCard onClose={() => setIsActive(false)} onCreated={refreshCards}/>
          </div>
        </div>
      )}

    </div>
  );
}
