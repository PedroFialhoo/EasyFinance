import { Bell, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function description(reminder) {
  if (reminder.status === "OVERDUE") {
    const days = Math.abs(reminder.daysUntilDue);
    return `Atrasada há ${days} ${days === 1 ? "dia" : "dias"}`;
  }
  if (reminder.status === "TODAY") return "Vence hoje";
  if (reminder.daysUntilDue === 1) return "Vence amanhã";
  return `Vence em ${reminder.daysUntilDue} dias`;
}

function billPath(reminder) {
  const [year, month] = reminder.dueDate.split("-");
  return `/app/bills?year=${year}&month=${Number(month)}&billId=${reminder.billId}`;
}

export default function ReminderBell() {
  const [summary, setSummary] = useState({ pendingCount: 0, overdue: [], dueToday: [], upcoming: [] });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const refreshSummary = () => api.get("/reminders/summary").then(response => {
    const dismissed = new Set(JSON.parse(localStorage.getItem("dismissed-reminders") || "[]"));
    const filterDismissed = reminders => reminders.filter(reminder => !dismissed.has(reminder.installmentId));
    const overdue = filterDismissed(response.data.overdue);
    const dueToday = filterDismissed(response.data.dueToday);
    const upcoming = filterDismissed(response.data.upcoming);
    setSummary({ pendingCount: overdue.length + dueToday.length + upcoming.length, overdue, dueToday, upcoming });
  }).catch(() => {});

  useEffect(() => {
    const load = () => refreshSummary();
    load();
    const interval = window.setInterval(load, 5 * 60 * 1000);
    window.addEventListener("reminders-updated", load);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("reminders-updated", load);
    };
  }, []);

  const allReminders = [...summary.overdue, ...summary.dueToday, ...summary.upcoming];
  const reminders = allReminders.slice(0, 6);

  const clearReminders = () => {
    const dismissed = new Set(JSON.parse(localStorage.getItem("dismissed-reminders") || "[]"));
    allReminders.forEach(reminder => dismissed.add(reminder.installmentId));
    localStorage.setItem("dismissed-reminders", JSON.stringify([...dismissed]));
    setSummary({ pendingCount: 0, overdue: [], dueToday: [], upcoming: [] });
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => { refreshSummary(); setOpen(current => !current); }} aria-label="Abrir lembretes" className="relative rounded-lg p-2 text-white transition-colors hover:bg-green-900 hover:text-yellow-500">
        <Bell className="size-6" />
        {summary.pendingCount > 0 && <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-green-950">{summary.pendingCount > 9 ? "9+" : summary.pendingCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <strong>Lembretes</strong>
            <div className="flex items-center gap-3"><button type="button" className="text-sm text-green-800 hover:underline" onClick={clearReminders}>Limpar</button><button type="button" className="text-sm text-green-800 hover:underline" onClick={() => { setOpen(false); navigate("/app/calendar"); }}>Ver calendário</button></div>
          </div>
          {reminders.length === 0 ? <p className="px-1 py-4 text-sm text-slate-500">Nenhuma conta pendente nos próximos 7 dias.</p> : (
            <div className="space-y-1">
              {reminders.map(reminder => (
                <button key={reminder.installmentId} type="button" onClick={() => { setOpen(false); navigate(billPath(reminder)); }} className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-100">
                  <CircleAlert className={reminder.status === "OVERDUE" ? "mt-0.5 size-4 shrink-0 text-red-600" : "mt-0.5 size-4 shrink-0 text-amber-600"} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{reminder.name}</span>
                    <span className="block text-xs text-slate-500">{description(reminder)} · {currency.format(reminder.value)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
