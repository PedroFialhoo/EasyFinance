import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bell, DollarSign, Eye, EyeClosed, Lock, Mail, User } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/services/api"
import Feedback from "@/components/Feedback"

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
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [saving, setSaving] = useState(false)

    const toggleShow = () =>{
        setShow(!show)
    }

    const loadSettings = () => {
        setLoading(true)
        setLoadError(false)
        api.get("/user/get")
            .then(response => {
                setRevenue(response.data.revenue ?? "")
                setEmail(response.data.email)
                setUsername(response.data.username)
            })
            .catch(() => setLoadError(true))
            .finally(() => setLoading(false));
        api.get("/reminders/preferences")
            .then(response => {
                setReminderEnabled(response.data.enabled)
                setReminderDays(response.data.daysBeforeDue)
            })
            .catch(() => setLoadError(true))
    }

    useEffect(() => {
        Promise.resolve().then(loadSettings)
    }, []);

    const updateProfile = () => {
        if (saving) return
        const parsedRevenue = Number(revenue)
        if (revenue === "" || !Number.isFinite(parsedRevenue) || parsedRevenue < 0) {
            setProfileMessage("Informe uma receita maior ou igual a zero")
            setProfileStatus(false)
            return
        }
        setSaving(true)
        api.put('/user/update',{
            revenue: parsedRevenue,
            email,
            username,
        }).finally(() => setSaving(false))
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
        if (saving) return
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
        setSaving(true)
        api.put('/user/update-password',{
            currentPassword,
            newPassword: password,
        }).finally(() => setSaving(false))
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
        if (saving) return
        if (reminderEnabled && reminderDays.length === 0) {
            setReminderMessage("Selecione pelo menos um dia de aviso")
            return
        }
        setSaving(true)
        api.put("/reminders/preferences", { enabled: reminderEnabled, daysBeforeDue: reminderDays })
            .then(() => setReminderMessage("Preferências de lembrete salvas!"))
            .catch(err => setReminderMessage(err.response?.data || "Erro ao salvar lembretes"))
            .finally(() => setSaving(false))
    }

return (
  <main className="app-page">
    <div className="app-panel flex w-full justify-center bg-slate-50 p-4 lg:p-6">
      <form className="flex w-full flex-col gap-5" onSubmit={event => event.preventDefault()}>
        {loading && <p className="text-sm text-slate-600">Carregando configurações...</p>}
        {loadError && <div className="text-sm text-red-700">Não foi possível carregar as configurações. <Button type="button" variant="link" onClick={loadSettings}>Tentar novamente</Button></div>}
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
              <label htmlFor="settings-revenue" className="text-sm font-medium text-green-800">Receita mensal *</label>
              <div className="relative w-full">
                <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input id="settings-revenue" value={revenue} required type="number" min="0" step="0.01" placeholder="0,00" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setRevenue(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="settings-username" className="text-sm font-medium text-green-800">Nome de usuário *</label>
              <div className="relative w-full">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input id="settings-username" value={username} required type="text" placeholder="Usuário" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setUsername(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="settings-email" className="text-sm font-medium text-green-800">E-mail *</label>
              <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input id="settings-email" value={email} required type="email" placeholder="E-mail" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <Button type="button" disabled={saving} onClick={updateProfile} className="mt-auto self-start bg-green-800 text-base font-normal hover:bg-green-900 hover:shadow-lg">{saving ? "Salvando..." : "Salvar dados"}</Button>
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
              <label htmlFor="settings-password" className="text-sm font-medium text-green-800">Nova senha *</label>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input id="settings-password" value={password} required type={show ? "text" : "password"} placeholder="Nova senha" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setPassword(e.target.value)} />
                <button type="button" aria-label={show ? "Ocultar senhas" : "Mostrar senhas"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-green-700 hover:bg-green-100" onClick={toggleShow}>{show ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="settings-password-repeat" className="text-sm font-medium text-green-800">Confirmar nova senha *</label>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input id="settings-password-repeat" value={passwordRepeat} required aria-invalid={passwordRepeat && password !== passwordRepeat} type={show ? "text" : "password"} placeholder="Repita a nova senha" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setPasswordRepeat(e.target.value)} />
                <button type="button" aria-label={show ? "Ocultar senhas" : "Mostrar senhas"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-green-700 hover:bg-green-100" onClick={toggleShow}>{show ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="settings-current-password" className="text-sm font-medium text-green-800">Senha atual *</label>
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-green-800" />
                <Input id="settings-current-password" value={currentPassword} required type={show ? "text" : "password"} placeholder="Senha atual" className="h-11 bg-slate-50 pl-10 pr-10" onChange={(e) => setCurrentPassword(e.target.value)} />
                <button type="button" aria-label={show ? "Ocultar senhas" : "Mostrar senhas"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-green-700 hover:bg-green-100" onClick={toggleShow}>{show ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
            </div>

            <Button type="button" disabled={saving} onClick={updatePassword} className="mt-auto self-start bg-green-800 text-base font-normal hover:bg-green-900 hover:shadow-lg">{saving ? "Salvando..." : "Atualizar senha"}</Button>
          </section>
        </div>

        <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm lg:p-6">
          <div>
            <div className="flex items-center gap-2 text-green-900"><Bell className="size-5" /><h2 className="text-lg font-semibold">Lembretes de vencimento</h2></div>
            <p className="mt-1 text-sm text-slate-600">Os avisos aparecem enquanto o EasyFinance estiver aberto.</p>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-green-800"><input type="checkbox" checked={reminderEnabled} onChange={event => setReminderEnabled(event.target.checked)} className="size-4 accent-green-800" />Ativar notificações</label>
          <div className="flex flex-wrap gap-3">
            {[7, 3, 1, 0].map(day => <label key={day} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 has-[:disabled]:opacity-50"><input type="checkbox" disabled={!reminderEnabled} checked={reminderDays.includes(day)} onChange={() => toggleReminderDay(day)} className="size-4 accent-green-800" />{day === 0 ? "No vencimento" : `${day} dia${day > 1 ? "s" : ""} antes`}</label>)}
          </div>
          <Button type="button" disabled={saving} onClick={updateReminders} className="self-start bg-green-800 text-base font-normal hover:bg-green-900 hover:shadow-lg">{saving ? "Salvando..." : "Salvar lembretes"}</Button>
        </section>
      </form>
      <Feedback message={profileMessage || passwordMessage || reminderMessage} error={profileStatus === false || passwordStatus === false || (typeof reminderMessage === "string" && (reminderMessage.startsWith("Erro") || reminderMessage.startsWith("Selecione")))} />
    </div>
  </main>
)
 
}
