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

  // 1. Generate flat grid cells (Previous, Current, Next month)
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
      dayOfWeek: prevDateObj.getDay()
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
      isSelected: dateStr === selectedDateStr
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
      dayOfWeek: nextDateObj.getDay()
    });
  }

  // 2. Divide grid cells into 7-day Week Rows
  const weeks = [];
  for (let i = 0; i < gridCells.length; i += 7) {
    weeks.push(gridCells.slice(i, i + 7));
  }

  // Filter visible events for assigned members
  const visibleEvents = events.filter(evt => {
    if (!Array.isArray(evt.member_ids)) return false;
    return evt.member_ids.some(mId => visibleMemberIds.includes(mId));
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border">
      {/* Weekdays Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/50 shrink-0">
        <div className="py-2 text-center text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Sun</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mon</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tue</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Wed</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Thu</div>
        <div className="py-2 text-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Fri</div>
        <div className="py-2 text-center text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Sat</div>
      </div>

      {/* 7-Column Week Rows Container */}
      <div className="flex-1 grid grid-rows-5 lg:grid-rows-6 bg-slate-200 dark:bg-dark-border gap-px overflow-y-auto no-scrollbar">
        {weeks.map((week, weekIdx) => {
          // Calculate events present in this week
          const weekEvents = [];

          visibleEvents.forEach(evt => {
            let startCol = -1;
            let endCol = -1;

            week.forEach((cell, colIdx) => {
              if (isEventOnDate(evt, cell.dateStr)) {
                if (startCol === -1) startCol = colIdx;
                endCol = colIdx;
              }
            });

            if (startCol !== -1 && endCol !== -1) {
              const evtStartDateStr = evt.start_time ? evt.start_time.split('T')[0] : '';
              const evtEndDateStr = evt.end_time ? evt.end_time.split('T')[0] : evtStartDateStr;

              const isStartOfEvent = week[startCol].dateStr === evtStartDateStr;
              const isEndOfEvent = week[endCol].dateStr === evtEndDateStr;
              const span = endCol - startCol + 1;

              weekEvents.push({
                evt,
                startCol,
                endCol,
                span,
                isStartOfEvent,
                isEndOfEvent
              });
            }
          });

          // Sort week events: multi-day/all-day first, then by startCol, then longer span
          weekEvents.sort((a, b) => {
            const aAllDay = a.evt.all_day !== false || a.span > 1;
            const bAllDay = b.evt.all_day !== false || b.span > 1;
            if (aAllDay && !bAllDay) return -1;
            if (!aAllDay && bAllDay) return 1;
            if (a.startCol !== b.startCol) return a.startCol - b.startCol;
            return b.span - a.span;
          });

          // Assign slotIndex to prevent overlaps in this week row
          const slots = [];
          const weekEventsWithSlots = weekEvents.map(item => {
            let slotIndex = 0;
            while (slots[slotIndex] && slots[slotIndex].some(col => col >= item.startCol && col <= item.endCol)) {
              slotIndex++;
            }
            if (!slots[slotIndex]) slots[slotIndex] = [];
            for (let c = item.startCol; c <= item.endCol; c++) {
              slots[slotIndex].push(c);
            }
            return { ...item, slotIndex };
          });

          return (
            <div key={`week-${weekIdx}`} className="relative grid grid-cols-7 bg-slate-200 dark:bg-dark-border gap-px min-h-[90px] overflow-hidden">
              
              {/* Day Background Cells */}
              {week.map(cell => (
                <div
                  key={cell.key}
                  onClick={() => cell.dateStr && onSelectDate(cell.dateStr)}
                  className={`bg-white dark:bg-dark-card p-1.5 flex flex-col justify-between cursor-pointer transition-all duration-150 relative select-none ${
                    cell.isSelected
                      ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  } ${cell.isOtherMonth ? 'bg-slate-50/60 dark:bg-dark-card/40' : ''}`}
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black font-mono ${
                        cell.isToday
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : cell.isOtherMonth
                          ? 'text-slate-300 dark:text-slate-600'
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
                </div>
              ))}

              {/* Multi-Day Spanning Event Banners & Timed Pills Overlay */}
              <div className="absolute inset-0 top-7 pointer-events-none grid grid-cols-7 gap-px p-0.5">
                {weekEventsWithSlots.slice(0, 14).map(({ evt, startCol, span, isStartOfEvent, isEndOfEvent, slotIndex }) => {
                  const firstMem = getMemberById(evt.member_ids ? evt.member_ids[0] : null);
                  const evtColor = evt.color || (firstMem ? firstMem.color : '#10b981');
                  const isAllDay = evt.all_day !== false || span > 1;

                  // Compute grid column placement: 1-indexed in CSS Grid
                  const gridColStart = startCol + 1;

                  return (
                    <div
                      key={`${evt.id}-w${weekIdx}`}
                      onClick={(e) => { e.stopPropagation(); onEditEvent(evt.id); }}
                      className={`pointer-events-auto h-5 px-2 text-[11px] font-bold flex items-center shadow-xs transition-transform hover:scale-[1.01] cursor-pointer truncate z-10 ${
                        isStartOfEvent ? 'rounded-l-md' : 'rounded-l-none'
                      } ${
                        isEndOfEvent ? 'rounded-r-md' : 'rounded-r-none'
                      }`}
                      style={{
                        gridColumnStart: gridColStart,
                        gridColumnEnd: `span ${span}`,
                        marginTop: `${slotIndex * 24}px`,
                        backgroundColor: isAllDay ? evtColor : hexToRgba(evtColor, 0.18),
                        color: isAllDay ? '#ffffff' : evtColor,
                        borderLeft: !isAllDay && isStartOfEvent ? `3px solid ${evtColor}` : undefined
                      }}
                      title={`${evt.title}${!isAllDay ? ` (${formatTimeShort(evt.start_time)})` : ''}`}
                    >
                      {!isAllDay && isStartOfEvent && (
                        <span className="font-mono text-[10px] mr-1 opacity-90">{formatTimeShort(evt.start_time)}</span>
                      )}
                      <span className="truncate">{evt.title}</span>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
