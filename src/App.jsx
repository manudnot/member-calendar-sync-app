import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightToolbar from './components/RightToolbar';
import Toast from './components/Toast';
import MonthGrid from './components/Scheduler/MonthGrid';
import DailyAgenda from './components/Scheduler/DailyAgenda';
import MissionModal from './components/Scheduler/MissionModal';
import IcalModal from './components/Modals/IcalModal';
import { formatDateKey } from './utils/helpers';
import { supabase } from './utils/supabase';

// INITIAL REAL TIMETREE MEMBERS (8 MEMBERS WITH INITIALS & COLOR TOKENS)
const INITIAL_MEMBERS = [
  { id: 'mem_woooddy', name: 'WoooddY', initials: 'WD', color: '#10b981', email: 'woooddy@unit21.com' },
  { id: 'mem_supanut', name: 'Supanut Tongnumwon', initials: 'SN', color: '#3b82f6', email: 'supanut@unit21.com' },
  { id: 'mem_manudnot', name: 'manudnot', initials: 'MN', color: '#8b5cf6', email: 'manudnot@unit21.com' },
  { id: 'mem_june', name: 'June', initials: 'JN', color: '#ec4899', email: 'june@unit21.com' },
  { id: 'mem_thanatat', name: 'Thanatat Parnsaeng', initials: 'TT', color: '#f59e0b', email: 'thanatat@unit21.com' },
  { id: 'mem_phak_ek', name: 'ผก.เอก', initials: 'PE', color: '#ef4444', email: 'ek@unit21.com' },
  { id: 'mem_keng', name: 'มว.เก่ง', initials: 'KG', color: '#06b6d4', email: 'keng@unit21.com' },
  { id: 'mem_tum', name: 'มว.ตั้ม', initials: 'TM', color: '#84cc16', email: 'tum@unit21.com' }
];

