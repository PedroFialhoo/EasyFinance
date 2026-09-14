import { useEffect } from "react";
import { api } from "@/services/api";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function message(reminder) {
  if (reminder.status === "OVERDUE") return `${reminder.name} esta atrasada (${currency.format(reminder.value)}).`;
  if (reminder.status === "TODAY") return `${reminder.name} vence hoje (${currency.format(reminder.value)}).`;
  return `${reminder.name} vence em ${reminder.daysUntilDue} dia(s) (${currency.format(reminder.value)}).`;
}

export default function ReminderNotifications() {
  useEffect(() => {
    const check = () => api.get("/reminders/notifications")
      .then(response => response.data.forEach(reminder => {
        const payload = { title: "Lembrete EasyFinance", body: message(reminder) };
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

  return null;
}
