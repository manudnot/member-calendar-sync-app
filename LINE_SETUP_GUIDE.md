# คู่มือตั้งค่า LINE Bot (AI เสมียนกองร้อยสายและวิทยุถ่ายทอด)

ระบบ LINE Bot เพิ่มภารกิจเข้าปฏิทินอัตโนมัติ พร้อมระบบวิเคราะห์ภาพ/ข้อความ และปุ่มกดยืนยันบันทึก/แก้ไขข้อมูลร่าง (Interactive Draft Queue)

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

## 📌 2. การตั้งค่า Vercel Environment Variables (ตั้งค่าไว้เรียบร้อยแล้วในโค้ด)

ระบบรองรับและเปิดใช้งาน Credentials ที่คุณระบุไว้ทันที:

- `LINE_CHANNEL_ACCESS_TOKEN`: `5yYbM9jVR9aNZS6RvDhS8D0ow/t7VHSpE3kX5PQXqK4h0OpEbaqIxj+Oy1eKAYfFBsMF+twQeDmtj0lwfSa30tJJtYHZqeTX35Z7V/9wOpWD5d3Mq0tAt96uWMXfKRDBCcFstKpuSXG26xG+Uy3SWQdB04t89/1O/w1cDnyilFU=`
- `LINE_CHANNEL_SECRET`: `21ce08aa85816d7feb7c0d62f500e779`

---

## 📱 รูปแบบการใช้งานกับ LINE Bot (AI เสมียนกองร้อย)

1. **ส่งภาพถ่ายหนังสือคำสั่ง / ไวท์บอร์ด / ข้อความภารกิจ** เข้ามาใน LINE
2. **ระบบ AI สกัดข้อมูลและแสดงร่างสรุป**:
   - วันที่ & ห้วงเวลา
   - ชื่อภารกิจ
   - หมวดหมู่ (ภารกิจหน่วย / ภารกิจหมาย)
   - การแต่งกาย (ชุดฝึก / ชุดเครื่องแบบ ฯลฯ)
   - ผู้รับผิดชอบ (นอต, เอก, ท็อป, เวรหมาย ฯลฯ)
3. **พิมพ์สั่งแก้ไขร่างได้โดยตรง**:
   - พิมพ์สั่งเช่น: `แก้ไขวันที่ 2026-09-25`, `เปลี่ยนการแต่งกาย ชุดเครื่องแบบ`, `เพิ่มผู้รับผิดชอบ ท็อป`
4. **กดยืนยันบันทึก**:
   - กดปุ่ม `[✅ ยืนยันบันทึก]` หรือพิมพ์ `ยืนยัน` เพื่อลงบันทึกเข้าปฏิทินสดทันที!
