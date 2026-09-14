import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  const amount = Number(value)
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0)
}

export function formatCurrencyInput(value) {
  const digits = String(value).replace(/\D/g, "")
  return digits ? formatCurrency(Number(digits) / 100) : ""
}

export function parseCurrencyInput(value) {
  const digits = String(value).replace(/\D/g, "")
  return digits ? Number(digits) / 100 : 0
}
