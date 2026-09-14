import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bell, DollarSign, Eye, EyeClosed, Lock, Mail, User } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/services/api"

export default function Settings(){
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")
    const [profileMessage, setProfileMessage] = useState("")
    const [profileStatus, setProfileStatus] = useState(null)
    const [passwordMessage, setPasswordMessage] = useState("")
    const [passwordStatus, setPasswordStatus] = useState(null)
    const [revenue, setRevenue] = useState("")
    const [reminderEnabled, setReminderEnabled] = useState(true)
    const [reminderDays, setReminderDays] = useState([])
    const [reminderMessage, setReminderMessage] = useState("")

    const toggleShow = () =>{
        setShow(!show)
    }

    useEffect(() => {
        api.get("/user/get")
            .then(response => {
                setRevenue(response.data.revenue ?? "")
                setEmail(response.data.email)
                setUsername(response.data.username)
            })
            .catch(err => console.log("Erro:", err));
        api.get("/reminders/preferences")
            .then(response => {
                setReminderEnabled(response.data.enabled)
                setReminderDays(response.data.daysBeforeDue)
            })
            .catch(() => {})
    }, []);

    const updateProfile = () => {
        const parsedRevenue = Number(revenue)
        if (revenue === "" || !Number.isFinite(parsedRevenue) || parsedRevenue < 0) {
            setProfileMessage("Informe uma receita maior ou igual a zero")
            setProfileStatus(false)
            return
        }
        api.put('/user/update',{
            revenue: parsedRevenue,
            email,
            username,
        })
        .then(() => {
            setProfileMessage("Dados atualizados com sucesso!")
            setProfileStatus(true)
        })
        .catch(err => {
            setProfileMessage(err.response?.data || "Erro ao atualizar dados")
            setProfileStatus(false)
        })
    }

    const updatePassword = () => {
        if(password !== passwordRepeat){
            setPasswordMessage("As senhas não conferem")
            setPasswordStatus(false)
            return
        }
        if (!currentPassword) {
            setPasswordMessage("Informe a senha atual")
            setPasswordStatus(false)
            return
        }
        api.put('/user/update-password',{
            currentPassword,
            newPassword: password,
        })
        .then(() => {
            setPasswordMessage("Senha atualizada com sucesso!")
            setPasswordStatus(true)
            setPassword("")
            setPasswordRepeat("")
            setCurrentPassword("")
        })
        .catch(err => {
            setPasswordMessage(err.response?.data || "Erro ao atualizar senha")
            setPasswordStatus(false)
        })
    }

    const toggleReminderDay = (day) => {
        setReminderDays(days => days.includes(day) ? days.filter(value => value !== day) : [...days, day])
    }

    const updateReminders = () => {
        if (reminderDays.length === 0) {
            setReminderMessage("Selecione pelo menos um dia de aviso")
            return
        }
        api.put("/reminders/preferences", { enabled: reminderEnabled, daysBeforeDue: reminderDays })
            .then(() => setReminderMessage("Preferências de lembrete salvas!"))
            .catch(err => setReminderMessage(err.response?.data || "Erro ao salvar lembretes"))
    }

return (
  <div className="flex w-full max-w-6xl self-center p-4 lg:p-8">
    <div className="flex w-full justify-center rounded-2xl border border-slate-300 bg-slate-200 p-4 shadow-sm lg:p-8">
      <form className="flex w-full flex-col gap-6">
        <div className="border-b border-slate-300 pb-5">
          <h1 className="text-2xl font-semibold text-green-900">Configurações da conta</h1>
          <p className="mt-1 text-slate-600">Atualize seus dados financeiros e credenciais em áreas separadas.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm lg:p-6">
            <div>
              <div className="flex items-center gap-2 text-green-900">
                <DollarSign className="size-5" />
                <h2 className="text-lg font-semibold">Dados financeiros e perfil</h2>
              </div>
              <p className="mt-1 text-sm text-slate-600">Essas alterações não exigem confirmação de senha.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-green-800">Receita mensal</label>
              <div className="relative w-full">
                <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input value={revenue} type="number" min="0" step="0.01" placeholder="0,00" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setRevenue(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-green-800">Nome de usuário</label>
              <div className="relative w-full">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input value={username} type="text" placeholder="Usuário" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setUsername(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-green-800">E-mail</label>
              <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input value={email} type="email" placeholder="E-mail" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            {profileMessage && <span className={profileStatus ? "text-sm text-green-600" : "text-sm text-red-600"}>{profileMessage}</span>}
            <Button type="button" onClick={updateProfile} className="mt-auto self-start bg-green-800 text-base font-normal hover:bg-green-900 hover:shadow-lg">Salvar dados</Button>
          </section>

          <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm lg:p-6">
            <div>
              <div className="flex items-center gap-2 text-green-900">
                <Lock className="size-5" />
                <h2 className="text-lg font-semibold">Alterar senha</h2>
              </div>
              <p className="mt-1 text-sm text-slate-600">Confirme a senha atual somente para alterar sua senha.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-green-800">Nova senha</label>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input value={password} type={show ? "text" : "password"} placeholder="Nova senha" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setPassword(e.target.value)} />
                {!show ? <Eye className="absolute right-3 top-1/2 size-4 -translate-y-1/2 cursor-pointer text-green-700" onClick={toggleShow} /> : <EyeClosed className="absolute right-3 top-1/2 size-4 -translate-y-1/2 cursor-pointer text-green-700" onClick={toggleShow} />}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-green-800">Confirmar nova senha</label>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input value={passwordRepeat} type={show ? "text" : "password"} placeholder="Repita a nova senha" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setPasswordRepeat(e.target.value)} />
                {!show ? <Eye className="absolute right-3 top-1/2 size-4 -translate-y-1/2 cursor-pointer text-green-700" onClick={toggleShow} /> : <EyeClosed className="absolute right-3 top-1/2 size-4 -translate-y-1/2 cursor-pointer text-green-700" onClick={toggleShow} />}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-green-800">Senha atual</label>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input value={currentPassword} type={show ? "text" : "password"} placeholder="Senha atual" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setCurrentPassword(e.target.value)} />
                {!show ? <Eye className="absolute right-3 top-1/2 size-4 -translate-y-1/2 cursor-pointer text-green-700" onClick={toggleShow} /> : <EyeClosed className="absolute right-3 top-1/2 size-4 -translate-y-1/2 cursor-pointer text-green-700" onClick={toggleShow} />}
              </div>
            </div>

            {passwordMessage && <span className={passwordStatus ? "text-sm text-green-600" : "text-sm text-red-600"}>{passwordMessage}</span>}
            <Button type="button" onClick={updatePassword} className="mt-auto self-start bg-green-800 text-base font-normal hover:bg-green-900 hover:shadow-lg">Atualizar senha</Button>
          </section>
        </div>

        <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm lg:p-6">
          <div>
            <div className="flex items-center gap-2 text-green-900"><Bell className="size-5" /><h2 className="text-lg font-semibold">Lembretes de vencimento</h2></div>
            <p className="mt-1 text-sm text-slate-600">Os avisos aparecem enquanto o EasyFinance estiver aberto.</p>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-green-800"><input type="checkbox" checked={reminderEnabled} onChange={event => setReminderEnabled(event.target.checked)} className="size-4 accent-green-800" />Ativar notificações</label>
          <div className="flex flex-wrap gap-3">
            {[7, 3, 1, 0].map(day => <label key={day} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"><input type="checkbox" checked={reminderDays.includes(day)} onChange={() => toggleReminderDay(day)} className="size-4 accent-green-800" />{day === 0 ? "No vencimento" : `${day} dia${day > 1 ? "s" : ""} antes`}</label>)}
          </div>
          {reminderMessage && <span className={reminderMessage.includes("salvas") ? "text-sm text-green-600" : "text-sm text-red-600"}>{reminderMessage}</span>}
          <Button type="button" onClick={updateReminders} className="self-start bg-green-800 text-base font-normal hover:bg-green-900 hover:shadow-lg">Salvar lembretes</Button>
        </section>
      </form>
    </div>
  </div>
)
 
}
