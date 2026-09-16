import { Pencil, Trash } from "lucide-react";

export default function CategoryCard({
    id,
    name,
    setIsActiveEdit,
    setIsActiveDelete,
    setId,
    setName
}){
  return (
    <div className="group flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-all hover:border-green-200 hover:shadow-md">
      <h2 className="min-w-0 truncate text-sm font-semibold text-green-900 capitalize" title={name}>{name}</h2>
      <div className="flex shrink-0 gap-1 opacity-80 transition-opacity group-hover:opacity-100">
        <button type="button" aria-label={`Editar ${name}`} title="Editar" className="rounded-lg p-2 text-green-800 hover:bg-green-100" onClick={() => {
          setId(id)
          setName(name)
          setIsActiveEdit(true)
        }}><Pencil className="size-4" /></button>
        <button type="button" aria-label={`Excluir ${name}`} title="Excluir" className="rounded-lg p-2 text-red-700 hover:bg-red-50" onClick={() => {
          setId(id)
          setName(name)
          setIsActiveDelete(true)
        }}><Trash className="size-4" /></button>
      </div>
    </div>
  );
}
