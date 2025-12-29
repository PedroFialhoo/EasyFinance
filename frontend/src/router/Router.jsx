import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/login/Login";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/home/Home";
import Bills from "@/pages/bills/Bills";
import Cards from "@/pages/cards/Cards";
import Settings from "@/pages/settings/Settings";

const Router = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    },
    {
        path: "/app",
        element: <AppLayout />,
        children:[
            {
                path: "home",
                element: <Home />
            },
            {
                path: "bills",
                element: <Bills />
            },
            {
                path: "cards",
                element: <Cards />
            },
            {
                path: "settings",
                element: <Settings />
            }
        ]
    }
])

export default Router
