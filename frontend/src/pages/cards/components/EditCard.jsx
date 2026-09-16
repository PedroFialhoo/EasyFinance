/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, CreditCard as CreditCardIcon, Landmark, Trash, User, X } from "lucide-react";
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
import Feedback from "@/components/Feedback"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function EditCard({onClose, onCreated, card}){    
    const [banks, setBanks] = useState([])
    const [holders, setHolders] = useState([])    
    const [number, setNumber] = useState("")
    const [dueDay, setDueDay] = useState("")
    const [selectedBank, setSelectedBank] = useState("")
    const [selectedHolder, setSelectedHolder] = useState("")
    const [isActived, setIsActived] = useState(null)
    const selectedBankObj = banks.find(b => b.id.toString() === selectedBank)
    const selectedHolderObj = holders.find(h => h.id.toString() === selectedHolder)
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const [pay, setPay] = useState(false)
    const [loadingPay, setLoadingPay] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmation, setConfirmation] = useState(null)
    const [originalCard, setOriginalCard] = useState(null)
    useEffect(() => {
        api.get("/bank/getAll")
            .then(response => setBanks(response.data))
            .catch(err => console.log("Erro:", err))
    }, []);

    useEffect(() => {
        api.get("/holder/getAll")
            .then(response => setHolders(response.data))
            .catch(err => console.log("Erro:", err))
    }, []);

    useEffect(() => {
        api.get(`/card/get/${card?.id}`)
            .then(response => {                
                setNumber(response.data.number)
                setDueDay(response.data.dueDay?.toString() || "")
                setSelectedBank(response.data.bank.id.toString())
                setSelectedHolder(response.data.holder.id.toString())
                setIsActived(response.data.active)
                setOriginalCard({
                    number: response.data.number,
                    dueDay: response.data.dueDay?.toString() || "",
                    bankId: response.data.bank.id.toString(),
                    holderId: response.data.holder.id.toString(),
                    active: response.data.active,
                })
            })
            .catch(err => console.log("Erro:", err))
    }, []);   

    useEffect(() => {        
        api.get(`/card/checkMonthlyInvoice/${card.id}`)
            .then(response => setPay(true))
            .catch(err => console.log("Erro:", err))            
    }, []);

    const editCard = () =>{
        if (isSubmitting) return
        if (!number || !selectedBank || !selectedHolder || !dueDay) {
            setMessage("Preencha todos os campos do cartão")
            setStatusMessage(false)
            return
        }
        setIsSubmitting(true)
        api.put('/card/edit',{
            id: card.id,
            number: number,
            dueDay: Number(dueDay),
            bank:{
                id: selectedBank
            },
            holder:{
                id:selectedHolder
            },
            active: isActived
        }).finally(() => setIsSubmitting(false))
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

    const requestSave = () => {
        if (!number || !selectedBank || !selectedHolder || !dueDay) {
            setMessage("Preencha os campos obrigatórios antes de salvar.")
            setStatusMessage(false)
            return
        }
        setConfirmation("save")
    }

    const changes = originalCard ? [
        originalCard.number !== number && "os últimos quatro dígitos",
        originalCard.dueDay !== dueDay && "o dia de vencimento",
        originalCard.bankId !== selectedBank && "o banco",
        originalCard.holderId !== selectedHolder && "o titular",
        originalCard.active !== isActived && `o status para ${isActived ? "ativo" : "inativo"}`,
    ].filter(Boolean) : []

    const deleteCard = () =>{
        if (isSubmitting) return
        setIsSubmitting(true)
        api.delete(`/card/delete/${card.id}`)
        .then(response => {
            setMessage("Cartão excluido com sucesso!")
            onCreated() 
            onClose()
        }).finally(() => { setIsSubmitting(false); setConfirmation(null) })
        .catch(err => {
            setMessage("Erro ao excluir cartão, caso tenha contas registradas com ele desative-o!")
            setStatusMessage(false)
            console.log(err)
        })
    }

    const payCard = () => {
        if (loadingPay) return

        setLoadingPay(true)
        api.post("/card/payCard",{
            id: card.id
        })
            .then(response => {
                setMessage("Cartão pago com sucesso!")
                setStatusMessage(true)
                setPay(false)
                window.dispatchEvent(new Event("reminders-updated"))
                window.dispatchEvent(new Event("balance-updated"))
            })
            .catch(err => {
                console.log("Erro:", err)
                setMessage("Erro ao pagar cartão")
                setStatusMessage(false)
            })
            .finally(() => setLoadingPay(false))
    }

    if (!number || !selectedBank || !selectedHolder){
        return <div />;
    }

    return(
        <div className="flex flex-col">
            <div className="flex w-full justify-between p-4">
                <button type="button" aria-label="Excluir cartão" className="rounded p-2 hover:bg-red-50 hover:text-red-700" onClick={() => setConfirmation("delete")}><Trash /></button>
                 <button type="button" aria-label="Fechar" className="rounded p-2 hover:bg-red-50 hover:text-red-700" onClick={onClose}><X /></button>
            </div>            
            <form action="" className="m-4 flex flex-col gap-5 sm:m-8 lg:m-12">
                 <div className="space-y-2"><label htmlFor="edit-card-number" className="text-sm font-medium text-green-800">Últimos 4 dígitos *</label><div className="relative w-full">
                    <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                    <Input id="edit-card-number" value={number} required type="text" inputMode="numeric" maxLength={4} placeholder="Numero do Cartão (4 últimos)" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}/>
                  </div></div>
                 <div className="space-y-2">
                     <label htmlFor="edit-card-due-day" className="text-sm font-medium text-green-800">Dia de vencimento *</label>
                    <div className="relative w-full">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input id="edit-card-due-day" value={dueDay} type="number" min="1" max="31" placeholder="Dia do mês (1 a 31)" required className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setDueDay(e.target.value.replace(/\D/g, ""))}/>
                    </div>
                 </div>
                <div className="space-y-2">
                    <label htmlFor="edit-card-bank" className="text-sm font-medium text-green-800">Banco *</label>
                    <div className="relative w-full">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                         <SelectTrigger id="edit-card-bank" className="h-10 pl-10 pr-10 text-base! w-full capitalize">
                            <SelectValue placeholder="Selecione um Banco" />
                        </SelectTrigger>
                        <SelectContent>
                            {banks.map((bank)=>(
                                <SelectItem key={bank.id} value={bank.id.toString()} className="capitalize">{bank.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="edit-card-holder" className="text-sm font-medium text-green-800">Titular *</label>
                    <div className="relative w-full">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                    <Select value={selectedHolder} onValueChange={setSelectedHolder}>
                         <SelectTrigger id="edit-card-holder" className="h-10 pl-10 pr-10 text-base! w-full capitalize">
                            <SelectValue placeholder="Selecione um Titular" />
                        </SelectTrigger>
                        <SelectContent>
                            {holders.map((holder)=>(
                                <SelectItem key={holder.id} value={holder.id.toString()} className="capitalize">{holder.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                <div className="self-center pointer-events-none">
                    <CreditCard number={number} name={selectedHolderObj?.name} bank={selectedBankObj?.name}/>
                </div>
                {isActived && (
                    pay ? (
                        <Button
                        type="button"
                        className="bg-blue-700 text-lg font-normal hover:bg-blue-900 hover:shadow-2xl self-center"
                        onClick={() => setConfirmation("pay")}
                        disabled={loadingPay}
                        >
                        Pagar Cartão
                        </Button>
                    ) : (
                        <Button
                        disabled
                        type="button"
                        className="bg-red-800 text-lg font-normal self-center"
                        >
                        Cartão Pago
                        </Button>
                    )
                    )}
                {isActived ? 
                (<Button type="button" className="bg-red-700 text-lg font-normal hover:bg-red-900 hover:shadow-2xl self-center" onClick={() => setIsActived(false)}>Desativar cartão</Button> )
                :(<Button type="button" className="bg-blue-700 text-lg font-normal hover:bg-blue-900 hover:shadow-2xl self-center" onClick={() => setIsActived(true)}>Ativar cartão</Button> )}
                 {changes.length > 0 && <p className="text-center text-sm text-amber-800">Há alterações não salvas.</p>}
                 <Button type="button" disabled={isSubmitting || changes.length === 0} className="bg-green-800 text-lg font-normal hover:bg-green-900 hover:shadow-2xl self-center" onClick={requestSave}>{isSubmitting ? "Salvando..." : "Salvar alterações"}</Button>
                 <Feedback message={message} error={statusMessage === false} />
            </form>                            
            <AlertDialog open={Boolean(confirmation)} onOpenChange={open => !open && setConfirmation(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirmation === "delete" ? "Excluir cartão?" : confirmation === "pay" ? "Pagar cartão?" : "Salvar alterações do cartão?"}</AlertDialogTitle><AlertDialogDescription>{confirmation === "delete" ? "Esta ação é permanente." : confirmation === "pay" ? "O pagamento atualizará o saldo disponível." : `Você está prestes a atualizar ${changes.join(", ") || "os dados"} deste cartão.`}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className={confirmation === "delete" ? "bg-red-700 hover:bg-red-800" : ""} disabled={isSubmitting || loadingPay} onClick={confirmation === "delete" ? deleteCard : confirmation === "pay" ? payCard : editCard}>{confirmation === "delete" ? "Excluir" : confirmation === "pay" ? "Confirmar pagamento" : "Salvar alterações"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </div>
    )
}
