import React, { useState } from 'react';
import { X, Search, Plus, User, Trash2, Edit3, Check } from 'lucide-react';

export default function MemberManagementModal({
  isOpen,
  onClose,
  members,
  onAddMember,
  onDeleteMember,
  visibleMemberIds,
  onToggleMemberVisibility
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Virtual member');
  const [newMemberColor, setNewMemberColor] = useState('#10b981');

  if (!isOpen) return null;

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !['สมชาย', 'สมศรี', 'สมศักดิ์', 'สมใจ'].some(mockName => m.name.includes(mockName))
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const initials = newMemberName.trim().substring(0, 2).toUpperCase();
    const newMember = {
      id: `mem_${Date.now()}`,
      name: newMemberName.trim(),
      initials,
      role: newMemberRole,
      color: newMemberColor,
      email: `${newMemberName.toLowerCase().replace(/\s+/g, '')}@unit21.com`
    };

    onAddMember(newMember);
    setNewMemberName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/50">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
            Member List
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary py-1 px-3 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Member Form (Toggled) */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="p-4 bg-slate-50 dark:bg-dark-bg/80 border-b border-slate-200 dark:border-dark-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                เพิ่มสมาชิกใหม่
              </span>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-slate-400">ยกเลิก</button>
            </div>

            <input
              type="text"
              placeholder="ชื่อสมาชิก (เช่น สมชาย วงศ์สว่าง)"
              className="input-field text-xs"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                className="input-field text-xs"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
              >
                <option value="Member">Member</option>
                <option value="Virtual member">Virtual member</option>
                <option value="Creator">Creator</option>
              </select>

              <input
                type="color"
                className="input-field text-xs h-9 cursor-pointer"
                value={newMemberColor}
                onChange={(e) => setNewMemberColor(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary justify-center text-xs py-1.5">
              บันทึกสมาชิก
            </button>
          </form>
        )}

        {/* Body Content */}
        <div className="p-4 overflow-y-auto no-scrollbar flex flex-col gap-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search..."
              className="input-field pl-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Member Count Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Member List ({filteredMembers.length})</span>
          </div>

          {/* Member List Items */}
          <div className="flex flex-col gap-2">
            {filteredMembers.map(mem => {
              const isVisible = visibleMemberIds.includes(mem.id);
              const roleTag = mem.role || (mem.name === 'manudnot' ? 'Me' : mem.name.includes('Thanatat') ? 'Creator' : 'Virtual member');

              return (
                <div
                  key={mem.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center font-mono font-black text-xs shadow-sm shrink-0"
                      style={{ backgroundColor: mem.color || '#10b981' }}
                    >
                      {mem.initials || mem.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {mem.name}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          roleTag === 'Me'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {roleTag}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {mem.email || 'active'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle Switch for Member Visibility */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isVisible}
                        onChange={() => onToggleMemberVisibility(mem.id)}
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>

                    {/* Delete Member (if not primary) */}
                    {roleTag === 'Virtual member' && (
                      <button
                        onClick={() => onDeleteMember(mem.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="ลบสมาชิก"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
