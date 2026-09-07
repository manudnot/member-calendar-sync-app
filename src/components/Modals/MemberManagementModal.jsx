import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2, Edit3, Check, User } from 'lucide-react';

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#64748b'  // Slate
];

export default function MemberManagementModal({
  isOpen,
  onClose,
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  memberToEdit = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [memberColor, setMemberColor] = useState('#10b981');

  useEffect(() => {
    if (memberToEdit) {
      setEditingMemberId(memberToEdit.id);
      setMemberName(memberToEdit.name);
      setMemberColor(memberToEdit.color || '#10b981');
      setShowForm(true);
    }
  }, [memberToEdit]);

  if (!isOpen) return null;

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !['สมชาย', 'สมศรี', 'สมศักดิ์', 'สมใจ'].some(mockName => m.name.includes(mockName))
  );

  const handleOpenAdd = () => {
    setEditingMemberId(null);
    setMemberName('');
    setMemberColor('#10b981');
    setShowForm(true);
  };

  const handleOpenEdit = (mem) => {
    setEditingMemberId(mem.id);
    setMemberName(mem.name);
    setMemberColor(mem.color || '#10b981');
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    const initials = memberName.trim().substring(0, 2).toUpperCase();

    if (editingMemberId) {
      // Update Member
      const updatedMember = {
        id: editingMemberId,
        name: memberName.trim(),
        initials,
        color: memberColor
      };
      onUpdateMember(updatedMember);
    } else {
      // Add New Member
      const newMember = {
        id: `mem_${Date.now()}`,
        name: memberName.trim(),
        initials,
        color: memberColor
      };
      onAddMember(newMember);
    }

    setMemberName('');
    setEditingMemberId(null);
    setShowForm(false);
  };

  const previewInitials = memberName.trim() ? memberName.trim().substring(0, 2).toUpperCase() : '??';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              จัดการรายชื่อและสีประจำตัวสมาชิก
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {!showForm && (
              <button
                onClick={handleOpenAdd}
                className="btn-primary py-1 px-3 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มสมาชิก</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add / Edit Member Form */}
        {showForm && (
          <form onSubmit={handleFormSubmit} className="p-4 bg-slate-50 dark:bg-dark-bg/80 border-b border-slate-200 dark:border-dark-border flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                {editingMemberId ? 'แก้ไขข้อมูลสมาชิก (ชื่อและสีประจำตัว)' : 'เพิ่มสมาชิกใหม่'}
              </span>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingMemberId(null); }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ยกเลิก
              </button>
            </div>

            {/* Live Avatar Preview & Name Input */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full text-white flex items-center justify-center font-mono font-black text-sm shadow-md shrink-0 transition-all duration-200"
                style={{ backgroundColor: memberColor }}
              >
                {previewInitials}
              </div>
              <input
                type="text"
                placeholder="ระบุชื่อสมาชิก (เช่น WoooddY, ผก.เอก)"
                className="input-field text-xs flex-1"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                required
              />
            </div>

            {/* Color Palette Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                เลือกสีประจำตัวสมาชิก:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setMemberColor(color)}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center shadow-xs ${
                      memberColor.toLowerCase() === color.toLowerCase()
                        ? 'scale-115 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {memberColor.toLowerCase() === color.toLowerCase() && (
                      <Check className="w-4 h-4 text-white drop-shadow-xs" />
                    )}
                  </button>
                ))}

                {/* Custom Color Input */}
                <div className="relative flex items-center">
                  <input
                    type="color"
                    className="w-7 h-7 rounded-full border-0 p-0 cursor-pointer overflow-hidden opacity-0 absolute inset-0"
                    value={memberColor}
                    onChange={(e) => setMemberColor(e.target.value)}
                  />
                  <div
                    className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800"
                    title="เลือกสีแบบกำหนดเอง"
                  >
                    +
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary justify-center text-xs py-2 mt-1">
              {editingMemberId ? 'บันทึกการแก้ไขสมาชิก' : 'บันทึกสมาชิกใหม่'}
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
              placeholder="ค้นหาชื่อสมาชิก..."
              className="input-field pl-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Member Count Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>รายการสมาชิกทั้งหมด ({filteredMembers.length} ท่าน)</span>
          </div>

          {/* Member List Items */}
          <div className="flex flex-col gap-2">
            {filteredMembers.map(mem => {
              return (
                <div
                  key={mem.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center font-mono font-black text-xs shadow-sm shrink-0"
                      style={{ backgroundColor: mem.color || '#10b981' }}
                    >
                      {mem.initials || mem.name.substring(0, 2).toUpperCase()}
                    </div>

                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {mem.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit Member Button */}
                    <button
                      onClick={() => handleOpenEdit(mem)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                      title="แก้ไขชื่อและสีประจำตัว"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Member Button */}
                    <button
                      onClick={() => onDeleteMember(mem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="ลบสมาชิก"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

