import type { Doc, LineItem } from '../types'

export const VAT_RATE = 7

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export const lineAmount = (it: LineItem) => round2((Number(it.qty) || 0) * (Number(it.price) || 0))

export interface Totals {
  subtotal: number
  discount: number
  afterDiscount: number
  /** Amount before VAT; withholding tax is calculated on this. */
  base: number
  vat: number
  total: number
  wht: number
  /** What the customer actually transfers (total − withholding tax). */
  net: number
}

export function computeTotals(doc: Pick<Doc, 'items' | 'discount' | 'vatMode' | 'whtRate'>): Totals {
  const subtotal = round2(doc.items.reduce((s, it) => s + lineAmount(it), 0))
  const discount = Math.min(Math.max(0, round2(Number(doc.discount) || 0)), subtotal)
  const afterDiscount = round2(subtotal - discount)

  let base = afterDiscount
  let vat = 0
  let total = afterDiscount
  if (doc.vatMode === 'exclusive') {
    vat = round2((afterDiscount * VAT_RATE) / 100)
    total = round2(afterDiscount + vat)
  } else if (doc.vatMode === 'inclusive') {
    base = round2((afterDiscount * 100) / (100 + VAT_RATE))
    vat = round2(afterDiscount - base)
  }

  const wht = round2((base * (Number(doc.whtRate) || 0)) / 100)
  const net = round2(total - wht)
  return { subtotal, discount, afterDiscount, base, vat, total, wht, net }
}

const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtMoney = (n: number) => money.format(n)

const qtyFmt = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 })
export const fmtQty = (n: number) => qtyFmt.format(n)

/** "2026-11-17" → "17 พฤศจิกายน 2569" (Buddhist year). */
export function fmtThaiDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, d),
  )
}
