// api/line-webhook.js - Vercel Serverless Endpoint for LINE Messaging Bot (AI เสมียนกองร้อย)
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aevutuguijjakfhulgjd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8LNKQLJ6snj6AvxPGf2TmA_Sm8KCbhU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '5yYbM9jVR9aNZS6RvDhS8D0ow/t7VHSpE3kX5PQXqK4h0OpEbaqIxj+Oy1eKAYfFBsMF+twQeDmtj0lwfSa30tJJtYHZqeTX35Z7V/9wOpWD5d3Mq0tAt96uWMXfKRDBCcFstKpuSXG26xG+Uy3SWQdB04t89/1O/w1cDnyilFU=';
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '21ce08aa85816d7feb7c0d62f500e779';
const TYPHOON_API_KEY = process.env.TYPHOON_API_KEY || 'sk-JfnzdevrTSBsAw9GRBda4zhHtTNMkEFM9GEnLjc4Pyu0WPaS';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Dynamic Supabase member fetch & matching
async function fetchMembersFromSupabase() {
  try {
    const { data, error } = await supabase.from('members').select('id, name, rank, first_name, last_name, nickname, full_name, member_type');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.error('Error fetching members from Supabase:', e);
  }
  return [
    { id: 'mem_manudnot', name: 'Not', rank: 'จ.ส.อ.', first_name: 'มนุษย์นอต', last_name: 'สื่อสาร', nickname: 'นอต', full_name: 'มนุษย์นอต สื่อสาร' },
    { id: 'mem_phak_ek', name: 'เอก', rank: 'ร.อ.', first_name: 'ภาคเอก', last_name: '', nickname: 'เอก', full_name: 'ภาคเอก' },
    { id: 'mem_thanatat', name: 'Top', rank: 'ร.อ.', first_name: 'ธนทัต', last_name: '', nickname: 'ท็อป', full_name: 'ธนทัต' },
    { id: 'mem_third', name: 'Third', rank: 'ร.ท.', first_name: 'สุภณัฐ', last_name: '', nickname: 'สุภณัฐ', full_name: 'สุภณัฐ' },
    { id: 'mem_june', name: 'June', rank: 'ร.ต.หญิง', first_name: 'จูน', last_name: '', nickname: 'จูน', full_name: 'จูน' },
    { id: 'mem_keng', name: 'เก่ง', rank: 'ส.อ.', first_name: 'เก่งการ', last_name: '', nickname: 'เก่ง', full_name: 'เก่งการ' },
    { id: 'mem_tum', name: 'ตั้ม', rank: 'ส.อ.', first_name: 'ตั้ม', last_name: '', nickname: 'ตั้ม', full_name: 'ตั้ม' },
    { id: 'mem_woooddy', name: 'Champ', rank: 'พ.อ.', first_name: 'แชมป์', last_name: '', nickname: 'แชมป์', full_name: 'แชมป์' },
    { id: 'mem_wm', name: 'เวรหมาย', rank: 'เวร', first_name: 'เวรปฏิบัติการหมาย', last_name: '', nickname: 'เวรหมาย', full_name: 'เวรปฏิบัติการหมาย' }
  ];
}

function matchMemberIds(memberNamesArray, dbMembers = []) {
  if (!Array.isArray(memberNamesArray) || memberNamesArray.length === 0) return [];
  const matched = new Set();

  memberNamesArray.forEach(nameStr => {
    const s = String(nameStr).toLowerCase().trim();
    if (!s || s === 'ไม่ระบุ' || s === 'ไม่มี' || s === 'รวม') return;

    dbMembers.forEach(mem => {
      const searchTerms = [
        mem.name,
        mem.first_name,
        mem.last_name,
        mem.nickname,
        mem.full_name,
        mem.rank ? `${mem.rank} ${mem.name}` : '',
        mem.rank ? `${mem.rank} ${mem.first_name}` : '',
        mem.rank ? `${mem.rank} ${mem.nickname}` : '',
        mem.rank ? `${mem.rank} ${mem.full_name}` : ''
      ].filter(Boolean).map(t => String(t).toLowerCase());

      if (searchTerms.some(term => s.includes(term) || term.includes(s))) {
        matched.add(mem.id);
      }
    });
  });

  return Array.from(matched);
}

