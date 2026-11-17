/**
 * Build a Thai PromptPay QR payload (EMVCo merchant-presented format).
 * Target can be a mobile number (10 digits), national/tax ID (13 digits) or e-wallet ID (15 digits).
 */

function tlv(id: string, value: string): string {
  return id + value.length.toString().padStart(2, '0') + value
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF), as required by EMVCo. */
export function crc16(data: string): string {
  let crc = 0xffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export type PromptPayKind = 'phone' | 'id' | 'ewallet'

export function detectPromptPay(raw: string): { kind: PromptPayKind; digits: string } | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) return { kind: 'phone', digits }
  if (digits.length === 13) return { kind: 'id', digits }
  if (digits.length === 15) return { kind: 'ewallet', digits }
  return null
}

export function promptPayPayload(target: string, amount?: number): string | null {
  const t = detectPromptPay(target)
  if (!t) return null

  let account: string
  if (t.kind === 'phone') account = tlv('01', ('0000' + '66' + t.digits.slice(1)).slice(-13))
  else if (t.kind === 'id') account = tlv('02', t.digits)
  else account = tlv('03', t.digits)

  const hasAmount = amount !== undefined && amount > 0
  let payload =
    tlv('00', '01') +
    tlv('01', hasAmount ? '12' : '11') +
    tlv('29', tlv('00', 'A000000677010111') + account) +
    tlv('58', 'TH') +
    tlv('53', '764')
  if (hasAmount) payload += tlv('54', amount.toFixed(2))
  payload += '6304'
  return payload + crc16(payload)
}
