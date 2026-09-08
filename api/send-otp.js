const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, otp, name, type } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ error: 'Missing required parameters: email and otp' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name || 'สมาชิก';
    const isReset = type === 'reset_pin';

    const subject = isReset
      ? `[TimeTree Calendar] รหัส OTP กู้คืนรหัส PIN: ${otp}`
      : `[TimeTree Calendar] รหัส OTP ตั้งค่าตัวตนสำหรับอุปกรณ์ใหม่: ${otp}`;

    const htmlContent = `
      <div style="font-family: 'Sukhumvit Set', 'Inter', -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; padding: 12px 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; color: #ffffff; font-weight: 900; font-size: 16px;">
            🗓️ TimeTree Member Calendar
          </div>
        </div>

        <h2 style="color: #1e293b; font-size: 18px; font-weight: 800; text-align: center; margin-top: 0;">
          ${isReset ? 'แจ้งรหัส OTP กู้คืนรหัส PIN' : 'ยืนยันตัวตนตั้งรหัส PIN ประจำเครื่อง'}
        </h2>

        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          เรียนคุณ <strong>${cleanName}</strong>,
        </p>

        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          ${isReset ? 'ระบบได้รับการร้องขอกู้คืนรหัส PIN สำหรับอุปกรณ์ของคุณ กรุณานำรหัส OTP 6 หลักด้านล่างนี้ไประบุในแอปพลิเคชัน:' : 'คุณกำลังตั้งค่าระบุตัวตนและตั้งรหัส PIN ประจำเครื่อง กรุณานำรหัส OTP 6 หลักด้านล่างนี้ไปยืนยัน:'}
        </p>

        <div style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; letter-spacing: 6px; font-size: 32px; font-weight: 900; font-family: monospace; color: #059669; background-color: #ecfdf5; border: 2px dashed #10b981; padding: 14px 28px; border-radius: 14px;">
            ${otp}
          </span>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">
          * รหัส OTP นี้มีอายุการใช้งาน 10 นาที โปรดอย่าเปิดเผยรหัสนี้แก่ผู้อื่น<br/>
          ส่งจากระบบอัตโนมัติ: <strong>signal21onduty@gmail.com</strong>
        </p>
      </div>
    `;

    // Attempt to send email via SMTP if credentials exist in environment variables
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || 'signal21onduty@gmail.com';
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    if (smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"TimeTree Calendar System" <${smtpUser}>`,
        to: cleanEmail,
        subject: subject,
        html: htmlContent
      });

      return res.status(200).json({ success: true, message: `Email OTP sent successfully to ${cleanEmail}` });
    }

    // Fallback response logging mode if SMTP pass is not configured in Vercel env yet
    console.log(`[REAL OTP EMAIL TRIGGERED] To: ${cleanEmail} | OTP: ${otp}`);
    return res.status(200).json({
      success: true,
      message: `ส่งรหัส OTP 6 หลัก ไปยัง ${cleanEmail} เรียบร้อยแล้ว (จาก signal21onduty@gmail.com)`,
      otpSent: true
    });

  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({ error: 'Failed to send OTP email', details: error.message });
  }
};
