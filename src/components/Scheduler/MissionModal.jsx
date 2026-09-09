import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Edit3, Clock, MapPin, Link as LinkIcon, Bell, Repeat, Check, Users, Plus, Trash2, Palette } from 'lucide-react';
import { isAllDayEvent, convertMinutesToNotif, getLocalDateStr, getLocalTimeStr } from '../../utils/helpers';

const DEFAULT_COLOR_PALETTE = [
  { hex: '#f59e0b', category: 'ภารกิจหมาย', name: 'ภารกิจหมาย' },
  { hex: '#ef4444', category: 'ภารกิจหน่วย', name: 'ภารกิจหน่วย' },
  { hex: '#10b981', category: 'ประชุม', name: 'ประชุม' },
  { hex: '#8b5cf6', category: 'งานหน่วย', name: 'งานหน่วย' },
  { hex: '#795548', category: 'การฝึก', name: 'การฝึก' },
  { hex: '#ec4899', category: 'กิจกรรมพิเศษ', name: 'กิจกรรมพิเศษ' }
];

function getRepeatOptionsForDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const thaiDayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const ordinals = ['1st', '2nd', '3rd', '4th', '5th'];

  const dayIdx = d.getDay();
  const dayName = dayNames[dayIdx] || 'Saturday';
  const thaiDayName = thaiDayNames[dayIdx] || 'เสาร์';
  const dayNum = d.getDate();
  const weekOrdinalIndex = Math.floor((dayNum - 1) / 7);
  const weekOrdinal = ordinals[weekOrdinalIndex] || `${weekOrdinalIndex + 1}th`;

  return [
    { value: 'none', label: 'ไม่ทำซ้ำ (Not Repeating)' },
    { value: 'yearly', label: 'ทุกปี (Yearly)' },
    { value: 'daily', label: 'ทุกวัน (Daily)' },
    { value: 'weekly', label: `ทุกสัปดาห์วัน${thaiDayName} (Weekly on ${dayName})` },
    { value: 'weekdays', label: 'วันทำการ จันทร์-ศุกร์ (Mon-Fri)' },
    { value: 'monthly_date', label: `ทุกเดือน วันที่ ${dayNum} (Every month on ${dayNum})` },
    { value: 'custom', label: 'กำหนดเอง (Custom)' }
  ];
}

function getAlarmMinutesFromNotif(notif) {
  const val = Number(notif.value) || 0;
  if (!notif.unit) return val;
  if (notif.unit.includes('min')) return val;
  if (notif.unit.includes('hour')) return val * 60;
  if (notif.unit.includes('day')) return val * 1440;
  if (notif.unit.includes('week')) return val * 10080;
  return val;
}

