import React, { useState } from 'react';
import { User, KeyRound, ShieldCheck, Fingerprint, Check, AlertCircle, Sparkles, Lock, ArrowRight, RefreshCw } from 'lucide-react';
import { verifyMasterPasscode } from '../../utils/crypto';

export default function FirstTimeUserModal({
  isOpen,
  members,
  onSelectMemberWithPin,
  onSaveNewPin,
  onOpenForgotPin
}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [masterPasscodeInput, setMasterPasscodeInput] = useState('');
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [confirmPinInput, setConfirmPinInput] = useState(['', '', '', '']);
  const [step, setStep] = useState('select_user'); // 'select_user' | 'enter_pin' | 'enter_master_passcode' | 'setup_pin'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [enableBiometrics, setEnableBiometrics] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);

  if (!isOpen) return null;

  const activeMembers = members.filter(m => !m.is_archived && m.status !== 'resigned' && m.member_type !== 'virtual');

  const handleChooseMember = (member) => {
    setSelectedMember(member);
    setErrorMsg('');
    setSuccessMsg('');
    setPinInput(['', '', '', '']);
    setConfirmPinInput(['', '', '', '']);
    setMasterPasscodeInput('');
    setIsResetMode(false);

    if (member.pin_code) {
      // If member already has a PIN, require existing 4-digit PIN entry (Multi-device rule)
      setStep('enter_pin');
    } else {
      // First-time member without a PIN: Go to Step 2 (Master Passcode CRMASIGNAL21)
      setStep('enter_master_passcode');
    }
  };

  const handleVerifyMasterPasscode = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!masterPasscodeInput || !masterPasscodeInput.trim()) {
      setErrorMsg('กรุณากรอกรหัสหน่วย CRMASIGNAL21');
      return;
    }

    if (!verifyMasterPasscode(masterPasscodeInput)) {
      setErrorMsg('รหัสหน่วยไม่ถูกต้อง (กรุณาตรวจสอบการพิมพ์ตัวเล็ก-ตัวใหญ่ให้ถูกต้อง)');
      return;
    }

    // Passcode valid -> Move to Step 3: Setup PIN
    setStep('setup_pin');
    setSuccessMsg(
      isResetMode
        ? 'ยืนยันรหัสหน่วยสำเร็จ! กรุณาตั้งรหัส PIN 4 หลักใหม่'
        : 'ยืนยันรหัสหน่วยสำเร็จ! กรุณาตั้งรหัส PIN 4 หลักส่วนตัวของคุณ'
    );
  };

  const handleDigitChange = (val, idx, isConfirm = false) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 1);
    const targetArr = isConfirm ? [...confirmPinInput] : [...pinInput];
    targetArr[idx] = cleanVal;

    if (isConfirm) {
      setConfirmPinInput(targetArr);
    } else {
      setPinInput(targetArr);
    }

    // Auto focus next input
    if (cleanVal && idx < 3) {
      const nextId = isConfirm ? `confirm_pin_${idx + 1}` : `pin_${idx + 1}`;
      const nextEl = document.getElementById(nextId);
      if (nextEl) nextEl.focus();
    }
  };

  const handleKeyDown = (e, idx, isConfirm = false) => {
    if (e.key === 'Backspace') {
      const targetArr = isConfirm ? confirmPinInput : pinInput;
      if (!targetArr[idx] && idx > 0) {
        const prevId = isConfirm ? `confirm_pin_${idx - 1}` : `pin_${idx - 1}`;
        const prevEl = document.getElementById(prevId);
        if (prevEl) prevEl.focus();
      }
    }
  };

  const handleVerifyExistingPin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const enteredPin = pinInput.join('');
    if (enteredPin.length < 4) {
      setErrorMsg('กรุณากรอกรหัส PIN 4 หลักให้ครบ');
      return;
    }

    if (enteredPin !== selectedMember.pin_code) {
      setErrorMsg('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setPinInput(['', '', '', '']);
      const firstEl = document.getElementById('pin_0');
      if (firstEl) firstEl.focus();
      return;
    }

    onSelectMemberWithPin(selectedMember.id, enteredPin, enableBiometrics);
  };

  const handleCreateNewPin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const p1 = pinInput.join('');
    const p2 = confirmPinInput.join('');

    if (p1.length < 4 || p2.length < 4) {
      setErrorMsg('กรุณากรอกรหัส PIN 4 หลักให้ครบถ้วนทั้งสองช่อง');
      return;
    }

    if (p1 !== p2) {
      setErrorMsg('รหัส PIN ทั้งสองครั้งไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      setConfirmPinInput(['', '', '', '']);
      const cEl = document.getElementById('confirm_pin_0');
      if (cEl) cEl.focus();
      return;
    }

    onSaveNewPin(selectedMember.id, p1, enableBiometrics, selectedMember.email);
  };

  const handleTriggerForgotPin = () => {
    setIsResetMode(true);
    setMasterPasscodeInput('');
    setErrorMsg('');
    setSuccessMsg('');
    setStep('enter_master_passcode');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden glass-panel max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-dark-border bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col gap-1 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-1 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-base font-black tracking-tight">
            เข้าใช้งานระบบปฏิทินปฏิบัติงาน
          </h2>
          <p className="text-xs font-semibold text-emerald-100">
            {step === 'select_user' && '[Step 1] กรุณาเลือกชื่อสมาชิกทีมเพื่อเปิดใช้งาน'}
            {step === 'enter_pin' && `กรอกรหัส PIN 4 หลักเดิมเพื่อเข้าใช้งานในนาม ${selectedMember?.name}`}
            {step === 'enter_master_passcode' && `[Step 2] กรอกรหัสหน่วยเพื่อยืนยันสิทธิ์สำหรับ ${selectedMember?.name}`}
            {step === 'setup_pin' && `[Step 3] ตั้งรหัส PIN 4 หลักส่วนตัวสำหรับ ${selectedMember?.name}`}
          </p>
        </div>

        <div className="p-5 overflow-y-auto no-scrollbar flex-1 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Select Member Identity */}
          {step === 'select_user' && (
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>[Step 1] รายชื่อสมาชิกทีม (คลิกเลือกชื่อของคุณ):</span>
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
                {activeMembers.map(mem => (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => handleChooseMember(mem)}
                    className="p-3 bg-slate-50 dark:bg-dark-bg/80 border border-slate-200 dark:border-dark-border hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-mono font-black text-xs shadow-sm"
                        style={{ backgroundColor: mem.color }}
                      >
                        {mem.initials || mem.name.substring(0, 2).toUpperCase()}
                      </span>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {mem.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {mem.pin_code ? '🔒 มีรหัส PIN แล้ว (กรอก PIN เดิมเพื่อเข้าเครื่อง)' : '🔑 สมาชิกใหม่ (กรอกรหัสหน่วยเพื่อตั้ง PIN)'}
                        </span>
                      </div>
                    </div>

                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Enter Existing PIN (Multi-device Login) */}
          {step === 'enter_pin' && (
            <form onSubmit={handleVerifyExistingPin} className="flex flex-col gap-4 py-2">
              <div className="flex items-center justify-center gap-2">
                <span
                  className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-mono font-black text-sm shadow-sm"
                  style={{ backgroundColor: selectedMember?.color }}
                >
                  {selectedMember?.initials}
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {selectedMember?.name}
                </span>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  กรอกรหัส PIN 4 หลักส่วนตัวของคุณ:
                </label>
                <div className="flex gap-3 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`pin_${idx}`}
                      id={`pin_${idx}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="w-12 h-14 text-center font-mono font-black text-xl bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-2xl outline-none shadow-sm focus:scale-105 transition-all"
                      value={pinInput[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, false)}
                      onKeyDown={(e) => handleKeyDown(e, idx, false)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleTriggerForgotPin}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer mt-2 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>จำรหัสไม่ได้? กดลืมรหัส PIN (ยืนยันด้วยรหัสหน่วย)</span>
                </button>
              </div>

              {/* Biometrics Switch */}
              <div className="p-3 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    เปิดใช้ Face ID / Touch ID สำหรับเครื่องนี้
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  checked={enableBiometrics}
                  onChange={(e) => setEnableBiometrics(e.target.checked)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select_user')}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-xs py-2.5"
                >
                  ยืนยันเข้าใช้งาน
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter Master Passcode (CRMASIGNAL21) */}
          {step === 'enter_master_passcode' && (
            <form onSubmit={handleVerifyMasterPasscode} className="flex flex-col gap-4 py-2">
              <div className="flex items-center justify-center gap-2">
                <span
                  className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-mono font-black text-sm shadow-sm"
                  style={{ backgroundColor: selectedMember?.color }}
                >
                  {selectedMember?.initials}
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {selectedMember?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {isResetMode ? 'กู้คืนและตั้งรหัส PIN ใหม่' : 'ยืนยันรหัสหน่วยเพื่อเริ่มตั้งรหัส PIN'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left bg-slate-50 dark:bg-dark-bg/60 p-4 border border-slate-200 dark:border-dark-border rounded-2xl">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  [Step 2] กรอกรหัสหน่วย CRMASIGNAL21:
                </label>
                <input
                  type="text"
                  placeholder="กรอกรหัสหน่วย"
                  className="input-field font-mono text-sm tracking-wider"
                  value={masterPasscodeInput}
                  onChange={(e) => setMasterPasscodeInput(e.target.value)}
                  autoFocus
                  required
                />
                <span className="text-[10px] text-slate-400">
                  * กรอกรหัสให้ถูกต้องตามตัวอักษรเพื่อยืนยันสิทธิ์
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select_user')}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-xs py-2.5"
                >
                  ถัดไป (ตั้ง PIN 4 หลัก)
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Setup New 4-Digit PIN */}
          {step === 'setup_pin' && (
            <form onSubmit={handleCreateNewPin} className="flex flex-col gap-4 py-1">
              <div className="flex items-center justify-center gap-2">
                <span
                  className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-mono font-black text-sm shadow-sm"
                  style={{ backgroundColor: selectedMember?.color }}
                >
                  {selectedMember?.initials}
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {selectedMember?.name}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 items-center">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  [Step 3] ตั้งรหัส PIN 4 หลักส่วนตัว:
                </label>
                <div className="flex gap-2.5 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`pin_${idx}`}
                      id={`pin_${idx}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="w-11 h-12 text-center font-mono font-black text-lg bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl outline-none shadow-sm transition-all"
                      value={pinInput[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, false)}
                      onKeyDown={(e) => handleKeyDown(e, idx, false)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 items-center">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ยืนยันรหัส PIN 4 หลักอีกครั้ง:
                </label>
                <div className="flex gap-2.5 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`confirm_pin_${idx}`}
                      id={`confirm_pin_${idx}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="w-11 h-12 text-center font-mono font-black text-lg bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl outline-none shadow-sm transition-all"
                      value={confirmPinInput[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, true)}
                      onKeyDown={(e) => handleKeyDown(e, idx, true)}
                    />
                  ))}
                </div>
              </div>

              {/* Biometrics Switch */}
              <div className="p-2.5 bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    เปิดใช้ Face ID / Touch ID ประจำเครื่อง
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  checked={enableBiometrics}
                  onChange={(e) => setEnableBiometrics(e.target.checked)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select_user')}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-xs py-2.5"
                >
                  บันทึกรหัส PIN & เข้าใช้งาน
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

