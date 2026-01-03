import Sidebar from "@/components/myComponents/Sidebar";
import { CreditCard, House, Landmark, LogOut, Receipt, Settings, User } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function AppLayout(){
    const links = [
    { to: "/app/home", icon: <House />, name: "Home" },
    { to: "/app/bills", icon: <Receipt />, name: "Contas" },
    { to: "/app/cards", icon: <CreditCard />, name: "Cartões" },
    { to: "/app/banks", icon: <Landmark />, name: "Bancos" },
    { to: "/app/holders", icon: <User />, name: "Titulares" },
    { to: "/app/settings", icon: <Settings />, name: "Configurações" },
    { to: "/", icon: <LogOut />, name: "Sair" },
    ]
    return(
        <div className="flex flex-col overflow-x-hidden">
            <Sidebar links={links} />
            <Outlet />
        </div>        
    )
}