# คู่มือตั้งค่า LINE Bot (AI เสมียนกองร้อยสายและวิทยุถ่ายทอด)

ระบบ LINE Bot เพิ่มภารกิจเข้าปฏิทินอัตโนมัติ ขับเคลื่อนด้วย **Typhoon AI** (`typhoon-ocr` สำหรับสกัดข้อความจากภาพถ่าย และ `typhoon-v2.5-30b-a3b-instruct` สำหรับวิเคราะห์ภารกิจ) พร้อมระบบวิเคราะห์กำลังพลจากฐานข้อมูล Supabase สด และปุ่มกดยืนยันบันทึก/แก้ไขข้อมูลร่าง (Interactive Draft Queue)

---

## 📌 1. นำ Webhook URL ไปกรอกใน LINE Developers Console

1. เข้าไปยังเว็บ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก **Messaging API Channel** ของคุณ
3. ไปที่แท็บ **Messaging API**
4. ในช่อง **Webhook URL** ให้กรอก URL ดังนี้:
   ```
   https://member-calendar-sync-app.vercel.app/api/line-webhook
   ```
5. กดปุ่ม **Verify** (ต้องขึ้นผลลัพธ์ `Success`)
6. สวิตช์เปิด **Use webhook** ให้เป็น **Enabled (เปิดใช้งาน)**

---

## 📌 2. การตั้งค่า Vercel Environment Variables

ใน Vercel Dashboard -> Settings -> Environment Variables ให้ตั้งค่า Key ต่อไปนี้:

- `LINE_CHANNEL_ACCESS_TOKEN`: Long-Lived Access Token จาก LINE Developers Console
- `LINE_CHANNEL_SECRET`: Channel Secret จาก LINE Developers Console
- `TYPHOON_API_KEY`: API Key จาก Typhoon AI Platform
- `SUPABASE_URL`: URL ฐานข้อมูล Supabase (เช่น `https://xxxx.supabase.co`)
- `SUPABASE_ANON_KEY` หรือ `SUPABASE_SERVICE_ROLE_KEY`: Key สิทธิ์ในการเข้าถึง Supabase

---

## 📱 รูปแบบการทำงานของ Typhoon AI & LINE Bot

1. **สกัดข้อความอัตโนมัติ (OCR & NLP)**:
   - **ส่งภาพถ่ายหนังสือคำสั่ง / ไวท์บอร์ด / ข้อความสั่งการ**: ระบบใช้ `typhoon-ocr` อ่านข้อความภาษาไทย แล้วส่งต่อให้ `typhoon-v2.5-30b-a3b-instruct` แยกแยะโครงสร้างภารกิจ
   - **แมตช์กำลังพลสดจาก Supabase**: ระบบจะดึงรายชื่อสมาชิก (`members` table) ทั้งยศ ชื่อ สกุล ชื่อเล่น มาฉีดใส่ System Prompt ของ Typhoon AI อัตโนมัติ เพื่อให้ระบุผู้รับผิดชอบได้อย่างแม่นยำ

2. **ร่างสรุปภารกิจ (Interactive Draft Queue)**:
   - แสดงวัน เวลา (คำนวณ `all_day` อัตโนมัติ)
   - ชื่อภารกิจ (รักษาสมบูรณ์แบบ ไม่ตัดทอนคำว่า "น้อง 63..." หรือชื่อชุดภารกิจ)
   - หมวดหมู่ (`ภารกิจหน่วย` / `ภารกิจหมาย`)
   - การแต่งกาย (ชุดฝึก / ชุดเครื่องแบบ ฯลฯ)
   - ผู้รับผิดชอบ (แมตช์ด้วย ID ของสมาชิกในระบบ)

3. **พิมพ์สั่งแก้ไขร่างด้วยภาษาไทย**:
   - พิมพ์สั่งเช่น: `แก้ไขวันที่ 2026-09-25`, `เปลี่ยนการแต่งกาย ชุดเครื่องแบบ`, `เพิ่มผู้รับผิดชอบ ท็อป`

4. **กดยืนยันบันทึก**:
   - กดปุ่ม `[✅ ยืนยันบันทึก]` หรือพิมพ์ `ยืนยัน` เพื่อลงบันทึกเข้าปฏิทิน Supabase สดทันที!
