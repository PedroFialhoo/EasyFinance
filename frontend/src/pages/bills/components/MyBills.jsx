import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import BillCard from "./BillCard";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MyBills({ onAdd, reload }){
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [bills, setBills] = useState([])
  const [name, setName] = useState("")

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return { month: now.getMonth(), year: now.getFullYear() }
  })

  const monthLabel = new Date(
    currentDate.year,
    currentDate.month
  ).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  const prevMonth = () => {
    setCurrentDate((prev) =>
      prev.month === 0
        ? { month: 11, year: prev.year - 1 }
        : { ...prev, month: prev.month - 1 }
    )
  }

  const nextMonth = () => {
    setCurrentDate((prev) =>
      prev.month === 11
        ? { month: 0, year: prev.year + 1 }
        : { ...prev, month: prev.month + 1 }
    )
  }

  const filteredBills = bills.filter(bill =>
    bill.name.toLowerCase().includes(name.toLowerCase())
  )

  useEffect(() => {
    api
      .post("/bill/get/byMonth", {        
          month: currentDate.month + 1,
          year: currentDate.year,
          categoryId:
            selectedCategory && selectedCategory !== "all"
              ? Number(selectedCategory)
              : undefined
      })
      .then((res) => setBills(res.data))
      .catch((err) => console.log(err))
  }, [currentDate, selectedCategory, reload])

  useEffect(() => {
    api
      .get("/category/getAll")
      .then((response) => setCategories(response.data))
      .catch((err) => console.log("Erro:", err))
  }, [])

  return (
    <div className="bg-slate-200 rounded-xl p-4">
      <div className="p-4 mb-3 flex justify-between items-center">
        <h1 className="font-bold text-2xl text-green-800">Minhas Contas</h1>

        <Button className="bg-green-800 text-lg hover:bg-green-900" onClick={onAdd}>
          Adicionar Conta +
        </Button>
      </div>

      <div className="flex items-center justify-center gap-6 mb-4">
        <ArrowLeft onClick={prevMonth} className="text-green-800 hover:text-green-900 cursor-pointer" />

        <span className="w-64 text-center capitalize font-semibold text-2xl text-green-800">
          {monthLabel}
        </span>

        <ArrowRight onClick={nextMonth} className="text-green-800 hover:text-green-900 cursor-pointer" />
      </div>

      <div className="p-4">
        <div className="flex items-baseline gap-6 mb-6">
          <div className="relative ml-10 w-[30%]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800" />
              <Input value={name} type="text" placeholder="Nome da conta" className="h-10 pl-10 pr-10 text-base! bg-slate-100" onChange={(e) => setName(e.target.value)}/>
          </div>
          <div className="w-[20%] mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-10 w-full capitalize bg-slate-100">
                <SelectValue placeholder="Selecione uma Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id.toString()}
                    className="capitalize"
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>          
        </div>
        

        <div className="flex gap-3 flex-wrap pl-10">
          {filteredBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      </div>
    </div>
  )
}