const INITIAL_EVENTS = [
  { "id": "evt_tt_1", "title": "Open house All", "start_time": "2024-12-27T09:00:00Z", "end_time": "2024-12-27T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_woooddy", "mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_2", "title": "ตรวจพื้นที่ All บน.6 (ประชุม กฝร. 8:30 / SBAC 9:00)", "start_time": "2025-01-02T08:30:00Z", "end_time": "2025-01-02T16:00:00Z", "all_day": false, "color": "#ef4444", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_3", "title": "ประกาศรายชื่อจิตอาสา", "start_time": "2025-01-03T09:00:00Z", "end_time": "2025-01-03T17:00:00Z", "all_day": true, "color": "#795548", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_4", "title": "STAFFEX", "start_time": "2025-01-06T09:00:00Z", "end_time": "2025-01-10T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_manudnot", "mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_5", "title": "วันเด็ก", "start_time": "2025-01-09T08:00:00Z", "end_time": "2025-01-09T16:00:00Z", "all_day": true, "color": "#ec4899", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_6", "title": "สัมภาษณ์ จอส. รุ่น 8", "start_time": "2025-01-13T09:00:00Z", "end_time": "2025-01-18T17:00:00Z", "all_day": true, "color": "#10b981", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_7", "title": "CPX ท็อป ศยพ.ทอ.", "start_time": "2025-01-26T09:00:00Z", "end_time": "2025-01-30T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_supanut", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_8", "title": "หมาย รับปริญญาธรรมศาสตร์", "start_time": "2025-02-01T08:00:00Z", "end_time": "2025-02-01T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_9", "title": "การฝึกตาม รปจ.", "start_time": "2025-02-07T09:00:00Z", "end_time": "2025-02-11T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_keng"], "alarm_minutes": 15 },
  { "id": "evt_tt_10", "title": "อบรมก่อนฝึก CG", "start_time": "2025-02-10T09:00:00Z", "end_time": "2025-02-12T17:00:00Z", "all_day": true, "color": "#10b981", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_11", "title": "905 ม.ศิลปากร นครปฐม", "start_time": "2025-02-18T09:00:00Z", "end_time": "2025-02-20T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_12", "title": "Unit school / ภาคนอกที่ตั้ง", "start_time": "2025-03-01T09:00:00Z", "end_time": "2025-03-28T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_woooddy", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_13", "title": "กฝร.ห้วยภูมิภาค ระยอง", "start_time": "2025-03-12T09:00:00Z", "end_time": "2025-03-15T17:00:00Z", "all_day": true, "color": "#795548", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_80", "title": "ฝึก CALFLEX", "start_time": "2026-09-05T09:00:00Z", "end_time": "2026-09-08T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_81", "title": "1000 ประชุมหารือ การติดต่อสื่อสาร กกล.บูรพา และ ส.พัน.2", "start_time": "2026-09-09T10:00:00Z", "end_time": "2026-09-09T12:00:00Z", "all_day": false, "color": "#10b981", "member_ids": ["mem_supanut"], "location": "https://meet.google.com/cqp-hwsa-eet", "alarm_minutes": 15 },
  { "id": "evt_tt_82", "title": "จเร ทภ.1 ตรวจคุณภาพชีวิต", "start_time": "2026-09-10T09:00:00Z", "end_time": "2026-09-10T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_83", "title": "908 ครบ 100 วัน / หมาย 904 HMSV", "start_time": "2026-09-18T09:00:00Z", "end_time": "2026-09-19T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_84", "title": "หมาย 904 HMSV", "start_time": "2026-09-24T09:00:00Z", "end_time": "2026-09-25T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 }
];

export default function App() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(formatDateKey(new Date()));
  const [activeMemberFilter, setActiveMemberFilter] = useState('all');
  const [viewMode, setViewMode] = useState('monthly');
  const [theme, setTheme] = useState('light'); // 'light' | 'dark' | 'system'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [events, setEvents] = useState(INITIAL_EVENTS);

  // Modals state
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isIcalModalOpen, setIsIcalModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast] = useState(null);

  // Theme manager
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Load from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      if (supabase) {
        try {
          const { data: supaMembers } = await supabase.from('members').select('*');
          if (supaMembers && supaMembers.length > 0) setMembers(supaMembers);

          const { data: supaEvents } = await supabase.from('events').select('*');
          if (supaEvents && supaEvents.length > 0) setEvents(supaEvents);
        } catch (err) {
          console.warn('Supabase fetch notice:', err);
        }
      }
    }
    fetchData();
  }, []);

  const handlePrevMonth = () => {
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 0) {
      m = 11;
      y--;
    }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const handleNextMonth = () => {
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(formatDateKey(now));
  };

  const handleOpenAddEvent = (dateStr) => {
    setEditingEvent(null);
    if (dateStr) setSelectedDateStr(dateStr);
    setIsMissionModalOpen(true);
  };

  const handleOpenEditEvent = (eventId) => {
    const evt = events.find(e => e.id === eventId);
    if (evt) {
      setEditingEvent(evt);
      setIsMissionModalOpen(true);
    }
  };

  const handleSaveEvent = async (eventPayload) => {
    const exists = events.some(e => e.id === eventPayload.id);

    if (exists) {
      setEvents(events.map(e => e.id === eventPayload.id ? eventPayload : e));
      if (supabase) {
        try { await supabase.from('events').update(eventPayload).eq('id', eventPayload.id); } catch(e){}
      }
      setToast({ message: 'แก้ไขกิจกรรมสำเร็จแล้ว!', type: 'success' });
    } else {
      setEvents([...events, eventPayload]);
      if (supabase) {
        try { await supabase.from('events').insert([eventPayload]); } catch(e){}
      }
      setToast({ message: 'สร้างกิจกรรมใหม่สำเร็จแล้ว!', type: 'success' });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?')) return;

    setEvents(events.filter(e => e.id !== eventId));
    if (supabase) {
      try { await supabase.from('events').delete().eq('id', eventId); } catch(e){}
    }
    setToast({ message: 'ลบกิจกรรมเรียบร้อยแล้ว', type: 'info' });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
      
      {/* 1. Header with DutyRoster Theme Switcher & Month Navigator */}
      <Header
        currentYear={currentYear}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        setTheme={setTheme}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenIcalModal={() => setIsIcalModalOpen(true)}
        onOpenAddEvent={() => handleOpenAddEvent(selectedDateStr)}
      />

      {/* 2. Three-Column Main Body Layout */}
      <div className="flex flex-1 h-[calc(100vh-56px)] overflow-hidden">
        
        {/* Left Sidebar (Member Filters & Initials Avatars) */}
        <Sidebar
          members={members}
          events={events}
          activeMemberFilter={activeMemberFilter}
          setActiveMemberFilter={setActiveMemberFilter}
          isOpen={isSidebarOpen}
        />

        {/* Center Workspace (Month Grid & Daily Agenda Drawer) */}
        <main className="flex-1 flex flex-col bg-white dark:bg-dark-card overflow-hidden">
          <MonthGrid
            currentYear={currentYear}
            currentMonth={currentMonth}
            selectedDateStr={selectedDateStr}
            onSelectDate={setSelectedDateStr}
            events={events}
            members={members}
            activeMemberFilter={activeMemberFilter}
            onEditEvent={handleOpenEditEvent}
          />

          <DailyAgenda
            selectedDateStr={selectedDateStr}
            events={events}
            members={members}
            activeMemberFilter={activeMemberFilter}
            onOpenAddEvent={handleOpenAddEvent}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </main>

        {/* Right Toolbar Actions */}
        <RightToolbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenIcalModal={() => setIsIcalModalOpen(true)}
          onOpenAddEvent={() => handleOpenAddEvent(selectedDateStr)}
        />
      </div>

      {/* Modals & Toast */}
      <MissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        editingEvent={editingEvent}
        members={members}
        onSaveEvent={handleSaveEvent}
        initialDateStr={selectedDateStr}
      />

      <IcalModal
        isOpen={isIcalModalOpen}
        onClose={() => setIsIcalModalOpen(false)}
        members={members}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
