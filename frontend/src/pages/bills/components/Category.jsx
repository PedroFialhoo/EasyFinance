import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { X } from "lucide-react";
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

    useEffect(() => {
          api.get("/category/getAll")
            .then(response => setCategories(response.data))
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
        <div className="rounded-xl border border-slate-300 bg-slate-200 p-4 shadow-sm lg:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h1 className="font-bold text-2xl text-green-800">Categorias</h1> 
                <X className="text-green-700 hover:text-green-950" onClick={() => navigate('/app/bills')}/>             
            </div>      
            <div className="mt-4 grid w-full grid-cols-2 place-items-center gap-4 lg:grid-cols-3 xl:grid-cols-5">
                {
                  categories.map((category) =>(
                    <CategoryCard
                        id={category.id}
                        name={category.name}
                        setId={setId}
                        setName={setName}
                        setIsActiveEdit={setIsActiveEdit}
                        setIsActiveDelete={setIsActiveDelete}
                    />              
                  ))
                }   
                <Button type="button" className="bg-green-800 self-center mt-3 text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={() => {
                    setIsActiveAdd(!isActiveAdd)
                    setName("")
                    }}>Adicionar Categoria <span className="font-semibold text-xl">+</span>
                </Button> 
            </div>    
            {isActiveAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-y-auto rounded-xl bg-white p-4 shadow-2xl">
                    <X className="text-green-800 hover:text-green-950 self-end" onClick={() => setIsActiveAdd(!isActiveAdd)}/>
                    <div>
                    <h1 className="font-bold text-2xl text-green-800">Adicionar</h1>
                    <form action="" className="mt-4">
                        <Input value={name} type="text" placeholder="Nome" className="capitalize" onChange={(e) => setName(e.target.value)}/>
                        <Button type="button" className="bg-green-800 self-center mt-3 text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={createFunc}>Salvar</Button> 
                    </form>              
                    </div>
                    {message && (
                    <span className={statusMessage ? "text-green-600 self-center text-xl font-semibold" : "text-red-600 self-center text-xl font-semibold"}>
                        {message}
                    </span>
                    )}
                </div>
                </div>
            )}
            {isActiveEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-y-auto rounded-xl bg-white p-4 shadow-2xl">
                    <X className="text-green-800 hover:text-green-950 self-end" onClick={() => setIsActiveEdit(!isActiveEdit)}/>
                    <div>
                    <h1 className="font-bold text-2xl text-green-800">Editar</h1>
                    <form action="" className="mt-4">
                        <Input value={name} type="text" placeholder="Nome" className="capitalize" onChange={(e) => setName(e.target.value)}/>
                        <Button type="button" className="bg-green-800 self-center mt-3 text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={editFunc}>Salvar</Button> 
                    </form>              
                    </div>
                    {message && (
                    <span className={statusMessage ? "text-green-600 self-center text-xl font-semibold" : "text-red-600 self-center text-xl font-semibold"}>
                        {message}
                    </span>
                    )}
                </div>
                </div>
            )}
            {isActiveDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-y-auto rounded-xl bg-white p-4 shadow-2xl">
                    <X className="text-green-800 hover:text-green-950 self-end" onClick={() => setIsActiveDelete(!isActiveDelete)}/>
                    <div className="mt-6 self-center flex flex-col items-center">
                    <h1 className="text-center text-xl font-bold text-green-800 lg:text-2xl">Tem certeza de que deseja excluir - <span className="capitalize text-slate-700">{name}</span> ?</h1>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button type="button" className="bg-red-800 self-center mt-3 text-lg font-normal hover:bg-red-900 hover:shadow-2xl" onClick={deleteFunc}>Sim</Button> 
                        <Button type="button" className="bg-green-800 self-center mt-3 text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={() => setIsActiveDelete(!isActiveDelete)}>Não</Button>   
                    </div>                        
                    </div>
                    {message && (
                    <span className={statusMessage ? "text-green-600 self-center text-xl font-semibold" : "text-red-600 self-center text-xl font-semibold"}>
                        {message}
                    </span>
                    )}
                </div>
                </div>
            )} 
        </div>
    )
}
