import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit3, Clock, MapPin, Link as LinkIcon, Bell, Repeat, Check, Users, Plus, Trash2 } from 'lucide-react';

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

function getRepeatOptionsForDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const ordinals = ['1st', '2nd', '3rd', '4th', '5th'];

  const dayName = dayNames[d.getDay()] || 'Saturday';
  const dayNum = d.getDate();
  const weekOrdinalIndex = Math.floor((dayNum - 1) / 7);
  const weekOrdinal = ordinals[weekOrdinalIndex] || `${weekOrdinalIndex + 1}th`;

  return [
    { value: 'none', label: 'Not Repeating' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: `${dayName} each week` },
    { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
    { value: 'monthly_nth_day', label: `${weekOrdinal} ${dayName} each month` },
    { value: 'monthly_date', label: `Every month on the ${dayNum}` },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' }
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
  initialDateStr
}) {
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [color, setColor] = useState('#10b981');

  
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

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || '');
      setAllDay(editingEvent.all_day !== false);
      const sKey = editingEvent.start_time ? editingEvent.start_time.split('T')[0] : initialDateStr;
      const eKey = editingEvent.end_time ? editingEvent.end_time.split('T')[0] : sKey;
      setStartDate(sKey);
      setEndDate(eKey);
      setCustomEndsOnDate(eKey);

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

      if (editingEvent.custom_repeat) {
        setCustomInterval(editingEvent.custom_repeat.interval || 1);
        setCustomUnit(editingEvent.custom_repeat.unit || 'week');
        setCustomEndsMode(editingEvent.custom_repeat.ends_mode || 'never');
        setCustomEndsOnDate(editingEvent.custom_repeat.ends_on || eKey);
        setCustomEndsOccurrences(editingEvent.custom_repeat.ends_occurrences || 10);
      }

      if (Array.isArray(editingEvent.notifications) && editingEvent.notifications.length > 0) {
        setNotifications(editingEvent.notifications);
      } else if (editingEvent.alarm_minutes !== undefined) {
        setNotifications([{ id: 'notif_1', value: editingEvent.alarm_minutes || 15, unit: 'min before' }]);
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
      setColor('#10b981');
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
  }, [editingEvent, initialDateStr, members, isOpen]);

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

    const primaryAlarmMinutes = notifications.length > 0 ? getAlarmMinutesFromNotif(notifications[0]) : 15;

    const payload = {
      id: editingEvent ? editingEvent.id : `evt_${Date.now()}`,
      title,
      start_time: startIso,
      end_time: endIso,
      all_day: allDay,
      color,
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
      member_ids: selectedMembers,
      is_memo: activeTab === 'memo'
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
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                    color === item.hex
                      ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 border-white scale-110 shadow-md'
                      : 'border-transparent hover:scale-105 opacity-85'
                  }`}
                  title={item.name}
                />
              ))}
            </div>
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
                    <option value="min before">min before</option>
                    <option value="hour before">hour before</option>
                    <option value="day before">day before</option>
                    <option value="week before">week before</option>
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

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-dark-border">
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

        </form>
      </div>
    </div>
  );
}
