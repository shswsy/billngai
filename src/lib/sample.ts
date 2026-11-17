import type { Doc, Profile } from '../types'
import { emptyProfile, newDoc, uid } from './storage'

/** Example data so first-time visitors can see a finished document in one click. */
export function sampleData(): { profile: Profile; doc: Doc } {
  const profile: Profile = {
    ...emptyProfile(),
    name: 'สตูดิโอตัวอย่าง ดีไซน์',
    address: '99/9 ถ.นิมมานเหมินท์ ต.สุเทพ\nอ.เมือง จ.เชียงใหม่ 50200',
    taxId: '0505566000000',
    branch: 'สำนักงานใหญ่',
    phone: '080-000-0000',
    email: 'hello@example.com',
    bankName: 'ธนาคารตัวอย่าง',
    bankAccountName: 'สตูดิโอตัวอย่าง ดีไซน์',
    bankAccountNo: '000-0-00000-0',
    promptPay: '0800000000',
    signerName: 'สมชาย ตัวอย่าง',
  }
  const doc: Doc = {
    ...newDoc('quotation'),
    customer: {
      name: 'บริษัท ลูกค้าตัวอย่าง จำกัด',
      address: '123 ถ.ห้วยแก้ว ต.ช้างเผือก อ.เมือง จ.เชียงใหม่ 50300',
      taxId: '0505561000000',
      branch: 'สำนักงานใหญ่',
      phone: '053-000-000',
      email: '',
    },
    items: [
      { id: uid(), description: 'ออกแบบและพัฒนาเว็บไซต์บริษัท 5 หน้า (รองรับมือถือ)\nแก้ไขได้ 2 ครั้ง', qty: 1, unit: 'งาน', price: 18000 },
      { id: uid(), description: 'ติดตั้งเว็บบน Cloud พร้อม SSL และโดเมน', qty: 1, unit: 'งาน', price: 3500 },
      { id: uid(), description: 'ดูแลระบบและสำรองข้อมูลรายเดือน', qty: 3, unit: 'เดือน', price: 1500 },
    ],
    discount: 500,
    vatMode: 'exclusive',
    whtRate: 3,
    notes: 'ชำระมัดจำ 50% ก่อนเริ่มงาน ส่วนที่เหลือชำระเมื่อส่งมอบงาน',
  }
  return { profile, doc }
}
