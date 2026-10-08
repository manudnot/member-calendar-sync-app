import React from 'react';
import { Plus, Edit3, Trash2, Clock, MapPin, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { THAI_MONTHS, formatTimeShort, isEventOnDate, getEventColor, isAllDayEvent, getLocalDateStr } from '../../utils/helpers';

export default function DailyAgenda({
  selectedDateStr,
  events,
  members,
  categories = [],
  visibleMemberIds,
  holidays = {},
  onOpenAddEvent,
  onEditEvent,
  onDeleteEvent
}) {
  const d = new Date(selectedDateStr);
  const formattedThaiDate = `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
  const holidayName = holidays[selectedDateStr];

  const getMemberById = (mId) => members.find(m => m.id === mId);

  const rawDayEvents = events.filter(evt => {
    if (!isEventOnDate(evt, selectedDateStr)) return false;
    if (!Array.isArray(evt.member_ids) || evt.member_ids.length === 0) return true;

    // Filter by visible members
    return evt.member_ids.some(mId => visibleMemberIds.includes(mId));
  });

  // Sort dayEvents:
  // Tier 1: Multi-day continuous events (start_date !== end_date)
  // Tier 2: All-day single-day events (all_day === true)
  // Tier 3: Timed events sorted chronologically (earlier start time first, evening last!)
  const dayEvents = [...rawDayEvents].sort((a, b) => {
    const aStartD = getLocalDateStr(a.start_time);
    const aEndD = getLocalDateStr(a.end_time) || aStartD;
    const bStartD = getLocalDateStr(b.start_time);
    const bEndD = getLocalDateStr(b.end_time) || bStartD;

    const aMultiDay = aStartD !== aEndD;
    const bMultiDay = bStartD !== bEndD;
    const aAllDay = isAllDayEvent(a);
    const bAllDay = isAllDayEvent(b);

    const getTier = (isMulti, isAll) => {
      if (isMulti) return 1;
      if (isAll) return 2;
      return 3;
    };

    const tierA = getTier(aMultiDay, aAllDay);
    const tierB = getTier(bMultiDay, bAllDay);

    if (tierA !== tierB) {
      return tierA - tierB;
    }

    if (tierA === 1) {
      const timeA = new Date(a.start_time).getTime();
      const timeB = new Date(b.start_time).getTime();
      return timeA - timeB;
    }

    if (tierA === 2) {
      return (a.title || '').localeCompare(b.title || '');
    }

    // Tier 3: Timed events strictly sorted by start time (earlier first, evening last)
    const timeA = new Date(a.start_time).getTime();
    const timeB = new Date(b.start_time).getTime();
    if (timeA !== timeB) return timeA - timeB;

    const endA = new Date(a.end_time).getTime();
    const endB = new Date(b.end_time).getTime();
    if (endA !== endB) return endA - endB;

    return (a.title || '').localeCompare(b.title || '');
  });

  const wfhEvents = dayEvents.filter(evt => {
    const cat = String(evt.category || '').toLowerCase();
    const t = String(evt.title || '').toLowerCase();
    return cat.includes('wfh') || cat.includes('ปฏิบัติงานที่พัก') || t.startsWith('[wfh]') || t.includes('work from home');
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
        {/* Holiday Banner Badge */}
        {holidayName && (
          <div className="p-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span className="text-xs font-black">
              {holidayName}
            </span>
          </div>
        )}
        {/* WFH Banner Badge */}
        {wfhEvents.length > 0 && (
          <div className="p-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-amber-800 dark:text-amber-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-xs font-black">
              🏠 ปฏิบัติงานที่พัก (WFH): {wfhEvents.map(e => e.title.replace(/^\[WFH\]\s*/i, '')).join(', ')}
            </span>
          </div>
        )}
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
            const evtColor = getEventColor(evt, categories, members);
            const isAllDay = isAllDayEvent(evt);

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
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.location)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        title="กดเพื่อเปิด Google Maps นำทาง"
                      >
                        <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{evt.location}</span>
                      </a>
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
