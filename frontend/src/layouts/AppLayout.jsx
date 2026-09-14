import Sidebar from "@/components/myComponents/Sidebar";
import { CreditCard, House, LogOut, Receipt, Settings } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { api } from "@/services/api";

const REMEMBERED_CREDENTIALS_KEY = "easyfinance.rememberedCredentials";

export default function AppLayout() {
  const navigate = useNavigate();

  const logout = async (event) => {
    event.preventDefault();

    try {
      await api.get("/auth/logout");
    } finally {
      localStorage.removeItem(REMEMBERED_CREDENTIALS_KEY);
      navigate("/");
    }
  };

  const links = [
    { to: "/app/home", icon: <House />, name: "Home" },
    { to: "/app/bills", icon: <Receipt />, name: "Contas" },
    { to: "/app/cards", icon: <CreditCard />, name: "Cartões" },
    { to: "/app/settings", icon: <Settings />, name: "Configurações" },
    { to: "/", icon: <LogOut />, name: "Sair", onClick: logout },
  ];
  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-hidden">
      <Sidebar links={links} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
