import Sidebar from "@/components/myComponents/Sidebar";
import { CalendarDays, CreditCard, House, LogOut, Receipt, Settings, WalletCards } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import ReminderBell from "@/components/myComponents/ReminderBell";
import ReminderNotifications from "@/components/myComponents/ReminderNotifications";

export default function AppLayout() {
  const navigate = useNavigate();

  const logout = async (event) => {
    event.preventDefault();

    try {
      await api.get("/auth/logout");
    } finally {
      navigate("/");
    }
  };

  const links = [
    { to: "/app/home", icon: <House />, name: "Home" },
    { to: "/app/bills", icon: <Receipt />, name: "Contas" },
    { to: "/app/cards", icon: <CreditCard />, name: "Cartões" },
    { to: "/app/balance", icon: <WalletCards />, name: "Saldo" },
    { to: "/app/calendar", icon: <CalendarDays />, name: "Calendário" },
    { to: "/app/settings", icon: <Settings />, name: "Configurações" },
    { to: "/", icon: <LogOut />, name: "Sair", onClick: logout },
  ];
  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(187,247,208,0.45),_transparent_32rem)]">
      <ReminderNotifications />
      <Sidebar links={links} actions={<ReminderBell />} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
