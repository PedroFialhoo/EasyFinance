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
import { CalendarDays, ChartColumnStacked, CreditCardIcon, DollarSign, Eye, FileText, HandCoins, Paperclip, Plus, Receipt, Trash, X } from "lucide-react";
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
import Feedback from "@/components/Feedback"


export default function EditBill({ onClose, onCreated, bill }){
    const [name, setName] = useState(bill.name || "")
    const [cards, setCards] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCard, setSelectedCard] = useState(bill.card ? bill.card.id.toString() : "")
    const [selectedCategory, setSelectedCategory] = useState(bill.category ? bill.category.id.toString() : "")
    const [typePayment, setTypePayment] = useState(bill.typePayment || "")
    const [numberInstallments, setNumberInstallments] = useState(bill.numberInstallments || null)
    const fixedRecurring = bill.fixedRecurring === true
    const [totalValue, setTotalValue] = useState(formatCurrency(bill.totalValue))
    const [dueDate, setDueDate] = useState(bill.billInstallments?.[0]?.dueDate ?? null)
    const [recurrenceEndDate, setRecurrenceEndDate] = useState(bill.recurrenceEndDate ?? "")
    const selectedCardObj = cards.find(c => c.id.toString() === selectedCard)
    const selectedCategoryObj = categories.find(cat => cat.id.toString() === selectedCategory) 
    const [paymentDate, setPaymentDate] = useState(bill.billInstallments?.[0]?.paymentDate ?? null)
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const [attachments, setAttachments] = useState(bill.attachments || [])
    const [uploadingAttachment, setUploadingAttachment] = useState(false)
    const [pendingAttachmentRemoval, setPendingAttachmentRemoval] = useState(null)
    const [previewAttachment, setPreviewAttachment] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [previewError, setPreviewError] = useState("")
    const navigate = useNavigate()
    const hasPaidInstallments = bill.hasPaidInstallments ?? bill.billInstallments?.some(installment => installment.paymentDate !== null)
    const datesLocked = fixedRecurring || numberInstallments > 1 || hasPaidInstallments
    const lockedDateMessage = "Este campo não pode mais ser editado para contas parceladas ou parcelas pagas."
    const lockedValueMessage = "Este campo não pode mais ser editado para contas com parcelas pagas."

    const selectCard = (cardId) => {
        setSelectedCard(cardId)
        if (!datesLocked) {
            const dueDay = cards.find(card => card.id.toString() === cardId)?.dueDay
            if (!dueDay) return setDueDate("")

            const today = new Date()
            const day = Math.min(dueDay, new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
            setDueDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
        }
    }

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

useEffect(() => {
        if (!previewAttachment) return

        let active = true
        let objectUrl = null
        api.get(`/bill/${bill.id}/attachments/${previewAttachment.id}/content`, { responseType: "blob" })
            .then(response => {
                objectUrl = URL.createObjectURL(response.data)
                if (active) setPreviewUrl(objectUrl)
            })
            .catch(() => {
                if (active) setPreviewError("Não foi possível carregar este PDF.")
            })

        return () => {
            active = false
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [bill.id, previewAttachment])

    useEffect(() => {
        if (!previewAttachment) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreviewUrl(null)
            setPreviewError("")
        }
    }, [previewAttachment])


    const payBill = () => {
        if(typePayment === "PENDING"){
            setMessage("Escolha uma forma de pagamento")
            setStatusMessage(false)
            return
        }
        if ((typePayment === "CREDIT" || typePayment === "DEBIT") && !selectedCard) {
            setMessage("Selecione um cartão para pagamentos no crédito ou débito.")
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
                 window.dispatchEvent(new Event("reminders-updated"))
                 window.dispatchEvent(new Event("balance-updated"))
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
            firstDueDate: fixedRecurring ? bill.recurrenceStartDate : dueDate ? dueDate : null,
            fixedRecurring,
            recurrenceEndDate: recurrenceEndDate || null,
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
            window.dispatchEvent(new Event("balance-updated"))
            onClose()
        })
        .catch(err => {
            setMessage(err.response?.data || "Erro ao excluir conta")
            setStatusMessage(false)
            console.log(err)
        })
    }

    const cancelRecurringBill = () => {
        api.post(`/bill/cancel/${bill.id}`)
        .then(() => {
            onCreated()
            window.dispatchEvent(new Event("reminders-updated"))
            onClose()
        })
        .catch(err => {
            setMessage(err.response?.data || "Erro ao cancelar conta fixa")
            setStatusMessage(false)
        })
    }

    const uploadAttachment = (event) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return
        if (!file.name.toLowerCase().endsWith(".pdf")) {
            setMessage("Selecione um arquivo PDF.")
            setStatusMessage(false)
            return
        }
        if (file.size > 20 * 1024 * 1024) {
            setMessage("O PDF deve ter no máximo 20 MB.")
            setStatusMessage(false)
            return
        }

        const formData = new FormData()
        formData.append("file", file)
        setUploadingAttachment(true)
        api.post(`/bill/${bill.id}/attachments`, formData)
            .then(response => {
                setAttachments(current => [response.data, ...current])
                setMessage("PDF anexado com sucesso!")
                setStatusMessage(true)
            })
            .catch(err => {
                setMessage(getAttachmentErrorMessage(err, "Erro ao anexar o PDF."))
                setStatusMessage(false)
            })
            .finally(() => setUploadingAttachment(false))
    }

    const removeAttachment = () => {
        if (!pendingAttachmentRemoval) return
        api.delete(`/bill/${bill.id}/attachments/${pendingAttachmentRemoval.id}`)
            .then(() => {
                setAttachments(current => current.filter(attachment => attachment.id !== pendingAttachmentRemoval.id))
                setMessage("Anexo removido com sucesso!")
                setStatusMessage(true)
            })
            .catch(err => {
                setMessage(getAttachmentErrorMessage(err, "Erro ao remover o anexo."))
                setStatusMessage(false)
            })
            .finally(() => setPendingAttachmentRemoval(null))
    }

    const getAttachmentErrorMessage = (error, fallback) => {
        const data = error.response?.data
        return typeof data === "string" ? data : data?.message || fallback
    }

    const formatAttachmentSize = size => {
        const bytes = Number(size)
        if (!Number.isFinite(bytes) || bytes < 0) return "Tamanho não informado"
        return bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
                        <AlertDialogTitle>{fixedRecurring ? "Cancelar conta fixa" : "Excluir conta"}</AlertDialogTitle>
                        <AlertDialogDescription className="text-xl">
                        {fixedRecurring ? "As próximas cobranças em aberto serão removidas." : "Tem certeza que deseja excluir esta conta?"}
                        <br />
                        <span className="text-red-600 font-semibold text-lg">
                        {fixedRecurring ? "O histórico de pagamentos será preservado." : "Essa ação não pode ser desfeita."}
                        </span>
                    </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-700 hover:bg-red-800"
                        onClick={fixedRecurring ? cancelRecurringBill : deleteBill}
                    >
                        {fixedRecurring ? "Cancelar conta" : "Excluir"}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
                <X onClick={onClose} className=" hover:text-red-700 "/> 
            </div>  
            <form action="" className="m-8 flex flex-col gap-6">
                <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-xl font-semibold text-green-900">Editar conta</h2>
                    <p className="mt-1 text-sm text-slate-600">{fixedRecurring ? "Conta fixa mensal" : `Parcela ${bill.billInstallments?.[0]?.installmentNumber || 1} de ${numberInstallments}`}</p>
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
                                    <Select value={selectedCard} onValueChange={selectCard}>
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
                            <p className="text-sm font-medium text-green-800">{fixedRecurring ? "Valor mensal" : "Valor total"}</p>
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
                        {fixedRecurring && <div className="space-y-2">
                            <p className="text-sm font-medium text-green-800">Término da recorrência <span className="text-slate-500">(opcional)</span></p>
                            <Input type="date" min={bill.recurrenceStartDate || undefined} value={recurrenceEndDate} onChange={(e) => setRecurrenceEndDate(e.target.value)} className="h-10 bg-slate-50 text-base!" />
                            <p className="text-xs text-slate-500">As alterações valem para as próximas cobranças.</p>
                        </div>}
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

                <div className="border-t border-slate-200 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-green-800">Anexos</h3>
                            <p className="mt-1 text-xs text-slate-500">Boletos e faturas em PDF, até 20 MB cada.</p>
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-green-800 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-50">
                            <Paperclip size={16} />
                            {uploadingAttachment ? "Anexando..." : "Anexar PDF"}
                            <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={uploadingAttachment} onChange={uploadAttachment} />
                        </label>
                    </div>
                    {attachments.length === 0 ? <p className="mt-4 rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-600">Nenhum PDF anexado a esta conta.</p> : <ul className="mt-4 space-y-2">{attachments.map(attachment => <li key={attachment.id} className="flex items-center gap-3 rounded-md border border-slate-200 p-3"><FileText className="shrink-0 text-red-700" size={20} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{attachment.originalFilename}</p><p className="text-xs text-slate-500">{formatAttachmentSize(attachment.size)}{attachment.createdAt ? ` · ${new Date(attachment.createdAt).toLocaleDateString("pt-BR")}` : ""}</p></div><Button type="button" variant="ghost" size="icon" title="Visualizar PDF" onClick={() => setPreviewAttachment(attachment)}><Eye size={18} /></Button><Button type="button" variant="ghost" size="icon" title="Remover anexo" className="text-red-700 hover:text-red-800" onClick={() => setPendingAttachmentRemoval(attachment)}><Trash size={18} /></Button></li>)}</ul>}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    {paymentDate === null && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button type="button" className="bg-blue-800 text-lg font-normal hover:bg-blue-900 hover:shadow-2xl">Pagar conta</Button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar pagamento</AlertDialogTitle><AlertDialogDescription>Confirmar o pagamento de "{bill.name}"? Esta ação atualizará o saldo e não poderá ser desfeita nesta tela.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={payBill}>Confirmar pagamento</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button type="button" className="bg-green-800 text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={editBill}>Salvar alterações</Button>
                </div>
                <Feedback message={message} error={statusMessage === false} />
            </form>                            
            <AlertDialog open={Boolean(pendingAttachmentRemoval)} onOpenChange={open => !open && setPendingAttachmentRemoval(null)}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover anexo?</AlertDialogTitle><AlertDialogDescription>O arquivo "{pendingAttachmentRemoval?.originalFilename}" será removido permanentemente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-red-700 hover:bg-red-800" onClick={removeAttachment}>Remover</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={Boolean(previewAttachment)} onOpenChange={open => !open && setPreviewAttachment(null)}>
                <AlertDialogContent className="h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-3 sm:max-w-[calc(100%-2rem)] sm:p-5"><AlertDialogHeader><AlertDialogTitle className="truncate">{previewAttachment?.originalFilename}</AlertDialogTitle></AlertDialogHeader>{previewUrl ? <iframe title={previewAttachment?.originalFilename || "Visualização do PDF"} className="h-full min-h-0 w-full rounded border bg-slate-100" src={previewUrl} /> : <div className="flex min-h-0 items-center justify-center rounded border bg-slate-50 text-sm text-slate-600">{previewError || "Carregando PDF..."}</div>}<AlertDialogFooter><AlertDialogCancel>Fechar</AlertDialogCancel></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
