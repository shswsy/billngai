import { useEffect, useRef } from 'react'
import { DOC_LABEL, type Doc, type DocType, type Profile } from '../types'
import { computeTotals, fmtMoney } from '../lib/calc'
import { pdfName, printWarnings } from '../lib/printCheck'
import { IconAlert, IconArrowRight, IconCheck, IconClose, IconPlus, IconPrint } from './icons'

const NEXT: Record<DocType, DocType | null> = { quotation: 'invoice', invoice: 'receipt', receipt: null }
const SHORT: Record<DocType, string> = { quotation: 'ใบเสนอราคา', invoice: 'ใบแจ้งหนี้', receipt: 'ใบเสร็จ' }

interface Props {
  /** 'check' before printing, 'done' after the print dialog closes, null when hidden */
  stage: 'check' | 'done' | null
  doc: Doc
  profile: Profile
  onPrint: () => void
  onClose: () => void
  onNext: (t: DocType) => void
  onNew: () => void
}

export function PrintCheck({ stage, doc, profile, onPrint, onClose, onNext, onNew }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (stage && !d.open) d.showModal()
    if (!stage && d.open) d.close()
  }, [stage])

  const totals = computeTotals(doc)
  const warnings = printWarnings(doc, profile)
  const next = NEXT[doc.type]
  const label = DOC_LABEL[doc.type].th

  return (
    <dialog
      ref={ref}
      className="print-check"
      aria-labelledby="pc-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {stage === 'done' ? (
        <div className="pc-body">
          <header className="pc-head">
            <span className="pc-mark pc-mark-ok">
              <IconCheck width={22} height={22} />
            </span>
            <div>
              <h2 id="pc-title">ปิดหน้าต่างพิมพ์แล้ว</h2>
              <p>
                {label} <span className="mono">{doc.number}</span> บันทึกไว้ใน “เอกสารของฉัน” แล้ว
              </p>
            </div>
          </header>
          <p className="pc-note">
            ถ้าเลือก “บันทึกเป็น PDF” ไฟล์ชื่อ <b>{pdfName(doc)}.pdf</b> จะอยู่ในโฟลเดอร์ดาวน์โหลด ถ้ากดยกเลิกไป
            ก็พิมพ์ใหม่ได้ทุกเมื่อ
          </p>
          <div className="pc-actions">
            {next && (
              <button type="button" className="btn btn-primary" onClick={() => onNext(next)}>
                ออก{SHORT[next]}จากใบนี้ <IconArrowRight />
              </button>
            )}
            <button type="button" className={next ? 'btn btn-soft' : 'btn btn-primary'} onClick={onNew}>
              <IconPlus /> เอกสารใหม่
            </button>
            <button type="button" className="btn btn-soft" onClick={onPrint}>
              <IconPrint /> พิมพ์อีกครั้ง
            </button>
            <button type="button" className="btn btn-quiet" onClick={onClose}>
              ปิด
            </button>
          </div>
        </div>
      ) : stage === 'check' ? (
        <div className="pc-body">
          <header className="pc-head">
            <span className="pc-mark">
              <IconPrint width={22} height={22} />
            </span>
            <div>
              <h2 id="pc-title">ตรวจก่อนพิมพ์</h2>
              <p>
                {label} <span className="mono">{doc.number}</span>
              </p>
            </div>
            <button type="button" className="icon-btn pc-x" aria-label="ปิด" onClick={onClose}>
              <IconClose />
            </button>
          </header>

          <dl className="pc-facts">
            <div>
              <dt>ลูกค้า</dt>
              <dd>{doc.customer.name.trim() || <span className="pc-missing">ยังไม่ได้ใส่</span>}</dd>
            </div>
            <div>
              <dt>ยอดชำระสุทธิ</dt>
              <dd className="num pc-total">฿{fmtMoney(totals.net)}</dd>
            </div>
            <div>
              <dt>ชื่อไฟล์ PDF</dt>
              <dd className="pc-file">{pdfName(doc)}.pdf</dd>
            </div>
          </dl>

          {warnings.length > 0 ? (
            <div className="pc-warn" role="group" aria-label="สิ่งที่ควรตรวจ">
              <p>
                <IconAlert width={18} height={18} /> ควรตรวจอีกนิด ({warnings.length})
              </p>
              <ul>
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="pc-ok">
              <IconCheck width={18} height={18} /> ข้อมูลครบ พร้อมพิมพ์
            </p>
          )}

          <p className="pc-note">
            ต้องการไฟล์ PDF: ในหน้าต่างพิมพ์ เลือกปลายทาง <b>“บันทึกเป็น PDF”</b> (Save as PDF) กระดาษ A4
            และปิด “ส่วนหัวและท้ายกระดาษ”
          </p>

          <div className="pc-actions">
            <button type="button" className="btn btn-primary" onClick={onPrint} autoFocus>
              <IconPrint /> {warnings.length ? 'พิมพ์ทั้งอย่างนี้' : 'พิมพ์ / บันทึก PDF'}
            </button>
            <button type="button" className="btn btn-soft" onClick={onClose}>
              กลับไปแก้
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
