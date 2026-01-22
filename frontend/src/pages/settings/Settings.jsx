/* eslint-disable no-unused-vars */
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DollarSign, Eye, EyeClosed, Lock, Mail, User } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/services/api"

export default function Settings(){
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const [revenue, setRevenue] = useState()

    const toggleShow = () =>{
        setShow(!show)
    }

    useEffect(() => {
        api.get("/user/get")
            .then(response => {
                setRevenue(response.data.revenue)
                setEmail(response.data.email)
                setUsername(response.data.username)
                setOldPassword(response.data.password)
            })
            .catch(err => console.log("Erro:", err));
    }, []);

    const editAccount = () => {
        if(password !== passwordRepeat){
            setMessage("As senhas não conferem")
            setStatusMessage(false)
            return
        }
        if(passwordConfirm !== oldPassword){
            setMessage("Confirme a senha atual corretamente para atualizar a conta")
            setStatusMessage(false)
            return
        }
        api.put('/user/update',{
            revenue,
            email,
            username,
            password: password && password !== "" ? password : null
        })
        .then(response => {
            setMessage("Conta atualizada com sucesso!")
            setStatusMessage(true)  
            setPassword("")
            setPasswordRepeat("")
            setPasswordConfirm("")
        })
        .catch(err => {
            setMessage("Erro ao atualizar conta")
            setStatusMessage(false)
        })
    }

return (
  <div className="p-8 flex flex-col gap-7 w-[70%] self-center">
    <div className="bg-slate-200 rounded-xl p-14 flex justify-center">
      <form className="w-full flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-green-900">Configurações da Conta</h1>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-5">
            <div className="w-full">
              <h1 className="text-lg text-green-900">Atualizar receita mensal</h1>
              <div className="relative w-full">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                <Input value={revenue} type="number" placeholder="Receita" className="h-10 pl-10 pr-10 bg-slate-50" onChange={(e) => setRevenue(e.target.value)} />
              </div>
            </div>

            <div className="w-full">
              <h1 className="text-lg text-green-900">Nome de usuário</h1>
              <div className="relative w-full">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                <Input value={username} type="text" placeholder="Usuário" className="h-10 pl-10 pr-10 bg-slate-50" onChange={(e) => setUsername(e.target.value)} />
              </div>
            </div>

            <div className="w-full">
              <h1 className="text-lg text-green-900">E-mail</h1>
              <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                <Input value={email} type="email" placeholder="E-mail" className="h-10 pl-10 pr-10 bg-slate-50" onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="w-full">
              <h1 className="text-lg text-green-900">Nova senha</h1>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                <Input value={password} type={show ? "text" : "password"} placeholder="Nova senha" className="h-10 pl-10 pr-10 bg-slate-50" onChange={(e) => setPassword(e.target.value)} />
                {!show ? <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow} /> : <EyeClosed className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow} />}
              </div>
            </div>

            <div className="w-full">
              <h1 className="text-lg text-green-900">Confirmar nova senha</h1>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                <Input value={passwordRepeat} type={show ? "text" : "password"} placeholder="Confirmar senha" className="h-10 pl-10 pr-10 bg-slate-50" onChange={(e) => setPasswordRepeat(e.target.value)} />
                {!show ? <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow} /> : <EyeClosed className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow} />}
              </div>
            </div>

            <div className="w-full">
              <h1 className="text-lg text-green-900">Confirme a senha atual para editar a conta *</h1>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                <Input value={passwordConfirm} type={show ? "text" : "password"} placeholder="Senha atual" className="h-10 pl-10 pr-10 bg-slate-50" onChange={(e) => setPasswordConfirm(e.target.value)} />
                {!show ? <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow} /> : <EyeClosed className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow} />}
              </div>
            </div>
          </div>
        </div>

        {message && <span className={statusMessage ? "text-green-600 self-start" : "text-red-600 self-start"}>{message}</span>}

        <Button type="button" onClick={editAccount} className="bg-green-800 self-start text-lg font-normal hover:bg-green-900 hover:shadow-2xl">Atualizar conta</Button>
      </form>
    </div>
  </div>
)
 
}