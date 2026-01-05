import Sidebar from "@/components/myComponents/Sidebar";
import { CreditCard, House, LogOut, Receipt, Settings } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const links = [
    { to: "/app/home", icon: <House />, name: "Home" },
    { to: "/app/bills", icon: <Receipt />, name: "Contas" },
    { to: "/app/cards", icon: <CreditCard />, name: "Cartões" },
    { to: "/app/settings", icon: <Settings />, name: "Configurações" },
    { to: "/", icon: <LogOut />, name: "Sair" },
  ];
  return (
    <div className="flex flex-col overflow-x-hidden">
      <Sidebar links={links} />
      <Outlet />
    </div>
  );
}
