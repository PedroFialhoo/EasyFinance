import { NavLink } from "react-router-dom"
import logo from "@/assets/images/logo-w.png";

function Sidebar({ links = [] }) {
    return (
        <nav className="bg-green-800 flex flex-row w-screen min-h-24 p-4 items-center justify-between">
            <img src={logo} alt="Logo" className="w-[9%] h-[9%] self-baseline"/>
            <ul className="flex flex-row gap-10 mr-4">
                {links.map((link) => (
                    <li key={link.name} className="">
                        <NavLink to={link.to} className="text-2xl gap-2.5 flex no-underline group items-center">
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
