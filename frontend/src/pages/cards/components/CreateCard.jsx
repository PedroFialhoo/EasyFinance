/* eslint-disable no-unused-vars */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, CreditCard as CreditCardIcon, Landmark, Plus, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import CreditCard from "./CreditCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/services/api"
import { useNavigate } from "react-router-dom";
import Feedback from "@/components/Feedback"

export default function CreateCard({onClose, onCreated}){
    const [number, setNumber] = useState()
    const [dueDay, setDueDay] = useState("")
    const [banks, setBanks] = useState([])
    const [holders, setHolders] = useState([])
    const [selectedBank, setSelectedBank] = useState("")
    const [selectedHolder, setSelectedHolder] = useState("")
    const selectedBankObj = banks.find(b => b.id.toString() === selectedBank)
    const selectedHolderObj = holders.find(h => h.id.toString() === selectedHolder)
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        api.get("/bank/getAll")
            .then(response => setBanks(response.data))
            .catch(err => console.log("Erro:", err));
    }, []);

    useEffect(() => {
        api.get("/holder/getAll")
            .then(response => setHolders(response.data))
            .catch(err => console.log("Erro:", err)); 
    }, []);

    const createCard = () =>{
        if (isSubmitting) return
        if (!number || !selectedBank || !selectedHolder || !dueDay) {
            setMessage("Preencha todos os campos do cartão")
            setStatusMessage(false)
            return
        }
        setIsSubmitting(true)
        api.post('/card/create',{
            number: number,
            dueDay: Number(dueDay),
            bank:{
                id: selectedBank
            },
            holder:{
                id:selectedHolder
            }
        }).finally(() => setIsSubmitting(false))
        .then(response => {
            setMessage("Cartão criado com sucesso!")
            setStatusMessage(true)
            setNumber("")
            setDueDay("")
            setSelectedBank("")
            setSelectedHolder("")
            onCreated() 
        })
        .catch(err => {
            setMessage("Erro ao criar cartão")
            setStatusMessage(false)
        })
    }

    return(
        <div className="flex flex-col">
            <button type="button" aria-label="Fechar" className="m-4 mb-3 self-end rounded p-1 hover:bg-red-50 hover:text-red-700" onClick={onClose}><X /></button>
            <form action="" className="m-4 flex flex-col gap-5 sm:m-8 lg:m-12">
                 <div className="space-y-2"><label htmlFor="card-number" className="text-sm font-medium text-green-800">Últimos 4 dígitos *</label><div className="relative w-full">
                    <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                    <Input id="card-number" value={number} required type="text" inputMode="numeric" maxLength={4} placeholder="Numero do Cartão (4 últimos)" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}/>
                 </div></div>
                 <div className="space-y-2">
                    <label htmlFor="card-due-day" className="text-sm font-medium text-green-800">Dia de vencimento *</label>
                    <div className="relative w-full">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input id="card-due-day" value={dueDay} type="number" min="1" max="31" placeholder="Dia do mês (1 a 31)" required className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setDueDay(e.target.value.replace(/\D/g, ""))}/>
                    </div>
                 </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full">
                        <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <label htmlFor="card-bank" className="sr-only">Banco *</label><Select value={selectedBank} onValueChange={setSelectedBank}>
                            <SelectTrigger id="card-bank" aria-label="Banco obrigatório" className="h-10 pl-10 pr-10 text-base! w-full capitalize">
                                <SelectValue placeholder="Selecione um Banco" />
                            </SelectTrigger>
                            <SelectContent>
                                {banks.map((bank)=>(
                                    <SelectItem key={bank.id} value={bank.id.toString()} className="capitalize">{bank.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>   
                    <button type="button" aria-label="Cadastrar banco ou titular" className="rounded p-1 text-green-800 hover:bg-green-100 hover:text-green-950" onClick={() => {
                        navigate('/app/cards/banks-holders')
                        onClose()
                    }}><Plus /></button>
                </div>  
                <div className="flex items-center gap-2">
                    <div className="relative w-full">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <label htmlFor="card-holder" className="sr-only">Titular *</label><Select value={selectedHolder} onValueChange={setSelectedHolder}>
                            <SelectTrigger id="card-holder" aria-label="Titular obrigatório" className="h-10 pl-10 pr-10 text-base! w-full capitalize">
                                <SelectValue placeholder="Selecione um Titular" />
                            </SelectTrigger>
                            <SelectContent>
                                {holders.map((holder)=>(
                                    <SelectItem key={holder.id} value={holder.id.toString()} className="capitalize">{holder.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div> 
                    <button type="button" aria-label="Cadastrar banco ou titular" className="rounded p-1 text-green-800 hover:bg-green-100 hover:text-green-950" onClick={() => {
                        navigate('/app/cards/banks-holders')
                        onClose()
                    }}><Plus /></button>
                </div>                              
                <div className="self-center pointer-events-none">
                    <CreditCard number={number} name={selectedHolderObj?.name} bank={selectedBankObj?.name}/>
                </div>
                <Button type="button" disabled={isSubmitting} className="bg-green-800 text-lg font-normal hover:bg-green-900 hover:shadow-2xl self-center" onClick={createCard}>{isSubmitting ? "Criando..." : "Criar Cartão"}</Button>
                <Feedback message={message} error={statusMessage === false} />
            </form>                            
        </div>
    )
}
