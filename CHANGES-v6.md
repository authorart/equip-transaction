# v6 — ติดตามสถานะ/ที่อยู่/ประวัติอุปกรณ์

สำเนาไฟล์เดิมทั้งหมดอยู่ที่ `backup/20261005-1630_before-v6/` (ไม่ถูก push ขึ้น git)

## สิ่งที่เปลี่ยน
- `apps-script/Dashboard.js` → ลบ (ไม่มีส่วนไหนเรียกใช้, `doGet` ซ้ำกับ Code.js)
- `Code.js` → token/secret อ่านจาก Script Properties; ทุกการเปลี่ยนสถานะบันทึกลง `Status_History`
  + `Status_Since / Current_Location / Status_Note` ใน Inventory; `update_status` ต้องมีอาการ/เหตุผล;
  เพิ่ม API `getEquipmentHistory`; public dashboard ส่ง since/daysInStatus/location/note
  แก้บั๊ก `INV.BORROWER_USERID` ที่ไม่เคยถูกประกาศ (คอลัมน์ O ไม่เคยถูกเขียน)
- `Tracking.js` (ใหม่) → ประวัติรายเครื่อง, แจ้งเตือนชำรุดค้าง, `installTriggers()`
- `SheetSetup.js` → เพิ่ม `runV6Migration()`
- `Richmenusetup.js` → ใช้ token จาก CONFIG
- `dashboard.html` → KPI ชำรุด/ซ่อม/หาย, ตารางเครื่องที่ต้องดำเนินการ (ตั้งแต่เมื่อไหร่/นานกี่วัน/อาการ),
  ตารางรายเครื่อง (ค้นหา/กรอง), แผงประวัติ timeline + สถิติ (ต้อง login LINE)

## ลำดับ deploy (ทำตามลำดับ — ยังไม่ได้ push อะไรทั้งนั้น)
1. ทำสำเนา Google Sheet
2. Apps Script → Project Settings → Script properties เพิ่ม 3 ค่า:
   `LINE_CHANNEL_ACCESS_TOKEN`, `MOPH_NOTIFY_CLIENT_KEY`, `MOPH_NOTIFY_SECRET_KEY`
   (ค่าเดิมดูได้จาก backup/…/apps-script/Code.js)
3. `cd apps-script && clasp push` (ถ้ามี Dashboard.js เดิมบน server ให้ลบด้วย: clasp push จะถามยืนยัน)
4. รัน `runV6Migration()` แล้ว `installTriggers()` ใน Script Editor
5. Deploy → Manage deployments → แก้ไข deployment เดิม → New version (URL เดิม)
6. `git add *.html CHANGES-v6.md && git commit && git push` (apps-script/ อยู่ใน .gitignore)
