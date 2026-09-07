import React, { useState } from 'react';
import { X, Mail, KeyRound, ShieldCheck, AlertCircle, CheckCircle, Send, Sparkles } from 'lucide-react';

export default function ForgotPinModal({
  isOpen,
  onClose,
  members,
  onResetPinWithOtp
}) {
  const [emailInput, setEmailInput] = useState('');
  const [step, setStep] = useState('enter_email'); // 'enter_email' | 'enter_otp' | 'new_pin'
  const [targetMember, setTargetMember] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('กรุณากรอก Email ที่ลงทะเบียนไว้');
      return;
    }

    const matchedMem = members.find(m => m.email && m.email.trim().toLowerCase() === cleanEmail && m.member_type !== 'virtual');
    
    if (!matchedMem) {
      setErrorMsg('ไม่พบ Email นี้ในระบบสมาชิก หรือเป็นตำแหน่งเวรเสมือน');
      return;
    }

    setIsSending(true);
    
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTargetMember(matchedMem);

    // Simulate sending email from signal21onduty@gmail.com
    setTimeout(() => {
      setIsSending(false);
      setStep('enter_otp');
      setSuccessMsg(`ระบบได้ส่งรหัส OTP 6 หลัก จาก signal21onduty@gmail.com ไปยัง ${cleanEmail} แล้ว (รหัสทดสอบ: ${code})`);
    }, 1000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpInput.trim() !== generatedOtp) {
      setErrorMsg('รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบจาก Email ของคุณอีกครั้ง');
      return;
    }

    setStep('new_pin');
    setSuccessMsg('ยืนยันรหัส OTP สำเร็จ! กรุณาตั้งรหัส PIN 4 หลักใหม่');
  };

  const handleDigitChange = (val, idx, isConfirm = false) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 1);
    const targetArr = isConfirm ? [...confirmPin] : [...newPin];
    targetArr[idx] = cleanVal;

    if (isConfirm) setConfirmPin(targetArr);
    else setNewPin(targetArr);

    if (cleanVal && idx < 3) {
      const nextId = isConfirm ? `forgot_cpin_${idx + 1}` : `forgot_pin_${idx + 1}`;
      const nextEl = document.getElementById(nextId);
      if (nextEl) nextEl.focus();
    }
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    const p1 = newPin.join('');
    const p2 = confirmPin.join('');

    if (p1.length < 4 || p2.length < 4) {
      setErrorMsg('กรุณากรอกรหัส PIN 4 หลักให้ครบถ้วน');
      return;
    }

    if (p1 !== p2) {
      setErrorMsg('รหัส PIN ทั้งสองครั้งไม่ตรงกัน');
      return;
    }

    onResetPinWithOtp(targetMember.id, p1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden glass-panel max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            <h3 className="text-xs font-black">
              กู้คืนรหัส PIN (Forgot PIN)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          
          {/* Sender Badge Banner */}
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center gap-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ส่งจาก: <strong className="font-mono text-emerald-700 dark:text-emerald-400">signal21onduty@gmail.com</strong></span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'enter_email' && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  กรอก Email ที่เคยลงทะเบียนไว้ *
                </label>
                <input
                  type="email"
                  className="input-field text-xs font-mono"
                  placeholder="เช่น signal21onduty@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="btn-primary py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'กำลังส่ง OTP...' : 'ส่งรหัส OTP 6 หลัก'}</span>
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP Code */}
          {step === 'enter_otp' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-center">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  กรอกรหัส OTP 6 หลักที่ได้รับจาก Email:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="input-field text-center font-mono font-black text-xl tracking-widest py-2"
                  placeholder="123456"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('enter_email')}
                  className="btn-secondary flex-1 text-xs py-2"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-xs py-2"
                >
                  ยืนยัน OTP
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Set New PIN */}
          {step === 'new_pin' && (
            <form onSubmit={handleSavePin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 items-center">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  ตั้งรหัส PIN 4 หลักใหม่:
                </label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`forgot_pin_${idx}`}
                      id={`forgot_pin_${idx}`}
                      type="password"
                      maxLength={1}
                      className="w-11 h-12 text-center font-mono font-black text-lg bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl outline-none"
                      value={newPin[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, false)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 items-center">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  ยืนยันรหัส PIN 4 หลักอีกครั้ง:
                </label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={`forgot_cpin_${idx}`}
                      id={`forgot_cpin_${idx}`}
                      type="password"
                      maxLength={1}
                      className="w-11 h-12 text-center font-mono font-black text-lg bg-slate-100 dark:bg-dark-bg border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl outline-none"
                      value={confirmPin[idx]}
                      onChange={(e) => handleDigitChange(e.target.value, idx, true)}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary py-2.5 text-xs shadow-md mt-2"
              >
                บันทึกรหัส PIN ใหม่
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
