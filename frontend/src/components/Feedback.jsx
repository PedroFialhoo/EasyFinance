export default function Feedback({ message, error = false }) {
  if (!message) return null

  return (
    <div className="pointer-events-none fixed inset-x-4 top-6 z-[100] flex justify-center" aria-live="polite" aria-atomic="true">
      <p role={error ? "alert" : "status"} className={error ? "rounded-lg bg-red-700 px-4 py-3 text-sm font-medium text-white shadow-lg" : "rounded-lg bg-green-800 px-4 py-3 text-sm font-medium text-white shadow-lg"}>{message}</p>
    </div>
  )
}
