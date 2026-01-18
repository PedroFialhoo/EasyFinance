/* eslint-disable no-unused-vars */
import { Input } from "@/components/ui/input"
import logo from "/src/assets/images/logo-w.png"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Eye, EyeClosed, Lock, Mail } from "lucide-react"
import { useState } from "react"
import { api } from "@/services/api"

export default function Register() {
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const toggleShow = () =>{
        setShow(!show)
    }

    const register = () =>{
        setMessage("")
        setStatusMessage(null)
        api.post('/user/create',{
            email: email,
            password: password
        })
        .then(response => {
            setMessage("Conta criada com sucesso")
            setStatusMessage(true)
        })
        .catch(err => {
            setMessage("Erro ao criar conta")
            setStatusMessage(false)
            console.log(err)
        })
    }

    return(
        <div className="flex h-screen overflow-hidden">
            <div className="h-full bg-green-800 w-[40%] flex items-center justify-center">
                <img src={logo} alt="logo EasyFinance" className="w-[90%]"/>
            </div>
            <div className="flex flex-col justify-center items-center w-[60%] gap-18"> 
                <h1 className="text-5xl font-normal text-green-800 w-[50%]">Assuma o controle do seu dinheiro e transforme seus objetivos em conquistas reais.</h1>
                <form action="" className="flex flex-col justify-center items-center w-[50%] gap-5">
                    <div className="relative w-full">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input value={email} type="email" placeholder="Email" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    
                    <div className="relative w-full">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input value={password} type={show ? "text" : "password"} placeholder="Senha" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setPassword(e.target.value)}/>
                        {!show ? (<Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow}/>) : (<EyeClosed className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow} />)}
                    </div>
                    <div className="relative w-full">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input value={passwordRepeat} type={show ? "text" : "password"} placeholder="Confirme a Senha" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setPasswordRepeat(e.target.value)}/>
                        {!show ? (<Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow}/>) : (<EyeClosed className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow} />)}
                    </div>
                    {message && (
                        <span className={statusMessage ? "text-green-600 self-start" : "text-red-600 self-start"}>
                            {message}
                        </span>
                    )}
                    <div className="flex flex-col w-full">
                        <Link className="text-slate-500 hover:text-slate-800" to={"/"}>Já possui uma conta?</Link>
                    </div>                    
                    <Button type="button" className="bg-green-800 self-start text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={register}>Criar conta</Button> 
                </form>
            </div>
        </div> 
    )
}
