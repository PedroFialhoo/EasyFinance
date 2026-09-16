import { Button } from "@/components/ui/button";
import { Building2, Plus, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BHCard from "./BHCard";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import Feedback from "@/components/Feedback";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function BankHolder() {
  const navigate = useNavigate()
  const [banks, setBanks] = useState([])
  const [holders, setHolders] = useState([])
  const [isActiveAdd, setIsActiveAdd] = useState(false)
  const [isActiveEdit, setIsActiveEdit] = useState(false)
  const [isActiveDelete, setIsActiveDelete] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState(null) // "bank" | "holder"
  const [id, setId] = useState(null)
  const [reload, setReload] = useState(false);
  const refreshCards = () => setReload((prev) => !prev);
  const [message, setMessage] = useState("")
  const [statusMessage, setStatusMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
      api.get("/bank/getAll")
        .then(response => setBanks(response.data))
        .catch(err => console.log("Erro:", err));
    }, [reload]);

  useEffect(() => {
    api.get("/holder/getAll")
      .then(response => setHolders(response.data))
      .catch(err => console.log("Erro:", err));
  }, [reload]);

  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage("")
      setStatusMessage(null)
    }, 4000)

    return () => clearTimeout(timer);
  }, [message])

  const createFunc = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    api.post(`/${type}/create`,{
      name: name
    })
    .then(() => {
      if(type == 'bank'){
        setMessage("Banco criado com sucesso!")
        setStatusMessage(true)
      } 
      if(type == 'holder'){
        setMessage("Titular criado com sucesso!")
        setStatusMessage(true)
      }         
    })
    .catch(() => {
      if(type == 'bank'){
        setMessage("Falha ao criar banco")
        setStatusMessage(false)
      } 
      if(type == 'holder'){
        setMessage("Falha ao criar titular")
        setStatusMessage(false)
      } 
    })
    .finally(() => {
      setIsSubmitting(false)
      refreshCards()
      setName("")
    })
  }

  const editFunc = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    api.put(`/${type}/edit`, {
      id: id,
      name: name
    })
    .then(response => {
      if(response.status == 200){
        if(type == 'bank'){
          setMessage("Banco editado com sucesso!")
          setStatusMessage(true)
        } 
        if(type == 'holder'){
          setMessage("Titular editado com sucesso!")
          setStatusMessage(true)
        }         
      }
      else{
        if(type == 'bank'){
          setMessage("Falha ao editar banco")
          setStatusMessage(false)
        } 
        if(type == 'holder'){
          setMessage("Falha ao editar titular")
          setStatusMessage(false)
        } 
      }
    })
    .finally(() => {
      setIsSubmitting(false)
      refreshCards()
      setName("")
    })
  }

  const deleteFunc = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    api.delete(`/${type}/delete/${id}`)
    .then(() => {
      if(type == 'bank'){
        setMessage("Banco excluido com sucesso!")
        setStatusMessage(true)
      } 
      if(type == 'holder'){
        setMessage("Titular excluido com sucesso!")
        setStatusMessage(true)
      }         
    })
    .catch(() => {
      if(type == 'bank'){
        setMessage("Falha ao excluir banco, verifique se não estão sendo utilizados em cartões registrados")
        setStatusMessage(false)
      } 
      if(type == 'holder'){
        setMessage("Falha ao excluir titular, verifique se não estão sendo utilizados em cartões registrados")
        setStatusMessage(false)
      } 
    })
    .finally(() => {
      setIsSubmitting(false)
      refreshCards()
      setIsActiveDelete(false)
    })
  }

  return (
    <section className="app-panel p-5 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div><h1 className="app-page-title">Bancos e titulares</h1><p className="app-page-description">Cadastros usados pelos seus cartões.</p></div>
        <button type="button" aria-label="Voltar para cartões" className="rounded-lg p-2 text-green-800 hover:bg-green-100" onClick={() => navigate('/app/cards')}><X className="size-5" /></button>
      </div>      
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-green-900"><Building2 className="size-5" /><h2 className="font-semibold">Bancos</h2><span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">{banks.length}</span></div>
          <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {
              banks.map((bank) =>(
                <BHCard
                  key={bank.id}
                  id={bank.id}
                  name={bank.name}
                  type="bank"
                  setId={setId}
                  setType={setType}
                  setIsActiveEdit={setIsActiveEdit}
                  setIsActiveDelete={setIsActiveDelete}
                  setName={setName}
                />              
              ))
            }
            {!banks.length && <p className="col-span-full py-8 text-center text-sm text-slate-500">Nenhum banco cadastrado.</p>}
          </div>
          <Button type="button" size="sm" className="mt-auto self-start" onClick={() => {
            setIsActiveAdd(true)
            setType('bank')
            setName("")
            }}><Plus />Adicionar banco</Button>
        </div>
        <div className="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-green-900"><UserRound className="size-5" /><h2 className="font-semibold">Titulares</h2><span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">{holders.length}</span></div>
          <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {
              holders.map((holder) =>(
                <BHCard
                  key={holder.id}
                  id={holder.id}
                  name={holder.name}
                  type="holder"
                  setId={setId}
                  setType={setType}
                  setIsActiveEdit={setIsActiveEdit}                  
                  setIsActiveDelete={setIsActiveDelete}
                  setName={setName}
                />
              ))
            }
            {!holders.length && <p className="col-span-full py-8 text-center text-sm text-slate-500">Nenhum titular cadastrado.</p>}
          </div>
          <Button type="button" size="sm" className="mt-auto self-start" onClick={() => {
            setIsActiveAdd(true)
            setType('holder')
            setName("")
          }}><Plus />Adicionar titular</Button>
        </div>
      </div>  
      {isActiveAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <button type="button" aria-label="Fechar" className="self-end rounded-lg p-1 text-green-800 hover:bg-green-100" onClick={() => setIsActiveAdd(false)}><X className="size-5" /></button>
            <div>
              <h1 className="text-lg font-semibold text-green-900">Adicionar {type === "bank" ? "banco" : "titular"}</h1>
              <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); createFunc(); }}>
                <label htmlFor="new-bank-holder-name" className="text-sm font-medium text-green-800">Nome *</label><Input id="new-bank-holder-name" value={name} required type="text" placeholder="Nome" className="capitalize" onChange={(e) => setName(e.target.value)}/>
                <Button type="submit" size="sm" disabled={!name.trim() || isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
              </form>              
            </div>
            {message && (
              <span role="status" className={statusMessage ? "mt-3 self-start text-sm font-medium text-green-700" : "mt-3 self-start text-sm font-medium text-red-700"}>
                  {message}
              </span>
            )}
          </div>
        </div>
      )}
      {isActiveEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <button type="button" aria-label="Fechar" className="self-end rounded-lg p-1 text-green-800 hover:bg-green-100" onClick={() => setIsActiveEdit(false)}><X className="size-5" /></button>
            <div>
              <h1 className="text-lg font-semibold text-green-900">Editar {type === "bank" ? "banco" : "titular"}</h1>
              <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); editFunc(); }}>
                <label htmlFor="edit-bank-holder-name" className="text-sm font-medium text-green-800">Nome *</label><Input id="edit-bank-holder-name" value={name} required type="text" placeholder="Nome" className="capitalize" onChange={(e) => setName(e.target.value)}/>
                <Button type="submit" size="sm" disabled={!name.trim() || isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar alterações"}</Button>
              </form>              
            </div>
            {message && (
              <span role="status" className={statusMessage ? "mt-3 self-start text-sm font-medium text-green-700" : "mt-3 self-start text-sm font-medium text-red-700"}>
                  {message}
              </span>
            )}
          </div>
        </div>
      )}
      <AlertDialog open={isActiveDelete} onOpenChange={setIsActiveDelete}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir {type === "bank" ? "banco" : "titular"}?</AlertDialogTitle><AlertDialogDescription>Esta ação removerá {name} permanentemente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-red-700 hover:bg-red-800" disabled={isSubmitting} onClick={deleteFunc}>{isSubmitting ? "Excluindo..." : "Excluir"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Feedback message={message} error={statusMessage === false} />

      
    </section>
  );
}
