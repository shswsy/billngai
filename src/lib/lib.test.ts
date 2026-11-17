import { describe, expect, it } from 'vitest'
import { bahtText } from './bahtText'
import { crc16, promptPayPayload } from './promptpay'
import { computeTotals } from './calc'
import type { LineItem } from '../types'

describe('bahtText', () => {
  const cases: [number, string][] = [
    [0, 'ศูนย์บาทถ้วน'],
    [1, 'หนึ่งบาทถ้วน'],
    [11, 'สิบเอ็ดบาทถ้วน'],
    [21, 'ยี่สิบเอ็ดบาทถ้วน'],
    [101, 'หนึ่งร้อยเอ็ดบาทถ้วน'],
    [110, 'หนึ่งร้อยสิบบาทถ้วน'],
    [1000, 'หนึ่งพันบาทถ้วน'],
    [1250.5, 'หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์'],
    [0.25, 'ยี่สิบห้าสตางค์'],
    [0.01, 'หนึ่งสตางค์'],
    [0.21, 'ยี่สิบเอ็ดสตางค์'],
    [1000000, 'หนึ่งล้านบาทถ้วน'],
    [1000001, 'หนึ่งล้านเอ็ดบาทถ้วน'],
    [11000000, 'สิบเอ็ดล้านบาทถ้วน'],
    [21500000, 'ยี่สิบเอ็ดล้านห้าแสนบาทถ้วน'],
    [1000000000000, 'หนึ่งล้านล้านบาทถ้วน'],
    [-5, 'ลบห้าบาทถ้วน'],
    [99.999, 'หนึ่งร้อยบาทถ้วน'],
  ]
  it.each(cases)('%d → %s', (n, expected) => {
    expect(bahtText(n)).toBe(expected)
  })
})

describe('promptpay', () => {
  it('crc16 matches CCITT-FALSE check value', () => {
    expect(crc16('123456789')).toBe('29B1')
  })
  it('builds phone payload without amount', () => {
    // Reference vectors from the widely used `promptpay-qr` package
    expect(promptPayPayload('000-000-0000')).toBe(
      '00020101021129370016A000000677010111011300660000000005802TH530376463048956',
    )
  })
  it('builds phone payload with amount', () => {
    expect(promptPayPayload('0000000000', 4.22)).toBe(
      '00020101021229370016A000000677010111011300660000000005802TH530376454044.226304E469',
    )
  })
  it('builds national id payload', () => {
    expect(promptPayPayload('1111111111111')).toBe(
      '00020101021129370016A000000677010111021311111111111115802TH530376463047B5A',
    )
  })
  it('rejects invalid targets', () => {
    expect(promptPayPayload('12345')).toBeNull()
  })
})

describe('computeTotals', () => {
  const items: LineItem[] = [
    { id: '1', description: 'a', qty: 2, unit: '', price: 1500 },
    { id: '2', description: 'b', qty: 1, unit: '', price: 1000 },
  ]
  it('no vat', () => {
    const t = computeTotals({ items, discount: 0, vatMode: 'none', whtRate: 0 })
    expect(t).toMatchObject({ subtotal: 4000, total: 4000, vat: 0, net: 4000 })
  })
  it('vat exclusive with discount and 3% wht', () => {
    const t = computeTotals({ items, discount: 1000, vatMode: 'exclusive', whtRate: 3 })
    expect(t).toMatchObject({ afterDiscount: 3000, base: 3000, vat: 210, total: 3210, wht: 90, net: 3120 })
  })
  it('vat inclusive', () => {
    const t = computeTotals({ items: [{ ...items[0], qty: 1, price: 1070 }], discount: 0, vatMode: 'inclusive', whtRate: 3 })
    expect(t).toMatchObject({ base: 1000, vat: 70, total: 1070, wht: 30, net: 1040 })
  })
  it('discount cannot exceed subtotal', () => {
    const t = computeTotals({ items, discount: 99999, vatMode: 'none', whtRate: 0 })
    expect(t.total).toBe(0)
  })
})
