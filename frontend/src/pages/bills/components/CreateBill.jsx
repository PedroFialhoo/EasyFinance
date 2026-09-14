/* eslint-disable no-unused-vars */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/services/api"
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils"
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ArrowUp10, CalendarDays, ChartColumnStacked, CreditCardIcon, DollarSign, HandCoins, Plus, Receipt, User, X } from "lucide-react";

export default function CreateBill({ onClose, onCreated }){
    const [name, setName] = useState()
    const [cards, setCards] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCard, setSelectedCard] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [typePayment, setTypePayment] = useState("")
    const [numberInstallments, setNumberInstallments] = useState(null)
    const [totalValue, setTotalValue] = useState(null)
    const [firstDueDate, setFirstDueDate] = useState("")
    const selectedCardObj = cards.find(c => c.id.toString() === selectedCard)
    const selectedCategoryObj = categories.find(cat => cat.id.toString() === selectedCategory)    
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        api.get("/category/getAll")
            .then(response => setCategories(response.data))
            .catch(err => console.log("Erro:", err));
    }, []);

    useEffect(() => {
        api.get("/card/getAllActive")
            .then(response => setCards(response.data))
            .catch(err => console.log("Erro:", err));
    }, []);

    const createBill = () =>{
        if(!name || !selectedCategory || !typePayment || !firstDueDate || !totalValue){
            setMessage("Por favor, preencha todos os campos obrigatórios (*).")
            setStatusMessage(false)
            return
        }
        api.post('/bill/create',{
            name,
            category: { id: selectedCategory },
            typePayment,
            card:{ id: selectedCard ? selectedCard : null } ,
            numberInstallments: numberInstallments ? Number(numberInstallments) : 1,
            totalValue: parseCurrencyInput(totalValue),
            firstDueDate
        })
        .then(response => {
            setMessage("Conta criada com sucesso!")
            setStatusMessage(true)
            setName("")
            setSelectedCard("")
            setSelectedCategory("")
            setTypePayment("")
            setNumberInstallments("")
            setTotalValue("")
            setFirstDueDate("")
            onCreated() 
        })
        .catch(err => {
            setMessage(err.response?.data || "Erro ao criar conta")
            setStatusMessage(false)
        })
    }

    return(
        <div className="flex flex-col">
            <X onClick={onClose} className="mb-3 self-end hover:text-red-700 m-4"/>
            <form action="" className="m-8 flex flex-col gap-6">
                <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-xl font-semibold text-green-900">Nova conta</h2>
                    <p className="mt-1 text-sm text-slate-600">Preencha os dados para registrar uma conta.</p>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-green-800">Nome da conta</p>
                    <div className="relative w-full">
                        <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input value={name} type="text" placeholder="Nome da conta" required className="h-10 bg-slate-50 pl-10 pr-10 text-base!" onChange={(e) => setName(e.target.value)}/>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-green-800">Método de pagamento</p>
                        <div className="relative w-full">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Select value={typePayment} onValueChange={setTypePayment}>
                                <SelectTrigger className="h-10 w-full bg-slate-50 pl-10 pr-10 text-base! capitalize">
                                    <SelectValue placeholder="Selecione o método" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING" className="capitalize">Em aberto</SelectItem>
                                    <SelectItem value="PIX" className="capitalize">PIX</SelectItem>
                                    <SelectItem value="MONEY" className="capitalize">Dinheiro</SelectItem>
                                    <SelectItem value="CARNE" className="capitalize">Carnê</SelectItem>
                                    <SelectItem value="CREDIT" className="capitalize">Cartão de crédito</SelectItem>
                                    <SelectItem value="DEBIT" className="capitalize">Cartão de débito</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-green-800">Categoria</p>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full">
                                <ChartColumnStacked className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-10 w-full bg-slate-50 pl-10 pr-10 text-base! capitalize">
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.length === 0 ? (
                                            <SelectItem disabled>Nenhuma categoria cadastrada</SelectItem>
                                        ) : categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()} className="capitalize">{category.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Plus className="cursor-pointer text-green-800 hover:text-green-950" onClick={() => {
                                navigate('/app/bills/categories')
                                onClose()
                            }}/>
                        </div>
                    </div>

                    {(typePayment === "CREDIT" || typePayment === "DEBIT") && (
                        <div className="space-y-2 md:col-span-2">
                            <p className="text-sm font-medium text-green-800">Cartão</p>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full">
                                    <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                                    <Select value={selectedCard} onValueChange={setSelectedCard}>
                                        <SelectTrigger className="h-10 w-full bg-slate-50 pl-10 pr-10 text-base! capitalize">
                                            <SelectValue placeholder="Selecione um cartão" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cards.map((card) => (
                                                <SelectItem key={card.id} value={card.id.toString()} className="capitalize">{card.holder.name} - {card.number} | {card.bank.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Plus className="cursor-pointer text-green-800 hover:text-green-950" onClick={() => {
                                    navigate('/app/cards/banks-holders')
                                    onClose()
                                }}/>
                            </div>
                        </div>
                    )}

                    {(typePayment === "CREDIT" || typePayment === "CARNE") && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-green-800">Número de parcelas</p>
                            <div className="relative w-full">
                                <ArrowUp10 className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                                <Input value={numberInstallments} type="number" min="1" step="1" placeholder="Número de parcelas" className="h-10 bg-slate-50 pl-10 pr-10 text-base!" onChange={(e) => setNumberInstallments(e.target.value.replace(/\D/g, ""))}/>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-green-800">Valor total</p>
                        <div className="relative w-full">
                            <HandCoins className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Input value={totalValue} type="text" inputMode="decimal" placeholder="Valor total" required className="h-10 bg-slate-50 pl-10 pr-10 text-base!" onChange={(e) => setTotalValue(formatCurrencyInput(e.target.value))}/>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-green-800">Data</h3>
                    <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-green-800">{(typePayment === "CREDIT" || typePayment === "PENDING" || typePayment === "CARNE") ? "Data de vencimento" : "Data de pagamento"}</p>
                        <div className="relative w-full">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Input type="date" value={firstDueDate} required onChange={(e) => setFirstDueDate(e.target.value)} className="h-10 bg-slate-50 pl-10 pr-10 text-base!" />
                        </div>
                    </div>
                </div>

                <Button type="button" className="self-end bg-green-800 text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={createBill}>Criar conta</Button>
                {message && (
                    <span className={statusMessage ? "text-green-600 self-center text-xl font-semibold" : "text-red-600 self-center text-xl font-semibold"}>
                        {message}
                    </span>
                )}
            </form>                            
        </div>
    )
}
