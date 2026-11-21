import type { Doc, Profile } from '../types'
import { detectPromptPay } from './promptpay'

/** Things worth a second look before the paper goes out. None of them block printing. */
export function printWarnings(doc: Doc, profile: Profile): string[] {
  const w: string[] = []
  if (!profile.name.trim()) w.push('ยังไม่ได้ใส่ชื่อกิจการของคุณ หัวกระดาษจะขึ้นว่า “ชื่อกิจการของคุณ”')
  if (!doc.customer.name.trim()) w.push('ยังไม่ได้ใส่ชื่อลูกค้า')
  const filled = doc.items.filter((it) => it.description.trim() || it.price)
  if (filled.length === 0) w.push('ยังไม่มีรายการสินค้าหรือบริการ')
  const noPrice = filled.filter((it) => !it.price).length
  if (noPrice) w.push(`มี ${noPrice} รายการที่ราคาเป็น 0 บาท`)
  const noName = filled.filter((it) => !it.description.trim()).length
  if (noName) w.push(`มี ${noName} รายการที่ยังไม่มีชื่อ`)
  const taxBad = (id: string) => id.trim() !== '' && id.replace(/\D/g, '').length !== 13
  if (taxBad(doc.customer.taxId)) w.push('เลขผู้เสียภาษีของลูกค้าไม่ครบ 13 หลัก')
  if (taxBad(profile.taxId)) w.push('เลขผู้เสียภาษีของคุณไม่ครบ 13 หลัก')
  if (doc.showQr && doc.type !== 'receipt') {
    if (!profile.promptPay.trim()) w.push('เปิดแสดง QR พร้อมเพย์ไว้ แต่ยังไม่ได้ใส่เบอร์หรือเลขพร้อมเพย์ จึงจะไม่มี QR บนเอกสาร')
    else if (!detectPromptPay(profile.promptPay)) w.push('เลขพร้อมเพย์ไม่ถูกต้อง QR จะไม่แสดงบนเอกสาร')
  }
  return w
}

export const pdfName = (doc: Doc) => [doc.number, doc.customer.name.trim()].filter(Boolean).join(' ')
