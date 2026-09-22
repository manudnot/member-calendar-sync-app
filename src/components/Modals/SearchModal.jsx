import React, { useEffect, useRef } from 'react';
import { Search, X, Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { THAI_MONTHS, getLocalDateStr, formatTimeShort, isAllDayEvent, getEventColor } from '../../utils/helpers';

const THAI_DAYS_FULL = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

function formatFullThaiDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const dayName = THAI_DAYS_FULL[d.getDay()];
  const dayNum = d.getDate();
  const monthName = THAI_MONTHS[d.getMonth()];
  const thaiYear = d.getFullYear() + 543;
  return `${dayName}ที่ ${dayNum} ${monthName} ${thaiYear}`;
}

export default function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  events = [],
  members = [],
  categories = [],
  onEditEvent
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = (searchQuery || '').trim().toLowerCase();
  
  // Filter events strictly by TITLE only
  const filteredEvents = events.filter(e => {
    if (e.is_deleted) return false;
    if (!q) return true;
    return e.title && e.title.toLowerCase().includes(q);
  });

  // Sort by start_time ascending
  filteredEvents.sort((a, b) => {
    const dA = new Date(a.start_time).getTime() || 0;
    const dB = new Date(b.start_time).getTime() || 0;
    return dA - dB;
  });

  const handleItemClick = (evtId) => {
    onEditEvent(evtId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up cursor-default flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50/80 dark:bg-dark-bg/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="ค้นหาชื่อกิจกรรม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              title="ล้างข้อความ"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg border-l border-slate-200 dark:border-slate-700 pl-2"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="p-4 overflow-y-auto no-scrollbar flex-1 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider px-1">
            <span>ผลการค้นหาภารกิจ ({filteredEvents.length})</span>
            {q && <span>กรองจาก: "{searchQuery}"</span>}
          </div>

          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
              <Calendar className="w-10 h-10 stroke-1 opacity-50" />
              <p className="text-sm font-bold">ไม่พบภารกิจที่ตรงกับข้อความค้นหา</p>
              <span className="text-xs text-slate-400">ลองใช้คำค้นอื่น หรือตรวจสอบการพิมพ์</span>
            </div>
          ) : (
            filteredEvents.map(evt => {
              const fullDateStr = formatFullThaiDate(evt.start_time);
              const allDay = isAllDayEvent(evt);
              const evtColor = getEventColor(evt, categories, members);
              const assignedMembers = (evt.member_ids || []).map(mId => members.find(m => m.id === mId)).filter(Boolean);

              return (
                <div
                  key={evt.id}
                  onClick={() => handleItemClick(evt.id)}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-dark-bg/60 dark:hover:bg-dark-bg border border-slate-200 dark:border-dark-border hover:border-emerald-500/60 dark:hover:border-emerald-500/60 rounded-2xl transition-all cursor-pointer group shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: evtColor }}
                      />
                      <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {evt.title}
                      </h4>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Date & Time Row */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{fullDateStr}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {allDay ? (
                          <span className="text-purple-600 dark:text-purple-400 font-black">ตลอดวัน</span>
                        ) : (
                          `${formatTimeShort(evt.start_time)} - ${formatTimeShort(evt.end_time)} น.`
                        )}
                      </span>
                    </div>

                    {evt.location && (
                      <div className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Members */}
                  {assignedMembers.length > 0 && (
                    <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">ผู้ปฏิบัติงาน:</span>
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {assignedMembers.map(mem => (
                          <span
                            key={mem.id}
                            className="w-5 h-5 rounded-full text-white flex items-center justify-center font-mono font-black text-[9px] ring-2 ring-white dark:ring-dark-card shadow-xs"
                            style={{ backgroundColor: mem.color }}
                            title={mem.name}
                          >
                            {mem.initials || mem.name.substring(0, 2).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
