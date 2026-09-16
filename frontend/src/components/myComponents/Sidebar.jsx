import { NavLink } from "react-router-dom"
import logo from "@/assets/images/logo-w.png";
import { Menu, X } from "lucide-react"
import { useState } from "react"

function Sidebar({ links = [], actions }) {
    const [open, setOpen] = useState(false)
    return (
        <nav className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-green-950/20 bg-green-900 px-4 py-3 shadow-md lg:flex-nowrap lg:px-8">
            <img src={logo} alt="Logo EasyFinance" className="w-28 self-center lg:w-32"/>
            <div className="order-2 flex items-center gap-2 lg:order-3">{actions}<button type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(value => !value)} className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden">{open ? <X /> : <Menu />}</button></div>
            <ul className={`${open ? "flex" : "hidden"} order-3 w-full flex-col gap-1 border-t border-white/15 pt-2 lg:order-2 lg:flex lg:w-auto lg:flex-1 lg:flex-row lg:justify-end lg:border-0 lg:pt-0`}>
                {links.map((link) => (
                    <li key={link.name} className="">
                        <NavLink to={link.to} onClick={(event) => { setOpen(false); link.onClick?.(event) }} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${isActive ? "bg-white/15 text-yellow-300" : "text-green-50 hover:bg-white/10 hover:text-white"}`}>
                            <i className="[&_svg]:size-6">{link.icon}</i>
                            <span>{link.name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default Sidebar
