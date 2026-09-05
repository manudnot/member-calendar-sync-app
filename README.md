# 📅 TimeTree-Style Member Calendar Web App (Supabase + Vercel + GAS)

เว็บแอปพลิเคชันจัดการตารางงานทีม เลือกรายชื่อสมาชิก (Multi-Member Selection) พร้อมหน้าตา UI คล้าย **TimeTree** ที่รองรับการแจกจ่ายลิงก์ **iCal (.ics) Dynamic Subscription** ให้สมาชิกนำไปกด Subscribe ลงสมาร์ทโฟน (Apple Calendar, Google Calendar, TimeTree) พร้อมแจ้งเตือนแบบ Push Notification 24 ชั่วโมงผ่าน Vercel และ Supabase

---

## 🌟 คุณสมบัติเด่น (Features)

* 🎨 **TimeTree-Inspired UI/UX**: หน้าจอสวยงาม ปรับแต่งได้ทั้งบนคอมพิวเตอร์และมือถือ มีปฏิทินรายเดือน (Month Grid) และรายการกิจกรรมประจำวัน (Daily Agenda) ด้านล่าง
* 👥 **ระบบเลือกสมาชิก (Multi-Member Selection)**: เลือกสมาชิกได้มากกว่า 1 คนเมื่อสร้างตารางงาน และกดกรองดูเฉพาะตารางงานของแต่ละคนได้
* 📲 **Dynamic iCal Feeds (.ics)**: 
  * ลิงก์ส่วนตัวรายคน: `https://your-project.vercel.app/api/feed?memberId=xxx`
  * ลิงก์รวมทั้งทีม: `https://your-project.vercel.app/api/feed?team=true`
  * รองรับปุ่ม One-click **Copy iCal Link**, **Subscribe on Apple Calendar (`webcal://`)**, **Google Calendar**, และ **QR Code**
* 🔔 **ระบบแจ้งเตือนPush Notification (`VALARM`)**: ฝังเวลาแจ้งเตือนใน iCal Feed เพื่อให้มือถือของสมาชิกเด้งเตือนล่วงหน้า (เช่น 15 นาที, 30 นาที)
* ⚡ **Supabase Database**: จัดเก็บข้อมูลตารางงานและสมาชิกบน Supabase PostgreSQL อย่างปลอดภัย
* 🚀 **Vercel Serverless & Git Deploy**: พร้อมสำหรับ Push ขึ้น GitHub เพื่อเปิดใช้ Vercel แบบ 1-Click

---

## 🛠️ ขั้นตอนการติดตั้งและการตั้งค่า (Setup Guide)

### 1. ตั้งค่าฐานข้อมูล Supabase
1. เข้าไปที่ [Supabase Console](https://app.supabase.com) แล้วสร้าง Project ใหม่
2. ไปที่เมนู **SQL Editor** -> กด **New Query**
3. ก๊อปปี้เนื้อหาในไฟล์ [`supabase/schema.sql`](./supabase/schema.sql) ไปวางแล้วกด **Run**
4. ไปที่เมนู **Project Settings** -> **API** เพื่อคัดลอก:
   - `Project URL` (เช่น `https://xxxx.supabase.co`)
   - `anon public key`

### 2. ทดสอบในเครื่อง Local (Development)
```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. สร้างไฟล์ .env.local แล้วระบุค่า Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 3. รันพัฒนา Local Server
npm run dev
```

### 3. ขั้นตอนการ Deploy ขึ้น Vercel ผ่าน GitHub (เหมือน ExpenseTracker)
1. Push โค้ดในโปรเจกต์นี้ขึ้น **GitHub Repository** ของคุณ
2. เข้าไปที่ [Vercel Dashboard](https://vercel.com) -> กด **Add New Project** -> เลือก GitHub Repository ของคุณ
3. ในส่วน **Environment Variables** ให้ใส่:
   - `SUPABASE_URL` = `https://xxxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `your_anon_key`
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_anon_key`
4. กด **Deploy**! Vercel จะสร้าง URL HTTPS ให้ทันที เช่น `https://your-calendar-app.vercel.app`

---

## 📲 วิธีนำลิงก์ iCal ไปสมัครรับบนมือถือ (Subscription Instructions)

### iPhone / Mac (Apple Calendar)
1. เปิดแอป **Calendar (ปฏิทิน)** บน iPhone
2. กดปุ่ม **Calendars** ด้านล่าง -> เลือก **Add Subscription Calendar (เพิ่มปฏิทินที่สมัครรับ)**
3. นำ URL `https://your-project.vercel.app/api/feed?memberId=xxx` ไปวาง แล้วกด **Subscribe**

### Google Calendar (Android & Web)
1. เปิด [Google Calendar](https://calendar.google.com) บนคอมพิวเตอร์
2. แถบด้านซ้าย มองหา **Other calendars (ปฏิทินอื่น)** -> กดเครื่องหมาย `+` -> เลือก **From URL (จาก URL)**
3. วาง URL iCal ลงไปแล้วกด **Add calendar**

---

## 📄 License
MIT License - พัฒนาขึ้นโดย Antigravity AI
