import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import BillReportDocument from "./BillReportDocument"
import { createBillReportHtml } from "./billReport"

export default function BillPdfPreview({ open, onOpenChange, rows, period, filters, defaultName, groupByMonth }) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const savePdf = async () => {
    if (!window.easyfinance?.savePdfReport) {
      setMessage("A exportação em PDF está disponível apenas no aplicativo EasyFinance.")
      return
    }
    setSaving(true)
    setMessage("")
    try {
      const result = await window.easyfinance.savePdfReport({ html: createBillReportHtml({ rows, period, filters, groupByMonth }), defaultName })
      if (!result.cancelled) setMessage(`PDF salvo em ${result.filePath}`)
    } catch {
      setMessage("Não foi possível salvar o PDF. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent className="h-[calc(100dvh-2rem)] max-w-[calc(100%-2rem)] overflow-hidden sm:max-w-[calc(100%-2rem)]"><AlertDialogHeader><AlertDialogTitle>Prévia do relatório em A4</AlertDialogTitle></AlertDialogHeader><div className="min-h-0 flex-1 overflow-auto rounded-lg bg-slate-200 p-4"><BillReportDocument rows={rows} period={period} filters={filters} groupByMonth={groupByMonth} /></div>{message && <p role="status" className="text-sm text-green-800">{message}</p>}<AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><Button type="button" disabled={saving} onClick={savePdf}>{saving ? "Salvando..." : "Salvar PDF"}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
}
