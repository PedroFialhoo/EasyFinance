import { Pencil, Trash } from "lucide-react";

export default function BHCard({
  id,
  name,
  type,
  setIsActiveEdit,
  setIsActiveDelete,
  setId,
  setType,
  setName
}) {
  return (
    <div className="flex w-full justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl text-green-800 capitalize">{name}</h1>
      <div className="flex gap-2">
        <Pencil size={25} className="text-green-800 hover:text-blue-900" onClick={() => {
          setId(id)
          setType(type)
          setName(name)
          setIsActiveEdit(true)
        }}
      />
        <Trash size={25} className="text-green-800 hover:text-red-900" onClick={() => {
          setId(id)
          setType(type)     
          setName(name)     
          setIsActiveDelete(true)
        }}/>
      </div>
    </div>
  );
}
