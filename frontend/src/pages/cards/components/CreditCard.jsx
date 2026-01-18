export default function CreditCard({id = "", bank = "", name = "", number = "", edit = false, onEdit, setCard}) {  
    const coresBancos = {
        nubank: "bg-[#8A05BE]",
        itaú: "bg-[#FF6200]",
        bradesco: "bg-[#CC092F]",
        santander: "bg-[#EC0000]",
        inter: "bg-[#FF7A00]",
        caixa: "bg-[#005CA9]",
        bb: "bg-[#FCF800] text-blue-900!",
    }

    const corBg = coresBancos[bank.toLowerCase()] || "bg-slate-700"

    const editCard = () => {
        if(edit && onEdit){
            setCard({id, bank, name, number})
            onEdit()
        }
    }

    return (
        <div className={`${corBg} w-84 min-h-48 rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between transition-all duration-500 hover:-translate-y-3`} onClick={editCard}>
            <div className="flex justify-between items-start">
                <span className="font-bold text-lg italic tracking-tight capitalize">{bank}</span>
                <div className="w-10 h-8 bg-yellow-400/80 rounded-md shadow-inner"></div>
            </div>

            <div className="text-xl tracking-[0.2em] font-mono drop-shadow-md">
                XXXX XXXX XXXX {number}
            </div>

            <div className="flex justify-between items-end">
                <div className="w-full">
                <p className="text-[10px] uppercase opacity font-semibold">nome do titular</p>
                <p className="font-semibold tracking-wider capitalize wrap-break-word overflow-hidden text-xl">
                    {name}
                </p>
                </div>
            </div>
        </div>
    );
}
