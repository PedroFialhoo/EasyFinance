import { api } from "@/services/api"
import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedLayout() {
  const [authenticated, setAuthenticated] = useState(null)

  useEffect(() => {
    api.get("/user/get")
      .then(response => setAuthenticated(Boolean(response.data)))
      .catch(() => setAuthenticated(false))
  }, [])

  if (authenticated === null) {
    return <main className="flex min-h-dvh items-center justify-center bg-slate-50 text-sm text-slate-600">Verificando sua sessão...</main>
  }

  return authenticated ? <Outlet /> : <Navigate to="/" replace />
}
