import { Button } from "@/components/ui/button";
import CreditCard from "./CreditCard";
import { useEffect, useState } from "react";
import { api } from "@/services/api"
import { CreditCard as CreditCardIcon } from "lucide-react";

export default function MyCards({onAdd, reload, onEdit, setCard}) {

    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)

    const loadCards = () => {
        setLoading(true)
        setLoadError(false)
        api.get("/card/getAll")
            .then(response => setCards(response.data))
            .catch(() => setLoadError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        Promise.resolve().then(loadCards)
    }, [reload]);

    return(
        <section className="app-panel overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-green-100 text-green-800"><CreditCardIcon className="size-6" /></span><div><h1 className="app-page-title">Meus cartões</h1><p className="app-page-description">Gerencie seus cartões e faturas em um só lugar.</p></div></div>
                <Button className="bg-green-900 text-base font-semibold text-white hover:bg-green-800" type="button" onClick={onAdd}>Adicionar cartão</Button>
            </header>
            <div className="p-5 sm:p-6">
            <div className="flex flex-wrap justify-center gap-4 lg:justify-start lg:gap-6">
                {cards.map((card)=>(
                    <CreditCard key={card.id} id={card.id} bank={card.bank.name} name={card.holder.name} number={card.number} edit={true} onEdit={onEdit} setCard={setCard}/>
                ))}
                {loading ? <div className="w-full px-6 py-12 text-center text-sm text-slate-500">Carregando cartões...</div> : loadError ? <div className="w-full px-6 py-12 text-center text-sm text-red-700">Não foi possível carregar os cartões.<Button variant="link" onClick={loadCards}>Tentar novamente</Button></div> : cards.length === 0 && <div className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">Nenhum cartão cadastrado. Adicione um cartão para acompanhar suas faturas.</div>}
            </div>
            </div>
        </section>
    )
}
