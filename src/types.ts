export type DocType = 'quotation' | 'invoice' | 'receipt'
export type VatMode = 'none' | 'exclusive' | 'inclusive'

export interface Party {
  name: string
  address: string
  taxId: string
  branch: string
  phone: string
  email: string
}

export interface Profile extends Party {
  logo: string // data URL, empty = none
  bankName: string
  bankAccountName: string
  bankAccountNo: string
  promptPay: string
  signerName: string
  accent: string
}

export interface LineItem {
  id: string
  description: string
  qty: number
  unit: string
  price: number
}

export interface Doc {
  id: string
  type: DocType
  number: string
  date: string // YYYY-MM-DD
  dueDate: string // valid-until for quotation, due date for invoice
  reference: string
  customer: Party
  items: LineItem[]
  discount: number
  vatMode: VatMode
  whtRate: number // percent, 0 = none
  notes: string
  showQr: boolean
  updatedAt: number
}

export const DOC_LABEL: Record<DocType, { th: string; en: string }> = {
  quotation: { th: 'ใบเสนอราคา', en: 'Quotation' },
  invoice: { th: 'ใบแจ้งหนี้ / ใบวางบิล', en: 'Invoice' },
  receipt: { th: 'ใบเสร็จรับเงิน', en: 'Receipt' },
}

export const DOC_PREFIX: Record<DocType, string> = {
  quotation: 'QT',
  invoice: 'INV',
  receipt: 'RE',
}
