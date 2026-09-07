import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2, Edit3, Check, User, UserX, UserCheck, Mail, Send, Bot } from 'lucide-react';

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
  onToggleArchiveMember,
  memberToEdit = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [memberColor, setMemberColor] = useState('#10b981');
  const [memberType, setMemberType] = useState('real'); // 'real' | 'virtual'
  const [memberEmail, setMemberEmail] = useState('');
  const [inviteSentMsg, setInviteSentMsg] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setEditingMemberId(memberToEdit.id);
      setMemberName(memberToEdit.name);
      setMemberColor(memberToEdit.color || '#10b981');
      setMemberType(memberToEdit.member_type || 'real');
      setMemberEmail(memberToEdit.email || '');
      setShowForm(true);
    }
  }, [memberToEdit]);

  if (!isOpen) return null;

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !['สมชาย', 'สมศรี', 'สมศักดิ์', 'สมใจ'].some(mockName => m.name.includes(mockName))
  );

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const aResigned = Boolean(a.is_archived || a.status === 'resigned');
    const bResigned = Boolean(b.is_archived || b.status === 'resigned');

    if (aResigned && !bResigned) return 1;
    if (!aResigned && bResigned) return -1;
    return 0;
  });

  const handleOpenAdd = () => {
    setEditingMemberId(null);
    setMemberName('');
    setMemberColor('#10b981');
    setMemberType('real');
    setMemberEmail('');
    setInviteSentMsg('');
    setShowForm(true);
  };

  const handleOpenEdit = (mem) => {
    setEditingMemberId(mem.id);
    setMemberName(mem.name);
    setMemberColor(mem.color || '#10b981');
    setMemberType(mem.member_type || 'real');
    setMemberEmail(mem.email || '');
    setInviteSentMsg('');
    setShowForm(true);
  };

  const handleSendInvite = () => {
    if (!memberEmail.trim()) {
      alert('กรุณาระบุ Email ก่อนส่งคำเชิญ');
      return;
    }
    setInviteSentMsg(`ส่งคำเชิญจาก signal21onduty@gmail.com ไปยัง ${memberEmail.trim()} สำเร็จแล้ว!`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    const initials = memberName.trim().substring(0, 2).toUpperCase();

    if (editingMemberId) {
      const existingMem = members.find(m => m.id === editingMemberId);
      const updatedMember = {
        ...existingMem,
        id: editingMemberId,
        name: memberName.trim(),
        initials,
        color: memberColor,
        member_type: memberType,
        email: memberType === 'real' ? memberEmail.trim() : ''
      };
      onUpdateMember(updatedMember);
    } else {
      const newMember = {
        id: `mem_${Date.now()}`,
        name: memberName.trim(),
        initials,
        color: memberColor,
        member_type: memberType,
        email: memberType === 'real' ? memberEmail.trim() : '',
        is_archived: false
      };
      onAddMember(newMember);
    }

    setMemberName('');
    setMemberEmail('');
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
              จัดการรายชื่อและสถานะสมาชิก
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {!showForm && (
              <button
                onClick={handleOpenAdd}
                className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มสมาชิก</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add / Edit Member Form */}
        {showForm && (
          <form onSubmit={handleFormSubmit} className="p-4 bg-slate-50 dark:bg-dark-bg/80 border-b border-slate-200 dark:border-dark-border flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                {editingMemberId ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}
              </span>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingMemberId(null); }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ยกเลิก
              </button>
            </div>

            {/* Member Type Selector */}
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-dark-bg p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMemberType('real')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  memberType === 'real'
                    ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>คนจริง (Real Person)</span>
              </button>
              <button
                type="button"
                onClick={() => setMemberType('virtual')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  memberType === 'virtual'
                    ? 'bg-white dark:bg-dark-card text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>ตำแหน่งเวร (Virtual Role)</span>
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
                placeholder={memberType === 'real' ? "ระบุชื่อสมาชิก (เช่น Not, Third)" : "ระบุชื่อตำแหน่งเวร (เช่น เวรหมาย)"}
                className="input-field text-xs flex-1"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                required
              />
            </div>

            {/* Email Input for Real Persons */}
            {memberType === 'real' && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-emerald-600" /> Email สำหรับส่ง OTP / คำเชิญ:
                  </span>
                  <button
                    type="button"
                    onClick={handleSendInvite}
                    className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-2.5 h-2.5" /> ส่ง Email คำเชิญ
                  </button>
                </label>
                <input
                  type="email"
                  placeholder="เช่น signal21onduty@gmail.com"
                  className="input-field text-xs font-mono"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
                {inviteSentMsg && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {inviteSentMsg}
                  </span>
                )}
              </div>
            )}

            {/* Color Palette Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                เลือกสีประจำตัวสมาชิก:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setMemberColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center shadow-xs ${
                      memberColor.toLowerCase() === color.toLowerCase()
                        ? 'scale-115 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {memberColor.toLowerCase() === color.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary justify-center text-xs py-2 mt-1">
              {editingMemberId ? 'บันทึกการแก้ไขสมาชิก' : 'บันทึกสมาชิกใหม่'}
            </button>
          </form>
        )}

        {/* Member List with Search */}
        <div className="p-4 flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
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

          <div className="flex flex-col gap-2">
            {sortedMembers.map(mem => {
              const isResigned = Boolean(mem.is_archived || mem.status === 'resigned');
              const isVirtual = mem.member_type === 'virtual';

              return (
                <div
                  key={mem.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isResigned
                      ? 'bg-slate-100/60 dark:bg-dark-bg/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center font-mono font-black text-xs shadow-xs"
                      style={{ backgroundColor: mem.color }}
                    >
                      {mem.initials || mem.name.substring(0, 2).toUpperCase()}
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-xs font-black ${isResigned ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {mem.name} {isResigned && '(ลาออก)'} {isVirtual && '🤖 [ตำแหน่งเวร]'}
                      </span>
                      {mem.email && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {mem.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(mem)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onToggleArchiveMember(mem.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        isResigned
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      }`}
                      title={isResigned ? "คืนสภาพสมาชิก" : "แจ้งลาออก (Soft Delete)"}
                    >
                      {isResigned ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
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
