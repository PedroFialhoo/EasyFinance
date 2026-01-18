import { createHashRouter } from "react-router-dom";
import Login from "@/pages/login/Login";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/home/Home";
import Bills from "@/pages/bills/Bills";
import Cards from "@/pages/cards/Cards";
import Settings from "@/pages/settings/Settings";
import BankHolder from "@/pages/cards/components/BankHolder";
import Category from "@/pages/bills/components/Category";
import Register from "@/pages/register/Register";

const Router = createHashRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "bills",
        element: <Bills />,
        children: [
          {
            path: "categories",
            element: <Category />,
          },
        ],
      },
      {
        path: "cards",
        element: <Cards />,
        children: [
          {
            path: "banks-holders",
            element: <BankHolder />,
          },
        ],
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

export default Router;
