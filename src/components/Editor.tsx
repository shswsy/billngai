import type { ChangeEvent } from 'react'
import type { Doc, LineItem, Party, Profile, VatMode } from '../types'
import { computeTotals, fmtMoney, lineAmount } from '../lib/calc'
import { detectPromptPay } from '../lib/promptpay'
import { uid } from '../lib/storage'
import { Field, NumberInput, Section, TextInput } from './fields'
import { IconDown, IconPlus, IconTrash, IconUp } from './icons'

const ACCENTS = ['#1f3a5f', '#2f5d50', '#8a3b2e', '#4a4458', '#1c1c1c']
const UNITS = ['งาน', 'ชิ้น', 'ชั่วโมง', 'วัน', 'เดือน', 'ครั้ง', 'ชุด', 'หน้า', 'คน']

/** Shrink an uploaded logo so it fits comfortably in localStorage. */
function resizeImage(file: File, max = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('อ่านไฟล์รูปไม่ได้'))
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

interface Props {
  doc: Doc
  profile: Profile
  onDoc: (patch: Partial<Doc>) => void
  onProfile: (patch: Partial<Profile>) => void
  onToast: (msg: string) => void
}

export function Editor({ doc, profile, onDoc, onProfile, onToast }: Props) {
  const totals = computeTotals(doc)
  const setCustomer = (patch: Partial<Party>) => onDoc({ customer: { ...doc.customer, ...patch } })
  const setItem = (id: string, patch: Partial<LineItem>) =>
    onDoc({ items: doc.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })
  const addItem = () => onDoc({ items: [...doc.items, { id: uid(), description: '', qty: 1, unit: 'งาน', price: 0 }] })
  const removeItem = (id: string) => onDoc({ items: doc.items.filter((it) => it.id !== id) })
  const moveItem = (idx: number, dir: -1 | 1) => {
    const items = [...doc.items]
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    ;[items[idx], items[j]] = [items[j], items[idx]]
    onDoc({ items })
  }

  const onLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return onToast('กรุณาเลือกไฟล์รูปภาพ')
    try {
      onProfile({ logo: await resizeImage(file) })
    } catch {
      onToast('อ่านไฟล์รูปไม่ได้ ลองไฟล์ PNG หรือ JPG')
    }
  }

  const ppValid = !profile.promptPay || detectPromptPay(profile.promptPay)

  return (
    <div className="editor">
      <Section step={1} title="ข้อมูลกิจการของคุณ" aside={<span className="saved-note">จำไว้ให้ทุกเอกสาร</span>}>
        <div className="logo-row">
          <label className="logo-drop">
            {profile.logo ? (
              <img src={profile.logo} alt="โลโก้" />
            ) : (
              <span className="logo-empty">
                <IconPlus width={18} height={18} />
                โลโก้
              </span>
            )}
            <input type="file" accept="image/*" onChange={onLogo} />
          </label>
          <div className="logo-side">
            <TextInput label="ชื่อกิจการ / ชื่อของคุณ" value={profile.name} onChange={(name) => onProfile({ name })} wide />
            {profile.logo && (
              <button type="button" className="link-btn" onClick={() => onProfile({ logo: '' })}>
                ลบโลโก้
              </button>
            )}
          </div>
        </div>
        <div className="grid">
          <TextInput label="ที่อยู่" value={profile.address} onChange={(address) => onProfile({ address })} multiline wide />
          <TextInput
            label="เลขประจำตัวผู้เสียภาษี"
            value={profile.taxId}
            onChange={(taxId) => onProfile({ taxId })}
            inputMode="numeric"
          />
          <TextInput label="สาขา" value={profile.branch} onChange={(branch) => onProfile({ branch })} placeholder="สำนักงานใหญ่" />
          <TextInput label="โทรศัพท์" value={profile.phone} onChange={(phone) => onProfile({ phone })} inputMode="tel" />
          <TextInput label="อีเมล" value={profile.email} onChange={(email) => onProfile({ email })} type="email" />
          <TextInput label="ชื่อผู้ลงนาม" value={profile.signerName} onChange={(signerName) => onProfile({ signerName })} wide />
        </div>
        <div className="accent-row" role="radiogroup" aria-label="สีเอกสาร">
          <span>สีเอกสาร</span>
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={profile.accent === c}
              aria-label={c}
              className="swatch"
              style={{ background: c }}
              onClick={() => onProfile({ accent: c })}
            />
          ))}
        </div>
      </Section>

      <Section step={2} title="ลูกค้า">
        <div className="grid">
          <TextInput label="ชื่อลูกค้า / บริษัท" value={doc.customer.name} onChange={(name) => setCustomer({ name })} wide />
          <TextInput label="ที่อยู่" value={doc.customer.address} onChange={(address) => setCustomer({ address })} multiline wide />
          <TextInput
            label="เลขประจำตัวผู้เสียภาษี"
            value={doc.customer.taxId}
            onChange={(taxId) => setCustomer({ taxId })}
            inputMode="numeric"
          />
          <TextInput label="สาขา" value={doc.customer.branch} onChange={(branch) => setCustomer({ branch })} />
          <TextInput label="โทรศัพท์" value={doc.customer.phone} onChange={(phone) => setCustomer({ phone })} inputMode="tel" />
          <TextInput label="อีเมล" value={doc.customer.email} onChange={(email) => setCustomer({ email })} type="email" />
        </div>
      </Section>

      <Section step={3} title="เลขที่และวันที่">
        <div className="grid">
          <TextInput label="เลขที่เอกสาร" value={doc.number} onChange={(number) => onDoc({ number })} hint="รันเลขให้อัตโนมัติ แก้เองได้" />
          <TextInput label="วันที่" type="date" value={doc.date} onChange={(date) => onDoc({ date })} />
          {doc.type !== 'receipt' && (
            <TextInput
              label={doc.type === 'quotation' ? 'ยืนราคาถึง' : 'ครบกำหนดชำระ'}
              type="date"
              value={doc.dueDate}
              onChange={(dueDate) => onDoc({ dueDate })}
            />
          )}
          <TextInput
            label="อ้างอิง"
            value={doc.reference}
            onChange={(reference) => onDoc({ reference })}
            placeholder="เช่น เลขใบสั่งซื้อ (PO)"
          />
        </div>
      </Section>

      <Section step={4} title="รายการสินค้า / บริการ" aside={<span className="mono">{fmtMoney(totals.subtotal)} ฿</span>}>
        <datalist id="units">
          {UNITS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
        <ol className="items">
          {doc.items.map((it, idx) => (
            <li key={it.id} className="item">
              <div className="item-top">
                <span className="item-no">{idx + 1}</span>
                <textarea
                  aria-label={`รายการที่ ${idx + 1}`}
                  className="item-desc"
                  rows={1}
                  value={it.description}
                  placeholder="เช่น ออกแบบโลโก้ พร้อมไฟล์ AI"
                  onChange={(e) => setItem(it.id, { description: e.target.value })}
                />
                <div className="item-tools">
                  <button type="button" aria-label="เลื่อนขึ้น" disabled={idx === 0} onClick={() => moveItem(idx, -1)}>
                    <IconUp width={16} height={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="เลื่อนลง"
                    disabled={idx === doc.items.length - 1}
                    onClick={() => moveItem(idx, 1)}
                  >
                    <IconDown width={16} height={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="ลบรายการ"
                    className="danger"
                    disabled={doc.items.length === 1}
                    onClick={() => removeItem(it.id)}
                  >
                    <IconTrash width={16} height={16} />
                  </button>
                </div>
              </div>
              <div className="item-nums">
                <label>
                  <span>จำนวน</span>
                  <NumberInput value={it.qty} onChange={(qty) => setItem(it.id, { qty })} />
                </label>
                <label>
                  <span>หน่วย</span>
                  <input list="units" value={it.unit} onChange={(e) => setItem(it.id, { unit: e.target.value })} />
                </label>
                <label>
                  <span>ราคา/หน่วย</span>
                  <NumberInput value={it.price} onChange={(price) => setItem(it.id, { price })} />
                </label>
                <output className="item-amount mono">{fmtMoney(lineAmount(it))}</output>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="add-btn" onClick={addItem}>
          <IconPlus width={18} height={18} /> เพิ่มรายการ
        </button>
      </Section>

      <Section step={5} title="ส่วนลดและภาษี" aside={<span className="mono">{fmtMoney(totals.net)} ฿</span>}>
        <div className="grid">
          <Field label="ส่วนลด (บาท)">{(id) => <NumberInput id={id} value={doc.discount} onChange={(discount) => onDoc({ discount })} />}</Field>
          <Field label="หัก ณ ที่จ่าย" hint="ลูกค้านิติบุคคลมักหัก 3% สำหรับค่าบริการ">
            {(id) => (
              <select id={id} value={doc.whtRate} onChange={(e) => onDoc({ whtRate: Number(e.target.value) })}>
                <option value={0}>ไม่มี</option>
                <option value={1}>1% (ค่าขนส่ง)</option>
                <option value={2}>2% (ค่าโฆษณา)</option>
                <option value={3}>3% (ค่าบริการ / จ้างทำของ)</option>
                <option value={5}>5% (ค่าเช่า)</option>
              </select>
            )}
          </Field>
        </div>
        <fieldset className="seg" aria-label="ภาษีมูลค่าเพิ่ม">
          <legend>ภาษีมูลค่าเพิ่ม (VAT 7%)</legend>
          {(
            [
              ['none', 'ไม่มี VAT'],
              ['exclusive', 'บวกเพิ่ม 7%'],
              ['inclusive', 'รวมในราคาแล้ว'],
            ] as [VatMode, string][]
          ).map(([v, l]) => (
            <label key={v} className={doc.vatMode === v ? 'on' : ''}>
              <input type="radio" name="vat" checked={doc.vatMode === v} onChange={() => onDoc({ vatMode: v })} />
              {l}
            </label>
          ))}
        </fieldset>
      </Section>

      <Section step={6} title="การชำระเงินและหมายเหตุ">
        <div className="grid">
          <TextInput label="ธนาคาร" value={profile.bankName} onChange={(bankName) => onProfile({ bankName })} placeholder="เช่น กสิกรไทย" />
          <TextInput label="เลขที่บัญชี" value={profile.bankAccountNo} onChange={(bankAccountNo) => onProfile({ bankAccountNo })} inputMode="numeric" />
          <TextInput label="ชื่อบัญชี" value={profile.bankAccountName} onChange={(bankAccountName) => onProfile({ bankAccountName })} wide />
          <TextInput
            label="พร้อมเพย์ (เบอร์มือถือ หรือ เลขบัตรประชาชน)"
            value={profile.promptPay}
            onChange={(promptPay) => onProfile({ promptPay })}
            inputMode="numeric"
            wide
            hint={ppValid ? 'ใส่แล้วเอกสารจะมี QR พร้อมยอดเงิน ลูกค้าสแกนจ่ายได้ทันที' : 'ต้องเป็นเบอร์ 10 หลัก หรือเลข 13 หลัก'}
          />
        </div>
        {doc.type !== 'receipt' && (
          <label className="check">
            <input type="checkbox" checked={doc.showQr} onChange={(e) => onDoc({ showQr: e.target.checked })} />
            แสดง QR พร้อมเพย์ในเอกสารนี้
          </label>
        )}
        <div className="grid">
          <TextInput
            label="หมายเหตุ / เงื่อนไข"
            value={doc.notes}
            onChange={(notes) => onDoc({ notes })}
            multiline
            wide
            placeholder="เช่น ชำระมัดจำ 50% ก่อนเริ่มงาน แก้ไขได้ 2 ครั้ง"
          />
        </div>
      </Section>
    </div>
  )
}