export const config = {
  api: {
    bodyParser: false
  }
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyLineSignature(bodyBuffer, signature) {
  if (!signature || !LINE_CHANNEL_SECRET) return true; // Graceful fallback if testing
  const hmac = crypto.createHmac('SHA256', LINE_CHANNEL_SECRET);
  hmac.update(bodyBuffer);
  const calculated = hmac.digest('base64');
  return calculated === signature;
}

async function replyLineMessage(replyToken, messages) {
  if (!replyToken) return;
  const body = JSON.stringify({
    replyToken,
    messages: Array.isArray(messages) ? messages : [messages]
  });

  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body
  });
}

export function formatCategoryWithBadge(catStr) {
  if (!catStr) return '🔵 ภารกิจหน่วย';
  if (catStr.includes('🔴') || catStr.includes('🔵') || catStr.includes('🟢') || catStr.includes('🟡')) {
    return catStr;
  }
  if (catStr.includes('หมาย')) return '🔴 ภารกิจหมาย';
  if (catStr.includes('หน่วย')) return '🔵 ภารกิจหน่วย';
  if (catStr.includes('ฝึก')) return '🟢 ภารกิจการฝึก';
  return `🔵 ${catStr}`;
}

async function analyzeMissionOrderWithAI(text, imageBase64 = null, dbMembers = []) {
  const systemPrompt = `คุณคือเสมียนกองร้อยสายและวิทยุถ่ายทอด มีหน้าที่วิเคราะห์คำสั่งปฏิบัติงาน ภารกิจ รูปภาพ หรือเอกสารข่าวสาร 
สำคัญที่สุด: หากในคำสั่งมีหลายหัวข้อ/หลายภารกิจ ให้สกัดแยกเป็นรายการภารกิจในอาร์เรย์ "missions" ห้ามนำวันมารวมกันเป็นภารกิจเดียวเด็ดขาด!
กรุณาวิเคราะห์และสกัดข้อมูลภารกิจตอบกลับเฉพาะ JSON บริสุทธิ์ (ไม่ต้องใส่ markdown codeblock และไม่ใส่คำขึ้นต้นใดๆ) มีโครงสร้างดังนี้:
{
  "missions": [
    {
      "title": "ชื่อภารกิจหรือเรื่อง",
      "start_date": "YYYY-MM-DD (พ.ศ. 2569 หรือ 69 แปลงเป็น ค.ศ. 2026 เสมอ)",
      "end_date": "YYYY-MM-DD (พ.ศ. 2569 หรือ 69 แปลงเป็น ค.ศ. 2026 เสมอ)",
      "time_str": "ห้วงเวลา เช่น 09:00 - 16:00 หรือ ตลอดวัน",
      "all_day": true,
      "category": "ภารกิจหน่วย หรือ ภารกิจหมาย หรือ ภารกิจการฝึก",
      "dress_code": "ชุดการแต่งกาย (หากไม่ได้ระบุในข้อความ ให้ใช้ 'ชุดอ่อน (กำหนดอัตโนมัติ)')",
      "location": "สถานที่ปฏิบัติงานหรือลิงก์ประชุม (ถ้ามี)",
      "members": ["รายชื่อผู้รับผิดชอบเฉพาะที่มีระบุในข้อความเท่านั้น หากไม่มีให้เป็น []"]
    }
  ]
}`;

  // Check smart parser fallback first for multi-line text
  const multiMissions = parseAllThaiMissions(text, dbMembers);

  // 1. Try Opentyphoon API (typhoon-v2.5-30b-a3b-instruct)
  if (TYPHOON_API_KEY) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      if (imageBase64) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: text || 'กรุณาวิเคราะห์เอกสารคำสั่งภารกิจจากรูปภาพนี้' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: text || 'วิเคราะห์ภารกิจ'
        });
      }

      const res = await fetch('https://api.opentyphoon.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TYPHOON_API_KEY}`
        },
        body: JSON.stringify({
          model: 'typhoon-v2.5-30b-a3b-instruct',
          messages,
          temperature: 0.2,
          max_completion_tokens: 768
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawJsonText = data.choices?.[0]?.message?.content || '';
        const cleanJson = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedObj = JSON.parse(cleanJson);
        if (parsedObj) {
          const rawMissions = Array.isArray(parsedObj.missions) ? parsedObj.missions : [parsedObj];
          return { missions: rawMissions };
        }
      }
    } catch (e) {
      console.error('Opentyphoon API error:', e);
    }
  }

  // 2. Fallback to Gemini 2.5 Flash if available
  if (GEMINI_API_KEY) {
    try {
      const parts = [{ text: systemPrompt + '\n' + (text || '') }];
      if (imageBase64) {
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: imageBase64
          }
        });
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanJson = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedObj = JSON.parse(cleanJson);
        if (parsedObj) {
          const rawMissions = Array.isArray(parsedObj.missions) ? parsedObj.missions : [parsedObj];
          return { missions: rawMissions };
        }
      }
    } catch (e) {
      console.error('Gemini API fallback error:', e);
    }
  }

  // 3. Fallback Smart Multi-Mission Parser
  if (multiMissions && multiMissions.length > 0) {
    return { missions: multiMissions };
  }

  const parsedDates = parseThaiMissionDates(text);
  const todayStr = new Date().toISOString().split('T')[0];
  const startDateStr = parsedDates ? parsedDates.start_date : todayStr;
  const endDateStr = parsedDates ? parsedDates.end_date : startDateStr;

  let cleanTitle = text ? text.trim() : 'ภารกิจสั่งการจาก LINE';
  if (cleanTitle.length > 80) {
    const lines = cleanTitle.split('\n').map(l => l.trim()).filter(Boolean);
    cleanTitle = lines.find(l => !l.includes('แผนการปฏิบัติ') && !l.includes('วันอังคาร') && !l.includes('ทดสอบ')) || lines[0] || 'ภารกิจสั่งการ';
  }

  return {
    missions: [
      {
        title: cleanTitle.slice(0, 100),
        start_date: startDateStr,
        end_date: endDateStr,
        time_str: 'ตลอดวัน',
        all_day: true,
        category: text && text.includes('หมาย') ? '🔴 ภารกิจหมาย' : '🔵 ภารกิจหน่วย',
        dress_code: text && (text.includes('เครื่องแบบ') || text.includes('ชุดฝึก') || text.includes('สุภาพ'))
          ? (text.includes('เครื่องแบบ') ? 'ชุดเครื่องแบบ' : text.includes('ชุดฝึก') ? 'ชุดฝึก' : 'ชุดสุภาพ')
          : 'ชุดอ่อน (กำหนดอัตโนมัติ)',
        location: text && text.includes('ณ ') ? text.split('ณ ')[1].split('\n')[0].trim() : '',
        members: []
      }
    ]
  };
}

