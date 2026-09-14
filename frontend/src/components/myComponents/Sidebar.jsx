import { NavLink } from "react-router-dom"
import logo from "@/assets/images/logo-w.png";

function Sidebar({ links = [] }) {
    return (
        <nav className="flex min-h-20 w-full items-center justify-between gap-6 bg-green-800 px-4 py-3 lg:px-6">
            <img src={logo} alt="Logo" className="w-28 self-center lg:w-36"/>
            <ul className="flex flex-wrap justify-end gap-x-4 gap-y-2 lg:gap-x-7 xl:gap-x-10">
                {links.map((link) => (
                    <li key={link.name} className="">
                        <NavLink to={link.to} onClick={link.onClick} className="group flex items-center gap-2 text-lg no-underline lg:text-xl xl:gap-2.5 xl:text-2xl">
                            <i className="text-white group-hover:text-yellow-500 group-hover:-translate-y-2 transition-transform">{link.icon}</i>
                            <span className="text-white group-hover:text-yellow-500 group-hover:-translate-y-2 transition-transform">{link.name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default Sidebar
