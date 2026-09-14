import { Input } from "@/components/ui/input"
import logo from "/src/assets/images/logo-w.png"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeClosed, Lock, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/services/api"
import { Checkbox } from "@/components/ui/checkbox"

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
    const navigate = useNavigate()
    const toggleShow = () =>{
        setShow(!show)
    }

    useEffect(() => {
        let mounted = true

        const restoreSession = async () => {
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

                try {
                    await loginWithCredentials({ ...savedCredentials, rememberMe: true })
                    if (mounted) navigate("/app/home")
                    return
                } catch {
                    removeRememberedCredentials()
                }
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

                await loginWithCredentials({
                    identifier: credentials.email,
                    password: credentials.password,
                    rememberMe: true,
                })
                if (mounted) navigate("/app/home")
            } catch {
                // Invalid or unavailable saved credentials leave the login form available.
            }
        }

        restoreSession()
        return () => {
            mounted = false
        }
    }, [navigate])

    const login = async () =>{
        setMessage("")
        setStatusMessage(null)
        try {
            await loginWithCredentials({ identifier, password, rememberMe: checked })
            setMessage("Login bem sucedido")
            setStatusMessage(true)
            navigate("/app/home")
        } catch {
            setMessage("Erro ao realizar login")
            setStatusMessage(false)
        }
    }

    return (
        <div className="flex min-h-screen overflow-y-auto">
            <div className="flex w-[38%] items-center justify-center bg-green-800 p-8">
                <img src={logo} alt="logo EasyFinance" className="w-full max-w-xs"/>
            </div>
            <div className="flex w-[62%] flex-col items-center justify-center gap-10 px-8 py-10 lg:gap-14">
                <h1 className="w-full max-w-xl text-3xl font-normal text-green-800 lg:text-4xl xl:text-5xl">Cuidar do seu dinheiro nunca foi tão simples.</h1>
                <form className="flex w-full max-w-xl flex-col justify-center gap-5" onSubmit={(event) => {
                    event.preventDefault()
                    login()
                }}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-green-800">E-mail ou nome de usuário</label>
                        <div className="relative w-full">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Input value={identifier} type="text" placeholder="E-mail ou nome de usuário" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setIdentifier(e.target.value)}/>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-green-800">Senha</label>
                        <div className="relative w-full">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
                            <Input value={password} type={show ? "text" : "password"} placeholder="Senha" className="h-10 pl-10 pr-10 text-base!" onChange={(e) => setPassword(e.target.value)}/>
                            {!show ? (<Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow}/>) : (<EyeClosed className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 cursor-pointer" onClick={toggleShow} />)}
                        </div>
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
                    <Button type="submit" className="bg-green-800 self-start text-lg font-normal hover:bg-green-900 hover:shadow-2xl">Entrar</Button>
                </form>
            </div>
        </div>
    )
}
