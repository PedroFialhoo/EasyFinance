import { Button } from "@/components/ui/button";
import CreditCard from "./CreditCard";
import { useEffect, useState } from "react";
import { api } from "@/services/api"

export default function MyCards({onAdd, reload, onEdit, setCard}) {

    const [cards, setCards] = useState([])

    useEffect(() => {
        api.get("/card/getAll")
            .then(response => setCards(response.data))
            .catch(err => console.log("Erro:", err));
    }, [reload]);

    return(
        <div className="rounded-xl border border-slate-300 bg-slate-200 p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap justify-between gap-3 p-2 sm:p-4">
                <h1 className="font-bold text-2xl text-green-800">Meus Cartões</h1>
                <Button type="button" className="bg-green-800 self-start text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={onAdd}>Adicionar Cartão <span className="font-semibold text-xl">+</span></Button> 
            </div>
            <div className="flex flex-wrap justify-center gap-4 lg:justify-start lg:gap-6">
                {cards.map((card)=>(
                    <CreditCard id={card.id} bank={card.bank.name} name={card.holder.name} number={card.number} edit={true} onEdit={onEdit} setCard={setCard}/>
                ))}
            </div>                    
        </div>
    )
}
