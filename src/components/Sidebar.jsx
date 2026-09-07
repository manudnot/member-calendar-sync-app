import React from 'react';
import { Users, Check, Calendar as CalendarIcon, Edit3 } from 'lucide-react';

export default function Sidebar({
  members,
  events,
  visibleMemberIds,
  onToggleMemberVisibility,
  onSelectAllMembers,
  isOpen,
  onEditMember
}) {
  const getEventCountForMember = (memberId) => {
    return events.filter(e => Array.isArray(e.member_ids) && e.member_ids.includes(memberId)).length;
  };

  // Filter out any mock names if present
  const cleanMembers = members.filter(m =>
    !['สมชาย', 'สมศรี', 'สมศักดิ์', 'สมใจ'].some(mockName => m.name.includes(mockName))
  );

  const isAllSelected = cleanMembers.length > 0 && cleanMembers.every(mem => visibleMemberIds.includes(mem.id));

  return (
    <aside
      className={`bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border flex flex-col transition-all duration-300 z-20 shrink-0 ${
        isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
      }`}
    >
      {/* Calendar Identity Header */}
      <div className="p-4 border-b border-slate-200 dark:border-dark-border">
        <div className="flex items-center gap-3 glass-panel p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
              งาน ส/21 - TimeTree
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Team Schedule & iCal Hub
            </p>
          </div>
        </div>
      </div>

      {/* Member Filter Section */}
      <div className="p-4 flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            สมาชิกทีม ({cleanMembers.length})
          </span>
          <button
            onClick={onSelectAllMembers}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {isAllSelected ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด'}
          </button>
        </div>

        {/* Member Filter Checkbox List */}
        <div className="flex flex-col gap-1.5">
          {cleanMembers.map(mem => {
            const isChecked = visibleMemberIds.includes(mem.id);

            return (
              <div
                key={mem.id}
                onClick={() => onToggleMemberVisibility(mem.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border group ${
                  isChecked
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 shadow-xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-transparent opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden pr-1">
                  <div
                    className="w-7 h-7 rounded-full text-white flex items-center justify-center font-black text-[11px] shadow-sm font-mono shrink-0"
                    style={{ backgroundColor: mem.color || '#10b981' }}
                  >
                    {mem.initials || mem.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {mem.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Quick Edit Member Button */}
                  {onEditMember && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMember(mem);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md transition-colors cursor-pointer"
                      title="แก้ไขชื่อและสี"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handled by parent div onClick
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

