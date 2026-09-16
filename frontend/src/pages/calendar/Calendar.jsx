import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadReminders = () => {
    setLoading(true);
    setError("");
    api.get("/reminders/calendar", { params: { year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1 } })
      .then(response => {
        setReminders(response.data);
        setError("");
      })
      .catch(() => {
        setReminders([]);
        setError("Não foi possível carregar os vencimentos.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get("/reminders/calendar", { params: { year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1 } })
      .then(response => {
        setReminders(response.data);
        setError("");
      })
      .catch(() => {
        setReminders([]);
        setError("Não foi possível carregar os vencimentos.");
      })
      .finally(() => setLoading(false));
  }, [currentMonth]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = new Date(year, month, 1).getDay();
  const remindersByDay = reminders.reduce((groups, reminder) => {
    const day = new Date(`${reminder.dueDate}T00:00:00`).getDate();
    groups[day] = [...(groups[day] || []), reminder];
    return groups;
  }, {});
  const selectedMonth = `${year}-${String(month + 1).padStart(2, "0")}`;

  const changeMonth = (event) => {
    const [selectedYear, selectedMonthNumber] = event.target.value.split("-").map(Number);
    if (selectedYear && selectedMonthNumber) {
      setLoading(true);
      setCurrentMonth(new Date(selectedYear, selectedMonthNumber - 1, 1));
    }
  };
  const changeMonthBy = (amount) => {
    setLoading(true);
    setCurrentMonth(date => new Date(date.getFullYear(), date.getMonth() + amount, 1));
  };
  const openReminder = (reminder) => navigate(`/app/bills?billId=${reminder.billId}&month=${month + 1}&year=${year}`);
  const reminderClass = (reminder) => reminder.status === "OVERDUE" ? "bg-red-100 text-red-800" : reminder.status === "TODAY" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800";

  return (
    <main className="app-page">
      <section className="rounded-2xl border border-slate-300 bg-slate-200 p-4 shadow-sm lg:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-2xl font-semibold text-green-900">Calendário financeiro</h1><p className="mt-1 text-sm text-slate-600">Acompanhe as contas pendentes por data de vencimento.</p></div>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-green-900 shadow-sm">
            <button type="button" aria-label="Mês anterior" onClick={() => changeMonthBy(-1)}><ChevronLeft /></button>
            <label className="relative flex items-center">
              <CalendarDays className="pointer-events-none absolute left-3 size-4 text-green-800" />
              <Input aria-label="Selecionar mês" type="month" value={selectedMonth} onChange={changeMonth} className="h-9 w-50 border-0 bg-transparent pl-9 text-sm font-medium text-green-900 shadow-none" />
            </label>
            <button type="button" aria-label="Próximo mês" onClick={() => changeMonthBy(1)}><ChevronRight /></button>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-600"><span><i className="mr-1 inline-block size-2 rounded-full bg-red-500" />Atrasada</span><span><i className="mr-1 inline-block size-2 rounded-full bg-amber-500" />Vence hoje</span><span><i className="mr-1 inline-block size-2 rounded-full bg-green-600" />A vencer</span></div>
        {!loading && !error && reminders.length > 0 && <div className="hidden grid-cols-7 overflow-hidden rounded-xl border border-slate-300 bg-slate-300 sm:grid gap-px">
          {weekdays.map(day => <div key={day} className="bg-slate-100 px-1 py-2 text-center text-xs font-semibold text-slate-600 sm:text-sm">{day}</div>)}
          {Array.from({ length: leadingDays }).map((_, index) => <div key={`empty-${index}`} className="min-h-22 bg-slate-100 sm:min-h-28" />)}
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(day => (
            <div key={day} className="min-h-22 bg-white p-1 sm:min-h-28 sm:p-2">
              <span className="text-xs font-semibold text-slate-600 sm:text-sm">{day}</span>
              <div className="mt-1 space-y-1">
                {(remindersByDay[day] || []).map(reminder => <button type="button" key={reminder.installmentId} title={`${reminder.name}: ${currency.format(reminder.value)}`} aria-label={`Abrir conta ${reminder.name}, vencimento em ${reminder.dueDate}`} onClick={() => openReminder(reminder)} className={`block w-full truncate rounded px-1 py-0.5 text-left text-[10px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-800 sm:text-xs ${reminderClass(reminder)}`}>{reminder.name} <span className="hidden sm:inline">{currency.format(reminder.value)}</span></button>)}
              </div>
            </div>
          ))}
        </div>}
        {!loading && !error && reminders.length > 0 && <div className="space-y-2 sm:hidden">{reminders.map(reminder => <button type="button" key={reminder.installmentId} onClick={() => openReminder(reminder)} className={`flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 ${reminderClass(reminder)}`}><span><strong className="block">{reminder.name}</strong>{new Date(`${reminder.dueDate}T00:00:00`).toLocaleDateString("pt-BR")}</span><span className="font-semibold">{currency.format(reminder.value)}</span></button>)}</div>}
        {loading && <p role="status" className="mt-4 text-sm text-slate-500">Carregando vencimentos...</p>}
        {!loading && error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} <Button type="button" size="sm" variant="outline" className="ml-2" onClick={loadReminders}>Tentar novamente</Button></div>}
        {!loading && !error && reminders.length === 0 && <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">Nenhuma conta pendente neste mês.</p>}
      </section>
    </main>
  );
}
