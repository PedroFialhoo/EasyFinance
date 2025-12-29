import { NavLink } from "react-router-dom"

function Sidebar({ links = [] }) {
    return (
        <nav className="bg-green-900 flex flex-col max-w-64 h-screen">
            <img src="/src/assets/images/logo-w.png" alt="Logo" className="mb-10"/>
            <ul className="flex flex-col gap-3.5 ml-9">
                {links.map((link) => (
                    <li key={link.name} className="">
                        <NavLink to={link.to} className="text-2xl gap-2.5 flex no-underline group items-center">
                            <i className="text-white group-hover:text-yellow-500">{link.icon}</i>
                            <span className="text-white group-hover:text-yellow-500">{link.name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default Sidebar
