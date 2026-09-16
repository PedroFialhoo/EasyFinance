import { Input } from "@/components/ui/input"
import logo from "/src/assets/images/logo-w.png"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeClosed, Lock, Mail } from "lucide-react"
import { useState } from "react"
import { api } from "@/services/api"
import Feedback from "@/components/Feedback"

export default function Register() {
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const toggleShow = () =>{
        setShow(!show)
    }

    const register = async () =>{
        if (isSubmitting) return
        setMessage("")
        setStatusMessage(null)
        if (!email.trim() || !password || !passwordRepeat) {
            setMessage("Preencha todos os campos obrigatórios")
            setStatusMessage(false)
            return
        }
        if (password !== passwordRepeat) {
            setMessage("As senhas não conferem")
            setStatusMessage(false)
            return
        }
        setIsSubmitting(true)
        try {
            await api.post('/user/create', {
                email,
                password,
            })
            await api.post('/auth/login', {
                identifier: email,
                password,
                rememberMe: false,
            })
            setMessage("Conta criada com sucesso")
            setStatusMessage(true)
            navigate("/app/home")
        } catch (err) {
            setMessage(err.response?.data || "Não foi possível criar a conta. Tente novamente.")
            setStatusMessage(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    return(
        <div className="flex min-h-screen overflow-y-auto bg-slate-50">
            <div className="hidden w-[38%] items-center justify-center bg-green-900 p-8 lg:flex">
                <img src={logo} alt="logo EasyFinance" className="w-full max-w-xs"/>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-8 px-5 py-10 lg:w-[62%] lg:px-12">
                <img src={logo} alt="logo EasyFinance" className="w-44 lg:hidden"/>
                <div className="w-full max-w-xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">Comece agora</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-green-900 lg:text-4xl">Assuma o controle do seu dinheiro.</h1><p className="mt-3 text-slate-600">Crie sua conta para organizar as finanças da sua casa.</p></div>
                <form action="" className="flex w-full max-w-xl flex-col justify-center gap-5 p-6 sm:p-8" onSubmit={(event) => { event.preventDefault(); register(); }}>
                    <div className="space-y-2"><label htmlFor="register-email" className="text-sm font-medium text-green-800">E-mail *</label><div className="relative w-full">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input id="register-email" value={email} required type="email" placeholder="Email" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setEmail(e.target.value)}/>
                    </div></div>
                    
                    <div className="space-y-2"><label htmlFor="register-password" className="text-sm font-medium text-green-800">Senha *</label><div className="relative w-full">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input id="register-password" value={password} required type={show ? "text" : "password"} placeholder="Senha" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setPassword(e.target.value)}/>
                        <button type="button" aria-label={show ? "Ocultar senhas" : "Mostrar senhas"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-green-700 hover:bg-green-100" onClick={toggleShow}>{show ? <EyeClosed /> : <Eye />}</button>
                    </div></div>
                    <div className="space-y-2"><label htmlFor="register-password-repeat" className="text-sm font-medium text-green-800">Confirme a senha *</label><div className="relative w-full">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                        <Input id="register-password-repeat" value={passwordRepeat} required aria-invalid={passwordRepeat && password !== passwordRepeat} type={show ? "text" : "password"} placeholder="Confirme a Senha" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setPasswordRepeat(e.target.value)}/>
                        <button type="button" aria-label={show ? "Ocultar senhas" : "Mostrar senhas"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-green-700 hover:bg-green-100" onClick={toggleShow}>{show ? <EyeClosed /> : <Eye />}</button>
                    </div>{passwordRepeat && password !== passwordRepeat && <p className="text-sm text-red-700">As senhas não conferem</p>}</div>
                    <div className="flex flex-col w-full text-sm">
                        <Link className="font-medium text-green-800 hover:text-green-950" to={"/"}>Já possui uma conta?</Link>
                    </div>                    
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Criando conta..." : "Criar conta"}</Button>
                </form>
                <Feedback message={message} error={statusMessage === false} />
            </div>
        </div> 
    )
}