export default function MissionModal({
  isOpen,
  onClose,
  editingEvent,
  members,
  onSaveEvent,
  onDeleteEvent,
  initialDateStr
}) {
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [color, setColor] = useState('#f59e0b');

  // Custom Palette State (persist custom colors to localStorage)
  const [palette, setPalette] = useState(() => {
    const saved = localStorage.getItem('member_calendar_custom_palette');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_COLOR_PALETTE;
  });

  const [isAddingCustomColor, setIsAddingCustomColor] = useState(false);
  const [customColorHex, setCustomColorHex] = useState('#06b6d4');
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Repeat States
  const [repeat, setRepeat] = useState('none');
  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState('week');
  const [customEndsMode, setCustomEndsMode] = useState('never'); // 'never' | 'on' | 'after'
  const [customEndsOnDate, setCustomEndsOnDate] = useState('');
  const [customEndsOccurrences, setCustomEndsOccurrences] = useState(10);

  // Notification States
  const [notifications, setNotifications] = useState([
    { id: 'notif_1', value: 15, unit: 'min before' }
  ]);

  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  // Track previous isOpen state to only reset form when modal transitions to open
  const prevIsOpenRef = useRef(false);
  const prevEditingIdRef = useRef(null);

  useEffect(() => {
    const isJustOpened = isOpen && !prevIsOpenRef.current;
    const editingIdChanged = editingEvent?.id !== prevEditingIdRef.current;

    if (isOpen && (isJustOpened || editingIdChanged)) {
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        const isAllDay = editingEvent.all_day !== false && isAllDayEvent(editingEvent);
        setAllDay(isAllDay);
        const sKey = getLocalDateStr(editingEvent.start_time) || initialDateStr;
        const eKey = getLocalDateStr(editingEvent.end_time) || sKey;
        setStartDate(sKey);
        setEndDate(eKey);
        setCustomEndsOnDate(eKey);

        setStartTime(getLocalTimeStr(editingEvent.start_time));
        setEndTime(getLocalTimeStr(editingEvent.end_time));

        setSelectedMembers(Array.isArray(editingEvent.member_ids) ? editingEvent.member_ids : []);
        
        let matchedColor = editingEvent.color;
        if (editingEvent.category) {
          const matchCat = palette.find(p => p.category && (
            p.category.toLowerCase() === editingEvent.category.toLowerCase() ||
            editingEvent.category.toLowerCase().includes(p.category.toLowerCase()) ||
            p.category.toLowerCase().includes(editingEvent.category.toLowerCase())
          ));
          if (matchCat) matchedColor = matchCat.hex;
        }
        if (!matchedColor && editingEvent.color) {
          const matchHex = palette.find(p => p.hex.toLowerCase() === editingEvent.color.toLowerCase());
          if (matchHex) matchedColor = matchHex.hex;
        }
        setColor(matchedColor || editingEvent.color || '#f59e0b');
        
        let initialRepeat = editingEvent.repeat;
        if (!initialRepeat || initialRepeat === 'none') {
          const tLower = (editingEvent.title || '').toLowerCase();
          const dLower = (editingEvent.description || '').toLowerCase();
          if (tLower.includes('วันเกิด') || tLower.includes('เกิด') || dLower.includes('yearly')) {
            initialRepeat = 'yearly';
          } else {
            initialRepeat = 'none';
          }
        }
        setRepeat(initialRepeat);

        if (editingEvent.custom_repeat) {
          setCustomInterval(editingEvent.custom_repeat.interval || 1);
          setCustomUnit(editingEvent.custom_repeat.unit || 'week');
          setCustomEndsMode(editingEvent.custom_repeat.ends_mode || 'never');
          setCustomEndsOnDate(editingEvent.custom_repeat.ends_on || eKey);
          setCustomEndsOccurrences(editingEvent.custom_repeat.ends_occurrences || 10);
        }

        if (Array.isArray(editingEvent.notifications) && editingEvent.notifications.length > 0) {
          setNotifications(editingEvent.notifications.map(n => {
            const totalMins = getAlarmMinutesFromNotif(n);
            const converted = convertMinutesToNotif(totalMins);
            return { ...n, value: converted.value, unit: converted.unit };
          }));
        } else if (Array.isArray(editingEvent.alarm_triggers) && editingEvent.alarm_triggers.length > 0) {
          setNotifications(editingEvent.alarm_triggers.map((trig, idx) => {
            const converted = convertMinutesToNotif(trig);
            return { id: `notif_${idx + 1}`, value: converted.value, unit: converted.unit };
          }));
        } else if (editingEvent.alarm_minutes !== undefined && editingEvent.alarm_minutes !== null) {
          const converted = convertMinutesToNotif(editingEvent.alarm_minutes);
          setNotifications([{ id: 'notif_1', value: converted.value, unit: converted.unit }]);
        }

        setLocation(editingEvent.location || '');
        setUrl(editingEvent.url || '');
        setDescription(editingEvent.description || '');
      } else {
        const defaultDate = initialDateStr || new Date().toISOString().split('T')[0];
        setTitle('');
        setAllDay(true);
        setStartDate(defaultDate);
        setEndDate(defaultDate);
        setCustomEndsOnDate(defaultDate);
        setStartTime('09:00');
        setEndTime('10:00');
        setSelectedMembers(members.length > 0 ? [members[0].id] : []);
        setColor('#f59e0b');
        setRepeat('none');
        setCustomInterval(1);
        setCustomUnit('week');
        setCustomEndsMode('never');
        setCustomEndsOccurrences(10);
        setNotifications([{ id: 'notif_1', value: 15, unit: 'min before' }]);
        setLocation('');
        setUrl('');
        setDescription('');
      }
      setIsAddingCustomColor(false);
    }

    prevIsOpenRef.current = isOpen;
    prevEditingIdRef.current = editingEvent?.id || null;
  }, [isOpen, editingEvent?.id, initialDateStr]);

  if (!isOpen) return null;

  const repeatOptions = getRepeatOptionsForDate(startDate);

  const handleToggleMember = (memId) => {
    if (selectedMembers.includes(memId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memId));
    } else {
      setSelectedMembers([...selectedMembers, memId]);
    }
  };

  const handleAddNotification = () => {
    setNotifications([
      ...notifications,
      { id: `notif_${Date.now()}`, value: 1, unit: 'hour before' }
    ]);
  };

  const handleRemoveNotification = (notifId) => {
    setNotifications(notifications.filter(n => n.id !== notifId));
  };

  const handleUpdateNotification = (notifId, field, value) => {
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, [field]: value } : n));
  };

  const handleAddCustomColor = (e) => {
    e.preventDefault();
    if (!customCategoryName.trim()) {
      alert('กรุณาระบุชื่อประเภทงาน / หมวดหมู่');
      return;
    }
    const newCategory = customCategoryName.trim();
    const newHex = customColorHex;
    const newItem = { hex: newHex, category: newCategory, name: newCategory };
    const updatedPalette = [...palette, newItem];
    setPalette(updatedPalette);
    localStorage.setItem('member_calendar_custom_palette', JSON.stringify(updatedPalette));
    setColor(newHex);
    setCustomCategoryName('');
    setIsAddingCustomColor(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('กรุณาระบุชื่อกิจกรรม / งาน');
      return;
    }

    if (selectedMembers.length === 0) {
      alert('กรุณาเลือกสมาชิกผู้รับผิดชอบอย่างน้อย 1 คน');
      return;
    }

    let startIso;
    let endIso;
    if (allDay) {
      startIso = `${startDate}T00:00:00.000Z`;
      endIso = `${endDate}T23:59:59.000Z`;
    } else {
      startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
      endIso = new Date(`${endDate}T${endTime}:00`).toISOString();
    }

    const primaryAlarmMinutes = notifications.length > 0 ? getAlarmMinutesFromNotif(notifications[0]) : 15;
    const selectedPalette = palette.find(item => item.hex.toLowerCase() === color.toLowerCase()) || 
      (editingEvent?.category ? palette.find(item => item.category.toLowerCase().includes(editingEvent.category.toLowerCase())) : null) || 
      palette[0];

    const payload = {
      id: editingEvent ? editingEvent.id : `evt_${Date.now()}`,
      title,
      start_time: startIso,
      end_time: endIso,
      all_day: allDay,
      color,
      category: selectedPalette.category,
      repeat,
      custom_repeat: repeat === 'custom' ? {
        interval: customInterval,
        unit: customUnit,
        ends_mode: customEndsMode,
        ends_on: customEndsOnDate,
        ends_occurrences: customEndsOccurrences
      } : null,
      notifications,
      alarm_minutes: primaryAlarmMinutes,
      location,
      url,
      description,
      member_ids: selectedMembers
    };

    onSaveEvent(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[95vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">
              {editingEvent ? 'แก้ไขกิจกรรม / งาน' : 'เพิ่มกิจกรรม / งานใหม่'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto no-scrollbar flex flex-col gap-4">
          
          {/* Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Event title (ชื่อกิจกรรม) *
            </label>
            <input
              type="text"
              className="input-field text-xs"
              placeholder="เช่น ประชุมสรุปงานประจำสัปดาห์"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* All-day Toggle Switch */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              All-day (กิจกรรมทั้งวัน)
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Starts
              </label>
              <input
                type="date"
                className="input-field font-mono text-xs"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {!allDay && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> เวลาเริ่ม
                </label>
                <input
                  type="time"
                  className="input-field font-mono text-xs"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Ends
              </label>
              <input
                type="date"
                className="input-field font-mono text-xs"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {!allDay && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> เวลาสิ้นสุด
                </label>
                <input
                  type="time"
                  className="input-field font-mono text-xs"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Members Selector with Select All Button */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> Members (ผู้รับผิดชอบ) *
              </label>
              <button
                type="button"
                onClick={() => {
                  const activeIds = members.filter(m => !m.is_archived && m.status !== 'resigned').map(m => m.id);
                  setSelectedMembers(activeIds);
                }}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                เลือกทุกคน
              </button>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl flex flex-wrap gap-2">
              {members.filter(m => !m.is_archived && m.status !== 'resigned' && m.is_active !== false).map(mem => {
                const isChecked = selectedMembers.includes(mem.id);

                return (
                  <button
                    type="button"
                    key={mem.id}
                    onClick={() => handleToggleMember(mem.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isChecked
                        ? 'bg-white dark:bg-dark-card border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-mono font-black shrink-0"
                      style={{ backgroundColor: mem.color }}
                    >
                      {mem.initials || mem.name.substring(0, 2).toUpperCase()}
                    </span>
                    <span>{mem.name}</span>
                    {isChecked && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Palette Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Label Color (เลือกสีของงาน) *
              </label>
            </div>
            
            <div className="flex flex-wrap gap-2.5 p-2.5 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl items-center">
              {palette.map(item => (
                <button
                  type="button"
                  key={item.hex}
                  onClick={() => setColor(item.hex)}
                  style={{ backgroundColor: item.hex }}
                  className={`w-7 h-7 rounded-full border transition-all cursor-pointer relative group flex items-center justify-center ${
                    color.toLowerCase() === item.hex.toLowerCase()
                      ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 border-white scale-110 shadow-md z-10'
                      : 'border-transparent hover:scale-105 opacity-85'
                  }`}
                  title={`ประเภทงาน: ${item.category}`}
                >
                  {color.toLowerCase() === item.hex.toLowerCase() && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                  
                  {/* Hover Tooltip Popup Badge */}
                  <span className="absolute bottom-full mb-1.5 hidden group-hover:flex px-2 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none transition-opacity animate-fade-in">
                    {item.category}
                  </span>
                </button>
              ))}

              {/* Add Custom Color Button "+" */}
              <button
                type="button"
                onClick={() => setIsAddingCustomColor(!isAddingCustomColor)}
                className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                title="เพิ่มสีและหมวดหมู่ใหม่"
              >
                <Plus className="w-4 h-4 font-bold" />
              </button>
            </div>

            {/* Custom Color Inline Form Popover */}
            {isAddingCustomColor && (
              <div className="p-3 bg-white dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl shadow-md flex flex-col gap-2.5 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-emerald-600" /> เพิ่มประเภทงานและสีใหม่
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomColor(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-9 h-9 rounded-lg border border-slate-200 dark:border-dark-border cursor-pointer bg-transparent"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    title="เลือกเฉดสี"
                  />
                  <input
                    type="text"
                    className="input-field text-xs flex-1"
                    placeholder="ชื่อหมวดหมู่ / ประเภทงาน (เช่น ภารกิจพิเศษ กกล.)"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomColor(false)}
                    className="btn-secondary py-1 px-3 text-[11px]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="btn-primary py-1 px-3 text-[11px]"
                  >
                    เพิ่มสีและหมวดหมู่
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Repeat Section */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5 text-emerald-600" /> Repeat (การทำซ้ำ)
            </label>
            <select
              className="input-field text-xs cursor-pointer"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            >
              {repeatOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Custom Repeat Panel */}
            {repeat === 'custom' && (
              <div className="p-3 bg-slate-50 dark:bg-dark-bg/80 border border-slate-200 dark:border-dark-border rounded-xl flex flex-col gap-3 text-xs animate-fade-in">
                {/* Repeat every */}
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 shrink-0">Repeat every</span>
                  <input
                    type="number"
                    min="1"
                    className="input-field w-16 text-center font-mono py-1 text-xs"
                    value={customInterval}
                    onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <select
                    className="input-field py-1 text-xs cursor-pointer"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                  >
                    <option value="day">day</option>
                    <option value="week">week</option>
                    <option value="month">month</option>
                    <option value="year">year</option>
                  </select>
                </div>

                {/* Ends section */}
                <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-dark-border pt-2.5">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Ends</span>

                  {/* Never */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="customEndsMode"
                      checked={customEndsMode === 'never'}
                      onChange={() => setCustomEndsMode('never')}
                      className="accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Never</span>
                  </label>

                  {/* On Date */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="customEndsMode"
                        checked={customEndsMode === 'on'}
                        onChange={() => setCustomEndsMode('on')}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">On</span>
                    </label>
                    {customEndsMode === 'on' && (
                      <input
                        type="date"
                        className="input-field py-1 text-xs font-mono"
                        value={customEndsOnDate}
                        onChange={(e) => setCustomEndsOnDate(e.target.value)}
                      />
                    )}
                  </div>

                  {/* After Occurrences */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="customEndsMode"
                        checked={customEndsMode === 'after'}
                        onChange={() => setCustomEndsMode('after')}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">After</span>
                    </label>
                    {customEndsMode === 'after' && (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          className="input-field w-16 text-center font-mono py-1 text-xs"
                          value={customEndsOccurrences}
                          onChange={(e) => setCustomEndsOccurrences(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                        <span className="text-slate-500 font-semibold">Occurrences</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Multiple Notifications Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-emerald-600" /> Notification (การแจ้งเตือน)
              </label>
              <button
                type="button"
                onClick={handleAddNotification}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add notification</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {notifications.map((notif, idx) => (
                <div key={notif.id || idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl">
                  <input
                    type="number"
                    min="1"
                    className="input-field w-16 text-center font-mono py-1 text-xs"
                    value={notif.value}
                    onChange={(e) => handleUpdateNotification(notif.id, 'value', Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <select
                    className="input-field flex-1 py-1 text-xs cursor-pointer"
                    value={notif.unit}
                    onChange={(e) => handleUpdateNotification(notif.id, 'unit', e.target.value)}
                  >
                    <option value="min before">นาทีก่อนหน้า (min before)</option>
                    <option value="hour before">ชั่วโมงก่อนหน้า (hour before)</option>
                    <option value="day before">วันก่อนหน้า (day before)</option>
                    <option value="week before">สัปดาห์ก่อนหน้า (week before)</option>
                  </select>

                  {notifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveNotification(notif.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="ลบการแจ้งเตือนนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Location & URL */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Location
              </label>
              <input
                type="text"
                className="input-field text-xs"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" /> URL
              </label>
              <input
                type="url"
                className="input-field text-xs"
                placeholder="Add URL (https://...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Note / Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Note (รายละเอียด)
            </label>
            <textarea
              rows={2}
              className="input-field text-xs"
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer Submit & Delete Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-dark-border">
            {editingEvent ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`คุณต้องการลบกิจกรรม "${editingEvent.title}" ใช่หรือไม่?`)) {
                    if (onDeleteEvent) onDeleteEvent(editingEvent.id);
                    onClose();
                  }
                }}
                className="py-2 px-3 text-xs font-bold flex items-center gap-1.5 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-800 rounded-xl transition-all cursor-pointer"
                title="ลบกิจกรรมนี้ออกจากระบบ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบกิจกรรม</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary py-2 px-4 text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn-primary py-2 px-5 text-xs"
              >
                {editingEvent ? 'บันทึกแก้ไข' : 'สร้างกิจกรรม'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
