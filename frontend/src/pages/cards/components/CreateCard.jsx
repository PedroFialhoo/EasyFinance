/* eslint-disable no-unused-vars */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard as CreditCardIcon, Landmark, Plus, User, X } from "lucide-react";
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

export default function CreateCard({onClose, onCreated}){
    const [number, setNumber] = useState()
    const [banks, setBanks] = useState([])
    const [holders, setHolders] = useState([])
    const [selectedBank, setSelectedBank] = useState("")
    const [selectedHolder, setSelectedHolder] = useState("")
    const selectedBankObj = banks.find(b => b.id.toString() === selectedBank)
    const selectedHolderObj = holders.find(h => h.id.toString() === selectedHolder)
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
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
        api.post('/card/create',{
            number: number,
            bank:{
                id: selectedBank
            },
            holder:{
                id:selectedHolder
            }
        })
        .then(response => {
            setMessage("Cartão criado com sucesso!")
            setStatusMessage(true)
            setNumber("")
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
            <X onClick={onClose} className="mb-3 self-end hover:text-red-700 m-4"/>
            <form action="" className="m-14 flex flex-col gap-6">
                <div className="relative w-full">
                    <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                    <Input value={number} type="text" maxLength={4} placeholder="Numero do Cartão (4 últimos)" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}/>
                </div>
                <div className="flex items-center gap-2">
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
                    <Plus className="text-green-800 hover:text-green-950" onClick={() => {
                        navigate('/app/cards/banks-holders')
                        onClose()
                    }}/>
                </div>  
                <div className="flex items-center gap-2">
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
                    <Plus className="text-green-800 hover:text-green-950" onClick={() => {
                        navigate('/app/cards/banks-holders')
                        onClose()
                    }}/>
                </div>                              
                <div className="self-center pointer-events-none">
                    <CreditCard number={number} name={selectedHolderObj?.name} bank={selectedBankObj?.name}/>
                </div>
                <Button type="button" className="bg-green-800 text-lg font-normal hover:bg-green-900 hover:shadow-2xl self-center" onClick={createCard}>Criar Cartão</Button> 
                {message && (
                    <span className={statusMessage ? "text-green-600 self-center text-xl font-semibold" : "text-red-600 self-center text-xl font-semibold"}>
                        {message}
                    </span>
                )}
            </form>                            
        </div>
    )
}