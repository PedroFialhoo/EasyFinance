/* eslint-disable no-unused-vars */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/services/api"
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/utils"
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { CalendarDays, ChartColumnStacked, CreditCardIcon, DollarSign, HandCoins, Plus, Receipt, Trash, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"


export default function EditBill({ onClose, onCreated, bill }){
    const [name, setName] = useState(bill.name || "")
    const [cards, setCards] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCard, setSelectedCard] = useState(bill.card ? bill.card.id.toString() : "")
    const [selectedCategory, setSelectedCategory] = useState(bill.category ? bill.category.id.toString() : "")
    const [typePayment, setTypePayment] = useState(bill.typePayment || "")
    const [numberInstallments, setNumberInstallments] = useState(bill.numberInstallments || null)
    const [totalValue, setTotalValue] = useState(formatCurrency(bill.totalValue))
    const [dueDate, setDueDate] = useState(bill.billInstallments?.[0]?.dueDate ?? null)
    const selectedCardObj = cards.find(c => c.id.toString() === selectedCard)
    const selectedCategoryObj = categories.find(cat => cat.id.toString() === selectedCategory) 
    const [paymentDate, setPaymentDate] = useState(bill.billInstallments?.[0]?.paymentDate ?? null)
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const navigate = useNavigate()
    const hasPaidInstallments = bill.hasPaidInstallments ?? bill.billInstallments?.some(installment => installment.paymentDate !== null)
    const datesLocked = numberInstallments > 1 || hasPaidInstallments
    const lockedDateMessage = "Este campo não pode mais ser editado para contas parceladas ou parcelas pagas."
    const lockedValueMessage = "Este campo não pode mais ser editado para contas com parcelas pagas."

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


    const payBill = () => {
        if(typePayment === "PENDING"){
            setMessage("Escolha uma forma de pagamento")
            setStatusMessage(false)
            return
        }
        api.post("/bill/payBill",{
            id: bill.billInstallments[0].id,
            typePayment: typePayment,
            cardDto:{
                id: selectedCard
            }
        })
            .then(response => {
                setMessage("Conta paga com sucesso!")
                setStatusMessage(true)
                onCreated()
                onClose()
            })
            .catch(err => {
                setMessage(err.response?.data || "Erro ao pagar conta")
                setStatusMessage(false)
            })
    }

    const editBill = () =>{
        api.put('/bill/edit',{
            id: bill.id,
            name,
            category: { id: selectedCategory },
            typePayment,
            card:{ id: selectedCard ? selectedCard : null } ,
            numberInstallments: numberInstallments ? Number(numberInstallments) : 1,
            totalValue: parseCurrencyInput(totalValue),
            firstDueDate: dueDate ? dueDate : null,
            billInstallments: [
                {
                    installmentNumber: bill.billInstallments[0].installmentNumber,
                    paymentDate: paymentDate || null
                }
            ]
        })
        .then(response => {
            setMessage("Conta editada com sucesso!")
            setStatusMessage(true)            
            onCreated() 
        })
        .catch(err => {
            setMessage(err.response?.data || "Erro ao editar conta")
            setStatusMessage(false)
        })
    }

    const deleteBill = () =>{
        api.delete(`/bill/delete/${bill.id}`)
        .then(response => {
            setMessage("Conta excluida com sucesso!")
            onCreated() 
            onClose()
        })
        .catch(err => {
            setMessage(err.response?.data || "Erro ao excluir conta")
            setStatusMessage(false)
            console.log(err)
        })
    }
    return(
        <div className="flex flex-col">
            <div className="flex w-full justify-between p-4">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Trash className="cursor-pointer hover:text-red-700" />
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Excluir conta</AlertDialogTitle>
                    <AlertDialogDescription className="text-xl">
                        Tem certeza que deseja excluir esta conta?
                        <br />
                        <span className="text-red-600 font-semibold text-lg">
                        Essa ação não pode ser desfeita.
                        </span>
                    </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-700 hover:bg-red-800"
                        onClick={deleteBill}
                    >
                        Excluir
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
                <X onClick={onClose} className=" hover:text-red-700 "/> 
            </div>  
            <form action="" className="m-8 flex flex-col gap-6">
                <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-xl font-semibold text-green-900">Editar conta</h2>
                    <p className="mt-1 text-sm text-slate-600">Parcela {bill.billInstallments?.[0]?.installmentNumber || 1} de {numberInstallments}</p>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-green-800">Nome da conta</p>
                    <div className="relative w-full">
                        <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input value={name} type="text" placeholder="Nome da conta" className="h-10 bg-slate-50 pl-10 pr-10 text-base!" onChange={(e) => setName(e.target.value)}/>
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

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-green-800">Valor total</p>
                        <div className="relative w-full" title={hasPaidInstallments ? lockedValueMessage : undefined}>
                            <HandCoins className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Input value={totalValue} type="text" inputMode="decimal" placeholder="Valor total" required disabled={hasPaidInstallments} className="h-10 bg-slate-50 pl-10 pr-10 text-base!" onChange={(e) => setTotalValue(formatCurrencyInput(e.target.value))}/>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-green-800">Datas</h3>
                    <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-green-800">Data de vencimento</p>
                            <div className="relative w-full" title={datesLocked ? lockedDateMessage : undefined}>
                                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                                <Input type="date" value={dueDate || ""} disabled={datesLocked} onChange={(e) => setDueDate(e.target.value)} className="h-10 bg-slate-50 pl-10 pr-10 text-base!" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-green-800">Data de pagamento</p>
                            {paymentDate !== null ? (
                                <div className="relative w-full" title={lockedDateMessage}>
                                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                                    <Input type="date" value={paymentDate} disabled className="h-10 bg-slate-50 pl-10 pr-10 text-base!" />
                                </div>
                            ) : (
                                <p className="h-10 rounded-md border bg-slate-100 px-3 py-2 text-slate-600">Não paga</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    {paymentDate === null && (
                        <Button type="button" className="bg-blue-800 text-lg font-normal hover:bg-blue-900 hover:shadow-2xl" onClick={payBill}>Pagar conta</Button>
                    )}
                    <Button type="button" className="bg-green-800 text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={editBill}>Salvar alterações</Button>
                </div>
                {message && (
                    <span className={statusMessage ? "text-green-600 text-center text-xl font-semibold" : "text-red-600 text-center text-xl font-semibold"}>
                        {message}
                    </span>
                )}
            </form>                            
        </div>
    )
}
