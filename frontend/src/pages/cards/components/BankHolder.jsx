import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BHCard from "./BHCard";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function BankHolder() {
  const navigate = useNavigate()
  const [banks, setBanks] = useState([])
  const [holders, setHolders] = useState([])
  useEffect(() => {
      api.get("/bank/getAll")
        .then(response => setBanks(response.data))
        .catch(err => console.log("Erro:", err));
    }, []);

  useEffect(() => {
    api.get("/holder/getAll")
      .then(response => setHolders(response.data))
      .catch(err => console.log("Erro:", err));
  }, []);
  return (
    <div className="bg-slate-200 rounded-xl p-8">
      <div className="flex justify-between items-baseline">
        <h1 className="font-bold text-2xl text-green-800">Bancos e Titulares</h1> 
        <X className="text-green-700 hover:text-green-950" onClick={() => navigate('/app/cards')}/>             
      </div>      
      <div className="flex min-h-36 mt-6 gap-8 justify-center">
        <div className="bg-slate-100 rounded-2xl w-[40%] p-4 shadow-md flex flex-col">
          <h1 className="font-bold text-2xl text-green-800 text-center">Bancos</h1> 
          <div className="grid grid-cols-2 gap-5 mt-4 w-full place-items-center">
            {
              banks.map((bank) =>(
                <BHCard name={bank.name} key={bank.id}/>
              ))
            }            
          </div>
          <Button type="button" className="bg-green-800 self-center mt-3 text-lg font-normal hover:bg-green-900 hover:shadow-2xl">Adicionar Banco <span className="font-semibold text-xl">+</span></Button> 
        </div>
        <div className="bg-slate-100 rounded-2xl w-[40%] p-4 shadow-md flex flex-col">
          <h1 className="font-bold text-2xl text-green-800 text-center">Titulares</h1> 
          <div className="grid grid-cols-2 gap-5 mt-4 w-full place-items-center">
            {
              holders.map((holder) =>(
                <BHCard name={holder.name} key={holder.id}/>
              ))
            }            
          </div>
          <Button type="button" className="bg-green-800 self-center mt-3 text-lg font-normal hover:bg-green-900 hover:shadow-2xl">Adicionar Titular <span className="font-semibold text-xl">+</span></Button> 
        </div>
      </div>  
 
    </div>
  );
}
