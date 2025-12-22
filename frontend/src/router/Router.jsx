import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/login/Login";

const Router = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    }
])

export default Router
