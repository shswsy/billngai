import { useEffect, useRef, useState } from 'react'
import type { Doc, DocType } from '../types'
import { computeTotals, fmtMoney, fmtThaiDate } from '../lib/calc'
import { IconArrowRight, IconClose, IconDownload, IconSearch, IconUpload } from './icons'

const NEXT: Record<DocType, DocType | null> = { quotation: 'invoice', invoice: 'receipt', receipt: null }
const SHORT: Record<DocType, string> = { quotation: 'ใบเสนอราคา', invoice: 'ใบแจ้งหนี้', receipt: 'ใบเสร็จ' }

interface Props {
  open: boolean
  docs: Doc[]
  currentId: string
  onClose: () => void
  onOpen: (d: Doc) => void
  onConvert: (d: Doc, t: DocType) => void
  onDelete: (id: string) => void
  onExport: () => void
  onImport: (file: File) => void
}

export function DocsPanel({ open, docs, currentId, onClose, onOpen, onConvert, onDelete, onExport, onImport }: Props) {
  const [q, setQ] = useState('')
  const [confirmId, setConfirmId] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const needle = q.trim().toLowerCase()
  const shown = needle
    ? docs.filter((d) => (d.number + ' ' + d.customer.name).toLowerCase().includes(needle))
    : docs

  return (
    <div className={open ? 'drawer open' : 'drawer'} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label="เอกสารของฉัน">
        <header className="drawer-head">
          <div>
            <h2>เอกสารของฉัน</h2>
            <p className="drawer-sub">{docs.length} เอกสารที่บันทึกไว้</p>
          </div>
          <button ref={closeRef} type="button" className="icon-btn" aria-label="ปิด" onClick={onClose}>
            <IconClose />
          </button>
        </header>
        <label className="drawer-search">
          <IconSearch width={18} height={18} />
          <input
            type="search"
            placeholder="ค้นหาเลขที่ หรือชื่อลูกค้า"
            value={q}
            aria-label="ค้นหาเอกสาร"
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        {docs.length === 0 ? (
          <p className="drawer-empty">ยังไม่มีเอกสารที่บันทึกไว้ กด “บันทึก” หรือ “พิมพ์ / PDF” แล้วเอกสารจะมาอยู่ที่นี่</p>
        ) : (
          <ul className="doc-list">
            {shown.map((d) => {
              const next = NEXT[d.type]
              return (
                <li key={d.id} className={d.id === currentId ? 'doc-card current' : 'doc-card'}>
                  <button type="button" className="doc-main" onClick={() => onOpen(d)}>
                    <span className={`badge badge-${d.type}`}>{SHORT[d.type]}</span>
                    <span className="doc-no mono">{d.number}</span>
                    <span className="doc-cust">{d.customer.name || 'ไม่ระบุลูกค้า'}</span>
                    <span className="doc-sub">
                      {fmtThaiDate(d.date)} · <span className="mono">{fmtMoney(computeTotals(d).total)} ฿</span>
                    </span>
                  </button>
                  <div className="doc-actions">
                    {next && (
                      <button type="button" onClick={() => onConvert(d, next)}>
                        ทำเป็น{SHORT[next]} <IconArrowRight width={15} height={15} />
                      </button>
                    )}
                    {confirmId === d.id ? (
                      <button
                        type="button"
                        className="danger solid"
                        onClick={() => {
                          onDelete(d.id)
                          setConfirmId('')
                        }}
                      >
                        ยืนยันลบ
                      </button>
                    ) : (
                      <button type="button" className="danger" onClick={() => setConfirmId(d.id)}>
                        ลบ
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
            {shown.length === 0 && <li className="drawer-empty">ไม่พบเอกสารที่ค้นหา</li>}
          </ul>
        )}
        <footer className="drawer-foot">
          <p>
            ข้อมูลทั้งหมดเก็บในเบราว์เซอร์นี้เท่านั้น ไม่ถูกส่งไปที่ใด สำรองไว้เป็นไฟล์เพื่อย้ายเครื่องหรือกันข้อมูลหาย
          </p>
          <div className="drawer-foot-btns">
            <button type="button" onClick={onExport}>
              <IconDownload width={16} height={16} /> ดาวน์โหลดไฟล์สำรอง
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}>
              <IconUpload width={16} height={16} /> นำเข้าไฟล์สำรอง
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) onImport(f)
              }}
            />
          </div>
        </footer>
      </aside>
    </div>
  )
}
