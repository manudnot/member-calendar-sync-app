import React, { useState } from 'react';
import { X, CalendarOff, Home, Plus, Trash2, Calendar, Users, Check, AlertCircle, Sparkles } from 'lucide-react';
import { getLocalDateStr, isSpecialDayEvent, isWfhEvent, isHolidayEvent } from '../../utils/helpers';

export default function HolidayModal({
  isOpen,
  onClose,
  events = [],
  officialHolidays = {},
  members = [],
  currentYear = new Date().getFullYear(),
  onSaveHolidayOrWfh,
  onDeleteEvent
}) {
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' | 'official'
  const [entryType, setEntryType] = useState('holiday'); // 'holiday' | 'wfh'
  const [startDate, setStartDate] = useState(getLocalDateStr(new Date()));
  const [endDate, setEndDate] = useState(getLocalDateStr(new Date()));
  const [title, setTitle] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Filter custom holidays and WFH events from events list
  const customEntries = events.filter(e => {
    return isSpecialDayEvent(e) || String(e.category || '').toUpperCase() === 'WFH' || String(e.category || '').includes('วันหยุด');
  }).sort((a, b) => new Date(a.start_time || a.startDate) - new Date(b.start_time || b.startDate));

  const handleToggleMember = (memId) => {
    if (selectedMembers.includes(memId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memId));
    } else {
      setSelectedMembers([...selectedMembers, memId]);
    }
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    if (!endDate || endDate < val) {
      setEndDate(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!startDate) {
      setErrorMsg('กรุณาระบุวันที่เริ่มต้น');
      return;
    }

    const defaultTitle = entryType === 'holiday'
      ? 'วันหยุดราชการกรณีพิเศษ (มติ ครม.)'
      : 'ปฏิบัติงานที่พัก (WFH)';

    const finalTitle = title.trim() || defaultTitle;

    setIsSubmitting(true);
    try {
      const payload = {
        title: finalTitle,
        category: entryType === 'holiday' ? 'วันหยุดพิเศษ' : 'WFH',
        startDate: startDate,
        endDate: endDate || startDate,
        allDay: true,
        description: entryType === 'holiday' ? 'วันหยุดราชการกรณีพิเศษ / มติ ครม.' : 'ปฏิบัติงานนอกสถานที่ / Work From Home',
        memberIds: entryType === 'wfh' ? selectedMembers : []
      };

      if (onSaveHolidayOrWfh) {
        await onSaveHolidayOrWfh(payload);
      }

      // Reset form fields
      setTitle('');
      setSelectedMembers([]);
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert official holidays map to array sorted by date
  const officialHolidayList = Object.entries(officialHolidays || {})
    .map(([dateStr, hName]) => ({ dateStr, name: hName }))
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  const activeMembers = members.filter(m => !m.is_archived && m.status !== 'resigned');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                จัดการวันหยุด & วันปฏิบัติงานที่พัก (WFH)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                กำหนดวันหยุดราชการเพิ่มเติม (สีแดง) หรือวัน WFH (สีส้ม) ของหน่วย
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-dark-border px-5 pt-3 gap-2 bg-slate-50/30 dark:bg-dark-bg/20">
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>วันหยุดพิเศษ & WFH ที่กำหนดเอง ({customEntries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('official')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'official'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>วันหยุดราชการตามประกาศ ({officialHolidayList.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto no-scrollbar flex-1 flex flex-col gap-5">
          {activeTab === 'custom' ? (
            <>
              {/* Form Card */}
              <form onSubmit={handleSubmit} className="p-4 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-2xl flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                    เพิ่มวันหยุดพิเศษ หรือ วัน WFH ใหม่
                  </span>
                  {errorMsg && (
                    <span className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errorMsg}
                    </span>
                  )}
                </div>

                {/* Type Selection (2 Cards) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEntryType('holiday')}
                    className={`p-3 rounded-xl border flex flex-col gap-1 transition-all text-left cursor-pointer ${
                      entryType === 'holiday'
                        ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 ring-2 ring-rose-400'
                        : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        วันหยุดพิเศษ
                      </span>
                      {entryType === 'holiday' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      มติ ครม. เพิ่มเติม / วันหยุดหน่วย (แสดงสีแดงทั้งหน่วย)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntryType('wfh')}
                    className={`p-3 rounded-xl border flex flex-col gap-1 transition-all text-left cursor-pointer ${
                      entryType === 'wfh'
                        ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400'
                        : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        วัน WFH
                      </span>
                      {entryType === 'wfh' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      ปฏิบัติงานที่พัก / สลับเวร (แสดงสีส้ม + แท็ก WFH)
                    </span>
                  </button>
                </div>

                {/* Date Pickers */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">
                      วันที่เริ่มต้น *
                    </label>
                    <input
                      type="date"
                      className="input-field text-xs font-mono"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">
                      วันที่สิ้นสุด *
                    </label>
                    <input
                      type="date"
                      className="input-field text-xs font-mono"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Title / Reason */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-black text-slate-600 dark:text-slate-400">
                    ชื่อวัน / เหตุผล
                  </label>
                  <input
                    type="text"
                    className="input-field text-xs"
                    placeholder={
                      entryType === 'holiday'
                        ? 'เช่น วันหยุดราชการกรณีพิเศษ (มติ ครม.)'
                        : 'เช่น ปฏิบัติงานที่พักประจำสัปดาห์ (เวรผลัดที่ 1)'
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Member selection (Only for WFH) */}
                {entryType === 'wfh' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-600" /> สมาชิกที่ WFH:
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {selectedMembers.length === 0 ? '(ไม่เลือก = ทุกคนในหน่วย)' : `เลือกแล้ว ${selectedMembers.length} นาย`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl">
                      {activeMembers.map(m => {
                        const isSelected = selectedMembers.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleToggleMember(m.id)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color || '#f59e0b' }} />
                            <span>{m.rank ? `${m.rank} ${m.nickname || m.name}` : (m.nickname || m.name)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full p-2.5 rounded-xl font-black text-xs text-white transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                    entryType === 'holiday'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'กำลังบันทึก...' : entryType === 'holiday' ? 'บันทึกวันหยุดพิเศษ' : 'บันทึกวัน WFH'}</span>
                </button>
              </form>

              {/* Existing Custom Entries */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>รายการที่บันทึกไว้ในระบบ ({customEntries.length})</span>
                </span>

                {customEntries.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 dark:border-dark-border rounded-2xl text-center flex flex-col items-center justify-center gap-1 text-slate-400">
                    <CalendarOff className="w-6 h-6 stroke-1 text-slate-300 dark:text-slate-600" />
                    <span className="text-xs">ยังไม่มีการเพิ่มวันหยุดพิเศษหรือวัน WFH เอง</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {customEntries.map(entry => {
                      const isWfh = entry.category === 'WFH';
                      const isHoliday = !isWfh;
                      const startD = entry.start_time ? entry.start_time.split('T')[0] : (entry.startDate || '');
                      const endD = entry.end_time ? entry.end_time.split('T')[0] : (entry.endDate || startD);
                      const isDateRange = startD !== endD;

                      return (
                        <div
                          key={entry.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isHoliday
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                              : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isHoliday
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {isHoliday ? <CalendarOff className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                                  {entry.title}
                                </span>
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                                    isHoliday
                                      ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                  }`}
                                >
                                  {isHoliday ? 'วันหยุดพิเศษ' : 'WFH'}
                                </span>
                              </div>

                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                📅 {startD} {isDateRange ? `ถึง ${endD}` : ''}
                                {!isHoliday && Array.isArray(entry.member_ids) && entry.member_ids.length > 0 && (
                                  <span className="ml-2 font-sans text-amber-700 dark:text-amber-400">
                                    • {entry.member_ids.length} นาย
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`ต้องการลบรายการ "${entry.title}" ใช่หรือไม่?`)) {
                                if (onDeleteEvent) onDeleteEvent(entry.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Official Holidays Tab */
            <div className="flex flex-col gap-2">
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
                <span>วันหยุดราชการประจำปี {currentYear + 543} ดึงข้อมูลอัปเดตแบบอัตโนมัติ (Official Live Sync)</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {officialHolidayList.map(h => (
                  <div
                    key={h.dateStr}
                    className="p-2.5 bg-slate-50 dark:bg-dark-bg/40 border border-slate-200 dark:border-dark-border rounded-xl flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200">{h.name}</span>
                    <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 font-extrabold bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md">
                      {h.dateStr}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-dark-border flex justify-end bg-slate-50/50 dark:bg-dark-bg/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-all cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
