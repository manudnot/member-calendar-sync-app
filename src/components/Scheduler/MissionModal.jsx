import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit3, Clock, MapPin, Link as LinkIcon, Bell, Repeat, Check, Users } from 'lucide-react';

const COLOR_PALETTE = [
  { hex: '#10b981', name: 'Emerald green' },
  { hex: '#3b82f6', name: 'Blue' },
  { hex: '#8b5cf6', name: 'Purple' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#ef4444', name: 'Red' },
  { hex: '#795548', name: 'Brown' },
  { hex: '#009688', name: 'Teal' }
];

export default function MissionModal({
  isOpen,
  onClose,
  editingEvent,
  members,
  onSaveEvent,
  initialDateStr
}) {
  const [activeTab, setActiveTab] = useState('event'); // 'event' | 'memo'
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [color, setColor] = useState('#10b981');
  const [repeat, setRepeat] = useState('none');
  const [alarmMinutes, setAlarmMinutes] = useState(15);
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || '');
      setAllDay(editingEvent.all_day !== false);
      const sKey = editingEvent.start_time ? editingEvent.start_time.split('T')[0] : initialDateStr;
      const eKey = editingEvent.end_time ? editingEvent.end_time.split('T')[0] : sKey;
      setStartDate(sKey);
      setEndDate(eKey);

      if (editingEvent.start_time && editingEvent.start_time.includes('T')) {
        const timePart = editingEvent.start_time.split('T')[1].substring(0, 5);
        setStartTime(timePart);
      }
      if (editingEvent.end_time && editingEvent.end_time.includes('T')) {
        const timePart = editingEvent.end_time.split('T')[1].substring(0, 5);
        setEndTime(timePart);
      }

      setSelectedMembers(Array.isArray(editingEvent.member_ids) ? editingEvent.member_ids : []);
      setColor(editingEvent.color || '#10b981');
      setRepeat(editingEvent.repeat || 'none');
      setAlarmMinutes(editingEvent.alarm_minutes || 15);
      setLocation(editingEvent.location || '');
      setUrl(editingEvent.url || '');
      setDescription(editingEvent.description || '');
    } else {
      setTitle('');
      setAllDay(true);
      setStartDate(initialDateStr || new Date().toISOString().split('T')[0]);
      setEndDate(initialDateStr || new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setSelectedMembers(members.length > 0 ? [members[0].id] : []);
      setColor('#10b981');
      setRepeat('none');
      setAlarmMinutes(15);
      setLocation('');
      setUrl('');
      setDescription('');
    }
  }, [editingEvent, initialDateStr, members, isOpen]);

  if (!isOpen) return null;

  const handleToggleMember = (memId) => {
    if (selectedMembers.includes(memId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memId));
    } else {
      setSelectedMembers([...selectedMembers, memId]);
    }
  };

  const handleSelectAllMembers = () => {
    setSelectedMembers(members.map(m => m.id));
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

    const startIso = new Date(`${startDate}T${allDay ? '09:00' : startTime}:00`).toISOString();
    const endIso = new Date(`${endDate}T${allDay ? '10:00' : endTime}:00`).toISOString();

    const payload = {
      id: editingEvent ? editingEvent.id : `evt_${Date.now()}`,
      title,
      start_time: startIso,
      end_time: endIso,
      all_day: allDay,
      color,
      repeat,
      alarm_minutes: Number(alarmMinutes),
      location,
      url,
      description,
      member_ids: selectedMembers,
      is_memo: activeTab === 'memo'
    };

    onSaveEvent(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[95vh] flex flex-col">
        
        {/* Modal Header with Sliding Event vs Memo Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/50">
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-dark-bg p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('event')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg transition-all ${
                activeTab === 'event'
                  ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Event
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('memo')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg transition-all ${
                activeTab === 'memo'
                  ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Memo
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
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
              className="input-field"
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
                className="input-field font-mono"
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
                  className="input-field font-mono"
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
                className="input-field font-mono"
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
                  className="input-field font-mono"
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
                onClick={handleSelectAllMembers}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                เลือกทุกคน
              </button>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl flex flex-wrap gap-2">
              {members.map(mem => {
                const isChecked = selectedMembers.includes(mem.id);
                return (
                  <button
                    type="button"
                    key={mem.id}
                    onClick={() => handleToggleMember(mem.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                      isChecked
                        ? 'bg-white dark:bg-dark-card border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-mono font-black"
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

          {/* Color Palette Selector (DutyRoster Palette Style) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Label Color (เลือกสีของงาน)
            </label>
            <div className="flex flex-wrap gap-2.5 p-2.5 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl">
              {COLOR_PALETTE.map(item => (
                <button
                  type="button"
                  key={item.hex}
                  onClick={() => setColor(item.hex)}
                  style={{ backgroundColor: item.hex }}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    color === item.hex
                      ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 border-white scale-110 shadow-md'
                      : 'border-transparent hover:scale-105 opacity-85'
                  }`}
                  title={item.name}
                />
              ))}
            </div>
          </div>

          {/* Repeat & Remind */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-emerald-600" /> Repeat
              </label>
              <select
                className="input-field"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              >
                <option value="none">Not Repeating</option>
                <option value="daily">Daily (ทุกวัน)</option>
                <option value="weekly">Weekly (ทุกสัปดาห์)</option>
                <option value="monthly">Monthly (ทุกเดือน)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-emerald-600" /> Remind
              </label>
              <select
                className="input-field"
                value={alarmMinutes}
                onChange={(e) => setAlarmMinutes(e.target.value)}
              >
                <option value="15">⏰ เตือน 15 นาที</option>
                <option value="30">⏰ เตือน 30 นาที</option>
                <option value="60">⏰ เตือน 1 ชั่วโมง</option>
                <option value="1440">⏰ เตือน 1 วัน</option>
                <option value="0">❌ ไม่แจ้งเตือน</option>
              </select>
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
                className="input-field"
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
                className="input-field"
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
              className="input-field"
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2 px-4"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn-primary py-2 px-5"
            >
              {editingEvent ? 'บันทึกแก้ไข' : 'สร้างกิจกรรม'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