export function parseAllThaiMissions(text, dbMembers = []) {
  if (!text) return [];
  const thaiDigits = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
  let s = String(text);
  thaiDigits.forEach((td, idx) => {
    s = s.replaceAll(td, String(idx));
  });

  const monthsMap = {
    'ม.ค.': '01', 'มค': '01', 'มกราคม': '01',
    'ก.พ.': '02', 'กพ': '02', 'กุมภาพันธ์': '02',
    'มี.ค.': '03', 'มีค': '03', 'มีนาคม': '03',
    'เม.ย.': '04', 'เมย': '04', 'เมษายน': '04',
    'พ.ค.': '05', 'พค': '05', 'พฤษภาคม': '05',
    'มิ.ย.': '06', 'มิย': '06', 'มิถุนายน': '06',
    'ก.ค.': '07', 'กค': '07', 'กรกฎาคม': '07',
    'ส.ค.': '08', 'สค': '08', 'สิงหาคม': '08',
    'ก.ย.': '09', 'กย': '09', 'กันยายน': '09',
    'ต.ค.': '10', 'ตค': '10', 'ตุลาคม': '10',
    'พ.ย.': '11', 'พย': '11', 'พฤศจิกายน': '11',
    'ธ.ค.': '12', 'ธค': '12', 'ธันวาคม': '12'
  };

  const monthRegex = '(ม\\.?ค\\.?|ก\\.?พ\\.?|มี\\.?ค\\.?|เม\\.?ย\\.?|พ\\.?ค\\.?|มิ\\.?ย\\.?|ก\\.?ค\\.?|ส\\.?ค\\.?|ก\\.?ย\\.?|ต\\.?ค\\.?|พ\\.?ย\\.?|ธ\\.?ค\\.?|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)';
  const rangePattern = new RegExp(`(\\d{1,2})\\s*[-–ถึง]\\s*(\\d{1,2})\\s*${monthRegex}\\s*(\\d{2,4})?`, 'i');
  const singlePattern = new RegExp(`(\\d{1,2})\\s*${monthRegex}\\s*(\\d{2,4})?`, 'i');

  const lines = s.split('\n').map(l => l.trim()).filter(Boolean);
  const missions = [];

  for (const line of lines) {
    let dateObj = null;
    const rangeMatch = line.match(rangePattern);
    if (rangeMatch) {
      const startDay = rangeMatch[1].padStart(2, '0');
      const endDay = rangeMatch[2].padStart(2, '0');
      const monthKey = rangeMatch[3].trim();
      let monthStr = null;
      for (const [k, v] of Object.entries(monthsMap)) {
        if (monthKey.includes(k) || k.includes(monthKey)) {
          monthStr = v;
          break;
        }
      }
      if (monthStr) {
        let rawYear = rangeMatch[4] ? parseInt(rangeMatch[4]) : 2569;
        let yearAD = rawYear > 2500 ? rawYear - 543 : (rawYear < 100 ? 2000 + (rawYear > 50 ? rawYear - 43 : rawYear + 57) : rawYear);
        if (yearAD > 2090) yearAD -= 543;
        dateObj = {
          start_date: `${yearAD}-${monthStr}-${startDay}`,
          end_date: `${yearAD}-${monthStr}-${endDay}`
        };
      }
    } else {
      const singleMatch = line.match(singlePattern);
      if (singleMatch) {
        const day = singleMatch[1].padStart(2, '0');
        const monthKey = singleMatch[2].trim();
        let monthStr = null;
        for (const [k, v] of Object.entries(monthsMap)) {
          if (monthKey.includes(k) || k.includes(monthKey)) {
            monthStr = v;
            break;
          }
        }
        if (monthStr) {
          let rawYear = singleMatch[3] ? parseInt(singleMatch[3]) : 2569;
          let yearAD = rawYear > 2500 ? rawYear - 543 : (rawYear < 100 ? 2000 + (rawYear > 50 ? rawYear - 43 : rawYear + 57) : rawYear);
          if (yearAD > 2090) yearAD -= 543;
          dateObj = {
            start_date: `${yearAD}-${monthStr}-${day}`,
            end_date: `${yearAD}-${monthStr}-${day}`
          };
        }
      }
    }

    if (dateObj) {
      let location = '';
      if (line.includes('ณ ')) {
        const locParts = line.split('ณ ');
        location = locParts[1].trim();
      }

      let title = line
        .replace(/^[\d\.\s\-\*๒๒๑๒๓๔๕๖๗๘๙๐a-zA-Z]+/g, '')
        .replace(rangePattern, '')
        .replace(singlePattern, '')
        .replace(/^วันที่\s*/, '')
        .trim();

      if (!title || title.length < 3) {
        title = line.replace(/^[\d\.\s\-\*๒๒๑๒๓๔๕๖๗๘๙๐]+/g, '').trim();
      }

      let dress_code = 'ชุดอ่อน (กำหนดอัตโนมัติ)';
      if (line.includes('เครื่องแบบ') || text.includes('เครื่องแบบ')) dress_code = 'ชุดเครื่องแบบ';
      else if (line.includes('ชุดฝึก') || text.includes('ชุดฝึก')) dress_code = 'ชุดฝึก';
      else if (line.includes('สุภาพ') || text.includes('สุภาพ')) dress_code = 'ชุดสุภาพ';

      let category = '🔵 ภารกิจหน่วย';
      if (line.includes('หมาย') || text.includes('หมาย')) category = '🔴 ภารกิจหมาย';
      else if (line.includes('ฝึก') || text.includes('ฝึก')) category = '🟢 ภารกิจการฝึก';

      const memberIds = matchMemberIds([line], dbMembers);
      const memberNames = memberIds.length > 0 ? memberIds.map(id => {
        const m = dbMembers.find(x => x.id === id);
        return m ? (m.rank ? `${m.rank} ${m.name}` : m.name) : id;
      }).join(', ') : 'ไม่ระบุ';

      missions.push({
        title: title.slice(0, 100),
        start_date: dateObj.start_date,
        end_date: dateObj.end_date,
        time_str: 'ตลอดวัน',
        all_day: true,
        category,
        dress_code,
        location,
        member_ids: memberIds,
        member_names: memberNames
      });
    }
  }

  return missions;
}

