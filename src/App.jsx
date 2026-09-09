import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightToolbar from './components/RightToolbar';
import Toast from './components/Toast';
import MonthGrid from './components/Scheduler/MonthGrid';
import DailyAgenda from './components/Scheduler/DailyAgenda';
import MissionModal from './components/Scheduler/MissionModal';
import IcalModal from './components/Modals/IcalModal';
import MemberManagementModal from './components/Modals/MemberManagementModal';
import FirstTimeUserModal from './components/Modals/FirstTimeUserModal';
import AuthPinModal from './components/Modals/AuthPinModal';
import ActivityLogModal from './components/Modals/ActivityLogModal';
import ForgotPinModal from './components/Modals/ForgotPinModal';
import DayEventsModal from './components/Modals/DayEventsModal';
import { formatDateKey, formatThaiDateTime, sanitizeEventsTime, INITIAL_CATEGORIES, ensureEventCategoryAndColor, getLocalDateStr } from './utils/helpers';
import { supabase } from './utils/supabase';
import { hashPasscode } from './utils/crypto';

// INITIAL TEAM MEMBERS (9 MEMBERS: MEMBERS & VIRTUAL MEMBERS)
const INITIAL_MEMBERS = [
  { id: 'mem_manudnot', name: 'Not', initials: 'NO', color: '#8b5cf6', member_type: 'member' },
  { id: 'mem_third', name: 'Third', initials: 'TH', color: '#0ea5e9', member_type: 'member' },
  { id: 'mem_june', name: 'June', initials: 'JU', color: '#ec4899', member_type: 'member' },
  { id: 'mem_thanatat', name: 'Top', initials: 'TO', color: '#f59e0b', member_type: 'member' },
  { id: 'mem_phak_ek', name: 'เอก', initials: 'PE', color: '#ef4444', member_type: 'member' },
  { id: 'mem_keng', name: 'เก่ง', initials: 'KG', color: '#06b6d4', member_type: 'member' },
  { id: 'mem_tum', name: 'ตั้ม', initials: 'TM', color: '#84cc16', member_type: 'member' },
  { id: 'mem_woooddy', name: 'Champ', initials: 'CH', color: '#10b981', member_type: 'member' },
  { id: 'mem_wm', name: 'เวรหมาย', initials: 'WM', color: '#64748b', member_type: 'virtual' }
];



