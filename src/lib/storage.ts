import { DOC_PREFIX, type Doc, type DocType, type Profile } from '../types'

const KEY = {
  profile: 'billngai:profile',
  draft: 'billngai:draft',
  docs: 'billngai:docs',
  counter: 'billngai:counter',
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** Returns false when the browser refuses to store (private mode, quota full). */
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

export const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const addDaysIso = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export const emptyProfile = (): Profile => ({
  name: '',
  address: '',
  taxId: '',
  branch: '',
  phone: '',
  email: '',
  logo: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNo: '',
  promptPay: '',
  signerName: '',
  accent: '#1f3a5f',
})

/** Next running number per type and month, e.g. QT-202611-003. Not consumed until the doc is saved. */
export function peekNumber(type: DocType, dateIso: string): string {
  const ym = dateIso.slice(0, 7).replace('-', '')
  const counters = read<Record<string, number>>(KEY.counter, {})
  const n = (counters[`${type}:${ym}`] ?? 0) + 1
  return `${DOC_PREFIX[type]}-${ym}-${String(n).padStart(3, '0')}`
}

function bumpNumber(doc: Doc) {
  const m = doc.number.match(/^([A-Z]+)-(\d{6})-(\d+)$/)
  if (!m || m[1] !== DOC_PREFIX[doc.type]) return
  const counters = read<Record<string, number>>(KEY.counter, {})
  const k = `${doc.type}:${m[2]}`
  counters[k] = Math.max(counters[k] ?? 0, Number(m[3]))
  write(KEY.counter, counters)
}

export function newDoc(type: DocType = 'quotation'): Doc {
  const date = todayIso()
  return {
    id: uid(),
    type,
    number: peekNumber(type, date),
    date,
    dueDate: type === 'receipt' ? '' : addDaysIso(date, type === 'quotation' ? 30 : 15),
    reference: '',
    customer: { name: '', address: '', taxId: '', branch: '', phone: '', email: '' },
    items: [{ id: uid(), description: '', qty: 1, unit: 'งาน', price: 0 }],
    discount: 0,
    vatMode: 'none',
    whtRate: 0,
    notes: '',
    showQr: true,
    updatedAt: Date.now(),
  }
}

export const loadProfile = () => ({ ...emptyProfile(), ...read<Partial<Profile>>(KEY.profile, {}) })
export const saveProfile = (p: Profile) => write(KEY.profile, p)

export const loadDraft = (): Doc | null => read<Doc | null>(KEY.draft, null)
export const saveDraft = (d: Doc) => write(KEY.draft, d)

export const loadDocs = (): Doc[] => read<Doc[]>(KEY.docs, [])

export function saveDoc(doc: Doc): { ok: boolean; docs: Doc[] } {
  const docs = loadDocs().filter((d) => d.id !== doc.id)
  docs.unshift({ ...doc, updatedAt: Date.now() })
  const ok = write(KEY.docs, docs)
  if (ok) bumpNumber(doc)
  return { ok, docs }
}

export function deleteDoc(id: string): Doc[] {
  const docs = loadDocs().filter((d) => d.id !== id)
  write(KEY.docs, docs)
  return docs
}

/** Copy a document into another type (quotation → invoice → receipt) with a fresh number. */
export function convertDoc(doc: Doc, type: DocType): Doc {
  const fresh = newDoc(type)
  return {
    ...doc,
    id: fresh.id,
    type,
    number: fresh.number,
    date: fresh.date,
    dueDate: fresh.dueDate,
    reference: doc.number,
    items: doc.items.map((it) => ({ ...it, id: uid() })),
    showQr: type !== 'receipt',
    updatedAt: Date.now(),
  }
}

export interface Backup {
  app: 'billngai'
  version: 1
  exportedAt: string
  profile: Profile
  docs: Doc[]
}

export function exportBackup(): Backup {
  return { app: 'billngai', version: 1, exportedAt: new Date().toISOString(), profile: loadProfile(), docs: loadDocs() }
}

/** Merge a backup file into local data. Throws on files that are not billngai backups. */
export function importBackup(data: unknown): { profile: Profile; docs: Doc[] } {
  const b = data as Partial<Backup>
  if (!b || b.app !== 'billngai' || !Array.isArray(b.docs)) throw new Error('ไฟล์นี้ไม่ใช่ไฟล์สำรองของบิลง่าย')
  const valid = b.docs.filter((d): d is Doc => !!d && typeof d.id === 'string' && Array.isArray(d.items))
  const existing = loadDocs()
  const ids = new Set(valid.map((d) => d.id))
  const docs = [...valid, ...existing.filter((d) => !ids.has(d.id))].sort((a, b) => b.updatedAt - a.updatedAt)
  write(KEY.docs, docs)
  valid.forEach(bumpNumber)
  const profile = { ...emptyProfile(), ...loadProfile(), ...(b.profile ?? {}) }
  saveProfile(profile)
  return { profile, docs }
}
