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
import { formatDateKey } from './utils/helpers';
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
  { id: 'mem_woooddy', name: 'WoooddY', initials: 'WD', color: '#10b981', member_type: 'member' },
  { id: 'mem_wm', name: 'เวรหมาย', initials: 'WM', color: '#64748b', member_type: 'virtual' }
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
  const [viewMode, setViewMode] = useState('monthly');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('member_calendar_theme') || 'light';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

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


  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('member_calendar_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_EVENTS;
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
  const [unreadActivityCount, setUnreadActivityCount] = useState(0);
  const [isForgotPinModalOpen, setIsForgotPinModalOpen] = useState(false);

  const [targetMemberForAuth, setTargetMemberForAuth] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [toast, setToast] = useState(null);

  const activeUser = members.find(m => m.id === activeUserId) || members[0];

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

        if (!memErr && supaMembers && supaMembers.length > 0) {
          const cleanSupaMembers = supaMembers.filter(m =>
            !['สมชาย', 'สมศรี', 'สมศักดิ์', 'สมใจ'].some(mockName => m.name.includes(mockName))
          );

          setMembers(prevMembers => {
            const updated = prevMembers.map(localMem => {
              const supaMem = cleanSupaMembers.find(sm => sm.id === localMem.id);
              const validSupaPin = (supaMem && supaMem.pin_code && supaMem.pin_code.trim()) ? supaMem.pin_code.trim() : null;
              const syncedPin = validSupaPin || pinSyncMap[localMem.id] || localMem.pin_code || '';

              return {
                ...localMem,
                ...(supaMem || {}),
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
          setEvents(supaEvents);
          localStorage.setItem('member_calendar_events', JSON.stringify(supaEvents));
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

    logActivity('MEMBER_UPDATE', null, `แก้ไขข้อมูลสมาชิก: คุณ ${updatedMember.name}`);
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
    let updated;

    if (exists) {
      updated = events.map(e => e.id === eventPayload.id ? { ...eventPayload, is_deleted: false } : e);
      logActivity('UPDATE', eventPayload, 'แก้ไขรายละเอียดกิจกรรม');
      setToast({ message: 'แก้ไขกิจกรรมสำเร็จแล้ว!', type: 'success' });
    } else {
      const newEvt = { ...eventPayload, is_deleted: false };
      updated = [...events, newEvt];
      logActivity('CREATE', newEvt, 'สร้างกิจกรรมใหม่');
      setToast({ message: 'สร้างกิจกรรมใหม่สำเร็จแล้ว!', type: 'success' });
    }

    setEvents(updated);
    localStorage.setItem('member_calendar_events', JSON.stringify(updated));

    if (supabase) {
      try {
        await supabase.from('events').upsert([eventPayload]);
      } catch(e) {
        console.warn('Supabase upsert event warning:', e);
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

    logActivity('DELETE', targetEvt, 'ย้ายกิจกรรมลงถังขยะ (กู้คืนได้ใน Activity Log)');

    if (supabase) {
      try {
        await supabase.from('events').upsert([softDeletedEvt]);
      } catch(e) {
        console.warn('Supabase soft delete event warning:', e);
      }
    }
    setToast({ message: 'ย้ายกิจกรรมไปถังขยะเรียบร้อยแล้ว (สามารถกู้คืนได้)', type: 'info' });
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
            visibleMemberIds={visibleMemberIds}
            onEditEvent={handleOpenEditEvent}
          />

          <DailyAgenda
            selectedDateStr={selectedDateStr}
            events={activeEvents}
            members={members}
            visibleMemberIds={visibleMemberIds}
            onOpenAddEvent={handleOpenAddEvent}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
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
        members={members}
        onSelectMemberWithPin={handleSelectMemberWithPin}
        onSaveNewPin={handleSaveNewPin}
        onOpenForgotPin={() => setIsForgotPinModalOpen(true)}
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
        onSaveEvent={handleSaveEvent}
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

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