const INITIAL_EVENTS = [
  { "id": "evt_tt_1", "title": "Open house All", "start_time": "2024-12-27T09:00:00Z", "end_time": "2024-12-27T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_woooddy", "mem_third"], "alarm_minutes": 15 },
  { "id": "evt_tt_2", "title": "ตรวจพื้นที่ All บน.6 (ประชุม กฝร. 8:30 / SBAC 9:00)", "start_time": "2025-01-02T01:30:00Z", "end_time": "2025-01-02T09:00:00Z", "all_day": false, "color": "#ef4444", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_3", "title": "ประกาศรายชื่อจิตอาสา", "start_time": "2025-01-03T09:00:00Z", "end_time": "2025-01-03T17:00:00Z", "all_day": true, "color": "#795548", "member_ids": ["mem_third"], "alarm_minutes": 15 },
  { "id": "evt_tt_4", "title": "STAFFEX", "start_time": "2025-01-06T09:00:00Z", "end_time": "2025-01-10T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_manudnot", "mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_5", "title": "วันเด็ก", "start_time": "2025-01-09T08:00:00Z", "end_time": "2025-01-09T16:00:00Z", "all_day": true, "color": "#ec4899", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_6", "title": "สัมภาษณ์ จอส. รุ่น 8", "start_time": "2025-01-13T09:00:00Z", "end_time": "2025-01-18T17:00:00Z", "all_day": true, "color": "#10b981", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_7", "title": "CPX ท็อป ศยพ.ทอ.", "start_time": "2025-01-26T09:00:00Z", "end_time": "2025-01-30T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_third", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_8", "title": "หมาย รับปริญญาธรรมศาสตร์", "start_time": "2025-02-01T08:00:00Z", "end_time": "2025-02-01T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_9", "title": "การฝึกตาม รปจ.", "start_time": "2025-02-07T09:00:00Z", "end_time": "2025-02-11T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_keng"], "alarm_minutes": 15 },
  { "id": "evt_tt_10", "title": "อบรมก่อนฝึก CG", "start_time": "2025-02-10T09:00:00Z", "end_time": "2025-02-12T17:00:00Z", "all_day": true, "color": "#10b981", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_11", "title": "905 ม.ศิลปากร นครปฐม", "start_time": "2025-02-18T09:00:00Z", "end_time": "2025-02-20T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_12", "title": "Unit school / ภาคนอกที่ตั้ง", "start_time": "2025-03-01T09:00:00Z", "end_time": "2025-03-28T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_woooddy", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_13", "title": "กฝร.ห้วยภูมิภาค ระยอง", "start_time": "2025-03-12T09:00:00Z", "end_time": "2025-03-15T17:00:00Z", "all_day": true, "color": "#795548", "member_ids": ["mem_third"], "alarm_minutes": 15 },
  { "id": "evt_tt_80", "title": "ฝึก CALFLEX", "start_time": "2026-09-05T09:00:00Z", "end_time": "2026-09-08T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_81", "title": "1000 ประชุมหารือ การติดต่อสื่อสาร กกล.บูรพา และ ส.พัน.2", "start_time": "2026-09-09T03:00:00Z", "end_time": "2026-09-09T05:00:00Z", "all_day": false, "color": "#10b981", "member_ids": ["mem_third"], "location": "https://meet.google.com/cqp-hwsa-eet", "alarm_minutes": 15 },
  { "id": "evt_tt_82", "title": "จเร ทภ.1 ตรวจคุณภาพชีวิต", "start_time": "2026-09-10T09:00:00Z", "end_time": "2026-09-10T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_83", "title": "908 ครบ 100 วัน / หมาย 904 HMSV", "start_time": "2026-09-18T09:00:00Z", "end_time": "2026-09-19T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_84", "title": "หมาย 904 HMSV", "start_time": "2026-09-24T09:00:00Z", "end_time": "2026-09-25T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 }
];

export default function App() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(formatDateKey(new Date()));
  const [viewMode, setViewMode] = useState('monthly');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('member_calendar_theme') || 'light';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Per-Device Active User Identity State
  const [activeUserId, setActiveUserId] = useState(() => {
    return localStorage.getItem('member_calendar_active_user_id') || null;
  });

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('member_calendar_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(m => {
            if (m.id === 'mem_manudnot') {
              return { ...m, email: 'wtgmso123@gmail.com' };
            }
            if (m.email && m.email.includes('@unit21.com')) {
              return { ...m, email: '' };
            }
            return m;
          });
        }
      } catch (e) {}
    }
    return INITIAL_MEMBERS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('member_calendar_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_CATEGORIES;
  });

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('member_calendar_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return sanitizeEventsTime(parsed);
      } catch (e) {}
    }
    return sanitizeEventsTime(INITIAL_EVENTS);
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('member_calendar_activity_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [visibleMemberIds, setVisibleMemberIds] = useState(() => {
    return members.map(m => m.id);
  });

  // Modals state
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isIcalModalOpen, setIsIcalModalOpen] = useState(false);
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);
  const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState(!activeUserId);
  const [isAuthPinModalOpen, setIsAuthPinModalOpen] = useState(false);
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [unreadActivityCount, setUnreadActivityCount] = useState(0);
  const [isForgotPinModalOpen, setIsForgotPinModalOpen] = useState(false);

  const [targetMemberForAuth, setTargetMemberForAuth] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [toast, setToast] = useState(null);

  const activeUser = members.find(m => m.id === activeUserId) || members[0];

  const handleAddCategory = async (newCategory) => {
    if (!newCategory || !newCategory.id) return;
    const exists = categories.some(c => c.id === newCategory.id);
    let updated;
    if (exists) {
      updated = categories.map(c => c.id === newCategory.id ? newCategory : c);
    } else {
      updated = [...categories, newCategory];
    }
    setCategories(updated);
    localStorage.setItem('member_calendar_categories', JSON.stringify(updated));

    if (supabase) {
      try {
        await supabase.from('categories').upsert([newCategory]);
      } catch (e) {
        console.warn('Supabase add category error:', e);
      }
    }
  };

  // Theme manager
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('member_calendar_theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Load & Sync between LocalStorage and Supabase on mount and periodically
  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;

      try {
        // Fetch categories from Supabase
        const { data: supaCats, error: catErr } = await supabase.from('categories').select('*');
        if (!catErr && supaCats && supaCats.length > 0) {
          setCategories(prevCats => {
            const catMap = new Map();
            INITIAL_CATEGORIES.forEach(c => catMap.set(c.id, c));
            prevCats.forEach(c => catMap.set(c.id, c));
            supaCats.forEach(c => catMap.set(c.id, c));
            const mergedCats = Array.from(catMap.values());
            localStorage.setItem('member_calendar_categories', JSON.stringify(mergedCats));
            return mergedCats;
          });
        }

        // Fetch members and activity logs from Supabase
        const { data: supaMembers, error: memErr } = await supabase.from('members').select('*');
        const { data: supaLogs } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false });

        // Extract PIN_SYNC mapping from activity_logs to ensure multi-device sync even if table schema is missing pin_code column
        const pinSyncMap = {};
        if (supaLogs && supaLogs.length > 0) {
          supaLogs.forEach(l => {
            if (l.details && l.details.startsWith('PIN_HASH:')) {
              const parts = l.details.split(':');
              const mId = parts[1];
              const pHash = parts[2];
              if (mId && pHash && !pinSyncMap[mId]) {
                pinSyncMap[mId] = pHash;
              }
            }
          });
        }

        const savedPins = JSON.parse(localStorage.getItem('member_calendar_pins') || '{}');

        if (!memErr && supaMembers && supaMembers.length > 0) {
          const cleanSupaMembers = supaMembers.filter(m =>
            !['สมชาย', 'สมศรี', 'สมศักดิ์', 'สมใจ'].some(mockName => m.name.includes(mockName))
          );

          setMembers(prevMembers => {
            const updated = cleanSupaMembers.map(supaMem => {
              const localMem = prevMembers.find(m => m.id === supaMem.id);
              const validSupaPin = (supaMem.pin_code && supaMem.pin_code.trim()) ? supaMem.pin_code.trim() : null;
              const syncedPin = validSupaPin || pinSyncMap[supaMem.id] || savedPins[supaMem.id] || (localMem && localMem.pin_code) || '';

              if (syncedPin && !savedPins[supaMem.id]) {
                savedPins[supaMem.id] = syncedPin;
                localStorage.setItem('member_calendar_pins', JSON.stringify(savedPins));
              }

              return {
                ...localMem,
                ...supaMem,
                pin_code: syncedPin
              };
            });
            localStorage.setItem('member_calendar_members', JSON.stringify(updated));
            return updated;
          });
        } else {
          // If Supabase table empty, seed with initial members
          await supabase.from('members').upsert(INITIAL_MEMBERS);
        }

        // Fetch events from Supabase
        const { data: supaEvents, error: evtErr } = await supabase.from('events').select('*');
        if (!evtErr && supaEvents && supaEvents.length > 0) {
          const cleanEvents = sanitizeEventsTime(supaEvents);
          setEvents(prevEvents => {
            const merged = cleanEvents.map(supaEvt => {
              const localEvt = prevEvents.find(e => e.id === supaEvt.id);
              const combined = localEvt ? { ...supaEvt, ...localEvt } : supaEvt;
              return ensureEventCategoryAndColor({
                ...combined,
                all_day: localEvt?.all_day !== undefined ? localEvt.all_day : (supaEvt.all_day ?? true)
              }, categories);
            });
            localStorage.setItem('member_calendar_events', JSON.stringify(merged));
            return merged;
          });
        }

        // Fetch activity logs from Supabase
        if (supaLogs && supaLogs.length > 0) {
          setActivityLogs(supaLogs);
          localStorage.setItem('member_calendar_activity_logs', JSON.stringify(supaLogs));
        }
      } catch (err) {
        console.warn('Supabase sync notice:', err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 3000); // 3-second live multi-device polling
    return () => clearInterval(interval);
  }, []);

  // Audit Logging helper
  const logActivity = async (action, evt, details = '', customActor = null) => {
    const actor = customActor || members.find(m => m.id === activeUserId) || members[0];
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      event_id: evt ? evt.id : null,
      event_title: evt ? evt.title : (details || 'การจัดการระบบ'),
      action,
      actor_id: actor ? actor.id : 'unknown',
      actor_name: actor ? actor.name : 'ผู้ใช้งาน',
      actor_color: actor ? actor.color : '#10b981',
      details,
      created_at: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...activityLogs];
    setActivityLogs(updatedLogs);
    localStorage.setItem('member_calendar_activity_logs', JSON.stringify(updatedLogs));
    setUnreadActivityCount(prev => prev + 1);

    if (supabase) {
      try {
        await supabase.from('activity_logs').upsert([newLog]);
      } catch (err) {
        console.warn('Supabase activity log error:', err);
      }
    }
  };

  // Identity & PIN Verification Handlers
  const handleSelectMemberWithPin = (memberId, pinCode, enableBiometrics) => {
    setActiveUserId(memberId);
    localStorage.setItem('member_calendar_active_user_id', memberId);
    setIsFirstTimeModalOpen(false);
    
    const mem = members.find(m => m.id === memberId);
    setToast({ message: `ยินดีต้อนรับคุณ ${mem ? mem.name : ''}! ระบบจำตัวตนสำหรับอุปกรณ์นี้แล้ว`, type: 'success' });
  };

  const handleResetPinWithOtp = async (memberId, newPinCode) => {
    const hashedPin = await hashPasscode(newPinCode);

    const savedPins = JSON.parse(localStorage.getItem('member_calendar_pins') || '{}');
    savedPins[memberId] = hashedPin;
    localStorage.setItem('member_calendar_pins', JSON.stringify(savedPins));

    const updatedMembers = members.map(m => m.id === memberId ? { ...m, pin_code: hashedPin } : m);
    setMembers(updatedMembers);
    localStorage.setItem('member_calendar_members', JSON.stringify(updatedMembers));

    const mem = updatedMembers.find(m => m.id === memberId);
    logActivity('PIN_UPDATE', null, `กู้คืนและตั้งรหัส PIN 4 หลักใหม่สำหรับคุณ ${mem ? mem.name : ''}`, mem);

    if (supabase) {
      try {
        const target = updatedMembers.find(m => m.id === memberId);
        const supaPayload = {
          id: target.id,
          name: target.name,
          color: target.color,
          email: target.email || '',
          pin_code: target.pin_code
        };
        const { error } = await supabase.from('members').upsert([supaPayload]);
        if (error) {
          logActivity('PIN_SYNC', null, `PIN_HASH:${target.id}:${hashedPin}`, mem);
        }
      } catch (e) {}
    }

    setToast({ message: `กู้คืนและตั้งรหัส PIN ใหม่สำหรับคุณ ${mem ? mem.name : ''} สำเร็จ!`, type: 'success' });
  };

  const handleSaveNewPin = async (memberId, pinCode, enableBiometrics) => {
    const hashedPin = await hashPasscode(pinCode);

    const savedPins = JSON.parse(localStorage.getItem('member_calendar_pins') || '{}');
    savedPins[memberId] = hashedPin;
    localStorage.setItem('member_calendar_pins', JSON.stringify(savedPins));

    const updatedMembers = members.map(m => m.id === memberId ? {
      ...m,
      pin_code: hashedPin,
      email: ''
    } : m);

    setMembers(updatedMembers);
    localStorage.setItem('member_calendar_members', JSON.stringify(updatedMembers));

    setActiveUserId(memberId);
    localStorage.setItem('member_calendar_active_user_id', memberId);
    setIsFirstTimeModalOpen(false);

    const mem = updatedMembers.find(m => m.id === memberId);
    logActivity('PIN_UPDATE', null, `ตั้งรหัส PIN 4 หลักประจำเครื่องสำหรับคุณ ${mem ? mem.name : ''}`, mem);

    if (supabase) {
      try {
        const target = updatedMembers.find(m => m.id === memberId);
        const supaPayload = {
          id: target.id,
          name: target.name,
          color: target.color,
          email: target.email || '',
          pin_code: target.pin_code
        };
        const { error } = await supabase.from('members').upsert([supaPayload]);
        if (error) {
          logActivity('PIN_SYNC', null, `PIN_HASH:${target.id}:${hashedPin}`, mem);
        }
      } catch (e) {}
    }

    setToast({ message: `ตั้งรหัส PIN และสลับตัวตนเป็นคุณ ${mem ? mem.name : ''} สำเร็จ!`, type: 'success' });
  };

  const handleSwitchUserClick = () => {
    setIsFirstTimeModalOpen(true);
  };

  const handleToggleMemberVisibility = (memberId) => {
    if (visibleMemberIds.includes(memberId)) {
      setVisibleMemberIds(visibleMemberIds.filter(id => id !== memberId));
    } else {
      setVisibleMemberIds([...visibleMemberIds, memberId]);
    }
  };

  const handleSelectAllMembers = () => {
    const cleanMemberIds = members
      .filter(m => !['สมชาย', 'สมศรี', 'สมศักดิ์', 'สมใจ'].some(mockName => m.name.includes(mockName)))
      .map(m => m.id);

    const isAllSelected = cleanMemberIds.length > 0 && cleanMemberIds.every(id => visibleMemberIds.includes(id));

    if (isAllSelected) {
      setVisibleMemberIds([]);
    } else {
      setVisibleMemberIds(cleanMemberIds);
    }
  };

  const handleAddMember = async (newMember) => {
    const updated = [...members, newMember];
    setMembers(updated);
    localStorage.setItem('member_calendar_members', JSON.stringify(updated));
    setVisibleMemberIds([...visibleMemberIds, newMember.id]);

    if (supabase) {
      try {
        const supaPayload = {
          id: newMember.id,
          name: newMember.name,
          color: newMember.color,
          email: '',
          status: newMember.status || 'active',
          is_archived: Boolean(newMember.is_archived)
        };
        await supabase.from('members').upsert([supaPayload]);
      } catch (e) {
        console.warn('Supabase insert member warning:', e);
      }
    }

    logActivity('MEMBER_CREATE', null, `เพิ่มสมาชิกใหม่: คุณ ${newMember.name} (${newMember.member_type === 'virtual' ? 'Virtual Member' : 'Member'})`);
    setToast({ message: `เพิ่มสมาชิก ${newMember.name} สำเร็จ!`, type: 'success' });
  };

  const handleUpdateMember = async (updatedMember) => {
    const existingMem = members.find(m => m.id === updatedMember.id);
    const changes = [];

    if (existingMem) {
      if (existingMem.name !== updatedMember.name) {
        changes.push(`เปลี่ยนชื่อสมาชิก: จากเดิม "${existingMem.name}" ➔ เป็น "${updatedMember.name}"`);
      }
      if (existingMem.color !== updatedMember.color) {
        changes.push(`เปลี่ยนสีประจำตัว: จาก ${existingMem.color} ➔ เป็น ${updatedMember.color}`);
      }
      if (existingMem.member_type !== updatedMember.member_type) {
        changes.push(`เปลี่ยนประเภทสมาชิก: จาก ${existingMem.member_type === 'virtual' ? 'Virtual Member' : 'Member'} ➔ เป็น ${updatedMember.member_type === 'virtual' ? 'Virtual Member' : 'Member'}`);
      }
    }

    const logDetails = changes.length > 0 
      ? `แก้ไขข้อมูลสมาชิก: ${changes.join(' | ')}`
      : `แก้ไขข้อมูลสมาชิก: คุณ ${updatedMember.name}`;

    const updated = members.map(m => m.id === updatedMember.id ? updatedMember : m);
    setMembers(updated);
    localStorage.setItem('member_calendar_members', JSON.stringify(updated));

    if (supabase) {
      try {
        const supaPayload = {
          id: updatedMember.id,
          name: updatedMember.name,
          color: updatedMember.color,
          email: '',
          status: updatedMember.status || 'active',
          is_archived: Boolean(updatedMember.is_archived)
        };
        if (updatedMember.pin_code) supaPayload.pin_code = updatedMember.pin_code;
        await supabase.from('members').upsert([supaPayload]);
      } catch (e) {
        console.warn('Supabase update member warning:', e);
      }
    }

    logActivity('MEMBER_UPDATE', null, logDetails);
    setToast({ message: `แก้ไขข้อมูลสมาชิก ${updatedMember.name} สำเร็จ!`, type: 'success' });
  };

  const handleToggleArchiveMember = async (memberId) => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const nextArchived = !targetMember.is_archived;
    const updatedMember = {
      ...targetMember,
      is_archived: nextArchived,
      status: nextArchived ? 'resigned' : 'active'
    };

    const updated = members.map(m => m.id === memberId ? updatedMember : m);
    setMembers(updated);
    localStorage.setItem('member_calendar_members', JSON.stringify(updated));

    if (supabase) {
      try {
        const supaPayload = {
          id: updatedMember.id,
          name: updatedMember.name,
          color: updatedMember.color,
          email: '',
          status: updatedMember.status,
          is_archived: updatedMember.is_archived
        };
        if (updatedMember.pin_code) supaPayload.pin_code = updatedMember.pin_code;
        await supabase.from('members').upsert([supaPayload]);
      } catch (e) {
        console.warn('Supabase toggle archive member warning:', e);
      }
    }

    if (nextArchived) {
      logActivity('MEMBER_ARCHIVE', null, `แจ้งลาออกสมาชิก: คุณ ${targetMember.name}`);
      setToast({ message: `แจ้งลาออกสมาชิก ${targetMember.name} เรียบร้อยแล้ว (ประวัติงานเดิมยังคงอยู่)`, type: 'info' });
    } else {
      logActivity('MEMBER_RESTORE', null, `คืนสภาพสมาชิก: คุณ ${targetMember.name}`);
      setToast({ message: `คืนสภาพสมาชิก ${targetMember.name} สำเร็จ!`, type: 'success' });
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('คุณต้องการลบสมาชิกท่านนี้แบบถาวรใช่หรือไม่?')) return;

    const targetMember = members.find(m => m.id === memberId);
    const updated = members.filter(m => m.id !== memberId);
    setMembers(updated);
    localStorage.setItem('member_calendar_members', JSON.stringify(updated));
    setVisibleMemberIds(visibleMemberIds.filter(id => id !== memberId));

    if (supabase) {
      try {
        await supabase.from('members').delete().eq('id', memberId);
      } catch (e) {
        console.warn('Supabase delete member warning:', e);
      }
    }

    logActivity('MEMBER_ARCHIVE', null, `ลบสมาชิกถาวร: คุณ ${targetMember ? targetMember.name : ''}`);
    setToast({ message: 'ลบสมาชิกเรียบร้อยแล้ว', type: 'info' });
  };

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

  const handleOpenDayModal = (dateStr) => {
    if (dateStr) setSelectedDateStr(dateStr);
    setIsDayEventsModalOpen(true);
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
    const prevEventsState = [...events];
    const exists = events.some(e => e.id === eventPayload.id);
    let updated;
    let logAction = 'CREATE';
    let logDetails = 'สร้างกิจกรรมใหม่';

    if (exists) {
      logAction = 'UPDATE';
      const oldEvt = events.find(e => e.id === eventPayload.id);
      const changes = [];

      if (oldEvt) {
        if (oldEvt.title !== eventPayload.title) {
          changes.push(`เปลี่ยนชื่อกิจกรรม: จากเดิม "${oldEvt.title}" ➔ เป็น "${eventPayload.title}"`);
        }
        if (oldEvt.start_time !== eventPayload.start_time || oldEvt.end_time !== eventPayload.end_time || oldEvt.all_day !== eventPayload.all_day) {
          const oldIsAllDay = Boolean(oldEvt.all_day);
          const newIsAllDay = Boolean(eventPayload.all_day);
          const formatEvtTime = (evt, isAllDay) => {
            const sDate = getLocalDateStr(evt.start_time);
            const eDate = getLocalDateStr(evt.end_time) || sDate;
            if (isAllDay) return `${sDate} (ตลอดวัน)`;
            return `${formatThaiDateTime(evt.start_time)} - ${formatThaiDateTime(evt.end_time)}`;
          };
          const oldStr = formatEvtTime(oldEvt, oldIsAllDay);
          const newStr = formatEvtTime(eventPayload, newIsAllDay);
          if (oldStr !== newStr) {
            changes.push(`เปลี่ยนกำหนดเวลา: จาก "${oldStr}" ➔ เป็น "${newStr}"`);
          }
        }
        if ((oldEvt.location || '') !== (eventPayload.location || '')) {
          if (!oldEvt.location && eventPayload.location) {
            changes.push(`เพิ่มสถานที่/URL: "${eventPayload.location}"`);
          } else if (oldEvt.location && !eventPayload.location) {
            changes.push(`ลบสถานที่/URL ออก (เดิม: "${oldEvt.location}")`);
          } else {
            changes.push(`เปลี่ยนสถานที่/URL: จาก "${oldEvt.location}" ➔ เป็น "${eventPayload.location}"`);
          }
        }
        if (oldEvt.category && eventPayload.category && oldEvt.category !== eventPayload.category) {
          const oldC = oldEvt.category.trim();
          const newC = eventPayload.category.trim();
          if (oldC.toLowerCase() !== newC.toLowerCase() && !oldC.includes(newC) && !newC.includes(oldC)) {
            changes.push(`เปลี่ยนหมวดหมู่: จาก "${oldC}" ➔ เป็น "${newC}"`);
          }
        }
        if (JSON.stringify(oldEvt.member_ids || []) !== JSON.stringify(eventPayload.member_ids || [])) {
          const getMemberNames = (ids) => (ids || []).map(id => members.find(m => m.id === id)?.name || id).join(', ');
          const oldMems = getMemberNames(oldEvt.member_ids);
          const newMems = getMemberNames(eventPayload.member_ids);
          changes.push(`เปลี่ยนผู้รับผิดชอบ: จาก [${oldMems || 'ไม่มี'}] ➔ เป็น [${newMems || 'ไม่มี'}]`);
        }
      }

      logDetails = changes.length > 0 
        ? `แก้ไขรายละเอียด: ${changes.join(' | ')}`
        : 'ปรับปรุงรายละเอียดกิจกรรม';

      updated = events.map(e => e.id === eventPayload.id ? { ...eventPayload, is_deleted: false } : e);
    } else {
      const newEvt = { ...eventPayload, is_deleted: false };
      updated = [...events, newEvt];
    }

    // 1. Optimistic UI update locally
    setEvents(updated);
    localStorage.setItem('member_calendar_events', JSON.stringify(updated));

    // 2. Supabase Async Confirmation & Rollback on Error
    if (supabase) {
      try {
        const supaEvtPayload = {
          id: eventPayload.id,
          title: eventPayload.title,
          start_time: eventPayload.start_time,
          end_time: eventPayload.end_time,
          description: eventPayload.description || '',
          location: eventPayload.location || eventPayload.url || '',
          category: eventPayload.category || 'General',
          member_ids: eventPayload.member_ids || [],
          alarm_minutes: eventPayload.alarm_minutes || 15
        };

        const { error } = await supabase.from('events').upsert([supaEvtPayload]);
        if (error) {
          throw error;
        }

        // Success: Log activity & notify
        logActivity(logAction, eventPayload, logDetails);
        setToast({ message: 'บันทึกกิจกรรมลงเซิร์ฟเวอร์สำเร็จแล้ว!', type: 'success' });
      } catch (err) {
        console.error('Supabase save error:', err);
        // Rollback on error
        setEvents(prevEventsState);
        localStorage.setItem('member_calendar_events', JSON.stringify(prevEventsState));
        setToast({ message: 'การบันทึกล้มเหลว ระบบทำการคืนค่าเดิมเรียบร้อยแล้ว', type: 'error' });
      }
    } else {
      logActivity(logAction, eventPayload, logDetails);
      setToast({ message: 'บันทึกกิจกรรมในเครื่องสำเร็จ!', type: 'success' });
    }
  };

  const handleMoveEvent = async (eventId, targetDateStr) => {
    const targetEvt = events.find(e => e.id === eventId);
    if (!targetEvt || !targetDateStr) return;

    const oldStartDateStr = targetEvt.start_time ? targetEvt.start_time.split('T')[0] : targetDateStr;
    const oldEndDateStr = targetEvt.end_time ? targetEvt.end_time.split('T')[0] : oldStartDateStr;
    const oldStart = new Date(oldStartDateStr);
    const oldEnd = new Date(oldEndDateStr);
    const durationDays = Math.max(0, Math.round((oldEnd - oldStart) / (1000 * 60 * 60 * 24)));

    const startTimePart = targetEvt.start_time && targetEvt.start_time.includes('T') ? targetEvt.start_time.split('T')[1] : '09:00:00Z';
    const endTimePart = targetEvt.end_time && targetEvt.end_time.includes('T') ? targetEvt.end_time.split('T')[1] : '17:00:00Z';

    const newStartDateObj = new Date(targetDateStr);
    const newEndDateObj = new Date(newStartDateObj);
    newEndDateObj.setDate(newEndDateObj.getDate() + durationDays);
    const newEndDateStr = formatDateKey(newEndDateObj);

    const newStartIso = `${targetDateStr}T${startTimePart}`;
    const newEndIso = `${newEndDateStr}T${endTimePart}`;

    const updatedEvt = {
      ...targetEvt,
      start_time: newStartIso,
      end_time: newEndIso,
      is_deleted: false
    };

    const updatedEvents = events.map(e => e.id === eventId ? updatedEvt : e);
    setEvents(updatedEvents);
    localStorage.setItem('member_calendar_events', JSON.stringify(updatedEvents));

    logActivity('UPDATE', updatedEvt, `ย้ายกำหนดเวลา (Drag & Drop Move): จากวันที่ ${oldStartDateStr} ➔ ไปยังวันที่ ${targetDateStr}`);
    setToast({ message: `ย้ายกิจกรรม "${targetEvt.title}" ไปยังวันที่ ${targetDateStr} เรียบร้อยแล้ว!`, type: 'success' });

    if (supabase) {
      try {
        const supaEvtPayload = {
          id: updatedEvt.id,
          title: updatedEvt.title,
          start_time: updatedEvt.start_time,
          end_time: updatedEvt.end_time,
          description: updatedEvt.description || '',
          location: updatedEvt.location || updatedEvt.url || '',
          category: updatedEvt.category || 'General',
          member_ids: updatedEvt.member_ids || [],
          alarm_minutes: updatedEvt.alarm_minutes || 15
        };
        await supabase.from('events').upsert([supaEvtPayload]);
      } catch (e) {
        console.warn('Supabase move event warning:', e);
      }
    }
  };

  const handleCopyEvent = async (originalEvt, targetDateStr) => {
    if (!originalEvt || !targetDateStr) return;

    const oldStartDateStr = originalEvt.start_time ? originalEvt.start_time.split('T')[0] : targetDateStr;
    const oldEndDateStr = originalEvt.end_time ? originalEvt.end_time.split('T')[0] : oldStartDateStr;
    const oldStart = new Date(oldStartDateStr);
    const oldEnd = new Date(oldEndDateStr);
    const durationDays = Math.max(0, Math.round((oldEnd - oldStart) / (1000 * 60 * 60 * 24)));

    const startTimePart = originalEvt.start_time && originalEvt.start_time.includes('T') ? originalEvt.start_time.split('T')[1] : '09:00:00Z';
    const endTimePart = originalEvt.end_time && originalEvt.end_time.includes('T') ? originalEvt.end_time.split('T')[1] : '17:00:00Z';

    const newStartDateObj = new Date(targetDateStr);
    const newEndDateObj = new Date(newStartDateObj);
    newEndDateObj.setDate(newEndDateObj.getDate() + durationDays);
    const newEndDateStr = formatDateKey(newEndDateObj);

    const newStartIso = `${targetDateStr}T${startTimePart}`;
    const newEndIso = `${newEndDateStr}T${endTimePart}`;

    const newEvt = {
      ...originalEvt,
      id: `evt_copy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      start_time: newStartIso,
      end_time: newEndIso,
      is_deleted: false,
      created_at: new Date().toISOString()
    };

    const updatedEvents = [...events, newEvt];
    setEvents(updatedEvents);
    localStorage.setItem('member_calendar_events', JSON.stringify(updatedEvents));

    logActivity('CREATE', newEvt, `คัดลอกกิจกรรม (Drag & Drop Copy): ไปยังวันที่ ${targetDateStr}`);
    setToast({ message: `คัดลอกกิจกรรม "${originalEvt.title}" ไปยังวันที่ ${targetDateStr} สำเร็จแล้ว!`, type: 'success' });

    if (supabase) {
      try {
        const supaEvtPayload = {
          id: newEvt.id,
          title: newEvt.title,
          start_time: newEvt.start_time,
          end_time: newEvt.end_time,
          description: newEvt.description || '',
          location: newEvt.location || newEvt.url || '',
          category: newEvt.category || 'General',
          member_ids: newEvt.member_ids || [],
          alarm_minutes: newEvt.alarm_minutes || 15
        };
        await supabase.from('events').upsert([supaEvtPayload]);
      } catch (e) {
        console.warn('Supabase copy event warning:', e);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const targetEvt = events.find(e => e.id === eventId);
    if (!targetEvt) return;

    if (!window.confirm(`คุณต้องการย้ายกิจกรรม "${targetEvt.title}" ไปยังถังขยะใช่หรือไม่?`)) return;

    const softDeletedEvt = {
      ...targetEvt,
      is_deleted: true,
      deleted_at: new Date().toISOString()
    };

    const updated = events.map(e => e.id === eventId ? softDeletedEvt : e);
    setEvents(updated);
    localStorage.setItem('member_calendar_events', JSON.stringify(updated));

    logActivity('DELETE', targetEvt, 'ย้ายกิจกรรมลงถังขยะ');

    if (supabase) {
      try {
        await supabase.from('events').delete().eq('id', eventId);
      } catch(e) {
        console.warn('Supabase delete event warning:', e);
      }
    }
    setToast({ message: 'ย้ายกิจกรรมไปถังขยะเรียบร้อยแล้ว', type: 'info' });
  };

  const handleRestoreEvent = async (eventId) => {
    const targetEvt = events.find(e => e.id === eventId);
    if (!targetEvt) return;

    const restoredEvt = {
      ...targetEvt,
      is_deleted: false,
      deleted_at: null
    };

    const updated = events.map(e => e.id === eventId ? restoredEvt : e);
    setEvents(updated);
    localStorage.setItem('member_calendar_events', JSON.stringify(updated));

    logActivity('RESTORE', targetEvt, 'กู้คืนกิจกรรมกลับมายังปฏิทิน');

    if (supabase) {
      try {
        await supabase.from('events').upsert([restoredEvt]);
      } catch(e) {
        console.warn('Supabase restore event warning:', e);
      }
    }
    setToast({ message: `กู้คืนกิจกรรม "${targetEvt.title}" กลับมาบนปฏิทินแล้ว!`, type: 'success' });
  };

  // Active (Non-deleted) Events for MonthGrid and DailyAgenda
  const activeEvents = events.filter(e => !e.is_deleted);
  const deletedEvents = events.filter(e => e.is_deleted);

  const handleOpenActivityLogModal = () => {
    setUnreadActivityCount(0);
    setIsActivityLogModalOpen(true);
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
        activeUser={activeUser}
        onOpenSwitchUserModal={handleSwitchUserClick}
        onOpenActivityLogModal={handleOpenActivityLogModal}
        unreadActivityCount={unreadActivityCount}
      />

      {/* 2. Three-Column Main Body Layout */}
      <div className="flex flex-1 h-[calc(100vh-56px)] overflow-hidden">
        
        {/* Left Sidebar (Member Filters & Initials Avatars) */}
        <Sidebar
          members={members}
          events={activeEvents}
          visibleMemberIds={visibleMemberIds}
          onToggleMemberVisibility={handleToggleMemberVisibility}
          onSelectAllMembers={handleSelectAllMembers}
          isOpen={isSidebarOpen}
        />

        {/* Center Workspace (Month Grid & Daily Agenda Drawer) */}
        <main className="flex-1 flex flex-col bg-white dark:bg-dark-card overflow-hidden">
          <MonthGrid
            currentYear={currentYear}
            currentMonth={currentMonth}
            selectedDateStr={selectedDateStr}
            onSelectDate={setSelectedDateStr}
            events={activeEvents}
            members={members}
            categories={categories}
            visibleMemberIds={visibleMemberIds}
            onEditEvent={handleOpenEditEvent}
            onMoveEvent={handleMoveEvent}
            onCopyEvent={handleCopyEvent}
            onOpenDayModal={handleOpenDayModal}
            onOpenAddEvent={handleOpenAddEvent}
          />
        </main>

        {/* Right Toolbar Actions */}
        <RightToolbar
          onOpenMemberManagement={() => { setMemberToEdit(null); setIsMemberManagementOpen(true); }}
          onOpenIcalModal={() => setIsIcalModalOpen(true)}
          onOpenActivityLog={handleOpenActivityLogModal}
          onOpenAddEvent={() => handleOpenAddEvent(selectedDateStr)}
          unreadActivityCount={unreadActivityCount}
        />
      </div>

      {/* Modals & Toast */}
      <FirstTimeUserModal
        isOpen={isFirstTimeModalOpen}
        onClose={() => setIsFirstTimeModalOpen(false)}
        members={members}
        activeUser={activeUser}
        onSelectMemberWithPin={handleSelectMemberWithPin}
        onSaveNewPin={handleSaveNewPin}
        onOpenForgotPin={() => setIsForgotPinModalOpen(true)}
        onOpenAddEvent={() => handleOpenAddEvent(selectedDateStr)}
        onOpenMemberManagement={() => { setMemberToEdit(null); setIsMemberManagementOpen(true); }}
        onOpenIcalModal={() => setIsIcalModalOpen(true)}
        onOpenActivityLog={handleOpenActivityLogModal}
        unreadActivityCount={unreadActivityCount}
      />

      <ForgotPinModal
        isOpen={isForgotPinModalOpen}
        onClose={() => setIsForgotPinModalOpen(false)}
        members={members}
        onResetPinWithOtp={handleResetPinWithOtp}
      />

      <AuthPinModal
        isOpen={isAuthPinModalOpen}
        onClose={() => setIsAuthPinModalOpen(false)}
        targetMember={targetMemberForAuth}
        onAuthenticateSuccess={(mId) => {
          setActiveUserId(mId);
          localStorage.setItem('member_calendar_active_user_id', mId);
        }}
      />

      <ActivityLogModal
        isOpen={isActivityLogModalOpen}
        onClose={() => setIsActivityLogModalOpen(false)}
        activityLogs={activityLogs}
        deletedEvents={deletedEvents}
        members={members}
        onRestoreEvent={handleRestoreEvent}
      />

      <MissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        editingEvent={editingEvent}
        members={members}
        categories={categories}
        onAddCategory={handleAddCategory}
        onSaveEvent={handleSaveEvent}
        onDeleteEvent={handleDeleteEvent}
        initialDateStr={selectedDateStr}
      />

      <IcalModal
        isOpen={isIcalModalOpen}
        onClose={() => setIsIcalModalOpen(false)}
        members={members}
      />

      <MemberManagementModal
        isOpen={isMemberManagementOpen}
        onClose={() => { setIsMemberManagementOpen(false); setMemberToEdit(null); }}
        members={members}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        onToggleArchiveMember={handleToggleArchiveMember}
        memberToEdit={memberToEdit}
      />

      <DayEventsModal
        isOpen={isDayEventsModalOpen}
        onClose={() => setIsDayEventsModalOpen(false)}
        selectedDateStr={selectedDateStr}
        events={activeEvents}
        members={members}
        visibleMemberIds={visibleMemberIds}
        onOpenAddEvent={handleOpenAddEvent}
        onEditEvent={handleOpenEditEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
