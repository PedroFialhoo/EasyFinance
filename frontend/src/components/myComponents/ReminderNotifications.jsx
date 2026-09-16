import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function message(reminder) {
  if (reminder.status === "OVERDUE") return `${reminder.name} está atrasada (${currency.format(reminder.value)}).`;
  if (reminder.status === "TODAY") return `${reminder.name} vence hoje (${currency.format(reminder.value)}).`;
  if (reminder.daysUntilDue === 1) return `${reminder.name} vence amanhã (${currency.format(reminder.value)}).`;
  return `${reminder.name} vence em ${reminder.daysUntilDue} dias (${currency.format(reminder.value)}).`;
}

export default function ReminderNotifications() {
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => api.get("/reminders/notifications")
      .then(response => response.data.forEach(reminder => {
        const payload = { title: "Lembrete EasyFinance", body: message(reminder), reminder };
        if (window.easyfinance?.showReminderNotification) {
          window.easyfinance.showReminderNotification(payload);
        } else if ("Notification" in window && Notification.permission === "granted") {
          new Notification(payload.title, { body: payload.body });
        }
      }))
      .catch(() => {});

    check();
    const interval = window.setInterval(check, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!window.easyfinance?.onOpenReminder) return;
    return window.easyfinance.onOpenReminder(reminder => {
      const [year, month] = reminder.dueDate.split("-");
      navigate(`/app/bills?year=${year}&month=${Number(month)}&billId=${reminder.billId}`);
    });
  }, [navigate]);

  return null;
}
