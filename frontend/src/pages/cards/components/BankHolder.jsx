import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BHCard from "./BHCard";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";

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
      refreshCards()
      setName("")
    })
  }

  const editFunc = () => {
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
      refreshCards()
      setName("")
    })
  }

  const deleteFunc = () => {
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
      refreshCards()
      setIsActiveDelete(false)
    })
  }

  return (
    <div className="bg-slate-200 rounded-xl p-8">
      <div className="flex justify-between items-baseline">
        <h1 className="font-bold text-2xl text-green-800">Bancos e Titulares</h1> 
        <X className="text-green-700 hover:text-green-950" onClick={() => navigate('/app/cards')}/>             
      </div>      
      <div className="flex min-h-36 mt-6 gap-8 justify-center">
        <div className="bg-slate-100 rounded-2xl w-[40%] p-4 shadow-md flex flex-col">
          <h1 className="font-bold text-2xl text-green-800 text-center">Bancos</h1> 
          <div className="grid grid-cols-2 gap-5 mt-4 w-full place-items-center">
            {
              banks.map((bank) =>(
                <BHCard
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
          </div>
          <Button type="button" className="bg-green-800 self-center mt-3 text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={() => {
            setIsActiveAdd(!isActiveAdd)
            setType('bank')
            setName("")
            }}>Adicionar Banco <span className="font-semibold text-xl">+</span></Button> 
        </div>
        <div className="bg-slate-100 rounded-2xl w-[40%] p-4 shadow-md flex flex-col">
          <h1 className="font-bold text-2xl text-green-800 text-center">Titulares</h1> 
          <div className="grid grid-cols-2 gap-5 mt-4 w-full place-items-center">
            {
              holders.map((holder) =>(
                <BHCard
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
          </div>
          <Button type="button" className="bg-green-800 self-center mt-3 text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={() => {
            setIsActiveAdd(!isActiveAdd)
            setType('holder')
            setName("")
          }}>Adicionar Titular <span className="font-semibold text-xl">+</span></Button> 
        </div>
      </div>  
      {isActiveAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-145 min-h-44 flex flex-col p-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-145 min-h-44 flex flex-col p-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-145 min-h-44 flex flex-col p-4">
            <X className="text-green-800 hover:text-green-950 self-end" onClick={() => setIsActiveDelete(!isActiveDelete)}/>
            <div className="mt-6 self-center flex flex-col items-center">
              <h1 className="font-bold text-2xl text-green-800">Tem certeza de que deseja excluir - <span className="capitalize text-slate-700">{name}</span> ?</h1>  
              <div className="flex gap-4">
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
  );
}
