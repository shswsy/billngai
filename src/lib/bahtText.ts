const DIGITS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
const PLACES = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']

/** Read a group of up to 6 digits. `forceEt`: a lone 1 in the units place reads "เอ็ด" (e.g. the last group of 1,000,001). */
function readGroup(group: string, forceEt: boolean): string {
  const digits = group.replace(/^0+/, '')
  let out = ''
  const len = digits.length
  for (let i = 0; i < len; i++) {
    const d = Number(digits[i])
    const place = len - 1 - i
    if (d === 0) continue
    if (place === 1) {
      out += d === 1 ? 'สิบ' : d === 2 ? 'ยี่สิบ' : DIGITS[d] + 'สิบ'
    } else if (place === 0 && d === 1 && (len > 1 || forceEt)) {
      out += 'เอ็ด'
    } else {
      out += DIGITS[d] + PLACES[place]
    }
  }
  return out
}

/** Read a non-negative integer string in Thai, handling ล้าน for any size. */
function readInteger(int: string): string {
  const clean = int.replace(/^0+/, '')
  if (!clean) return ''
  const groups: string[] = []
  for (let end = clean.length; end > 0; end -= 6) {
    groups.unshift(clean.slice(Math.max(0, end - 6), end))
  }
  let out = ''
  groups.forEach((g, idx) => {
    const isLast = idx === groups.length - 1
    const text = readGroup(g, idx > 0)
    out += text
    if (!isLast) out += 'ล้าน'
  })
  return out
}

/** Convert an amount to Thai baht text, like Excel's BAHTTEXT. 1250.5 → "หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์" */
export function bahtText(amount: number): string {
  if (!Number.isFinite(amount)) return ''
  const negative = amount < 0
  const satangTotal = Math.round(Math.abs(amount) * 100)
  const baht = Math.floor(satangTotal / 100).toString()
  const satang = satangTotal % 100

  if (satangTotal === 0) return 'ศูนย์บาทถ้วน'

  let out = ''
  const bahtWords = readInteger(baht)
  if (bahtWords) out += bahtWords + 'บาท'
  out += satang === 0 ? 'ถ้วน' : readGroup(satang.toString(), false) + 'สตางค์'
  return (negative ? 'ลบ' : '') + out
}
