import { Bell, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function description(reminder) {
  if (reminder.status === "OVERDUE") return `Atrasada ha ${Math.abs(reminder.daysUntilDue)} dia(s)`;
  if (reminder.status === "TODAY") return "Vence hoje";
  return `Vence em ${reminder.daysUntilDue} dia(s)`;
}

export default function ReminderBell() {
  const [summary, setSummary] = useState({ pendingCount: 0, overdue: [], dueToday: [], upcoming: [] });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => api.get("/reminders/summary").then(response => setSummary(response.data)).catch(() => {});
    load();
    const interval = window.setInterval(load, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const reminders = [...summary.overdue, ...summary.dueToday, ...summary.upcoming].slice(0, 6);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(current => !current)} aria-label="Abrir lembretes" className="relative rounded-lg p-2 text-white transition-colors hover:bg-green-900 hover:text-yellow-500">
        <Bell className="size-6" />
        {summary.pendingCount > 0 && <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-green-950">{summary.pendingCount > 9 ? "9+" : summary.pendingCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <strong>Lembretes</strong>
            <button type="button" className="text-sm text-green-800 hover:underline" onClick={() => { setOpen(false); navigate("/app/calendar"); }}>Ver calendário</button>
          </div>
          {reminders.length === 0 ? <p className="px-1 py-4 text-sm text-slate-500">Nenhuma conta pendente nos próximos 7 dias.</p> : (
            <div className="space-y-1">
              {reminders.map(reminder => (
                <button key={reminder.installmentId} type="button" onClick={() => { setOpen(false); navigate("/app/bills"); }} className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-100">
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
