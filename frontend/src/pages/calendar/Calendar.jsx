import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reminders/calendar", { params: { year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1 } })
      .then(response => setReminders(response.data))
      .catch(() => setReminders([]))
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
  const monthLabel = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <main className="mx-auto w-full max-w-7xl p-4 lg:p-8">
      <section className="rounded-2xl border border-slate-300 bg-slate-200 p-4 shadow-sm lg:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-2xl font-semibold text-green-900">Calendário financeiro</h1><p className="mt-1 text-sm text-slate-600">Acompanhe as contas pendentes por data de vencimento.</p></div>
          <div className="flex items-center gap-3 text-green-900">
            <button type="button" aria-label="Mês anterior" onClick={() => setCurrentMonth(date => new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ChevronLeft /></button>
            <strong className="w-44 text-center capitalize">{monthLabel}</strong>
            <button type="button" aria-label="Próximo mês" onClick={() => setCurrentMonth(date => new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ChevronRight /></button>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-600"><span><i className="mr-1 inline-block size-2 rounded-full bg-red-500" />Atrasada</span><span><i className="mr-1 inline-block size-2 rounded-full bg-amber-500" />Vence hoje</span><span><i className="mr-1 inline-block size-2 rounded-full bg-green-600" />A vencer</span></div>
        <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-300 bg-slate-300 gap-px">
          {weekdays.map(day => <div key={day} className="bg-slate-100 px-1 py-2 text-center text-xs font-semibold text-slate-600 sm:text-sm">{day}</div>)}
          {Array.from({ length: leadingDays }).map((_, index) => <div key={`empty-${index}`} className="min-h-24 bg-slate-100 sm:min-h-32" />)}
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(day => (
            <div key={day} className="min-h-24 bg-white p-1 sm:min-h-32 sm:p-2">
              <span className="text-xs font-semibold text-slate-600 sm:text-sm">{day}</span>
              <div className="mt-1 space-y-1">
                {(remindersByDay[day] || []).map(reminder => <div key={reminder.installmentId} title={`${reminder.name}: ${currency.format(reminder.value)}`} className={reminder.status === "OVERDUE" ? "truncate rounded bg-red-100 px-1 py-0.5 text-[10px] text-red-800 sm:text-xs" : reminder.status === "TODAY" ? "truncate rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-800 sm:text-xs" : "truncate rounded bg-green-100 px-1 py-0.5 text-[10px] text-green-800 sm:text-xs"}>{reminder.name} <span className="hidden sm:inline">{currency.format(reminder.value)}</span></div>)}
              </div>
            </div>
          ))}
        </div>
        {loading && <p className="mt-4 text-sm text-slate-500">Carregando vencimentos...</p>}
      </section>
    </main>
  );
}
