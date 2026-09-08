import React from 'react';
import { formatDateKey, formatTimeShort, hexToRgba, isEventOnDate, getEventColor, isAllDayEvent } from '../../utils/helpers';

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

  // Filter visible events for assigned members (or unassigned team events)
  const visibleEvents = events.filter(evt => {
    if (!Array.isArray(evt.member_ids) || evt.member_ids.length === 0) return true;
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
            const aAllDay = isAllDayEvent(a.evt) || a.span > 1;
            const bAllDay = isAllDayEvent(b.evt) || b.span > 1;
            if (aAllDay && !bAllDay) return -1;
            if (!aAllDay && bAllDay) return 1;
            if (a.startCol !== b.startCol) return a.startCol - b.startCol;
            return b.span - a.span;
          });

          // Assign slotIndex for ALL week events so there are ZERO gaps between items
          const slots = [];
          const itemsWithSlots = weekEvents.map(item => {
            let slotIndex = 0;
            while (slots[slotIndex] && slots[slotIndex].some((taken, c) => taken && c >= item.startCol && c <= item.endCol)) {
              slotIndex++;
            }
            if (!slots[slotIndex]) slots[slotIndex] = Array(7).fill(false);
            for (let c = item.startCol; c <= item.endCol; c++) {
              slots[slotIndex][c] = true;
            }
            return { ...item, slotIndex };
          });

          return (
            <div key={`week-${weekIdx}`} className="relative grid grid-cols-7 bg-slate-200 dark:bg-dark-border gap-px min-h-[90px] overflow-hidden">
              
              {/* Day Background Cells with Full 4-Side Borders */}
              {week.map((cell, colIdx) => {
                const dayAllEvents = visibleEvents.filter(e => isEventOnDate(e, cell.dateStr));
                const totalEventsOnDay = dayAllEvents.length;
                const visibleInCellCount = itemsWithSlots.filter(item => item.startCol <= colIdx && item.endCol >= colIdx && item.slotIndex < 3).length;
                const overflowCount = totalEventsOnDay - visibleInCellCount;

                return (
                  <div
                    key={cell.key}
                    onClick={() => cell.dateStr && onSelectDate(cell.dateStr)}
                    className={`bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border/80 p-1 flex flex-col justify-between cursor-pointer transition-all duration-150 relative select-none ${
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

                    {/* Overflow "+N" Pill Badge (e.g. +2 on Day 7) */}
                    {overflowCount > 0 && (
                      <span
                        onClick={(e) => { e.stopPropagation(); onSelectDate(cell.dateStr); }}
                        className="absolute bottom-1 right-1 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-dark-border text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer hover:bg-emerald-500 hover:text-white transition-all z-20"
                        title={`ดูงานทั้งหมด ${totalEventsOnDay} รายการในวันที่ ${cell.dayNum}`}
                      >
                        +{overflowCount}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Unified Event Banners & Timed Cards Overlay (Tight Stack without Gaps) */}
              <div className="absolute inset-0 top-[22px] pointer-events-none grid grid-cols-7 gap-px p-0.5">
                {itemsWithSlots.filter(item => item.slotIndex < 3).map(({ evt, startCol, span, isStartOfEvent, isEndOfEvent, slotIndex }) => {
                  const evtColor = getEventColor(evt, members);
                  const gridColStart = startCol + 1;
                  const isAllDay = isAllDayEvent(evt) || span > 1;
                  const timeText = formatTimeShort(evt.start_time);

                  if (isAllDay) {
                    // All-Day Events: Solid background pill (TimeTree Style)
                    return (
                      <div
                        key={`${evt.id}-w${weekIdx}`}
                        onClick={(e) => { e.stopPropagation(); onEditEvent(evt.id); }}
                        className={`pointer-events-auto h-5 px-2 text-[11px] font-bold flex items-center shadow-xs transition-transform hover:scale-[1.01] cursor-pointer truncate z-10 ${
                          isStartOfEvent ? 'rounded-l-md' : 'rounded-r-none'
                        } ${
                          isEndOfEvent ? 'rounded-r-md' : 'rounded-r-none'
                        }`}
                        style={{
                          gridColumnStart: gridColStart,
                          gridColumnEnd: `span ${span}`,
                          gridRowStart: 1,
                          marginTop: `${slotIndex * 21}px`,
                          backgroundColor: evtColor,
                          color: '#ffffff'
                        }}
                        title={evt.title}
                      >
                        <span className="truncate">{evt.title}</span>
                      </div>
                    );
                  } else {
                    // Timed Events: Light/Faded color background pill (TimeTree Style _1r1c5vl4)
                    return (
                      <div
                        key={`${evt.id}-w${weekIdx}`}
                        onClick={(e) => { e.stopPropagation(); onEditEvent(evt.id); }}
                        className={`pointer-events-auto h-5 px-1.5 text-[10px] font-semibold flex items-center gap-1 shadow-2xs transition-transform hover:scale-[1.01] cursor-pointer truncate z-10 rounded-md border-l-2`}
                        style={{
                          gridColumnStart: gridColStart,
                          gridColumnEnd: `span ${span}`,
                          gridRowStart: 1,
                          marginTop: `${slotIndex * 21}px`,
                          backgroundColor: hexToRgba(evtColor, 0.16),
                          borderLeftColor: evtColor,
                          color: 'inherit'
                        }}
                        title={`${evt.title} (${timeText})`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: evtColor }} />
                        <span className="truncate font-bold text-slate-800 dark:text-slate-100">{evt.title}</span>
                      </div>
                    );
                  }
                })}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
