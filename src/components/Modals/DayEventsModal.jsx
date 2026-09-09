import React from 'react';
import { Plus, Edit3, Trash2, Clock, MapPin, Link as LinkIcon, Calendar, X } from 'lucide-react';
import { THAI_MONTHS, formatTimeShort, isEventOnDate, getEventColor, isAllDayEvent } from '../../utils/helpers';
import { getHolidayForDate, FALLBACK_HOLIDAYS } from '../../utils/holidays';

export default function DayEventsModal({
  isOpen,
  onClose,
  selectedDateStr,
  events,
  members,
  visibleMemberIds,
  holidays = FALLBACK_HOLIDAYS,
  onOpenAddEvent,
  onEditEvent,
  onDeleteEvent
}) {
  if (!isOpen || !selectedDateStr) return null;

  const d = new Date(selectedDateStr);
  const dayOfWeekNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const dayName = dayOfWeekNames[d.getDay()];
  const formattedThaiDate = `วัน${dayName}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;

  const getMemberById = (mId) => members.find(m => m.id === mId);

  const dayEvents = events.filter(evt => {
    if (!isEventOnDate(evt, selectedDateStr)) return false;
    if (!Array.isArray(evt.member_ids) || evt.member_ids.length === 0) return true;
    return evt.member_ids.some(mId => visibleMemberIds.includes(mId));
  });

  const holiday = getHolidayForDate(selectedDateStr, holidays);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/80 dark:bg-dark-bg/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">
                ภารกิจประจำวัน
              </h2>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formattedThaiDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddEvent(selectedDateStr);
              }}
              className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มภารกิจ</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Events List Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 no-scrollbar">
          {holiday && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span>🎉 วันหยุดราชการ/วันสำคัญ: <strong className="font-extrabold">{holiday.name}</strong></span>
            </div>
          )}

          {dayEvents.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-dark-bg/50 border border-dashed border-slate-200 dark:border-dark-border rounded-xl">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ไม่มีภารกิจหรือกิจกรรมในวันนี้
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddEvent(selectedDateStr);
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มภารกิจใหม่ในวันนี้</span>
              </button>
            </div>
          ) : (
            dayEvents.map(evt => {
              const evtColor = getEventColor(evt, members);
              const isAllDay = isAllDayEvent(evt);

              return (
                <div
                  key={evt.id}
                  onClick={() => {
                    onClose();
                    onEditEvent(evt.id);
                  }}
                  className="p-3.5 bg-white dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-between border-l-4 cursor-pointer group"
                  style={{ borderLeftColor: evtColor }}
                >
                  {/* Event Information */}
                  <div className="flex flex-col gap-1.5 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {evt.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {isAllDay ? 'ทั้งวัน (All-day)' : `${formatTimeShort(evt.start_time)} - ${formatTimeShort(evt.end_time)}`}
                      </span>

                      {evt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {evt.location}
                        </span>
                      )}

                      {evt.url && (
                        <a
                          href={evt.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          ลิงก์
                        </a>
                      )}

                      {/* Member Initials Avatar Badges */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {Array.isArray(evt.member_ids) && evt.member_ids.map(mId => {
                          const m = getMemberById(mId);
                          if (!m) return null;
                          const isResigned = m.is_archived || m.status === 'resigned';

                          return (
                            <span
                              key={mId}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-white font-mono font-black text-[9px] shadow-xs ${
                                isResigned ? 'opacity-70 ring-1 ring-rose-400/50' : ''
                              }`}
                              style={{ backgroundColor: m.color }}
                              title={isResigned ? `${m.name} (พ้นสภาพ / ลาออก)` : m.name}
                            >
                              <span>{m.initials || m.name.substring(0, 2).toUpperCase()}</span>
                              {isResigned && (
                                <span className="text-[8px] font-sans font-extrabold px-1 rounded bg-rose-950/60 text-rose-200">
                                  ลาออก
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onEditEvent(evt.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="แก้ไขภารกิจ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteEvent) onDeleteEvent(evt.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="ลบภารกิจ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
          <span>รวมทั้งหมด {dayEvents.length} รายการ</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-1.5 px-4 text-xs"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
}
