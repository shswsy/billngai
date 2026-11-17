import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { DOC_LABEL, type Doc, type Profile } from '../types'
import { computeTotals, fmtMoney, fmtQty, fmtThaiDate, lineAmount, VAT_RATE } from '../lib/calc'
import { bahtText } from '../lib/bahtText'
import { promptPayPayload } from '../lib/promptpay'

const DUE_LABEL = { quotation: 'ยืนราคาถึง', invoice: 'ครบกำหนดชำระ', receipt: '' }
const SIGN_LABEL = {
  quotation: ['ผู้เสนอราคา', 'ผู้อนุมัติสั่งซื้อ'],
  invoice: ['ผู้วางบิล', 'ผู้รับวางบิล'],
  receipt: ['ผู้รับเงิน', 'ผู้จ่ายเงิน'],
}

const safeImg = (src: string) => (src.startsWith('data:image/') ? src : '')

function usePromptPayQr(target: string, amount: number, enabled: boolean) {
  const payload = enabled ? promptPayPayload(target, amount) : null
  const [qr, setQr] = useState({ payload: '', url: '' })
  useEffect(() => {
    if (!payload) return
    let alive = true
    QRCode.toDataURL(payload, { margin: 1, width: 240, errorCorrectionLevel: 'M' })
      .then((url) => alive && setQr({ payload, url }))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [payload])
  return payload && qr.payload === payload ? qr.url : ''
}

function PartyLines({ p }: { p: { address: string; taxId: string; branch: string; phone: string; email: string } }) {
  return (
    <>
      {p.address && <p className="pp-addr">{p.address}</p>}
      {(p.taxId || p.branch) && (
        <p>
          {p.taxId && <>เลขประจำตัวผู้เสียภาษี {p.taxId}</>}
          {p.taxId && p.branch && ' · '}
          {p.branch}
        </p>
      )}
      {(p.phone || p.email) && (
        <p>
          {p.phone && <>โทร {p.phone}</>}
          {p.phone && p.email && ' · '}
          {p.email}
        </p>
      )}
    </>
  )
}

export function Paper({ doc, profile }: { doc: Doc; profile: Profile }) {
  const t = computeTotals(doc)
  const label = DOC_LABEL[doc.type]
  const wantsQr = doc.showQr && doc.type !== 'receipt'
  const qr = usePromptPayQr(profile.promptPay, t.net, wantsQr)
  const items = doc.items.filter((it) => it.description.trim() || it.price)
  const hasBank = profile.bankName || profile.bankAccountNo
  const logo = safeImg(profile.logo)

  return (
    <article className="paper" style={{ ['--doc-accent' as string]: profile.accent || '#1f3a5f' }}>
      <header className="pp-head">
        <div className="pp-seller">
          {logo && <img className="pp-logo" src={logo} alt="" />}
          <div>
            <h2 className="pp-seller-name">{profile.name || 'ชื่อกิจการของคุณ'}</h2>
            <PartyLines p={profile} />
          </div>
        </div>
        <div className="pp-title">
          <h1>{label.th}</h1>
          <p className="pp-title-en">{label.en}</p>
          <span className="pp-original">ต้นฉบับ · Original</span>
        </div>
      </header>

      <section className="pp-meta">
        <div className="pp-customer">
          <h3>ลูกค้า</h3>
          <p className="pp-customer-name">{doc.customer.name || '—'}</p>
          <PartyLines p={doc.customer} />
        </div>
        <dl className="pp-info">
          <dt>เลขที่</dt>
          <dd>{doc.number}</dd>
          <dt>วันที่</dt>
          <dd>{fmtThaiDate(doc.date)}</dd>
          {doc.type !== 'receipt' && doc.dueDate && (
            <>
              <dt>{DUE_LABEL[doc.type]}</dt>
              <dd>{fmtThaiDate(doc.dueDate)}</dd>
            </>
          )}
          {doc.reference && (
            <>
              <dt>อ้างอิง</dt>
              <dd>{doc.reference}</dd>
            </>
          )}
        </dl>
      </section>

      <table className="pp-table">
        <thead>
          <tr>
            <th className="c-no">ลำดับ</th>
            <th className="c-desc">รายการ</th>
            <th className="c-num">จำนวน</th>
            <th className="c-unit">หน่วย</th>
            <th className="c-num">ราคา/หน่วย</th>
            <th className="c-num">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="pp-empty">
                ยังไม่มีรายการ
              </td>
            </tr>
          )}
          {items.map((it, i) => (
            <tr key={it.id}>
              <td className="c-no">{i + 1}</td>
              <td className="c-desc">{it.description}</td>
              <td className="c-num">{fmtQty(it.qty)}</td>
              <td className="c-unit">{it.unit}</td>
              <td className="c-num">{fmtMoney(it.price)}</td>
              <td className="c-num">{fmtMoney(lineAmount(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="pp-bottom">
        <div className="pp-left">
          <p className="pp-words">({bahtText(t.total)})</p>
          {doc.notes && (
            <div className="pp-notes">
              <h3>หมายเหตุ</h3>
              <p>{doc.notes}</p>
            </div>
          )}
          {doc.type !== 'receipt' && (hasBank || qr) && (
            <div className="pp-pay">
              {qr && (
                <figure className="pp-qr">
                  <img src={qr} alt="QR พร้อมเพย์" />
                  <figcaption>สแกนจ่ายพร้อมเพย์ {fmtMoney(t.net)} บาท</figcaption>
                </figure>
              )}
              {hasBank && (
                <div>
                  <h3>ช่องทางชำระเงิน</h3>
                  <p>{profile.bankName}</p>
                  {profile.bankAccountName && <p>ชื่อบัญชี {profile.bankAccountName}</p>}
                  {profile.bankAccountNo && <p>เลขที่บัญชี {profile.bankAccountNo}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        <table className="pp-totals">
          <tbody>
            <tr>
              <th>รวมเป็นเงิน</th>
              <td>{fmtMoney(t.subtotal)}</td>
            </tr>
            {t.discount > 0 && (
              <>
                <tr>
                  <th>ส่วนลด</th>
                  <td>−{fmtMoney(t.discount)}</td>
                </tr>
                <tr>
                  <th>ยอดหลังหักส่วนลด</th>
                  <td>{fmtMoney(t.afterDiscount)}</td>
                </tr>
              </>
            )}
            {doc.vatMode === 'inclusive' && (
              <tr>
                <th>มูลค่าก่อนภาษี</th>
                <td>{fmtMoney(t.base)}</td>
              </tr>
            )}
            {doc.vatMode !== 'none' && (
              <tr>
                <th>ภาษีมูลค่าเพิ่ม {VAT_RATE}%</th>
                <td>{fmtMoney(t.vat)}</td>
              </tr>
            )}
            <tr className="pp-grand">
              <th>จำนวนเงินรวมทั้งสิ้น</th>
              <td>{fmtMoney(t.total)}</td>
            </tr>
            {t.wht > 0 && (
              <>
                <tr>
                  <th>หัก ณ ที่จ่าย {doc.whtRate}%</th>
                  <td>−{fmtMoney(t.wht)}</td>
                </tr>
                <tr className="pp-net">
                  <th>ยอดชำระสุทธิ</th>
                  <td>{fmtMoney(t.net)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </section>

      <footer className="pp-signs">
        {SIGN_LABEL[doc.type].map((role, i) => (
          <div key={role} className="pp-sign">
            <div className="pp-sign-line" />
            <p>({i === 0 && profile.signerName ? profile.signerName : ' '.repeat(48)})</p>
            <p className="pp-sign-role">{role}</p>
            <p className="pp-sign-date">วันที่ ______ / ______ / ______</p>
          </div>
        ))}
      </footer>
    </article>
  )
}
