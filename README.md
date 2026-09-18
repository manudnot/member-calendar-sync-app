# 📅 TimeTree-Style Member Calendar Web App (Supabase + Vercel + GAS + Typhoon AI)

เว็บแอปพลิเคชันจัดการตารางงานทีม เลือกรายชื่อสมาชิก (Multi-Member Selection) พร้อมหน้าตา UI คล้าย **TimeTree** ที่รองรับการแจกจ่ายลิงก์ **iCal (.ics) Dynamic Subscription** ให้สมาชิกนำไปกด Subscribe ลงสมาร์ทโฟน (Apple Calendar, Google Calendar, TimeTree) พร้อมระบบ **LINE Bot เสมียนกองร้อย AI (Typhoon AI)** ช่วยอ่านหนังสือคำสั่ง/รูปภาพ แล้วบันทึกเข้าปฏิทินให้อัตโนมัติ

---

## 🌟 คุณสมบัติเด่น (Features)

* 🎨 **TimeTree-Inspired UI/UX**: หน้าจอสวยงาม ปรับแต่งได้ทั้งบนคอมพิวเตอร์และมือถือ มีปฏิทินรายเดือน (Month Grid) และรายการกิจกรรมประจำวัน (Daily Agenda) ด้านล่าง
* 👥 **ระบบเลือกสมาชิก (Multi-Member Selection & Dynamic Database Matching)**: เลือกสมาชิกได้มากกว่า 1 คนเมื่อสร้างตารางงาน ดึงรายชื่อ ยศ ชื่อ สกุล ชื่อเล่น จาก Supabase PostgreSQL มาแสดงผลและแมตช์อัตโนมัติ
* 🤖 **LINE Bot เสมียนกองร้อย (Powered by Typhoon AI)**: 
  * ส่งรูปภาพหนังสือคำสั่ง / ตารางเวร / ข้อความภารกิจ เข้า LINE Bot ให้ AI สกัดวัน เวลา ภารกิจ การแต่งกาย และผู้รับผิดชอบ
  * มีระบบ **Interactive Draft Queue** ปรับแก้ร่างด้วยคำสั่งภาษาไทยธรรมดา (เช่น `แก้ไขวันที่ 2026-09-25`)
  * กดปุ่ม `[✅ ยืนยันบันทึก]` เพื่อลงบันทึกเข้าปฏิทิน Supabase ทันที
* 📲 **Dynamic iCal Feeds (.ics)**: 
  * ลิงก์ส่วนตัวรายคน: `https://member-calendar-sync-app.vercel.app/api/feed?memberId=xxx`
  * ลิงก์รวมทั้งทีม: `https://member-calendar-sync-app.vercel.app/api/feed?team=true`
  * รองรับปุ่ม One-click **Copy iCal Link**, **Subscribe on Apple Calendar (`webcal://`)**, **Google Calendar**, และ **QR Code**
* 🔔 **ระบบแจ้งเตือน Push Notification (`VALARM`)**: ฝังเวลาแจ้งเตือนใน iCal Feed เพื่อให้มือถือของสมาชิกเด้งเตือนล่วงหน้า (เช่น 15 นาที, 30 นาที)
* ⚡ **Supabase Database**: จัดเก็บข้อมูลตารางงานและสมาชิกบน Supabase PostgreSQL พร้อมฟิลด์ `all_day` สำหรับภารกิจตลอดวัน
* 🚀 **Vercel Serverless & Git Deploy**: พร้อมสำหรับ Push ขึ้น GitHub เพื่อเปิดใช้ Vercel แบบ 1-Click

---

## 🛠️ ขั้นตอนการติดตั้งและการตั้งค่า (Setup Guide)

### 1. ตั้งค่าฐานข้อมูล Supabase
1. เข้าไปที่ [Supabase Console](https://app.supabase.com) แล้วสร้าง Project ใหม่
2. ไปที่เมนู **SQL Editor** -> กด **New Query**
3. ก๊อปปี้เนื้อหาในไฟล์ [`supabase/schema.sql`](./supabase/schema.sql) ไปวางแล้วกด **Run**
4. หากมีตารางเดิมอยู่แล้ว สามารถรัน SQL Migration เพิ่มเติมได้ดังนี้:
```sql
-- เพิ่มฟิลด์ all_day ในตาราง events
ALTER TABLE events ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT false;

-- เพิ่มฟิลด์ข้อมูลยศ ชื่อ สกุล ชื่อเล่น ในตาราง members
ALTER TABLE members ADD COLUMN IF NOT EXISTS rank TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS member_type TEXT DEFAULT 'ประจำการ';
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
```

### 2. ทดสอบในเครื่อง Local (Development)
```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. สร้างไฟล์ .env.local แล้วระบุค่า Supabase & Typhoon AI
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key
# TYPHOON_API_KEY=your_typhoon_api_key

# 3. รันพัฒนา Local Server
npm run dev
```

### 3. ขั้นตอนการ Deploy ขึ้น Vercel
1. Push โค้ดในโปรเจกต์นี้ขึ้น **GitHub Repository** ของคุณ
2. เข้าไปที่ [Vercel Dashboard](https://vercel.com) -> เลือก Repository ของคุณ
3. ในส่วน **Environment Variables** ให้ใส่:
   - `SUPABASE_URL` = `https://xxxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `your_anon_key`
   - `VITE_SUPABASE_URL` = `https://xxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your_anon_key`
   - `LINE_CHANNEL_ACCESS_TOKEN` = `your_token`
   - `LINE_CHANNEL_SECRET` = `your_secret`
   - `TYPHOON_API_KEY` = `your_typhoon_api_key`
4. กด **Deploy**! Vercel จะสร้าง URL HTTPS ให้ทันที เช่น `https://member-calendar-sync-app.vercel.app`

---

## 📲 วิธีนำลิงก์ iCal ไปสมัครรับบนมือถือ (Subscription Instructions)

### iPhone / Mac (Apple Calendar)
1. เปิดแอป **Calendar (ปฏิทิน)** บน iPhone
2. กดปุ่ม **Calendars** ด้านล่าง -> เลือก **Add Subscription Calendar (เพิ่มปฏิทินที่สมัครรับ)**
3. นำ URL `https://member-calendar-sync-app.vercel.app/api/feed?memberId=xxx` ไปวาง แล้วกด **Subscribe**

### Google Calendar (Android & Web)
1. เปิด [Google Calendar](https://calendar.google.com) บนคอมพิวเตอร์
2. แถบด้านซ้าย มองหา **Other calendars (ปฏิทินอื่น)** -> กดเครื่องหมาย `+` -> เลือก **From URL (จาก URL)**
3. วาง URL iCal ลงไปแล้วกด **Add calendar**

---

## 📄 License
MIT License - พัฒนาขึ้นโดย Antigravity AI
