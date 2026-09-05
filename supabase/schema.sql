-- ==============================================================================
-- Supabase Database Schema for TimeTree-Style Member Calendar Web App
-- Executable in Supabase SQL Editor (https://app.supabase.com -> SQL Editor)
-- ==============================================================================

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    avatar TEXT NOT NULL DEFAULT '👤',
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    location TEXT,
    category TEXT DEFAULT 'General',
    member_ids JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of member IDs e.g. ["mem_woooddy", "mem_supanut"]
    alarm_minutes INTEGER DEFAULT 15,             -- Notification alarm minutes before event (e.g. 15)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create Open Policies for Public API Access (Dev/Demo Mode)
DROP POLICY IF EXISTS "Allow public read access on members" ON public.members;
DROP POLICY IF EXISTS "Allow public insert access on members" ON public.members;
DROP POLICY IF EXISTS "Allow public update access on members" ON public.members;
DROP POLICY IF EXISTS "Allow public delete access on members" ON public.members;

CREATE POLICY "Allow public read access on members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on members" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on members" ON public.members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on members" ON public.members FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access on events" ON public.events;
DROP POLICY IF EXISTS "Allow public insert access on events" ON public.events;
DROP POLICY IF EXISTS "Allow public update access on events" ON public.events;
DROP POLICY IF EXISTS "Allow public delete access on events" ON public.events;

CREATE POLICY "Allow public read access on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on events" ON public.events FOR DELETE USING (true);

-- 3. Seed Real Team Members from TimeTree Calendar 'งาน ส/21'
INSERT INTO public.members (id, name, color, avatar, email)
VALUES 
  ('mem_woooddy', 'WoooddY', '#10B981', '🎖️', 'woooddy@unit21.com'),
  ('mem_supanut', 'Supanut Tongnumwon', '#3B82F6', '👨‍✈️', 'supanut@unit21.com'),
  ('mem_manudnot', 'manudnot', '#8B5CF6', '👨‍💻', 'manudnot@unit21.com'),
  ('mem_june', 'June', '#EC4899', '👩‍💼', 'june@unit21.com'),
  ('mem_thanatat', 'Thanatat Parnsaeng', '#F59E0B', '👨‍🔬', 'thanatat@unit21.com'),
  ('mem_phak_ek', 'ผก.เอก', '#EF4444', '👮‍♂️', 'ek@unit21.com'),
  ('mem_keng', 'มว.เก่ง', '#06B6D4', '👨‍✈️', 'keng@unit21.com'),
  ('mem_tum', 'มว.ตั้ม', '#84CC16', '👨‍✈️', 'tum@unit21.com')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed All 84 Extracted TimeTree Events (From 27/12/2024 Onwards)
INSERT INTO public.events (id, title, start_time, end_time, category, member_ids, alarm_minutes, location)
VALUES
  ('evt_tt_1', 'Open house All', '2024-12-27T09:00:00Z', '2024-12-27T17:00:00Z', 'Open House (Purple)', '["mem_woooddy", "mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_2', 'ตรวจพื้นที่ All บน.6 (ประชุม กฝร. 8:30 / SBAC 9:00)', '2025-01-02T08:30:00Z', '2025-01-02T16:00:00Z', 'ตรวจพื้นที่ (Red)', '["mem_phak_ek", "mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_3', 'ประกาศรายชื่อจิตอาสา', '2025-01-03T09:00:00Z', '2025-01-03T17:00:00Z', 'จิตอาสา (Brown)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_4', 'STAFFEX', '2025-01-06T09:00:00Z', '2025-01-10T17:00:00Z', 'ฝึกศึกษา (Blue)', '["mem_manudnot", "mem_thanatat"]'::jsonb, 15, ''),
  ('evt_tt_5', 'วันเด็ก', '2025-01-09T08:00:00Z', '2025-01-09T16:00:00Z', 'กิจกรรมพิเศษ (Pink)', '["mem_june"]'::jsonb, 15, ''),
  ('evt_tt_6', 'สัมภาษณ์ จอส. รุ่น 8', '2025-01-13T09:00:00Z', '2025-01-18T17:00:00Z', 'คัดเลือก (Emerald)', '["mem_keng", "mem_tum"]'::jsonb, 15, ''),
  ('evt_tt_7', 'CPX ท็อป ศยพ.ทอ.', '2025-01-26T09:00:00Z', '2025-01-30T17:00:00Z', 'CPX (Purple)', '["mem_supanut", "mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_8', 'หมาย รับปริญญาธรรมศาสตร์', '2025-02-01T08:00:00Z', '2025-02-01T17:00:00Z', 'ภารกิจหมาย (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_9', 'การฝึกตาม รปจ.', '2025-02-07T09:00:00Z', '2025-02-11T17:00:00Z', 'ฝึกศึกษา (Blue)', '["mem_keng"]'::jsonb, 15, ''),
  ('evt_tt_10', 'อบรมก่อนฝึก CG', '2025-02-10T09:00:00Z', '2025-02-12T17:00:00Z', 'อบรม (Emerald)', '["mem_thanatat"]'::jsonb, 15, ''),
  ('evt_tt_11', '905 ม.ศิลปากร นครปฐม', '2025-02-18T09:00:00Z', '2025-02-20T17:00:00Z', 'ภารกิจหมาย (Red)', '["mem_manudnot"]'::jsonb, 15, ''),
  ('evt_tt_12', 'Unit school / ภาคนอกที่ตั้ง', '2025-03-01T09:00:00Z', '2025-03-28T17:00:00Z', 'Unit School (Blue)', '["mem_woooddy", "mem_tum"]'::jsonb, 15, ''),
  ('evt_tt_13', 'กฝร.ห้วยภูมิภาค ระยอง', '2025-03-12T09:00:00Z', '2025-03-15T17:00:00Z', 'กฝร. (Brown)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_14', 'เกณฑ์ทหาร', '2025-04-01T08:00:00Z', '2025-04-05T17:00:00Z', 'ภารกิจพิเศษ (Purple)', '["mem_phak_ek", "mem_june"]'::jsonb, 15, ''),
  ('evt_tt_15', 'ฝึก พัน.ร.ผสม', '2025-04-07T09:00:00Z', '2025-04-10T17:00:00Z', 'การฝึก (Blue)', '["mem_keng"]'::jsonb, 15, ''),
  ('evt_tt_16', 'สอบสัมภาษณ์ นดท.', '2025-04-18T09:00:00Z', '2025-04-23T17:00:00Z', 'สอบ (Emerald)', '["mem_thanatat"]'::jsonb, 15, ''),
  ('evt_tt_17', 'ภารกิจ VVIP เสด็จฯ', '2025-04-25T09:00:00Z', '2025-04-28T17:00:00Z', 'ภารกิจสำคัญ (Red)', '["mem_phak_ek", "mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_18', 'หมาย 904', '2025-05-01T09:00:00Z', '2025-05-01T17:00:00Z', 'ภารกิจหมาย (Red)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_19', 'อบรม C4I บก.ทท.', '2025-05-19T09:00:00Z', '2025-05-24T17:00:00Z', 'อบรม (Emerald)', '["mem_manudnot"]'::jsonb, 15, ''),
  ('evt_tt_20', 'ประชุม CPX ทน.1', '2025-05-28T09:00:00Z', '2025-05-30T17:00:00Z', 'ประชุม (Purple)', '["mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_21', 'กฝร.68', '2025-06-04T09:00:00Z', '2025-06-20T17:00:00Z', 'กฝร. (Brown)', '["mem_tum"]'::jsonb, 15, ''),
  ('evt_tt_22', 'Workshop CPX&LOGEX', '2025-06-25T09:00:00Z', '2025-06-27T17:00:00Z', 'Workshop (Blue)', '["mem_thanatat", "mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_23', 'INTEX จูน', '2025-06-29T09:00:00Z', '2025-06-30T17:00:00Z', 'INTEX (Emerald)', '["mem_june"]'::jsonb, 15, ''),
  ('evt_tt_24', 'INTEX จูน / นฝ. Open house', '2025-07-01T09:00:00Z', '2025-07-05T17:00:00Z', 'Open House (Purple)', '["mem_woooddy", "mem_june"]'::jsonb, 15, ''),
  ('evt_tt_25', 'CPX & LOGEX พี่ท็อป', '2025-07-13T09:00:00Z', '2025-07-18T17:00:00Z', 'CPX (Blue)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_26', 'วางพานพุ่ม 904', '2025-07-28T09:00:00Z', '2025-07-28T17:00:00Z', 'ภารกิจพิธี (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_27', 'ตรวจสอบน้ำท่วม', '2025-08-01T09:00:00Z', '2025-08-01T17:00:00Z', 'ช่วยเหลือประชาชน (Emerald)', '["mem_keng", "mem_tum"]'::jsonb, 15, ''),
  ('evt_tt_28', '128 ปี โรงเรียนนายร้อยพระจุลจอมเกล้า', '2025-08-05T08:00:00Z', '2025-08-05T17:00:00Z', 'พิธีการ (Red)', '["mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_29', 'RBC สระแก้ว', '2025-08-20T09:00:00Z', '2025-08-22T17:00:00Z', 'RBC (Brown)', '["mem_thanatat"]'::jsonb, 15, ''),
  ('evt_tt_30', 'ประชุมประจำเดือน / CCOC', '2025-08-28T09:00:00Z', '2025-08-29T17:00:00Z', 'ประชุม (Purple)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_31', 'โทรหาผมหงอก', '2025-09-02T09:00:00Z', '2025-09-02T10:00:00Z', 'ส่วนตัว (Pink)', '["mem_manudnot"]'::jsonb, 15, ''),
  ('evt_tt_32', '1330 ซักซ้อม มุทิตาจิต', '2025-09-18T13:30:00Z', '2025-09-18T17:00:00Z', 'ซักซ้อม (Brown)', '["mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_33', 'ซ้อมย่อย/ซ้อมใหญ่รับส่งหน้าที่ มหน.1', '2025-09-25T09:00:00Z', '2025-09-26T17:00:00Z', 'รับส่งหน้าที่ (Red)', '["mem_phak_ek", "mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_34', 'รับส่งหน้าที่ มหน.1', '2025-10-01T09:00:00Z', '2025-10-01T17:00:00Z', 'รับส่งหน้าที่ (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_35', 'หมาย 905 / หมาย 919', '2025-10-09T09:00:00Z', '2025-10-10T17:00:00Z', 'ภารกิจหมาย (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_36', 'พระบรมมหาราชวัง (19.00 น.)', '2025-10-27T19:00:00Z', '2025-11-01T21:00:00Z', 'ภารกิจวัง (Red)', '["mem_woooddy", "mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_37', 'ติดตั้ง vtc หอประชุม ท.', '2025-11-05T09:00:00Z', '2025-11-05T17:00:00Z', 'การสื่อสาร (Emerald)', '["mem_manudnot"]'::jsonb, 15, ''),
  ('evt_tt_38', 'งานแต่ง💕 เจ 22', '2025-11-09T17:00:00Z', '2025-11-09T22:00:00Z', 'งานสังคม (Pink)', '["mem_june", "mem_thanatat"]'::jsonb, 15, ''),
  ('evt_tt_39', 'รอง จก.ยศ. ตรวจหน่วย', '2025-11-18T09:00:00Z', '2025-11-18T17:00:00Z', 'ตรวจหน่วย (Purple)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_40', 'Big cleaning', '2025-11-26T09:00:00Z', '2025-11-26T17:00:00Z', 'ทำความสะอาด (Blue)', '["mem_woooddy", "mem_keng"]'::jsonb, 15, ''),
  ('evt_tt_41', 'ต่อใบขับขี่', '2025-12-01T09:00:00Z', '2025-12-01T12:00:00Z', 'ส่วนตัว (Pink)', '["mem_manudnot"]'::jsonb, 15, ''),
  ('evt_tt_42', 'งานนาเดีย', '2025-12-12T09:00:00Z', '2025-12-13T17:00:00Z', 'งานสังคม (Pink)', '["mem_june"]'::jsonb, 15, ''),
  ('evt_tt_43', 'สวนสนาม ส/1', '2025-12-22T08:00:00Z', '2025-12-26T17:00:00Z', 'สวนสนาม (Red)', '["mem_phak_ek", "mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_44', 'วันเด็ก', '2026-01-09T08:00:00Z', '2026-01-09T16:00:00Z', 'กิจกรรมพิเศษ (Pink)', '["mem_june"]'::jsonb, 15, ''),
  ('evt_tt_45', 'สัมภาษณ์ จอส. รุ่น 8', '2026-01-13T09:00:00Z', '2026-01-13T17:00:00Z', 'คัดเลือก (Emerald)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_46', 'อบรมประวัติศาสตร์ ค่ายพระราม 6', '2026-01-19T09:00:00Z', '2026-01-19T17:00:00Z', 'อบรม (Brown)', '["mem_thanatat"]'::jsonb, 15, ''),
  ('evt_tt_47', 'ฝึก กฝร staffex กองพล', '2026-01-26T09:00:00Z', '2026-01-30T17:00:00Z', 'การฝึก (Blue)', '["mem_keng", "mem_tum"]'::jsonb, 15, ''),
  ('evt_tt_48', 'การบำเพ็ญพระราชกุศลถวายพระพร', '2026-02-01T09:00:00Z', '2026-02-01T17:00:00Z', 'พิธีการ (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_49', 'ฝึก staffex กรม กองพัน', '2026-02-02T09:00:00Z', '2026-02-06T17:00:00Z', 'การฝึก (Blue)', '["mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_50', 'อบรมก่อนฝึก CG', '2026-02-10T09:00:00Z', '2026-02-12T17:00:00Z', 'อบรม (Emerald)', '["mem_thanatat"]'::jsonb, 15, ''),
  ('evt_tt_51', '905 ม.ศิลปากร นครปฐม', '2026-02-18T09:00:00Z', '2026-02-20T17:00:00Z', 'ภารกิจหมาย (Red)', '["mem_manudnot"]'::jsonb, 15, ''),
  ('evt_tt_52', 'สนับสนุนสื่อสาร จอส.รุ่น 8', '2026-03-09T09:00:00Z', '2026-03-21T17:00:00Z', 'สื่อสาร (Emerald)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_53', 'Unit school', '2026-03-17T09:00:00Z', '2026-03-18T17:00:00Z', 'Unit School (Blue)', '["mem_tum"]'::jsonb, 15, ''),
  ('evt_tt_54', 'ภาคกองพัน', '2026-03-23T09:00:00Z', '2026-03-23T17:00:00Z', 'การฝึก (Blue)', '["mem_keng"]'::jsonb, 15, ''),
  ('evt_tt_55', 'สนับสนุนการฝึกแผนป้องกันเขต', '2026-03-28T09:00:00Z', '2026-03-28T17:00:00Z', 'แผนป้องกัน (Purple)', '["mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_56', 'นฝ. เปิดหน่วยฝึก', '2026-04-01T09:00:00Z', '2026-04-03T17:00:00Z', 'เปิดหน่วยฝึก (Purple)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_57', 'สอบสัมภาษณ์ นดท.', '2026-04-17T09:00:00Z', '2026-04-20T17:00:00Z', 'สอบ (Emerald)', '["mem_thanatat"]'::jsonb, 15, ''),
  ('evt_tt_58', 'ตรวจสอบครูทหารใหม่', '2026-04-27T09:00:00Z', '2026-04-27T17:00:00Z', 'ตรวจหน่วย (Purple)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_59', 'นฝ. นดร.12 นิเทศก์อบรม', '2026-04-29T09:00:00Z', '2026-04-30T17:00:00Z', 'นิเทศ (Brown)', '["mem_manudnot"]'::jsonb, 15, ''),
  ('evt_tt_60', 'พิธีถวายราชฯ วันฉัตรมงคล', '2026-05-01T09:00:00Z', '2026-05-01T17:00:00Z', 'พิธีการ (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_61', 'ซ้อมตรวจ สดน.', '2026-05-06T09:00:00Z', '2026-05-06T17:00:00Z', 'ซักซ้อม (Brown)', '["mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_62', 'นิเทศโรคลมร้อน', '2026-05-19T09:00:00Z', '2026-05-19T17:00:00Z', 'นิเทศ (Emerald)', '["mem_june"]'::jsonb, 15, ''),
  ('evt_tt_63', 'ตรวจเอกสารสนามยิงปืน', '2026-05-28T09:00:00Z', '2026-05-29T17:00:00Z', 'ตรวจเอกสาร (Purple)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_64', 'กฝร.พดท.69 ภาคสนาม ภูมิภาค มทบ.12', '2026-06-06T09:00:00Z', '2026-06-13T17:00:00Z', 'กฝร. (Brown)', '["mem_keng", "mem_tum"]'::jsonb, 15, ''),
  ('evt_tt_65', 'จเร ทภ.1 ตรวจคุณภาพชีวิต', '2026-06-17T09:00:00Z', '2026-06-19T17:00:00Z', 'จเรตรวจ (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_66', 'ทหารใหม่ฝึกช่างไม้ ดุสิต', '2026-06-20T09:00:00Z', '2026-06-29T17:00:00Z', 'การฝึก (Blue)', '["mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_67', 'Open house', '2026-07-03T09:00:00Z', '2026-07-03T17:00:00Z', 'Open House (Purple)', '["mem_june"]'::jsonb, 15, ''),
  ('evt_tt_68', 'สอบ กพ.', '2026-07-05T08:00:00Z', '2026-07-05T17:00:00Z', 'สอบ (Emerald)', '["mem_thanatat"]'::jsonb, 15, ''),
  ('evt_tt_69', 'หมอมาทำฟัน', '2026-07-14T09:00:00Z', '2026-07-16T17:00:00Z', 'สวัสดิการ (Pink)', '["mem_manudnot"]'::jsonb, 15, ''),
  ('evt_tt_70', 'ตักบาตร ถวายราชสีกก', '2026-07-24T07:00:00Z', '2026-07-24T12:00:00Z', 'พิธีการ (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_71', 'วางพานพุ่ม สนามหลวง', '2026-07-28T08:00:00Z', '2026-07-28T17:00:00Z', 'พิธีการ (Red)', '["mem_phak_ek", "mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_72', '908 ครบ 50 วัน', '2026-07-30T09:00:00Z', '2026-07-30T17:00:00Z', 'ภารกิจหมาย (Red)', '["mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_73', 'หมาย 904 HMSV', '2026-08-01T09:00:00Z', '2026-08-01T17:00:00Z', 'ภารกิจหมาย (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_74', 'ทดสอบร่างกาย', '2026-08-05T07:30:00Z', '2026-08-05T12:00:00Z', 'ทดสอบ (Blue)', '["mem_keng", "mem_tum"]'::jsonb, 15, ''),
  ('evt_tt_75', 'เตรียม 2', '2026-08-10T09:00:00Z', '2026-08-10T17:00:00Z', 'เตรียมการ (Purple)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_76', 'ถวายราชสีกการะ 908', '2026-08-11T09:00:00Z', '2026-08-11T17:00:00Z', 'พิธีการ (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_77', 'รับตรวจ จเร ทบ. / ประชุม กยก.ทภ.1', '2026-08-19T09:00:00Z', '2026-08-19T17:00:00Z', 'จเรตรวจ (Red)', '["mem_phak_ek", "mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_78', 'ประชุม พระบรมศพ', '2026-08-21T09:00:00Z', '2026-08-21T17:00:00Z', 'ประชุม (Red)', '["mem_supanut"]'::jsonb, 15, ''),
  ('evt_tt_79', 'Party 01', '2026-08-26T18:00:00Z', '2026-08-26T21:00:00Z', 'Party (Pink)', '["mem_thanatat", "mem_supanut", "mem_manudnot"]'::jsonb, 15, ''),
  ('evt_tt_80', 'ฝึก CALFLEX', '2026-09-05T09:00:00Z', '2026-09-08T17:00:00Z', 'การฝึก (Blue)', '["mem_keng", "mem_tum"]'::jsonb, 15, ''),
  ('evt_tt_81', '1000 ประชุมหารือ การติดต่อสื่อสาร กกล.บูรพา และ ส.พัน.2', '2026-09-09T10:00:00Z', '2026-09-09T12:00:00Z', 'ประชุมสื่อสาร (Emerald)', '["mem_supanut"]'::jsonb, 15, 'https://meet.google.com/cqp-hwsa-eet'),
  ('evt_tt_82', 'จเร ทภ.1 ตรวจคุณภาพชีวิต', '2026-09-10T09:00:00Z', '2026-09-10T17:00:00Z', 'จเรตรวจ (Red)', '["mem_phak_ek"]'::jsonb, 15, ''),
  ('evt_tt_83', '908 ครบ 100 วัน / หมาย 904 HMSV', '2026-09-18T09:00:00Z', '2026-09-19T17:00:00Z', 'ภารกิจหมาย (Red)', '["mem_phak_ek", "mem_woooddy"]'::jsonb, 15, ''),
  ('evt_tt_84', 'หมาย 904 HMSV', '2026-09-24T09:00:00Z', '2026-09-25T17:00:00Z', 'ภารกิจหมาย (Red)', '["mem_phak_ek"]'::jsonb, 15, '')
ON CONFLICT (id) DO NOTHING;
