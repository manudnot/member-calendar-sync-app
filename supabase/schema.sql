-- ==============================================================================
-- Supabase Database Schema for TimeTree-Style Member Calendar Web App
-- Executable in Supabase SQL Editor (https://app.supabase.com -> SQL Editor)
-- ==============================================================================

-- 1. Create Members Table (With Rank, Full Name & Nickname)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,                           -- Display Name / Nickname (e.g. "Not", "เอก", "Top")
    rank TEXT,                                   -- Military Rank (ยศ e.g. "จ.ส.อ.", "ร.อ.", "ร.ต.", "ส.อ.")
    full_name TEXT,                              -- Official Full Name (ชื่อ-นามสกุลจริง)
    color TEXT NOT NULL DEFAULT '#3B82F6',
    avatar TEXT NOT NULL DEFAULT '👤',
    email TEXT,
    pin_code TEXT,                               -- 4-digit PIN code for multi-device authentication
    member_type TEXT DEFAULT 'real',             -- 'real' | 'virtual'
    is_archived BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS rank TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_type TEXT DEFAULT 'real';

-- 2. Create Vehicles Master Table (เตรียมไว้สำหรับอนาคต)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,                           -- e.g. "M51", "Revoหมาย", "6ล้อ(สวถ)", "6ล้อ(วศข)", "Vigo", "รถตู้", "รถส่วนตัว"
    plate_no TEXT,                                -- หมายเลขทะเบียน
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Initial Vehicles Master Data
INSERT INTO public.vehicles (id, name) VALUES
  ('veh_m51', 'M51'),
  ('veh_revo', 'Revoหมาย'),
  ('veh_6wheel_svt', '6ล้อ(สวถ)'),
  ('veh_6wheel_wsk', '6ล้อ(วศข)'),
  ('veh_vigo', 'Vigo'),
  ('veh_van', 'รถตู้'),
  ('veh_private', 'รถส่วนตัว')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Draft Events Table for LINE Messaging Bot
CREATE TABLE IF NOT EXISTS public.draft_events (
    id TEXT PRIMARY KEY,                          -- LINE User ID (e.g. U123456789)
    user_id TEXT NOT NULL,                        -- LINE User ID
    draft_data JSONB NOT NULL,                    -- Active event draft object
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT TRUE,
    description TEXT,
    location TEXT,
    category TEXT DEFAULT 'General',
    member_ids JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of member IDs e.g. ["mem_woooddy", "mem_supanut"]
    alarm_minutes INTEGER DEFAULT 15,             -- Notification alarm minutes before event (e.g. 15)
    is_deleted BOOLEAN DEFAULT FALSE,             -- Soft delete flag for Recycle Bin
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Activity Audit Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    event_id TEXT,
    event_title TEXT NOT NULL,
    action TEXT NOT NULL,                         -- 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
    actor_id TEXT NOT NULL,                       -- Member ID of who performed action
    actor_name TEXT NOT NULL,                     -- Member Name
    actor_color TEXT DEFAULT '#10B981',
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create Open Policies for Public API Access
CREATE POLICY "Allow public all access on members" ON public.members FOR ALL USING (true);
CREATE POLICY "Allow public all access on vehicles" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Allow public all access on draft_events" ON public.draft_events FOR ALL USING (true);
CREATE POLICY "Allow public all access on events" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow public all access on activity_logs" ON public.activity_logs FOR ALL USING (true);

-- Seed Real & Virtual Team Members with Ranks & Full Names
INSERT INTO public.members (id, name, rank, full_name, color, avatar, email, member_type)
VALUES 
  ('mem_manudnot', 'Not', 'จ.ส.อ.', 'มนุษย์นอต สื่อสาร', '#8B5CF6', '👨‍💻', 'wtgmso123@gmail.com', 'real'),
  ('mem_third', 'Third', 'ร.ท.', 'สุภณัฐ', '#0EA5E9', '👨‍✈️', '', 'real'),
  ('mem_june', 'June', 'ร.ต.หญิง', 'จูน', '#EC4899', '👩‍💼', '', 'real'),
  ('mem_thanatat', 'Top', 'ร.อ.', 'ธนทัต', '#F59E0B', '👨‍🔬', '', 'real'),
  ('mem_phak_ek', 'เอก', 'ร.อ.', 'ภาคเอก', '#EF4444', '👮‍♂️', '', 'real'),
  ('mem_keng', 'เก่ง', 'ส.อ.', 'เก่งการ', '#06B6D4', '👨‍✈️', '', 'real'),
  ('mem_tum', 'ตั้ม', 'ส.อ.', 'ตั้ม', '#84CC16', '👨‍✈️', '', 'real'),
  ('mem_woooddy', 'WoooddY', 'พ.อ.', 'แชมป์', '#10B981', '🎖️', '', 'real'),
  ('mem_wm', 'เวรหมาย', 'เวร', 'เวรปฏิบัติการหมาย', '#64748B', '🤖', '', 'virtual')
ON CONFLICT (id) DO UPDATE SET 
  rank = EXCLUDED.rank,
  full_name = EXCLUDED.full_name,
  member_type = EXCLUDED.member_type;
