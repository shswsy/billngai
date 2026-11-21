import { useCallback, useEffect, useRef, useState } from 'react'
import { DOC_LABEL, type Doc, type DocType, type Profile, type VatMode } from './types'
import { Editor } from './components/Editor'
import { Paper } from './components/Paper'
import { DocsPanel } from './components/DocsPanel'
import { PrintCheck } from './components/PrintCheck'
import { pdfName } from './lib/printCheck'
import {
  IconArrowRight,
  IconCheck,
  IconEdit,
  IconEye,
  IconFolder,
  IconInvoice,
  IconList,
  IconPercent,
  IconPlus,
  IconPrint,
  IconQuote,
  IconReceipt,
  IconSave,
  IconShield,
  IconSpark,
  IconWallet,
} from './components/icons'
import { computeTotals, fmtMoney } from './lib/calc'
import { sampleData } from './lib/sample'
import {
  convertDoc,
  deleteDoc,
  exportBackup,
  importBackup,
  loadDocs,
  loadDraft,
  loadProfile,
  newDoc,
  peekNumber,
  saveDoc,
  saveDraft,
  saveProfile,
} from './lib/storage'

const TYPES: DocType[] = ['quotation', 'invoice', 'receipt']
const TYPE_SHORT: Record<DocType, string> = { quotation: 'ใบเสนอราคา', invoice: 'ใบแจ้งหนี้', receipt: 'ใบเสร็จ' }
const KPI_SHORT: Record<DocType, string> = { quotation: 'เสนอราคา', invoice: 'แจ้งหนี้', receipt: 'ใบเสร็จ' }
const TYPE_ICON = { quotation: IconQuote, invoice: IconInvoice, receipt: IconReceipt }
const VAT_LABEL: Record<VatMode, string> = {
  none: 'ไม่มี VAT',
  exclusive: 'บวกเพิ่ม 7%',
  inclusive: 'รวมในราคาแล้ว',
}

/** Same document apart from the timestamp, i.e. nothing unsaved. */
const sameContent = (a: Doc, b: Doc) => JSON.stringify({ ...a, updatedAt: 0 }) === JSON.stringify({ ...b, updatedAt: 0 })

const isFirstVisit = () => !loadProfile().name && loadDocs().length === 0
// `?demo` opens with example data, but only for a visitor with nothing saved yet.
const initialSample = new URLSearchParams(location.search).has('demo') && isFirstVisit() ? sampleData() : null

