import { Pencil, Trash } from "lucide-react";

export default function BHCard({name = ""}) {
  return (
    <div className="flex justify-between w-full bg-slate-200 p-6 rounded-2xl gap-2">
      <h1 className="text-xl text-green-800 capitalize">{name}</h1>
      <div className="flex gap-2">
        <Pencil size={25} className="text-green-800 hover:text-blue-900" />
        <Trash size={25} className="text-green-800 hover:text-red-900" />
      </div>
    </div>
  );
}
