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
import { ArrowUp10, CalendarDays, ChartColumnStacked, CreditCardIcon, DollarSign, HandCoins, Paperclip, Plus, Receipt, User, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Feedback from "@/components/Feedback";

export default function CreateBill({ onClose, onCreated }){
    const [name, setName] = useState("")
    const [cards, setCards] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCard, setSelectedCard] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [typePayment, setTypePayment] = useState("")
    const [numberInstallments, setNumberInstallments] = useState(null)
    const [fixedRecurring, setFixedRecurring] = useState(false)
    const [totalValue, setTotalValue] = useState(null)
    const [firstDueDate, setFirstDueDate] = useState("")
    const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
    const [attachmentFile, setAttachmentFile] = useState(null)
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const [confirmRecurring, setConfirmRecurring] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        api.get("/category/getAll")
            .then(response => setCategories(response.data))
            .catch(err => console.log("Erro:", err));
    }, []);

    const selectCard = (cardId) => {
        setSelectedCard(cardId)
        const dueDay = cards.find(card => card.id.toString() === cardId)?.dueDay
        if (!dueDay) return setFirstDueDate("")

        const today = new Date()
        const day = Math.min(dueDay, new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
        setFirstDueDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
    }

    useEffect(() => {
        api.get("/card/getAllActive")
            .then(response => setCards(response.data))
            .catch(err => console.log("Erro:", err));
    }, []);

    const clearForm = () => {
        setName("")
        setSelectedCard("")
        setSelectedCategory("")
        setTypePayment("")
        setNumberInstallments("")
        setFixedRecurring(false)
        setTotalValue("")
        setFirstDueDate("")
        setRecurrenceEndDate("")
        setAttachmentFile(null)
    }

    const selectAttachment = event => {
        const file = event.target.files?.[0]
        if (!file) return
        if (!file.name.toLowerCase().endsWith(".pdf") || file.size > 20 * 1024 * 1024) {
            setMessage("Selecione um PDF de até 20 MB.")
            setStatusMessage(false)
            event.target.value = ""
            return
        }
        setAttachmentFile(file)
    }

    const uploadAttachment = billId => {
        if (!attachmentFile) return Promise.resolve()
        const formData = new FormData()
        formData.append("file", attachmentFile)
        return api.post(`/bill/${billId}/attachments`, formData)
    }

    const createBill = () =>{
        if(!name.trim() || !selectedCategory || !typePayment || !firstDueDate || !totalValue){
            setMessage("Por favor, preencha todos os campos obrigatórios (*).")
            setStatusMessage(false)
            return
        }
        if ((typePayment === "CREDIT" || typePayment === "DEBIT") && !selectedCard) {
            setMessage("Selecione um cartão para pagamentos no crédito ou débito.")
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
            firstDueDate,
            fixedRecurring,
            recurrenceEndDate: recurrenceEndDate || null
        })
        .then(response => uploadAttachment(response.data)
            .then(() => ({ attachmentError: null }))
            .catch(attachmentError => ({ attachmentError })))
        .then(({ attachmentError }) => {
            setMessage(attachmentError ? "Conta criada, mas não foi possível anexar o PDF." : "Conta criada com sucesso!")
            setStatusMessage(!attachmentError)
            clearForm()
            onCreated() 
            window.dispatchEvent(new Event("balance-updated"))
        })
        .catch(err => {
            setMessage(err.response?.data || "Erro ao criar conta")
            setStatusMessage(false)
        })
    }

    const requestCreate = () => {
        setMessage("")
        if (fixedRecurring && !recurrenceEndDate) {
            setConfirmRecurring(true)
            return
        }
        createBill()
    }

    return(
        <div className="flex flex-col">
            <button type="button" aria-label="Fechar nova conta" onClick={onClose} className="m-4 mb-3 self-end rounded-lg p-1 hover:bg-red-50 hover:text-red-700"><X /></button>
            <form className="m-8 flex flex-col gap-6" onSubmit={(event) => { event.preventDefault(); requestCreate(); }}>
                <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-xl font-semibold text-green-900">Nova conta</h2>
                    <p className="mt-1 text-sm text-slate-600">Preencha os dados para registrar uma conta.</p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="bill-name" className="text-sm font-medium text-green-800">Nome da conta *</label>
                    <div className="relative w-full">
                        <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input id="bill-name" value={name} type="text" placeholder="Nome da conta" required className="h-10 bg-slate-50 pl-10 pr-10 text-base!" onChange={(e) => setName(e.target.value)}/>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                        <label htmlFor="bill-kind" className="text-sm font-medium text-green-800">Tipo de conta *</label>
                        <Select value={fixedRecurring ? "FIXED" : "INSTALLMENT"} onValueChange={(value) => setFixedRecurring(value === "FIXED")}>
                            <SelectTrigger id="bill-kind" className="h-10 w-full bg-slate-50 text-base!"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INSTALLMENT">Conta avulsa ou parcelada</SelectItem>
                                <SelectItem value="FIXED">Conta fixa mensal</SelectItem>
                            </SelectContent>
                        </Select>
                        {fixedRecurring && <p className="text-xs text-slate-500">A cobrança será criada mensalmente e poderá ser cancelada sem apagar o histórico.</p>}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="bill-payment-method" className="text-sm font-medium text-green-800">Forma de pagamento *</label>
                        <div className="relative w-full">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Select value={typePayment} onValueChange={setTypePayment}>
                                <SelectTrigger id="bill-payment-method" className="h-10 w-full bg-slate-50 pl-10 pr-10 text-base!">
                                    <SelectValue placeholder="Selecione a forma" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Em aberto</SelectItem>
                                    <SelectItem value="PIX">PIX</SelectItem>
                                    <SelectItem value="MONEY">Dinheiro</SelectItem>
                                    <SelectItem value="CARNE">Carnê</SelectItem>
                                    <SelectItem value="CREDIT">Cartão de crédito</SelectItem>
                                    <SelectItem value="DEBIT">Cartão de débito</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="bill-category" className="text-sm font-medium text-green-800">Categoria *</label>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full max-w-54">
                                <ChartColumnStacked className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger id="bill-category" className="h-10 w-full bg-slate-50 pl-10 pr-10 text-base! capitalize">
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
                            <button type="button" aria-label="Gerenciar categorias" className="text-green-800 hover:text-green-950" onClick={() => {
                                navigate('/app/bills/categories')
                                onClose()
                            }}><Plus /></button>
                        </div>
                    </div>

                    {(typePayment === "CREDIT" || typePayment === "DEBIT") && (
                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="bill-card" className="text-sm font-medium text-green-800">Cartão *</label>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full">
                                    <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                                    <Select value={selectedCard} onValueChange={selectCard}>
                                    <SelectTrigger id="bill-card" className="h-10 w-full bg-slate-50 pl-10 pr-10 text-base! capitalize">
                                            <SelectValue placeholder="Selecione um cartão" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cards.map((card) => (
                                                <SelectItem key={card.id} value={card.id.toString()} className="capitalize">{card.holder.name} - {card.number} | {card.bank.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <button type="button" aria-label="Gerenciar cartões" className="text-green-800 hover:text-green-950" onClick={() => {
                                    navigate('/app/cards/banks-holders')
                                    onClose()
                                }}><Plus /></button>
                            </div>
                        </div>
                    )}

                    {!fixedRecurring && (typePayment === "CREDIT" || typePayment === "CARNE") && (
                        <div className="space-y-2">
                            <label htmlFor="bill-installments" className="text-sm font-medium text-green-800">Número de parcelas</label>
                            <div className="relative w-full">
                                <ArrowUp10 className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                                <Input id="bill-installments" value={numberInstallments || ""} type="number" min="1" step="1" placeholder="Número de parcelas" className="h-10 bg-slate-50 pl-10 pr-10 text-base!" onChange={(e) => setNumberInstallments(e.target.value.replace(/\D/g, ""))}/>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="bill-value" className="text-sm font-medium text-green-800">{fixedRecurring ? "Valor mensal" : "Valor total"} *</label>
                        <div className="relative w-full">
                            <HandCoins className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Input id="bill-value" value={totalValue || ""} type="text" inputMode="decimal" placeholder="Valor total" required className="h-10 bg-slate-50 pl-10 pr-10 text-base!" onChange={(e) => setTotalValue(formatCurrencyInput(e.target.value))}/>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-green-800">Anexo</h3>
                            <p className="mt-1 text-xs text-slate-500">Opcional. PDF de boleto ou fatura, até 20 MB.</p>
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-green-800 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-50">
                            <Paperclip size={16} />
                            {attachmentFile ? "Trocar PDF" : "Anexar PDF"}
                            <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={selectAttachment} />
                        </label>
                    </div>
                    {attachmentFile && <div className="mt-3 flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"><span className="truncate">{attachmentFile.name}</span><button type="button" className="ml-3 text-red-700 hover:text-red-800" onClick={() => setAttachmentFile(null)}>Remover</button></div>}
                </div>

                <div className="border-t border-slate-200 pt-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-green-800">Data</h3>
                    <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                        <label htmlFor="bill-first-due-date" className="text-sm font-medium text-green-800">{fixedRecurring ? "Início da recorrência" : typePayment === "PENDING" || typePayment === "CREDIT" || typePayment === "CARNE" ? "Data de vencimento" : "Data de pagamento"} *</label>
                        <div className="relative w-full">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Input id="bill-first-due-date" type="date" value={firstDueDate} required onChange={(e) => setFirstDueDate(e.target.value)} className="h-10 bg-slate-50 pl-10 pr-10 text-base!" />
                        </div>
                        </div>
                        {fixedRecurring && <div className="space-y-2">
                            <label htmlFor="bill-recurrence-end" className="text-sm font-medium text-green-800">Término da recorrência <span className="text-slate-500">(opcional)</span></label>
                            <Input id="bill-recurrence-end" type="date" value={recurrenceEndDate} min={firstDueDate || undefined} onChange={(e) => setRecurrenceEndDate(e.target.value)} className="h-10 bg-slate-50 text-base!" />
                        </div>}
                    </div>
                </div>

                <Button type="submit" className="self-end bg-green-800 text-lg font-normal hover:bg-green-900 hover:shadow-2xl">Criar conta</Button>
                <Feedback message={message} error={statusMessage === false} />
            </form>
            <AlertDialog open={confirmRecurring} onOpenChange={setConfirmRecurring}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar conta fixa sem término</AlertDialogTitle><AlertDialogDescription>"{name || "Nova conta"}" será criada como uma cobrança mensal de {totalValue || "valor não informado"}, a partir de {firstDueDate ? new Date(`${firstDueDate}T00:00:00`).toLocaleDateString("pt-BR") : "data não informada"}, sem data final.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Voltar e definir término</AlertDialogCancel><AlertDialogAction onClick={createBill}>Criar sem término</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
