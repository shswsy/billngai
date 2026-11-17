import { useCallback, useEffect, useRef, useState } from 'react'
import { DOC_LABEL, type Doc, type DocType, type Profile } from './types'
import { Editor } from './components/Editor'
import { Paper } from './components/Paper'
import { DocsPanel } from './components/DocsPanel'
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
      document.title = [doc.number, doc.customer.name].filter(Boolean).join(' ')
    }
    const onAfter = () => {
      document.title = base
    }
    window.addEventListener('beforeprint', onBefore)
    window.addEventListener('afterprint', onAfter)
    return () => {
      window.removeEventListener('beforeprint', onBefore)
      window.removeEventListener('afterprint', onAfter)
    }
  }, [doc.number, doc.customer.name])

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

  const print = () => {
    save(true)
    window.print()
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

  return (
    <div className="app" data-view={view}>
      <header className="topbar">
        <a className="brand" href="./" aria-label="บิลง่าย หน้าแรก">
          <span className="brand-stamp">บิลง่าย</span>
          <span className="brand-tag">ออกบิลฟรี ไม่ต้องสมัคร</span>
        </a>

        <nav className="type-tabs" aria-label="ประเภทเอกสาร">
          {TYPES.map((t) => (
            <button key={t} type="button" aria-pressed={doc.type === t} onClick={() => changeType(t)}>
              {TYPE_SHORT[t]}
            </button>
          ))}
        </nav>

        <div className="actions">
          <button type="button" className="ghost" onClick={startNew}>
            ใหม่
          </button>
          <button type="button" className="ghost" onClick={() => setPanel(true)}>
            เอกสารของฉัน{docs.length > 0 && <span className="count">{docs.length}</span>}
          </button>
          <button type="button" className="ghost hide-sm" onClick={() => save()}>
            บันทึก
          </button>
          <button type="button" className="primary hide-sm" onClick={print}>
            พิมพ์ / PDF
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="pane-edit" aria-label="กรอกข้อมูล">
          <div className="pane-intro">
            <h1>
              {DOC_LABEL[doc.type].th}
              <span className="mono pane-no">{doc.number}</span>
            </h1>
            <p>กรอกข้อมูลแล้วเอกสารจะอัปเดตทันที ข้อมูลเก็บในเครื่องคุณเท่านั้น ไม่ส่งขึ้นเซิร์ฟเวอร์</p>
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
                ยังไม่เคยใช้? ลองดูตัวอย่างเอกสารที่เสร็จแล้ว →
              </button>
            )}
          </div>
          <Editor doc={doc} profile={profile} onDoc={patchDoc} onProfile={patchProfile} onToast={showToast} />
        </section>
        <section className="pane-preview" aria-label="ตัวอย่างเอกสาร">
          <div className="paper-wrap" ref={wrapRef} style={{ ['--zoom' as string]: zoom }}>
            <Paper doc={doc} profile={profile} />
          </div>
        </section>
      </main>

      <nav className="bottombar" aria-label="มุมมอง">
        <button type="button" aria-pressed={view === 'edit'} onClick={() => setView('edit')}>
          แก้ไข
        </button>
        <button type="button" aria-pressed={view === 'preview'} onClick={() => setView('preview')}>
          ดูเอกสาร
        </button>
        <button type="button" onClick={() => save()}>
          บันทึก
        </button>
        <button type="button" className="primary" onClick={print}>
          PDF
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

      <div className={toast ? 'toast show' : 'toast'} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  )
}