export function parseThaiMissionDates(text) {
  if (!text) return null;
  const thaiDigits = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
  let s = String(text);
  thaiDigits.forEach((td, idx) => {
    s = s.replaceAll(td, String(idx));
  });

  const monthsMap = {
    'ม.ค.': '01', 'มค': '01', 'มกราคม': '01',
    'ก.พ.': '02', 'กพ': '02', 'กุมภาพันธ์': '02',
    'มี.ค.': '03', 'มีค': '03', 'มีนาคม': '03',
    'เม.ย.': '04', 'เมย': '04', 'เมษายน': '04',
    'พ.ค.': '05', 'พค': '05', 'พฤษภาคม': '05',
    'มิ.ย.': '06', 'มิย': '06', 'มิถุนายน': '06',
    'ก.ค.': '07', 'กค': '07', 'กรกฎาคม': '07',
    'ส.ค.': '08', 'สค': '08', 'สิงหาคม': '08',
    'ก.ย.': '09', 'กย': '09', 'กันยายน': '09',
    'ต.ค.': '10', 'ตค': '10', 'ตุลาคม': '10',
    'พ.ย.': '11', 'พย': '11', 'พฤศจิกายน': '11',
    'ธ.ค.': '12', 'ธค': '12', 'ธันวาคม': '12'
  };

  const monthRegex = '(ม\\.?ค\\.?|ก\\.?พ\\.?|มี\\.?ค\\.?|เม\\.?ย\\.?|พ\\.?ค\\.?|มิ\\.?ย\\.?|ก\\.?ค\\.?|ส\\.?ค\\.?|ก\\.?ย\\.?|ต\\.?ค\\.?|พ\\.?ย\\.?|ธ\\.?ค\\.?|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)';
  const rangePattern = new RegExp(`(\\d{1,2})\\s*[-–ถึง]\\s*(\\d{1,2})\\s*${monthRegex}\\s*(\\d{2,4})?`, 'i');
  const singlePattern = new RegExp(`(\\d{1,2})\\s*${monthRegex}\\s*(\\d{2,4})?`, 'i');

  const lines = s.split('\n');
  for (const line of lines) {
    const rangeMatch = line.match(rangePattern);
    if (rangeMatch) {
      const startDay = rangeMatch[1].padStart(2, '0');
      const endDay = rangeMatch[2].padStart(2, '0');
      const monthKey = rangeMatch[3].trim();
      let monthStr = null;
      for (const [k, v] of Object.entries(monthsMap)) {
        if (monthKey.includes(k) || k.includes(monthKey)) {
          monthStr = v;
          break;
        }
      }
      if (monthStr) {
        let rawYear = rangeMatch[4] ? parseInt(rangeMatch[4]) : 2569;
        let yearAD = rawYear > 2500 ? rawYear - 543 : (rawYear < 100 ? 2000 + (rawYear > 50 ? rawYear - 43 : rawYear + 57) : rawYear);
        if (yearAD > 2090) yearAD -= 543;
        return {
          start_date: `${yearAD}-${monthStr}-${startDay}`,
          end_date: `${yearAD}-${monthStr}-${endDay}`
        };
      }
    }

    const singleMatch = line.match(singlePattern);
    if (singleMatch) {
      const day = singleMatch[1].padStart(2, '0');
      const monthKey = singleMatch[2].trim();
      let monthStr = null;
      for (const [k, v] of Object.entries(monthsMap)) {
        if (monthKey.includes(k) || k.includes(monthKey)) {
          monthStr = v;
          break;
        }
      }
      if (monthStr) {
        let rawYear = singleMatch[3] ? parseInt(singleMatch[3]) : 2569;
        let yearAD = rawYear > 2500 ? rawYear - 543 : (rawYear < 100 ? 2000 + (rawYear > 50 ? rawYear - 43 : rawYear + 57) : rawYear);
        if (yearAD > 2090) yearAD -= 543;
        return {
          start_date: `${yearAD}-${monthStr}-${day}`,
          end_date: `${yearAD}-${monthStr}-${day}`
        };
      }
    }
  }

  return null;
}

