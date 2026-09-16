import { Input } from "@/components/ui/input"
import logo from "/src/assets/images/logo-w.png"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeClosed, Lock, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/services/api"
import { Checkbox } from "@/components/ui/checkbox"
import Feedback from "@/components/Feedback"

const REMEMBERED_CREDENTIALS_KEY = "easyfinance.rememberedCredentials"

const saveRememberedCredentials = (credentials) => {
    localStorage.setItem(REMEMBERED_CREDENTIALS_KEY, JSON.stringify(credentials))
}

const removeRememberedCredentials = () => {
    localStorage.removeItem(REMEMBERED_CREDENTIALS_KEY)
}

const loginWithCredentials = async (credentials) => {
    const response = await api.post('/auth/login', credentials)

    if (credentials.rememberMe) {
        saveRememberedCredentials({
            identifier: credentials.identifier,
            password: credentials.password,
        })
    } else {
        removeRememberedCredentials()
    }

    return response
}

export default function Login() {

    const [show, setShow] = useState(false)
    const [checked, setChecked] = useState(false)
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [statusMessage, setStatusMessage] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const toggleShow = () =>{
        setShow(!show)
    }

    useEffect(() => {
        let mounted = true

        const restoreCredentials = async () => {
            let savedCredentials = null

            try {
                savedCredentials = JSON.parse(localStorage.getItem(REMEMBERED_CREDENTIALS_KEY))
            } catch {
                removeRememberedCredentials()
            }

            if (savedCredentials?.identifier && savedCredentials?.password) {
                if (mounted) {
                    setIdentifier(savedCredentials.identifier)
                    setPassword(savedCredentials.password)
                    setChecked(true)
                }
                return
            }

            try {
                const response = await api.get("/user/rememberMe")
                const credentials = response.data
                if (!credentials?.email || !credentials?.password) return

                if (mounted) {
                    setIdentifier(credentials.email)
                    setPassword(credentials.password)
                    setChecked(true)
                }

            } catch {
                // No remembered credentials leave the login form available.
            }
        }

        restoreCredentials()
        return () => {
            mounted = false
        }
    }, [navigate])

    const login = async () =>{
        if (isSubmitting) return
        setMessage("")
        setStatusMessage(null)
        if (!identifier.trim() || !password) {
            setMessage("Preencha e-mail ou nome de usuário e senha")
            setStatusMessage(false)
            return
        }
        setIsSubmitting(true)
        try {
            await loginWithCredentials({ identifier, password, rememberMe: checked })
            setMessage("Login bem sucedido")
            setStatusMessage(true)
            navigate("/app/home")
        } catch {
            setMessage("Não foi possível entrar. Verifique seus dados e tente novamente.")
            setStatusMessage(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen overflow-y-auto bg-slate-50">
            <div className="hidden w-[38%] items-center justify-center bg-green-900 p-8 lg:flex">
                <img src={logo} alt="logo EasyFinance" className="w-full max-w-xs"/>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-8 px-5 py-10 lg:w-[62%] lg:gap-10 lg:px-12">
                <img src={logo} alt="logo EasyFinance" className="w-44 lg:hidden"/>
                <div className="w-full max-w-xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">EasyFinance</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-green-900 lg:text-4xl">Cuidar do seu dinheiro nunca foi tão simples.</h1><p className="mt-3 text-slate-600">Entre para acompanhar suas contas, cartões e planejamento mensal.</p></div>
                <form className="flex w-full max-w-xl flex-col justify-center gap-5 p-6 sm:p-8" onSubmit={(event) => {
                    event.preventDefault()
                    login()
                }}>
                    <div className="space-y-2">
                        <label htmlFor="login-identifier" className="text-sm font-medium text-green-800">E-mail ou nome de usuário *</label>
                        <div className="relative w-full">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Input id="login-identifier" value={identifier} required type="text" placeholder="E-mail ou nome de usuário" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setIdentifier(e.target.value)}/>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="login-password" className="text-sm font-medium text-green-800">Senha *</label>
                        <div className="relative w-full">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Input id="login-password" value={password} required type={show ? "text" : "password"} placeholder="Senha" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setPassword(e.target.value)}/>
                            <button type="button" aria-label={show ? "Ocultar senha" : "Mostrar senha"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-green-700 hover:bg-green-100" onClick={toggleShow}>{show ? <EyeClosed /> : <Eye />}</button>
                        </div>
                    </div>

                    <div className="w-full">
                        <Checkbox id="remember-me" className="border-slate-600 data-[state=checked]:bg-green-800" checked={checked} onCheckedChange={setChecked}/>
                        <label htmlFor="remember-me" className="ml-2 text-slate-500">Lembrar de mim</label>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 text-sm">
                        <p className="text-slate-500">Para recuperar sua senha, entre em contato com o suporte da aplicação.</p>
                        <Link className="font-medium text-green-800 hover:text-green-950" to={"/register"}>Não tem uma conta? Cadastre-se</Link>
                    </div>                    
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Entrando..." : "Entrar"}</Button>
                </form>
                <Feedback message={message} error={statusMessage === false} />
            </div>
        </div>
    )
}
