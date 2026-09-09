import React, { useState, useEffect, useRef } from 'react';
import { formatDateKey, formatTimeShort, hexToRgba, isEventOnDate, getEventColor, isAllDayEvent } from '../../utils/helpers';
import { Move, Copy, X } from 'lucide-react';

export default function MonthGrid({
  currentYear,
  currentMonth,
  selectedDateStr,
  onSelectDate,
  events,
  members,
  categories,
  visibleMemberIds,
  onEditEvent,
  onMoveEvent,
  onCopyEvent,
  onOpenDayModal,
  onOpenAddEvent
}) {
  const [draggedEvt, setDraggedEvt] = useState(null);
  const [dragOverDateStr, setDragOverDateStr] = useState(null);
  const [dropMenu, setDropMenu] = useState(null);

  // Dynamic max visible event slots based on row height
  const [maxVisibleSlots, setMaxVisibleSlots] = useState(3);
  const gridRef = useRef(null);

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

  const handleCellDrop = (e, cellDateStr) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedEvt) return;

    const clickX = e.clientX;
    const clickY = e.clientY;
    const menuWidth = 190;
    const menuHeight = 110;
    const posX = Math.min(clickX, window.innerWidth - menuWidth - 16);
    const posY = Math.min(clickY, window.innerHeight - menuHeight - 16);

    setDropMenu({
      evt: draggedEvt,
      targetDateStr: cellDateStr,
      position: { x: posX, y: posY }
    });
    setDragOverDateStr(null);
  };

  // Calculate dynamic max visible event slots based on grid container row height
  useEffect(() => {
    if (!gridRef.current) return;

    const updateSlots = () => {
      if (!gridRef.current) return;
      const containerHeight = gridRef.current.clientHeight;
      const numWeeks = weeks.length || 5;
      const weekRowHeight = containerHeight / numWeeks;
      
      // Reserve 24px top header space (date badge) + 20px bottom overflow badge buffer = 44px
      // Each slot uses 21px (20px height + 1px vertical gap)
      const availableHeight = weekRowHeight - 44;
      const computedSlots = Math.max(1, Math.floor(availableHeight / 21));
      setMaxVisibleSlots(computedSlots);
    };

    updateSlots();

    const resizeObserver = new ResizeObserver(() => {
      updateSlots();
    });

    resizeObserver.observe(gridRef.current);
    window.addEventListener('resize', updateSlots);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSlots);
    };
  }, [weeks.length]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border relative">
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

      {/* 7-Column Week Rows Container (Dynamic Height filling 100% space) */}
      <div
        ref={gridRef}
        className="flex-1 grid bg-slate-200 dark:bg-dark-border gap-px overflow-y-auto no-scrollbar"
        style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(0, 1fr))` }}
      >
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
            <div key={`week-${weekIdx}`} className="relative grid grid-cols-7 bg-slate-200 dark:bg-dark-border gap-px overflow-hidden">
              
              {/* Day Background Cells with Full 4-Side Borders & Drag Target Handlers */}
              {week.map((cell, colIdx) => {
                const dayAllEvents = visibleEvents.filter(e => isEventOnDate(e, cell.dateStr));
                const totalEventsOnDay = dayAllEvents.length;
                const visibleInCellCount = itemsWithSlots.filter(item => item.startCol <= colIdx && item.endCol >= colIdx && item.slotIndex < maxVisibleSlots).length;
                const overflowCount = totalEventsOnDay - visibleInCellCount;
                const isDragTarget = dragOverDateStr === cell.dateStr;

                return (
                  <div
                    key={cell.key}
                    onClick={() => {
                      if (cell.dateStr) {
                        onSelectDate(cell.dateStr);
                        if (onOpenAddEvent) onOpenAddEvent(cell.dateStr);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                      if (dragOverDateStr !== cell.dateStr) setDragOverDateStr(cell.dateStr);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      if (dragOverDateStr === cell.dateStr) setDragOverDateStr(null);
                    }}
                    onDrop={(e) => handleCellDrop(e, cell.dateStr)}
                    className={`bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border/80 p-1 flex flex-col justify-between cursor-pointer transition-all duration-150 relative select-none overflow-hidden group ${
                      isDragTarget
                        ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-100/60 dark:bg-emerald-950/40 shadow-inner z-20 scale-[0.99]'
                        : cell.isSelected
                        ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    } ${cell.isOtherMonth ? 'bg-slate-50/60 dark:bg-dark-card/40' : ''}`}
                    title="กดที่พื้นที่ว่างเพื่อสร้างภารกิจใหม่ในวันนี้"
                  >
                    {/* Day Header Strip Box (Centered Day Number + Clickable for Day Agenda Modal) */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (cell.dateStr) {
                          onSelectDate(cell.dateStr);
                          if (onOpenDayModal) onOpenDayModal(cell.dateStr);
                        }
                      }}
                      className="w-full flex items-center justify-center py-0.5 rounded-t-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/80 cursor-pointer transition-all z-20 pointer-events-auto group/header"
                      title={`กดที่แถบหัววันที่เพื่อดูภารกิจทั้งหมดในวันที่ ${cell.dayNum}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black font-mono transition-transform group-hover/header:scale-110 shadow-2xs ${
                          cell.isToday
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                            : cell.isOtherMonth
                            ? 'text-slate-300 dark:text-slate-600'
                            : cell.dayOfWeek === 0
                            ? 'text-rose-600 dark:text-rose-400 font-black'
                            : cell.dayOfWeek === 6
                            ? 'text-blue-600 dark:text-blue-400 font-black'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                    </div>

                    {/* Overflow "+N" Pill Badge (TimeTree Style +1, +2) */}
                    {overflowCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (cell.dateStr) {
                            onSelectDate(cell.dateStr);
                            if (onOpenDayModal) onOpenDayModal(cell.dateStr);
                          }
                        }}
                        className="absolute bottom-1 right-1 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer hover:bg-emerald-500 hover:text-white transition-all z-30 pointer-events-auto"
                        title={`กดเพื่อดูภารกิจทั้งหมด ${totalEventsOnDay} รายการในวันที่ ${cell.dayNum}`}
                      >
                        +{overflowCount}
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Unified Event Banners & Timed Cards Overlay (Strictly Clipped within Week Row) */}
              <div className="absolute inset-0 top-[22px] pointer-events-none grid grid-cols-7 gap-px p-0.5 overflow-hidden">
                {itemsWithSlots.filter(item => item.slotIndex < maxVisibleSlots).map(({ evt, startCol, span, isStartOfEvent, isEndOfEvent, slotIndex }) => {
                  const evtColor = getEventColor(evt, categories, members);
                  const gridColStart = startCol + 1;
                  const isAllDay = isAllDayEvent(evt) || span > 1;
                  const timeText = formatTimeShort(evt.start_time);
                  const isBeingDragged = draggedEvt?.id === evt.id;

                  if (isAllDay) {
                    // All-Day Events: Solid background pill (TimeTree Style)
                    return (
                      <div
                        key={`${evt.id}-w${weekIdx}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedEvt(evt);
                          e.dataTransfer.effectAllowed = 'copyMove';
                          e.dataTransfer.setData('text/plain', evt.id);
                        }}
                        onDragEnd={() => {
                          setDraggedEvt(null);
                          setDragOverDateStr(null);
                        }}
                        onClick={(e) => { e.stopPropagation(); onEditEvent(evt.id); }}
                        className={`pointer-events-auto h-5 px-2 text-[11px] font-bold flex items-center shadow-xs transition-transform hover:scale-[1.01] cursor-grab active:cursor-grabbing truncate z-10 ${
                          isStartOfEvent ? 'rounded-l-md' : 'rounded-r-none'
                        } ${
                          isEndOfEvent ? 'rounded-r-md' : 'rounded-r-none'
                        } ${isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-emerald-400' : ''}`}
                        style={{
                          gridColumnStart: gridColStart,
                          gridColumnEnd: `span ${span}`,
                          gridRowStart: 1,
                          marginTop: `${slotIndex * 21}px`,
                          backgroundColor: evtColor,
                          color: '#ffffff'
                        }}
                        title={`${evt.title} (ลากวางเพื่อย้ายหรือคัดลอก)`}
                      >
                        <span className="truncate">{evt.title}</span>
                      </div>
                    );
                  } else {
                    // Timed Events: Light/Faded color background pill (TimeTree Style _1r1c5vl4)
                    return (
                      <div
                        key={`${evt.id}-w${weekIdx}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedEvt(evt);
                          e.dataTransfer.effectAllowed = 'copyMove';
                          e.dataTransfer.setData('text/plain', evt.id);
                        }}
                        onDragEnd={() => {
                          setDraggedEvt(null);
                          setDragOverDateStr(null);
                        }}
                        onClick={(e) => { e.stopPropagation(); onEditEvent(evt.id); }}
                        className={`pointer-events-auto h-5 px-1.5 text-[10px] font-semibold flex items-center gap-1 shadow-2xs transition-transform hover:scale-[1.01] cursor-grab active:cursor-grabbing truncate z-10 rounded-md border-l-2 ${
                          isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-emerald-400' : ''
                        }`}
                        style={{
                          gridColumnStart: gridColStart,
                          gridColumnEnd: `span ${span}`,
                          gridRowStart: 1,
                          marginTop: `${slotIndex * 21}px`,
                          backgroundColor: hexToRgba(evtColor, 0.16),
                          borderLeftColor: evtColor,
                          color: 'inherit'
                        }}
                        title={`${evt.title} (${timeText}) (ลากวางเพื่อย้ายหรือคัดลอก)`}
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

      {/* TimeTree Style Move / Copy Popover Action Menu */}
      {dropMenu && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-[1px] overflow-hidden"
          onClick={() => setDropMenu(null)}
        >
          <div
            className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1.5 backdrop-blur-md animate-fade-in flex flex-col gap-1 z-50 min-w-[170px]"
            style={{ left: dropMenu.position.x, top: dropMenu.position.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="truncate max-w-[130px] font-bold text-slate-700 dark:text-slate-300">{dropMenu.evt?.title}</span>
              <button
                type="button"
                onClick={() => setDropMenu(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onMoveEvent && dropMenu.evt) {
                  onMoveEvent(dropMenu.evt.id, dropMenu.targetDateStr);
                }
                setDropMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors cursor-pointer text-left"
            >
              <Move className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Move (ย้าย)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onCopyEvent && dropMenu.evt) {
                  onCopyEvent(dropMenu.evt, dropMenu.targetDateStr);
                }
                setDropMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer text-left"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Copy (คัดลอก)</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
