import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/login/Login";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/home/Home";
import Bills from "@/pages/bills/Bills";
import Cards from "@/pages/cards/Cards";
import Settings from "@/pages/settings/Settings";
import BankHolder from "@/pages/cards/components/BankHolder";
import Category from "@/pages/bills/components/Category";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
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
