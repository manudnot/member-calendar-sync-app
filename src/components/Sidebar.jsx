import React from 'react';
import { Users, Check, Calendar as CalendarIcon } from 'lucide-react';

export default function Sidebar({
  members,
  events,
  activeMemberFilter,
  setActiveMemberFilter,
  isOpen
}) {
  const getEventCountForMember = (memberId) => {
    return events.filter(e => Array.isArray(e.member_ids) && e.member_ids.includes(memberId)).length;
  };

  return (
    <aside
      className={`w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border flex flex-col transition-all duration-300 z-20 shrink-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-64'
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
            สมาชิกทีม ({members.length})
          </span>
          <button
            onClick={() => setActiveMemberFilter('all')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            เลือกทั้งหมด
          </button>
        </div>

        {/* Member Filter Card Group */}
        <div className="flex flex-col gap-1.5">
          {/* All Members Option */}
          <div
            onClick={() => setActiveMemberFilter('all')}
            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
              activeMemberFilter === 'all'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 shadow-sm'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                ALL
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                สมาชิกทุกคน
              </span>
            </div>
            {activeMemberFilter === 'all' && (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>

          {/* Individual Member Options */}
          {members.map(mem => {
            const isSelected = activeMemberFilter === mem.id;
            const count = getEventCountForMember(mem.id);

            return (
              <div
                key={mem.id}
                onClick={() => setActiveMemberFilter(isSelected ? 'all' : mem.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 shadow-sm'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full text-white flex items-center justify-center font-black text-[11px] shadow-sm font-mono"
                    style={{ backgroundColor: mem.color }}
                  >
                    {mem.initials || mem.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {mem.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                    {count}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
