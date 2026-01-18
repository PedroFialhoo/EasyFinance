/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard as CreditCardIcon, Landmark, Trash, User, X } from "lucide-react";
import { use, useEffect, useState } from "react";
import CreditCard from "./CreditCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/services/api"

export default function EditCard({onClose, onCreated, card}){    
    const [banks, setBanks] = useState([])
    const [holders, setHolders] = useState([])    
    const [number, setNumber] = useState("")
    const [selectedBank, setSelectedBank] = useState("")
    const [selectedHolder, setSelectedHolder] = useState("")
    const [isActived, setIsActived] = useState(null)
    const selectedBankObj = banks.find(b => b.id.toString() === selectedBank)
    const selectedHolderObj = holders.find(h => h.id.toString() === selectedHolder)
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
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

    useEffect(() => {
        api.get(`/card/get/${card?.id}`)
            .then(response => {                
                setNumber(response.data.number)
                setSelectedBank(response.data.bank.id.toString())
                setSelectedHolder(response.data.holder.id.toString())
                setIsActived(response.data.active)
            })
            .catch(err => console.log("Erro:", err));
    }, []);   

    useEffect(() => {
        console.log(number, selectedBank, selectedHolder, isActived)
    }, [number, selectedBank, selectedHolder, isActived])

    const createCard = () =>{
        api.put('/card/edit',{
            id: card.id,
            number: number,
            bank:{
                id: selectedBank
            },
            holder:{
                id:selectedHolder
            },
            active: isActived
        })
        .then(response => {
            setMessage("Cartão editado com sucesso!")
            setStatusMessage(true)
            setNumber("")
            setSelectedBank("")
            setSelectedHolder("")
            onCreated() 
            onClose()
        })
        .catch(err => {
            setMessage("Erro ao editar cartão")
            setStatusMessage(false)
        })
    }

    const deleteCard = () =>{
        api.delete(`/card/delete/${card.id}`)
        .then(response => {
            setMessage("Cartão excluido com sucesso!")
            onCreated() 
            onClose()
        })
        .catch(err => {
            setMessage("Erro ao excluir cartão, caso tenha contas registradas com ele desative-o!")
            setStatusMessage(false)
            console.log(err)
        })
    }
    if (!number || !selectedBank || !selectedHolder) return null
    return(
        <div className="flex flex-col">
            <div className="flex w-full justify-between p-4">
               <Trash onClick={deleteCard} className=" hover:text-red-700"/>
                <X onClick={onClose} className=" hover:text-red-700 "/> 
            </div>            
            <form action="" className="m-14 flex flex-col gap-6">
                <div className="relative w-full">
                    <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                    <Input value={number} type="text" maxLength={4} placeholder="Numero do Cartão (4 últimos)" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}/>
                </div>
                <div className="relative w-full">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                        <SelectTrigger className="h-10 pl-10 pr-10 text-base! w-full capitalize">
                            <SelectValue placeholder="Selecione um Banco" />
                        </SelectTrigger>
                        <SelectContent>
                            {banks.map((bank)=>(
                                <SelectItem key={bank.id} value={bank.id.toString()} className="capitalize">{bank.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="relative w-full">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                    <Select value={selectedHolder} onValueChange={setSelectedHolder}>
                        <SelectTrigger className="h-10 pl-10 pr-10 text-base! w-full capitalize">
                            <SelectValue placeholder="Selecione um Titular" />
                        </SelectTrigger>
                        <SelectContent>
                            {holders.map((holder)=>(
                                <SelectItem key={holder.id} value={holder.id.toString()} className="capitalize">{holder.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="self-center pointer-events-none">
                    <CreditCard number={number} name={selectedHolderObj?.name} bank={selectedBankObj?.name}/>
                </div>

                {isActived ? 
                (<Button type="button" className="bg-red-700 text-lg font-normal hover:bg-red-900 hover:shadow-2xl self-center" onClick={() => setIsActived(!isActived)}>Desativar Cartão</Button> )
                :(<Button type="button" className="bg-blue-700 text-lg font-normal hover:bg-blue-900 hover:shadow-2xl self-center" onClick={() => setIsActived(!isActived)}>Ativar Cartão</Button> )}
                <Button type="button" className="bg-green-800 text-lg font-normal hover:bg-green-900 hover:shadow-2xl self-center" onClick={createCard}>Editar Cartão</Button>              
                
                {message && (
                    <span className={statusMessage ? "text-green-600 self-center text-xl font-semibold" : "text-red-600 self-center text-xl font-semibold"}>
                        {message}
                    </span>
                )}
            </form>                            
        </div>
    )
}