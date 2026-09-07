import React from 'react';
import { formatDateKey, formatTimeShort, hexToRgba, isEventOnDate } from '../../utils/helpers';

export default function MonthGrid({
  currentYear,
  currentMonth,
  selectedDateStr,
  onSelectDate,
  events,
  members,
  visibleMemberIds,
  onEditEvent
}) {
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  const todayStr = formatDateKey(new Date());

  const getMemberById = (mId) => members.find(m => m.id === mId);

  const getFilteredEventsForDate = (dateStr) => {
    if (!dateStr) return [];
    return events.filter(evt => {
      if (!isEventOnDate(evt, dateStr)) return false;
      if (!Array.isArray(evt.member_ids)) return false;

      // Event is visible if ANY of its assigned member IDs is in visibleMemberIds
      return evt.member_ids.some(mId => visibleMemberIds.includes(mId));
    });
  };

  // Days grid generation
  const gridCells = [];

  // Previous month overflow days
  for (let i = firstDayIndex; i > 0; i--) {
    const dayNum = prevMonthDays - i + 1;
    const prevDateObj = new Date(currentYear, currentMonth - 1, dayNum);
    const dateStr = formatDateKey(prevDateObj);
    gridCells.push({
      key: `prev-${dayNum}`,
      dayNum,
      isOtherMonth: true,
      dateStr,
      events: getFilteredEventsForDate(dateStr)
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(currentYear, currentMonth, day);
    const dateStr = formatDateKey(dateObj);
    const dayOfWeek = dateObj.getDay();

    gridCells.push({
      key: `curr-${day}`,
      dayNum: day,
      isOtherMonth: false,
      dateStr,
      dayOfWeek,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDateStr,
      events: getFilteredEventsForDate(dateStr)
    });
  }

  // Next month trailing days to complete 35 or 42 grid cells
  const totalSlots = gridCells.length > 35 ? 42 : 35;
  const nextMonthDaysCount = totalSlots - gridCells.length;
  for (let day = 1; day <= nextMonthDaysCount; day++) {
    const nextDateObj = new Date(currentYear, currentMonth + 1, day);
    const dateStr = formatDateKey(nextDateObj);
    gridCells.push({
      key: `next-${day}`,
      dayNum: day,
      isOtherMonth: true,
      dateStr,
      events: getFilteredEventsForDate(dateStr)
    });
  }


  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border">
      {/* Weekdays Header (Sunday Red, Saturday Blue) */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/50">
        <div className="py-2 text-center text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Sun</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mon</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tue</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Wed</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Thu</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Fri</div>
        <div className="py-2 text-center text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Sat</div>
      </div>

      {/* Month Days 7-Column Grid */}
      <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-slate-200 dark:bg-dark-border gap-px overflow-y-auto no-scrollbar">
        {gridCells.map(cell => {
          if (cell.isOtherMonth) {
            const otherDayEvents = cell.events || [];
            return (
              <div
                key={cell.key}
                onClick={() => cell.dateStr && onSelectDate(cell.dateStr)}
                className="bg-slate-50/40 dark:bg-dark-card/40 p-1.5 flex flex-col gap-1 select-none cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/20 transition-colors"
              >
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                  {cell.dayNum}
                </span>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {otherDayEvents.slice(0, 2).map(evt => (
                    <div
                      key={evt.id}
                      onClick={(e) => { e.stopPropagation(); onEditEvent(evt.id); }}
                      className="px-1 py-0.5 rounded text-[10px] font-bold text-white truncate opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ backgroundColor: evt.color || '#10b981' }}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          const dayEvents = cell.events || [];

          return (
            <div
              key={cell.key}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`bg-white dark:bg-dark-card p-1.5 flex flex-col gap-1.5 cursor-pointer transition-all duration-150 relative overflow-hidden group ${
                cell.isSelected ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/30 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black font-mono transition-transform group-hover:scale-110 ${
                    cell.isToday
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : cell.dayOfWeek === 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : cell.dayOfWeek === 6
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cell.dayNum}
                </span>
              </div>

              {/* Event List Pills inside Day Cell */}
              <div className="flex flex-col gap-1 overflow-hidden max-h-[calc(100%-24px)]">
                {dayEvents.slice(0, 3).map(evt => {
                  const firstMem = getMemberById(evt.member_ids ? evt.member_ids[0] : null);
                  const evtColor = evt.color || (firstMem ? firstMem.color : '#10b981');
                  const isAllDay = evt.all_day !== false;

                  if (isAllDay) {
                    // SOLID COLOR PILL FOR ALL-DAY EVENT
                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => { e.stopPropagation(); onEditEvent(evt.id); }}
                        className="px-1.5 py-0.5 rounded-md text-[11px] font-bold text-white truncate shadow-sm transition-transform hover:scale-[1.02] cursor-pointer"
                        style={{ backgroundColor: evtColor }}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    );
                  } else {
                    // FADED LIGHT PILL WITH LEFT INDICATOR BAR FOR TIMED EVENT
                    const timeStr = formatTimeShort(evt.start_time);
                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => { e.stopPropagation(); onEditEvent(evt.id); }}
                        className="px-1.5 py-0.5 rounded-md text-[11px] font-bold truncate flex items-center gap-1 border-l-3 transition-transform hover:scale-[1.02] cursor-pointer"
                        style={{
                          backgroundColor: hexToRgba(evtColor, 0.15),
                          borderColor: evtColor,
                          color: evtColor
                        }}
                        title={`${timeStr} ${evt.title}`}
                      >
                        <span className="font-mono text-[10px] opacity-90">{timeStr}</span>
                        <span className="truncate">{evt.title}</span>
                      </div>
                    );
                  }
                })}

                {dayEvents.length > 3 && (
                  <div className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-center font-mono">
                    +{dayEvents.length - 3} งาน
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
