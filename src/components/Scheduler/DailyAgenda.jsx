import React from 'react';
import { Plus, Edit3, Trash2, Clock, MapPin, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { THAI_MONTHS, formatTimeShort, isEventOnDate, getEventColor } from '../../utils/helpers';

export default function DailyAgenda({
  selectedDateStr,
  events,
  members,
  visibleMemberIds,
  onOpenAddEvent,
  onEditEvent,
  onDeleteEvent
}) {
  const d = new Date(selectedDateStr);
  const formattedThaiDate = `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;

  const getMemberById = (mId) => members.find(m => m.id === mId);

  const dayEvents = events.filter(evt => {
    if (!isEventOnDate(evt, selectedDateStr)) return false;
    if (!Array.isArray(evt.member_ids) || evt.member_ids.length === 0) return true;

    // Filter by visible members
    return evt.member_ids.some(mId => visibleMemberIds.includes(mId));
  });


  return (
    <div className="h-60 bg-white dark:bg-dark-card border-t-2 border-emerald-500 flex flex-col shadow-lg shrink-0 glass-panel">
      {/* Drawer Header */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/80 dark:bg-dark-bg/80">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-wide">
            ตารางงานประจำวันที่ <span className="font-mono text-emerald-600 dark:text-emerald-400">{formattedThaiDate}</span>
          </h3>
        </div>

        <button
          onClick={() => onOpenAddEvent(selectedDateStr)}
          className="btn-secondary py-1 px-3 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มงานวันนี้</span>
        </button>
      </div>

      {/* Daily Events List */}
      <div className="flex-1 p-3 overflow-y-auto no-scrollbar flex flex-col gap-2.5">
        {dayEvents.length === 0 ? (
          <div className="m-auto text-center py-6">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
              ไม่มีกิจกรรมในวันที่เลือก
            </p>
            <button
              onClick={() => onOpenAddEvent(selectedDateStr)}
              className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              + เพิ่มกิจกรรมใหม่
            </button>
          </div>
        ) : (
          dayEvents.map(evt => {
            const evtColor = getEventColor(evt, members);
            const isAllDay = evt.all_day !== false;

            return (
              <div
                key={evt.id}
                onClick={() => onEditEvent(evt.id)}
                className="p-3 bg-white dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between border-l-4 cursor-pointer group"
                style={{ borderLeftColor: evtColor }}
              >
                {/* Event Left Metadata */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {evt.title}
                  </span>

                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                      <Clock className="w-3 h-3" />
                      {isAllDay ? 'ทั้งวัน (All-day)' : `${formatTimeShort(evt.start_time)} - ${formatTimeShort(evt.end_time)}`}
                    </span>

                    {evt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
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
                        <LinkIcon className="w-3 h-3" />
                        ลิงก์
                      </a>
                    )}

                    {/* Member Initials Avatar Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
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

                {/* Event Right Quick Actions */}
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditEvent(evt.id); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="แก้ไข"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteEvent(evt.id); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