export default function App() {
  const [profile, setProfile] = useState<Profile>(() => initialSample?.profile ?? loadProfile())
  const [doc, setDoc] = useState<Doc>(() => initialSample?.doc ?? loadDraft() ?? newDoc())
  const [docs, setDocs] = useState<Doc[]>(loadDocs)
  const [panel, setPanel] = useState(false)
  const [view, setView] = useState<'edit' | 'preview'>('edit')
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number>(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [printStage, setPrintStage] = useState<'check' | 'done' | null>(null)
  // set while a print started from our check sheet is open, so only that one gets the "done" sheet
  const printing = useRef(false)

  // Scale the A4 sheet (≈794px wide) down to fit whatever space the preview has.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setZoom(Math.min(1, w / 800))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }, [])

  useEffect(() => {
    if (!saveProfile(profile)) showToast('เบราว์เซอร์ไม่ยอมให้บันทึกข้อมูล (โหมดส่วนตัวหรือพื้นที่เต็ม)')
  }, [profile, showToast])
  useEffect(() => {
    saveDraft(doc)
  }, [doc])

  // PDF file name follows the document number
  useEffect(() => {
    const base = 'บิลง่าย — ใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ ออนไลน์ฟรี'
    const onBefore = () => {
      document.title = pdfName(doc)
    }
    const onAfter = () => {
      document.title = base
      if (printing.current) {
        printing.current = false
        setPrintStage('done')
      }
    }
    window.addEventListener('beforeprint', onBefore)
    window.addEventListener('afterprint', onAfter)
    return () => {
      window.removeEventListener('beforeprint', onBefore)
      window.removeEventListener('afterprint', onAfter)
    }
  }, [doc])

  const patchDoc = (patch: Partial<Doc>) => setDoc((d) => ({ ...d, ...patch, updatedAt: Date.now() }))
  const patchProfile = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }))

  const isSaved = docs.some((d) => d.id === doc.id)

  const changeType = (type: DocType) => {
    if (type === doc.type) return
    if (isSaved) {
      // Saved docs keep their identity; switching type creates a linked copy.
      setDoc(convertDoc(doc, type))
      showToast(`สร้าง${TYPE_SHORT[type]}ใหม่จาก ${doc.number}`)
    } else {
      patchDoc({
        type,
        number: peekNumber(type, doc.date),
        dueDate: type === 'receipt' ? '' : doc.dueDate,
        showQr: type !== 'receipt',
      })
    }
  }

  const save = (silent = false) => {
    const { ok, docs } = saveDoc(doc)
    setDocs(docs)
    if (!silent) showToast(ok ? `บันทึก ${doc.number} แล้ว` : 'บันทึกไม่สำเร็จ พื้นที่ในเบราว์เซอร์อาจเต็ม')
  }

  // every print button opens the check sheet first; the sheet's own button does the real print
  const print = () => setPrintStage('check')

  const doPrint = () => {
    save(true)
    setPrintStage(null)
    printing.current = true
    // let the modal close before the browser snapshots the page
    window.setTimeout(() => window.print(), 60)
  }

  const startNew = () => {
    // Don't lose work: keep the current doc in history if anything was filled in.
    const hasContent = doc.customer.name.trim() || doc.items.some((it) => it.description.trim() || it.price)
    if (hasContent && !isSaved) save(true)
    setDoc(newDoc(doc.type))
    setView('edit')
    showToast(`เริ่ม${TYPE_SHORT[doc.type]}ใหม่`)
  }

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(exportBackup(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `billngai-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importFile = async (file: File) => {
    try {
      const res = importBackup(JSON.parse(await file.text()))
      setDocs(res.docs)
      setProfile(res.profile)
      showToast(`นำเข้าแล้ว ${res.docs.length} เอกสาร`)
    } catch (e) {
      showToast(e instanceof Error && e.message.startsWith('ไฟล์') ? e.message : 'อ่านไฟล์ไม่ได้')
    }
  }

  const totals = computeTotals(doc)
  const savedVersion = docs.find((d) => d.id === doc.id)
  const status: 'draft' | 'saved' | 'changed' = !savedVersion
    ? 'draft'
    : sameContent(savedVersion, doc)
      ? 'saved'
      : 'changed'
  const filledItems = doc.items.filter((it) => it.description.trim() || it.price).length
  const typeCounts = TYPES.map((t) => docs.filter((d) => d.type === t).length)

  const typeNav = (cls: string) => (
    <nav className={cls} aria-label="ประเภทเอกสาร">
      {TYPES.map((t) => {
        const Icon = TYPE_ICON[t]
        return (
          <button key={t} type="button" aria-pressed={doc.type === t} onClick={() => changeType(t)}>
            <Icon className="nav-ico" />
            <span>{TYPE_SHORT[t]}</span>
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="app" data-view={view}>
      <aside className="sidebar">
        <a className="brand" href="./" aria-label="บิลง่าย หน้าแรก">
          <span className="brand-mark" aria-hidden="true">
            <IconInvoice width={20} height={20} />
          </span>
          <span className="brand-text">
            <span className="brand-name">บิลง่าย</span>
            <span className="brand-tag">ออกบิลฟรี ไม่ต้องสมัคร</span>
          </span>
        </a>

        <button type="button" className="btn btn-primary btn-block side-new" onClick={startNew}>
          <IconPlus /> เอกสารใหม่
        </button>

        <p className="side-label">สร้างเอกสาร</p>
        {typeNav('side-nav')}

        <p className="side-label">จัดการ</p>
        <div className="side-nav">
          <button type="button" onClick={() => setPanel(true)}>
            <IconFolder className="nav-ico" />
            <span>เอกสารของฉัน</span>
            {docs.length > 0 && <span className="count">{docs.length}</span>}
          </button>
        </div>

        <div className="side-privacy">
          <IconShield width={22} height={22} />
          <p>
            <strong>ข้อมูลอยู่ในเครื่องคุณ</strong>
            ไม่มีการส่งข้อมูลลูกค้าหรือยอดเงินขึ้นเซิร์ฟเวอร์
          </p>
        </div>

        {/* compact header actions (tablet / mobile) */}
        <div className="head-actions">
          <button type="button" className="icon-btn" aria-label="เอกสารใหม่" title="เอกสารใหม่" onClick={startNew}>
            <IconPlus />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="เอกสารของฉัน"
            title="เอกสารของฉัน"
            onClick={() => setPanel(true)}
          >
            <IconFolder />
            {docs.length > 0 && <span className="count count-dot">{docs.length}</span>}
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="page-head">
          <div className="page-title">
            <p className="crumb">สร้างเอกสาร</p>
            <h1>
              <span>{DOC_LABEL[doc.type].th}</span>
              <span className="chip mono">{doc.number}</span>
              <span className={`status status-${status}`}>
                {status === 'saved' ? 'บันทึกแล้ว' : status === 'changed' ? 'มีการแก้ไข' : 'ฉบับร่าง'}
              </span>
            </h1>
          </div>
          {typeNav('seg-tabs')}
          <div className="page-actions">
            <button type="button" className="btn btn-soft" onClick={() => save()}>
              <IconSave /> บันทึก
            </button>
            <button type="button" className="btn btn-primary" onClick={print}>
              <IconPrint /> พิมพ์ / PDF
            </button>
          </div>
        </header>

        {!profile.name && docs.length === 0 && (
          <button
            type="button"
            className="sample-btn"
            onClick={() => {
              const s = sampleData()
              setProfile(s.profile)
              setDoc(s.doc)
              showToast('ใส่ข้อมูลตัวอย่างแล้ว ลองแก้ไขดูได้เลย')
            }}
          >
            <span className="sample-ico">
              <IconSpark />
            </span>
            <span>
              <strong>ยังไม่เคยใช้?</strong> ลองดูตัวอย่างเอกสารที่เสร็จแล้ว แล้วแก้เป็นของคุณได้เลย
            </span>
            <IconArrowRight className="sample-arrow" />
          </button>
        )}

        <section className="kpis" aria-label="สรุปยอดเอกสารนี้">
          <div className="kpi kpi-hero">
            <span className="kpi-ico">
              <IconWallet />
            </span>
            <span className="kpi-label">ยอดชำระสุทธิ</span>
            <strong className="kpi-value num">฿{fmtMoney(totals.net)}</strong>
            <span className="kpi-sub">
              {totals.wht > 0
                ? `หลังหัก ณ ที่จ่าย ${doc.whtRate}%`
                : doc.vatMode !== 'none'
                  ? 'รวม VAT แล้ว'
                  : 'ยอดที่ลูกค้าต้องจ่าย'}
            </span>
          </div>
          <div className="kpi">
            <span className="kpi-ico kpi-ico-amber">
              <IconPercent />
            </span>
            <span className="kpi-label">ภาษีมูลค่าเพิ่ม</span>
            <strong className="kpi-value num">฿{fmtMoney(totals.vat)}</strong>
            <span className="kpi-sub">{VAT_LABEL[doc.vatMode]}</span>
          </div>
          <div className="kpi">
            <span className="kpi-ico kpi-ico-green">
              <IconList />
            </span>
            <span className="kpi-label">รายการ</span>
            <strong className="kpi-value num">{filledItems}</strong>
            <span className="kpi-sub">รวม ฿{fmtMoney(totals.subtotal)}</span>
          </div>
          <button type="button" className="kpi kpi-link" onClick={() => setPanel(true)}>
            <span className="kpi-ico kpi-ico-violet">
              <IconFolder />
            </span>
            <span className="kpi-label">เอกสารที่บันทึก</span>
            <strong className="kpi-value num">{docs.length}</strong>
            <span className="kpi-sub">
              {docs.length === 0
                ? 'กดเพื่อเปิดดูและค้นหา'
                : TYPES.map((t, i) => (typeCounts[i] > 0 ? `${KPI_SHORT[t]} ${typeCounts[i]}` : ''))
                    .filter(Boolean)
                    .join(' · ')}
            </span>
          </button>
        </section>

        <div className="workspace">
          <section className="pane-edit" aria-label="กรอกข้อมูล">
            <Editor doc={doc} profile={profile} onDoc={patchDoc} onProfile={patchProfile} onToast={showToast} />
          </section>
          <section className="pane-preview" aria-label="ตัวอย่างเอกสาร">
            <div className="preview-card">
              <header className="preview-head">
                <div className="preview-title">
                  <h2>ตัวอย่างเอกสาร</h2>
                  <p>A4 · อัปเดตทันทีที่พิมพ์</p>
                </div>
                <span className="chip num">{Math.round(zoom * 100)}%</span>
                <button type="button" className="btn btn-soft btn-sm" onClick={print}>
                  <IconPrint /> พิมพ์
                </button>
              </header>
              <div className="paper-wrap" ref={wrapRef} style={{ ['--zoom' as string]: zoom }}>
                <Paper doc={doc} profile={profile} />
              </div>
            </div>
          </section>
        </div>
      </main>

      <nav className="bottombar" aria-label="มุมมอง">
        <button type="button" aria-pressed={view === 'edit'} onClick={() => setView('edit')}>
          <IconEdit />
          <span>แก้ไข</span>
        </button>
        <button type="button" aria-pressed={view === 'preview'} onClick={() => setView('preview')}>
          <IconEye />
          <span>ดูเอกสาร</span>
        </button>
        <button type="button" onClick={() => save()}>
          <IconSave />
          <span>บันทึก</span>
        </button>
        <button type="button" className="bb-primary" onClick={print}>
          <IconPrint />
          <span>PDF</span>
        </button>
      </nav>

      <DocsPanel
        open={panel}
        docs={docs}
        currentId={doc.id}
        onClose={() => setPanel(false)}
        onOpen={(d) => {
          setDoc(d)
          setPanel(false)
        }}
        onConvert={(d, t) => {
          setDoc(convertDoc(d, t))
          setPanel(false)
          showToast(`สร้าง${TYPE_SHORT[t]}จาก ${d.number} แล้ว`)
        }}
        onDelete={(id) => {
          setDocs(deleteDoc(id))
          showToast('ลบเอกสารแล้ว')
        }}
        onExport={exportFile}
        onImport={importFile}
      />

      <PrintCheck
        stage={printStage}
        doc={doc}
        profile={profile}
        onPrint={doPrint}
        onClose={() => setPrintStage(null)}
        onNext={(t) => {
          setPrintStage(null)
          setDoc(convertDoc(doc, t))
          setView('edit')
          showToast(`สร้าง${TYPE_SHORT[t]}จาก ${doc.number} แล้ว`)
        }}
        onNew={() => {
          setPrintStage(null)
          startNew()
        }}
      />

      <div className={toast ? 'toast show' : 'toast'} role="status" aria-live="polite">
        <IconCheck width={18} height={18} />
        <span>{toast}</span>
      </div>
    </div>
  )
}
