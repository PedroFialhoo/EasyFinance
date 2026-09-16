import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { Plus, Tags, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "./CategoryCard";
import { Input } from "@/components/ui/input";

export default function Category(){
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [isActiveAdd, setIsActiveAdd] = useState(false)
    const [isActiveEdit, setIsActiveEdit] = useState(false)
    const [isActiveDelete, setIsActiveDelete] = useState(false)
    const [reload, setReload] = useState(false);
    const refreshCards = () => setReload((prev) => !prev);
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const [name, setName] = useState("")
    const [id, setId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState("")

    const loadCategories = () => {
        setLoading(true)
        setLoadError("")
        api.get("/category/getAll")
          .then(response => setCategories(response.data))
          .catch(() => setLoadError("Não foi possível carregar as categorias."))
          .finally(() => setLoading(false))
    }

    useEffect(() => {
          api.get("/category/getAll")
            .then(response => setCategories(response.data))
            .catch(() => setLoadError("Não foi possível carregar as categorias."))
            .finally(() => setLoading(false));
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
        api.post("/category/create",{
        name: name
        })
        .then(() => {
            setMessage("Categoria criada com sucesso!")
            setStatusMessage(true)
        })
        .catch(() => {            
            setMessage("Falha ao criar categoria")
            setStatusMessage(false)
        })
        .finally(() => {
            refreshCards()
            setName("")
        })
    }

  const editFunc = () => {
    api.put("/category/edit", {
      id: id,
      name: name
    })
    .then(() => {
        setMessage("Categoria editada com sucesso!")
        setStatusMessage(true)
    })
    .catch(() => {            
        setMessage("Falha ao editar categoria")
        setStatusMessage(false)
    })
    .finally(() => {
        refreshCards()
        setName("")
    })
  }

  const deleteFunc = () => {
    api.delete(`/category/delete/${id}`)
    .then(() => {
        setMessage("Categoria excluída com sucesso!")
        setStatusMessage(true)
    })
    .catch(() => {            
        setMessage("Falha ao excluir categoria")
        setStatusMessage(false)
    })
    .finally(() => {
        refreshCards()
        setIsActiveDelete(false)
    })
  }

    return(
        <section className="app-panel p-5 lg:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
                <div><h1 className="app-page-title">Categorias</h1><p className="app-page-description">Organize suas contas em grupos claros.</p></div>
                <button type="button" aria-label="Voltar para contas" className="rounded-lg p-2 text-green-800 hover:bg-green-100" onClick={() => navigate('/app/bills')}><X className="size-5" /></button>
            </div>      
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-green-900"><Tags className="size-5" /><h2 className="font-semibold">Suas categorias</h2><span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">{categories.length}</span></div>
                <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {
                  categories.map((category) =>(
                    <CategoryCard
                        key={category.id}
                        id={category.id}
                        name={category.name}
                        setId={setId}
                        setName={setName}
                        setIsActiveEdit={setIsActiveEdit}
                        setIsActiveDelete={setIsActiveDelete}
                    />              
                  ))
                }
                {loading && <p role="status" className="col-span-full py-8 text-center text-sm text-slate-500">Carregando categorias...</p>}
                {!loading && loadError && <p role="alert" className="col-span-full py-8 text-center text-sm text-red-700">{loadError} <button type="button" className="font-semibold underline" onClick={loadCategories}>Tentar novamente</button></p>}
                {!loading && !loadError && !categories.length && <p className="col-span-full py-8 text-center text-sm text-slate-500">Nenhuma categoria cadastrada.</p>}
                </div>
                <Button type="button" size="sm" className="mt-4" onClick={() => {
                    setIsActiveAdd(true)
                    setName("")
                    }}><Plus />Adicionar categoria</Button>
            </div>
            {isActiveAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
                    <button type="button" aria-label="Fechar" className="self-end rounded-lg p-1 text-green-800 hover:bg-green-100" onClick={() => setIsActiveAdd(false)}><X className="size-5" /></button>
                    <div>
                    <h1 className="text-lg font-semibold text-green-900">Adicionar categoria</h1>
                    <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); createFunc(); }}>
                        <Input value={name} type="text" placeholder="Nome" className="capitalize" onChange={(e) => setName(e.target.value)}/>
                        <Button type="submit" size="sm" disabled={!name.trim()}>Salvar</Button>
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
                    <h1 className="text-lg font-semibold text-green-900">Editar categoria</h1>
                    <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); editFunc(); }}>
                        <Input value={name} type="text" placeholder="Nome" className="capitalize" onChange={(e) => setName(e.target.value)}/>
                        <Button type="submit" size="sm" disabled={!name.trim()}>Salvar alterações</Button>
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
            {isActiveDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
                    <button type="button" aria-label="Fechar" className="self-end rounded-lg p-1 text-green-800 hover:bg-green-100" onClick={() => setIsActiveDelete(false)}><X className="size-5" /></button>
                    <div className="mt-3 flex flex-col">
                    <h1 className="text-lg font-semibold text-slate-900">Excluir categoria?</h1>
                    <p className="mt-1 text-sm text-slate-600">Esta ação removerá <span className="font-semibold capitalize text-slate-800">{name}</span> permanentemente.</p>
                    <div className="mt-5 flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsActiveDelete(false)}>Cancelar</Button>
                        <Button type="button" variant="destructive" size="sm" onClick={deleteFunc}>Excluir</Button>
                    </div>                        
                    </div>
                    {message && (
                    <span role="status" className={statusMessage ? "mt-3 self-start text-sm font-medium text-green-700" : "mt-3 self-start text-sm font-medium text-red-700"}>
                        {message}
                    </span>
                    )}
                </div>
                </div>
            )} 
        </section>
    )
}
