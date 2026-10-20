# UX phase 1 — quick wins (ดู `UX-UI-SUGGESTIONS.md`)

สำเนาไฟล์เดิมอยู่ที่ `backup/20261019-ux-phase1-before/` (ไม่ถูก push ขึ้น git)

## สิ่งที่เปลี่ยน
- ทุกหน้า → เปิดให้ซูมได้ (ลบ `maximum-scale` / `user-scalable=no`); เพิ่ม `:focus-visible` และ `prefers-reduced-motion`;
  สีตัวอักษรเทาอ่อน `#94A3B8` / `#9CA3AF` → `#64748B` (contrast ≥ 4.5:1)
- `form.html` → แก้บั๊กหน้ายกเลิกคำร้องไม่แสดง (อ้าง `#formTitle` ที่ไม่มีอยู่);
  วันที่คืนเริ่มต้น/ขั้นต่ำใช้วันที่ท้องถิ่น (เดิมใช้ UTC → ช่วง 00:00–07:00 ได้วันของเมื่อวาน);
  กล่อง error มี `role="alert"`
- `dashboard.html` → ลบ CSS หน้าเลือกบทบาทที่ไม่ใช้แล้ว; ปุ่ม 🔄 / ✕ มี `aria-label`; กล่อง error ใน panel มี `role="alert"`

## Deploy
ไม่มีการแก้ Apps Script — `git push` อย่างเดียว