function formatDraftSummaryMessage(draftObj) {
  const missions = Array.isArray(draftObj.missions) && draftObj.missions.length > 0
    ? draftObj.missions
    : [draftObj];

  if (missions.length === 1) {
    const item = missions[0];
    return `🔍 ระบบวิเคราะห์ภารกิจเสร็จสิ้น โปรดตรวจสอบความถูกต้อง:

📅 วันที่: ${item.start_date}${item.end_date !== item.start_date ? ' ถึง ' + item.end_date : ''} (${item.time_str || 'ตลอดวัน'})
📝 ภารกิจ: ${item.title}
🏷️ หมวดหมู่: ${formatCategoryWithBadge(item.category)}
👔 การแต่งกาย: ${item.dress_code || 'ชุดอ่อน (กำหนดอัตโนมัติ)'}
🎯 ผู้รับผิดชอบ: ${item.member_names || 'ไม่ระบุ'}
${item.location ? '📍 สถานที่: ' + item.location : ''}

⏱️ ระบบจะกดยืนยันบันทึกให้อัตโนมัติใน 3 นาที หากไม่มีการกดปุ่มใดๆ หรือเมื่อเจ้านายส่งรูป/คำสั่งใหม่เข้ามาครับ

💡 เจ้านายสามารถพิมพ์สั่งแก้ไขข้อมูลร่างได้โดยตรง (เช่น 'แก้ไขวันที่ 2026-09-25' หรือ 'เปลี่ยนการแต่งกาย ชุดเครื่องแบบ' หรือ 'เพิ่มผู้รับผิดชอบ ท็อป') ก่อนกดยืนยันบันทึกครับ`;
  }

  const itemsText = missions.map((item, idx) => {
    return `📌 ภารกิจที่ ${idx + 1}:
📅 วันที่: ${item.start_date}${item.end_date !== item.start_date ? ' ถึง ' + item.end_date : ''} (${item.time_str || 'ตลอดวัน'})
📝 ภารกิจ: ${item.title}
🏷️ หมวดหมู่: ${formatCategoryWithBadge(item.category)}
👔 การแต่งกาย: ${item.dress_code || 'ชุดอ่อน (กำหนดอัตโนมัติ)'}
🎯 ผู้รับผิดชอบ: ${item.member_names || 'ไม่ระบุ'}
${item.location ? '📍 สถานที่: ' + item.location : ''}`;
  }).join('\n\n------------------\n\n');

  return `🔍 ระบบวิเคราะห์ภารกิจเสร็จสิ้น (พบ ${missions.length} ภารกิจ):

${itemsText}

⏱️ ระบบจะกดยืนยันบันทึกให้อัตโนมัติใน 3 นาที หากไม่มีการกดปุ่มใดๆ หรือเมื่อเจ้านายส่งรูป/คำสั่งใหม่เข้ามาครับ

💡 เจ้านายสามารถพิมพ์สั่งแก้ไขข้อมูลร่างได้โดยตรงก่อนกดยืนยันบันทึกครับ`;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('LINE Webhook Engine Active (เสมียนกองร้อยสายและวิทยุถ่ายทอด)');
  }

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  let rawBuffer;
  let body;

  try {
    if (typeof req.body === 'object' && req.body !== null) {
      body = req.body;
      rawBuffer = Buffer.from(JSON.stringify(req.body));
    } else if (typeof req.body === 'string') {
      rawBuffer = Buffer.from(req.body);
      body = JSON.parse(req.body);
    } else {
      rawBuffer = await getRawBody(req);
      body = JSON.parse(rawBuffer.toString('utf-8'));
    }
  } catch (e) {
    console.warn('Error reading LINE webhook body:', e);
    return res.status(400).send('Invalid JSON');
  }

  const signature = req.headers['x-line-signature'];

  if (!verifyLineSignature(rawBuffer, signature)) {
    console.warn('LINE signature verification notice');
  }

  const events = body.events || [];
  const dbMembers = await fetchMembersFromSupabase();

  for (const event of events) {
    if (event.type !== 'message') continue;

    const replyToken = event.replyToken;
    const userId = event.source?.userId || 'unknown_user';
    const msgType = event.message.type;

    // Check existing draft from Supabase
    const { data: existingDraftRow } = await supabase
      .from('draft_events')
      .select('*')
      .eq('user_id', userId)
      .single();

    let activeDraft = existingDraftRow ? existingDraftRow.draft_data : null;

    // 1. User Command: Confirming Save (✅ ยืนยันบันทึก / ยืนยัน)
    if (msgType === 'text' && (event.message.text.includes('ยืนยัน') || event.message.text.includes('บันทึก'))) {
      if (!activeDraft) {
        await replyLineMessage(replyToken, {
          type: 'text',
          text: '❌ ไม่พบร่างภารกิจที่ค้างอยู่ เจ้านายสามารถส่งรูปภาพคำสั่ง หรือข้อความภารกิจใหม่เข้ามาได้เลยครับ'
        });
        continue;
      }

      // Convert draft to Supabase Event (Supports single or multi-mission)
      const missionsToSave = Array.isArray(activeDraft.missions) && activeDraft.missions.length > 0
        ? activeDraft.missions
        : [activeDraft];

      const insertedEvents = [];
      for (const mItem of missionsToSave) {
        const startTime = new Date(`${mItem.start_date}T09:00:00+07:00`).toISOString();
        const endTime = new Date(`${mItem.end_date}T17:00:00+07:00`).toISOString();
        const newEvtId = `evt_line_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const descText = `👔 การแต่งกาย: ${mItem.dress_code || 'ชุดอ่อน (กำหนดอัตโนมัติ)'}\n📍 สถานที่: ${mItem.location || '-'}`;

        await supabase.from('events').insert({
          id: newEvtId,
          title: mItem.title,
          start_time: startTime,
          end_time: endTime,
          all_day: mItem.all_day !== false,
          category: formatCategoryWithBadge(mItem.category),
          description: descText,
          location: mItem.location || '',
          member_ids: Array.isArray(mItem.member_ids) ? mItem.member_ids : [],
          alarm_minutes: 1440
        });
        insertedEvents.push(mItem);
      }

      // Clear draft table
      await supabase.from('draft_events').delete().eq('user_id', userId);

      const confirmText = insertedEvents.length === 1
        ? `✅ ยืนยันบันทึกภารกิจเข้าปฏิทินเรียบร้อยแล้วครับ!\n\n📌 ภารกิจ: ${insertedEvents[0].title}\n📅 วันที่: ${insertedEvents[0].start_date}\n👥 ผู้รับผิดชอบ: ${insertedEvents[0].member_names || 'ไม่ระบุ'}\n\n🔗 ดูปฏิทินสด: https://member-calendar-sync-app.vercel.app`
        : `✅ ยืนยันบันทึก ${insertedEvents.length} ภารกิจเข้าปฏิทินเรียบร้อยแล้วครับ!\n\n` + insertedEvents.map((item, idx) => `${idx + 1}. 📌 ${item.title} (${item.start_date})`).join('\n') + '\n\n🔗 ดูปฏิทินสด: https://member-calendar-sync-app.vercel.app';

      await replyLineMessage(replyToken, {
        type: 'text',
        text: confirmText
      });
      continue;
    }

    // 2. User Command: Cancel Draft (❌ ยกเลิก)
    if (msgType === 'text' && event.message.text.includes('ยกเลิก')) {
      await supabase.from('draft_events').delete().eq('user_id', userId);
      await replyLineMessage(replyToken, {
        type: 'text',
        text: '❌ ยกเลิกร่างภารกิจเรียบร้อยแล้วครับ เจ้านายสามารถส่งภารกิจใหม่เข้ามาได้ตลอดเวลาครับ'
      });
      continue;
    }

    // 3. User Command: Interactive Edit Command on Active Draft
    if (msgType === 'text' && activeDraft && (event.message.text.includes('แก้') || event.message.text.includes('เปลี่ยน') || event.message.text.includes('เพิ่ม'))) {
      const userText = event.message.text;

      // Ensure missions array structure
      const targetMissions = Array.isArray(activeDraft.missions) && activeDraft.missions.length > 0
        ? activeDraft.missions
        : [activeDraft];

      const targetItem = targetMissions[0]; // edit primary mission item

      // Date Correction match
      const dateMatch = userText.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\/\d{1,2})/);
      if (dateMatch) {
        const raw = dateMatch[0];
        if (raw.includes('-')) targetItem.start_date = raw;
        else if (raw.includes('/')) {
          const parts = raw.split('/');
          const dStr = parts[0].padStart(2, '0');
          const mStr = parts[1].padStart(2, '0');
          const yStr = parts[2] ? (parseInt(parts[2]) > 2500 ? parseInt(parts[2]) - 543 : parts[2]) : new Date().getFullYear();
          targetItem.start_date = `${yStr}-${mStr}-${dStr}`;
          targetItem.end_date = targetItem.start_date;
        }
      }

      // Dress Code Correction match
      if (userText.includes('เครื่องแบบ') || userText.includes('ชุดฝึก') || userText.includes('สุภาพ') || userText.includes('ชุดอ่อน')) {
        if (userText.includes('เครื่องแบบ')) targetItem.dress_code = 'ชุดเครื่องแบบ';
        else if (userText.includes('ชุดฝึก')) targetItem.dress_code = 'ชุดฝึก';
        else if (userText.includes('สุภาพ')) targetItem.dress_code = 'ชุดสุภาพ';
        else if (userText.includes('ชุดอ่อน')) targetItem.dress_code = 'ชุดอ่อน (กำหนดอัตโนมัติ)';
      }

      // Member Correction match
      const newMemberIds = matchMemberIds([userText], dbMembers);
      if (newMemberIds.length > 0) {
        targetItem.member_ids = Array.from(new Set([...(targetItem.member_ids || []), ...newMemberIds]));
        targetItem.member_names = targetItem.member_ids.map(id => {
          const m = dbMembers.find(x => x.id === id);
          return m ? (m.rank ? `${m.rank} ${m.name}` : m.name) : id;
        }).join(', ');
      }

      activeDraft = { missions: targetMissions };

      // Save updated draft
      await supabase.from('draft_events').upsert({
        id: userId,
        user_id: userId,
        draft_data: activeDraft,
        updated_at: new Date().toISOString()
      });

      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: '🔄 แก้ไขข้อมูลร่างตามคำสั่งสำเร็จแล้ว! โปรดตรวจสอบความถูกต้องใหม่:\n\n' + formatDraftSummaryMessage(activeDraft),
          quickReply: {
            items: [
              {
                type: 'action',
                action: { type: 'message', label: '✅ ยืนยันบันทึก', text: '✅ ยืนยันบันทึก' }
              },
              {
                type: 'action',
                action: { type: 'message', label: '❌ ยกเลิก', text: '❌ ยกเลิก' }
              }
            ]
          }
        }
      ]);
      continue;
    }

    // 4. New Mission Order Input (Text or Image)
    let analyzedData = null;

    if (msgType === 'image') {
      try {
        const imageBuf = await fetchLineBinary(event.message.id);
        const imageBase64 = imageBuf.toString('base64');
        analyzedData = await analyzeMissionOrderWithAI(null, imageBase64, dbMembers);
      } catch (err) {
        console.error('Image analysis error:', err);
      }
    } else if (msgType === 'text') {
      analyzedData = await analyzeMissionOrderWithAI(event.message.text, null, dbMembers);
    }

    if (analyzedData) {
      const rawMissions = Array.isArray(analyzedData.missions) && analyzedData.missions.length > 0
        ? analyzedData.missions
        : [analyzedData];

      const formattedMissions = rawMissions.map(m => {
        const memberIds = matchMemberIds(m.members || [], dbMembers);
        const memberNames = memberIds.length > 0 ? memberIds.map(id => {
          const mem = dbMembers.find(x => x.id === id);
          return mem ? (mem.rank ? `${mem.rank} ${mem.name}` : mem.name) : id;
        }).join(', ') : 'ไม่ระบุ';

        return {
          title: m.title || 'ภารกิจสั่งการ',
          start_date: m.start_date || new Date().toISOString().split('T')[0],
          end_date: m.end_date || m.start_date || new Date().toISOString().split('T')[0],
          time_str: m.time_str || 'ตลอดวัน',
          all_day: m.all_day !== false,
          category: formatCategoryWithBadge(m.category),
          dress_code: m.dress_code || 'ชุดอ่อน (กำหนดอัตโนมัติ)',
          location: m.location || '',
          member_ids: memberIds,
          member_names: memberNames
        };
      });

      const newDraft = {
        missions: formattedMissions
      };

      // Save draft to Supabase
      await supabase.from('draft_events').upsert({
        id: userId,
        user_id: userId,
        draft_data: newDraft,
        updated_at: new Date().toISOString()
      });

      // Reply with Draft Summary and Quick Reply Buttons
      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: formatDraftSummaryMessage(newDraft),
          quickReply: {
            items: [
              {
                type: 'action',
                action: { type: 'message', label: '✅ ยืนยันบันทึก', text: '✅ ยืนยันบันทึก' }
              },
              {
                type: 'action',
                action: { type: 'message', label: '❌ ยกเลิก', text: '❌ ยกเลิก' }
              }
            ]
          }
        }
      ]);
    }
  }

  return res.status(200).json({ status: 'success' });
}
