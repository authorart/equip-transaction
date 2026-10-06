# v7 — Dashboard แยกเมนู + หน้าการใช้งาน + VBD

สำเนาไฟล์เดิมอยู่ที่ `backup/20261006-v7-before/` (ไม่ถูก push ขึ้น git)

## สิ่งที่เปลี่ยน
- `dashboard.html` → ไม่มีหน้าเลือกบทบาท เข้าดูได้ทันที; เมนู สถานะอุปกรณ์ / ชำรุด-ซ่อม-สูญหาย / การใช้งานอุปกรณ์
  (ตัวกรอง รายเดือน/รายปี/กำหนดเอง · ชนิดอุปกรณ์ · หน่วยงาน); เพิ่มกราฟ (โดนัท แท่ง แท่งซ้อน);
  ประวัติรายเครื่องดูได้โดยไม่ login; ใช้สี/ตัวอักษรตาม `chest-equip-vbd.jpeg`;
  เมนู Admin/จ่ายกลาง/Superadmin แสดงเป็นแท็บเพิ่มเฉพาะผู้ที่ login
- `apps-script/Code.js`, `Tracking.js` → เพิ่ม `getUsageData` (public, ไม่มีชื่อ/เบอร์ผู้ยืม);
  `getEquipmentHistory` เปิดสาธารณะ (ไม่ login จะซ่อนชื่อผู้ดำเนินการ)

## อัตราการใช้งาน
วันใช้งานรวม ÷ (จำนวนเครื่อง × จำนวนวันในช่วงที่เลือก) — วันใช้งานนับจากการจับคู่ ยืม→คืน ต่อเครื่อง

## ลำดับ deploy
1. `cd apps-script && clasp push`
2. Deploy → Manage deployments → New version (URL เดิม)
3. `git push` (apps-script/ อยู่ใน .gitignore)

## ความเสถียร
- dashboard retry คำสั่งอ่านอัตโนมัติ + แคชใน localStorage (แสดงข้อมูลเดิมถ้าโหลดใหม่ไม่ได้)
- Apps Script แคช getDashboardPublic 20 วินาที, getUsageData 2 นาที (CacheService)
