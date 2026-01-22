/* eslint-disable no-unused-vars */
import { Input } from "@/components/ui/input"
import logo from "/src/assets/images/logo-w.png"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeClosed, Lock, Mail } from "lucide-react"
import { useState } from "react"
import { api } from "@/services/api"
import { Checkbox } from "@/components/ui/checkbox"

export default function Login() {

    const [show, setShow] = useState(false)
    const [checked, setChecked] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const navigate = useNavigate()
    const toggleShow = () =>{
        setShow(!show)
    }

    useState(() => {
        api.get("/user/rememberMe")
        .then(response => {
            setEmail(response.data.email)
            setPassword(response.data.password)
            setChecked(response.data.rememberMe)
        })
        .catch(err => console.log("Erro:", err));
    }, [])

    const login = () =>{
        setMessage("")
        setStatusMessage(null)
        api.post('/auth/login',{
            email: email,
            password: password,
            rememberMe: checked
        })
        .then(response => {
            setMessage("Login bem sucedido")
            setStatusMessage(true)
            navigate("/app/home")
        })
        .catch(err => {
            setMessage("Erro ao realizar login")
            setStatusMessage(false)
        })
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="h-full bg-green-800 w-[40%] flex items-center justify-center">
                <img src={logo} alt="logo EasyFinance" className="w-[90%]"/>
            </div>
            <div className="flex flex-col justify-center items-center w-[60%] gap-22"> 
                <h1 className="text-5xl font-normal text-green-800 w-[50%]">Cuidar do seu dinheiro nunca foi tão simples.</h1>
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

                    <div className="w-full">
                        <Checkbox className="border-slate-600 data-[state=checked]:bg-green-800" checked={checked} onCheckedChange={setChecked}/>
                        <label className="ml-2 text-slate-500">Lembrar de mim</label>
                    </div>
                    
                    {message && (
                        <span className={statusMessage ? "text-green-600 self-start" : "text-red-600 self-start"}>
                            {message}
                        </span>
                    )}
                    <div className="flex flex-col w-full">
                        <Link className="text-slate-500 hover:text-slate-800">Esqueceu a senha?</Link>
                        <Link className="text-slate-500 hover:text-slate-800" to={"/register"}>Não tem uma conta? Cadastre-se</Link> 
                    </div>                    
                    <Button type="button" className="bg-green-800 self-start text-lg font-normal hover:bg-green-900 hover:shadow-2xl" onClick={login}>Entrar</Button> 
                </form>
            </div>
        </div>
    )
}
