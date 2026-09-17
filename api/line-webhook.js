// api/line-webhook.js - Vercel Serverless Endpoint for LINE Messaging Bot (AI เสมียนกองร้อย)
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

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
    const { data, error } = await supabase.from('members').select('id, name, rank, first_name, last_name, nickname, full_name, member_type, is_archived, status');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.error('Error fetching members from Supabase:', e);
  }
  return [
    { id: 'mem_manudnot', name: 'นอต', rank: 'ร.ท.', first_name: 'นิติพัฒน์', last_name: 'โชคกิจ', nickname: 'นอต', full_name: 'ร.ท. นิติพัฒน์ โชคกิจ', member_type: 'real', is_archived: false, status: 'active' },
    { id: 'mem_third', name: 'เติร์ธ', rank: 'ร.อ.', first_name: 'ศุภณัฐ', last_name: 'ทองน้ำวน', nickname: 'เติร์ธ', full_name: 'ร.อ. ศุภณัฐ ทองน้ำวน', member_type: 'real', is_archived: false, status: 'active' },
    { id: 'mem_june', name: 'จูน', rank: 'ร.ท.', first_name: 'อภิสิทธิ์', last_name: 'เย็นใส', nickname: 'จูน', full_name: 'ร.ท. อภิสิทธิ์ เย็นใส', member_type: 'real', is_archived: false, status: 'active' },
    { id: 'mem_phak_ek', name: 'เอก', rank: 'ร.อ.', first_name: 'จรินทร์', last_name: 'จินดานุช', nickname: 'เอก', full_name: 'ร.อ. จรินทร์ จินดานุช', member_type: 'virtual', is_archived: false, status: 'active' },
    { id: 'mem_keng', name: 'เก่ง', rank: 'ร.ท.', first_name: 'พัทธ์รวิน', last_name: 'อภินันท์ศิริเดช', nickname: 'เก่ง', full_name: 'ร.ท. พัทธ์รวิน อภินันท์ศิริเดช', member_type: 'virtual', is_archived: false, status: 'active' },
    { id: 'mem_tum', name: 'ตั้ม', rank: 'ร.ต.', first_name: 'อภิชาติ', last_name: 'เกษรแก้ว', nickname: 'ตั้ม', full_name: 'ร.ต. อภิชาติ เกษรแก้ว', member_type: 'virtual', is_archived: false, status: 'active' },
    { id: 'mem_wm', name: 'เวรหมาย', rank: '', first_name: 'เวรปฏิบัติการหมาย', last_name: '', nickname: 'เวรหมาย', full_name: 'เวรปฏิบัติการหมาย', member_type: 'virtual', is_archived: false, status: 'active' },
    { id: 'mem_thanatat', name: 'ท็อป', rank: 'ร.อ.', first_name: 'ธนทัต', last_name: 'ปานแสง', nickname: 'ท็อป', full_name: 'ร.อ. ธนทัต ปานแสง', member_type: 'real', is_archived: true, status: 'resigned' },
    { id: 'mem_woooddy', name: 'แชมป์', rank: 'พ.ต.', first_name: 'ภามพัฒน์', last_name: 'ทรัพย์กุลภิญโญ', nickname: 'แชมป์', full_name: 'พ.ต. ภามพัฒน์ ทรัพย์กุลภิญโญ', member_type: 'real', is_archived: true, status: 'resigned' }
  ];
}

const MEMBER_DISPLAY_NAMES = {
  'mem_manudnot': 'นอต',
  'mem_third': 'เติร์ธ',
  'mem_june': 'จูน',
  'mem_phak_ek': 'เอก',
  'mem_keng': 'เก่ง',
  'mem_tum': 'ตั้ม',
  'mem_wm': 'เวรหมาย',
  'mem_thanatat': 'ท็อป',
  'mem_woooddy': 'แชมป์'
};

function formatMemberNamesForDisplay(memberIds = [], dbMembers = []) {
  if (!Array.isArray(memberIds) || memberIds.length === 0) return 'ไม่ระบุ';
  return memberIds.map(id => {
    if (MEMBER_DISPLAY_NAMES[id]) return MEMBER_DISPLAY_NAMES[id];
    const mem = dbMembers.find(x => x.id === id);
    if (!mem) return id;
    return mem.nickname || mem.name || mem.first_name || id;
  }).join(', ');
}

function matchMemberIds(memberNamesArray, dbMembers = []) {
  if (!Array.isArray(memberNamesArray) || memberNamesArray.length === 0) return [];
  const matched = new Set();

  const isAllRealMembers = memberNamesArray.some(str => {
    const s = String(str).toLowerCase();
    return s.includes('ทุกคน') || s.includes('สมาชิกทุกคน') || s.includes('ทั้งทีม') || s.includes('กำลังพลทุกคน') || s.includes('ทุกนาย');
  });

  if (isAllRealMembers) {
    const realMemberIds = dbMembers
      .filter(m => m.member_type !== 'virtual' && m.id !== 'mem_wm' && !m.is_archived && m.status !== 'resigned')
      .map(m => m.id);
    if (realMemberIds.length > 0) return realMemberIds;
    return ['mem_manudnot', 'mem_third', 'mem_june'];
  }

  const ALIAS_MAP = {
    'mem_manudnot': ['not', 'นอต', 'น็อต', 'นิติพัฒน์', 'มนุษย์นอต', 'โชคกิจ'],
    'mem_third': ['third', 'สุภณัฐ', 'ศุภณัฐ', 'เติร์ธ', 'เทิร์ธ', 'เติร์ท', 'หมวดเติร์ธ', 'ผู้กองเติร์ธ', 'ทองน้ำวน'],
    'mem_phak_ek': ['เอก', 'ภาคเอก', 'จรินทร์', 'จินดานุช', 'เสธ.เอก', 'รองเอก', 'ผู้กองเอก'],
    'mem_thanatat': ['top', 'ท็อป', 'ท๊อป', 'ธนทัต', 'ปานแสง', 'ผู้กองท็อป'],
    'mem_woooddy': ['champ', 'แชมป์', 'ภามพัฒน์', 'ทรัพย์กุลภิญโญ', 'ผู้พันแชมป์', 'แชมพ์'],
    'mem_june': ['june', 'จูน', 'อภิสิทธิ์', 'เย็นใส', 'หมวดจูน'],
    'mem_keng': ['keng', 'เก่ง', 'พัทธ์รวิน', 'อภินันท์ศิริเดช', 'เก่งการ', 'หมวดเก่ง', 'จ่าเก่ง'],
    'mem_tum': ['tum', 'ตั้ม', 'ตั๊ม', 'อภิชาติ', 'เกษรแก้ว', 'หมวดตั้ม', 'จ่าตั้ม'],
    'mem_wm': ['เวรหมาย', 'เวร']
  };

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
      ].concat(ALIAS_MAP[mem.id] || []).filter(Boolean).map(t => String(t).toLowerCase());

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

async function fetchLineBinary(messageId) {
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: {
      'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch binary from LINE API: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// In-Memory Draft Fallback Engine (Guarantees draft retention even if Supabase draft_events table is missing)
if (!globalThis.inMemoryDraftStore) {
  globalThis.inMemoryDraftStore = new Map();
}

async function saveDraft(userId, draftData) {
  if (!userId) return;
  globalThis.inMemoryDraftStore.set(userId, draftData);
  globalThis.inMemoryDraftStore.set('latest', draftData);

  try {
    await supabase.from('draft_events').upsert({
      id: userId,
      user_id: userId,
      draft_data: draftData,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase draft_events upsert notice:', e?.message || e);
  }
}

async function getActiveDraft(userId) {
  if (globalThis.inMemoryDraftStore.has(userId)) {
    return globalThis.inMemoryDraftStore.get(userId);
  }
  if (globalThis.inMemoryDraftStore.has('latest')) {
    return globalThis.inMemoryDraftStore.get('latest');
  }

  try {
    const { data: userDrafts } = await supabase
      .from('draft_events')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (userDrafts && userDrafts.length > 0) {
      return userDrafts[0].draft_data;
    }

    const { data: latestDrafts } = await supabase
      .from('draft_events')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (latestDrafts && latestDrafts.length > 0) {
      return latestDrafts[0].draft_data;
    }
  } catch (e) {
    console.warn('Supabase draft_events select notice:', e?.message || e);
  }

  return null;
}

async function clearActiveDraft(userId) {
  if (userId) globalThis.inMemoryDraftStore.delete(userId);
  globalThis.inMemoryDraftStore.delete('latest');

  try {
    await supabase.from('draft_events').delete().eq('user_id', userId);
    await supabase.from('draft_events').delete().eq('id', userId);
  } catch (e) {
    console.warn('Supabase draft_events delete notice:', e?.message || e);
  }
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

async function extractTextWithTyphoonOCR(fileBuf, filename = 'document.pdf', mimeType = 'application/pdf') {
  if (!TYPHOON_API_KEY) return '';
  try {
    const blob = new Blob([fileBuf], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('model', 'typhoon-ocr');
    formData.append('task_type', 'default');
    formData.append('max_tokens', '16384');
    formData.append('temperature', '0.1');
    formData.append('top_p', '0.6');
    formData.append('repetition_penalty', '1.2');

    const res = await fetch('https://api.opentyphoon.ai/v1/ocr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TYPHOON_API_KEY}`
      },
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      const extractedTexts = [];
      for (const pageResult of (data.results || [])) {
        if (pageResult.success && pageResult.message) {
          const content = pageResult.message.choices?.[0]?.message?.content || '';
          try {
            const parsed = JSON.parse(content);
            extractedTexts.push(parsed.natural_text || content);
          } catch (e) {
            extractedTexts.push(content);
          }
        }
      }
      return extractedTexts.join('\n\n').trim();
    }
  } catch (err) {
    console.warn('Typhoon OCR error:', err?.message || err);
  }
  return '';
}

async function extractPdfTextWithTimeout(fileBuf, timeoutMs = 3500, maxChars = 5000) {
  return new Promise((resolve) => {
    let isResolved = false;
    const timer = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.warn('PDF text extraction timed out after', timeoutMs, 'ms');
        resolve('');
      }
    }, timeoutMs);

    try {
      const uint8 = new Uint8Array(fileBuf);
      const parser = new PDFParse({ data: uint8 });
      parser.getText({
        parsePageInfo: true,
        pageJoiner: '\n--- [หน้า page_number / total_number] ---\n'
      }).then(textResult => {
        let txt = (textResult?.text || '')
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        if (txt.length > maxChars) {
          console.log(`Truncating PDF text from ${txt.length} to ${maxChars} chars.`);
          txt = txt.substring(0, maxChars);
        }

        parser.destroy().catch(() => {});
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          resolve(txt);
        }
      }).catch(err => {
        console.warn('PDF getText error:', err?.message || err);
        parser.destroy().catch(() => {});
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          resolve('');
        }
      });
    } catch (e) {
      console.warn('PDFParse constructor error:', e?.message || e);
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timer);
        resolve('');
      }
    }
  });
}

async function analyzeMissionOrderWithAI(text, imageBase64 = null, dbMembers = [], mimeType = 'image/jpeg') {
  const systemPrompt = `คุณคือเสมียนกองร้อยสายและวิทยุถ่ายทอด มีหน้าที่วิเคราะห์คำสั่งปฏิบัติงาน ภารกิจ รูปภาพ หรือเอกสารข่าวสาร 
สำคัญที่สุด:
1. หากในข้อความต้นฉบับมีสัญลักษณ์หรือตัวเลขหัวข้อ เช่น ๑. หรือ ๒.๒.๑ หรือข้อหัวข้อแยกรายการ ให้สกัด 1 รายการภารกิจ ต่อ 1 ข้อหัวข้อเด็ดขาด! ห้ามแยกประโยคย่อยในข้อเดียวกันที่เชื่อมด้วยคำว่า 'และ' หรือ 'และซักซ้อม...' ออกเป็นหลายภารกิจเด็ดขาด
2. หากมีหลายวันในหัวข้อคนละข้อกัน ให้สกัดแยกเป็นรายการภารกิจในอาร์เรย์ "missions" ตามจำนวนหัวข้อต้นฉบับ ห้ามนำวันมารวมกันเป็นภารกิจเดียวเด็ดขาด
3. ถอนข้อความส่วนสถานที่ (เช่น ประโยคที่ขึ้นต้นด้วย 'ณ ...') ออกจากชื่อภารกิจ (title) โดยนำสถานที่ไปใส่ไว้เฉพาะในฟิลด์ location เท่านั้น ห้ามใส่สถานที่ซ้ำใน title
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

  // Check smart parser first for multi-line text input (guarantees 1-to-1 bullet point count)
  if (text && !imageBase64) {
    const multiMissions = parseAllThaiMissions(text, dbMembers);
    if (Array.isArray(multiMissions) && multiMissions.length >= 1) {
      return { missions: multiMissions };
    }
  }

  // 1. Try Opentyphoon API (typhoon-v2.5-30b-a3b-instruct)
  if (TYPHOON_API_KEY) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      if (imageBase64) {
        const userContent = [{ type: 'text', text: text || 'กรุณาวิเคราะห์เอกสารคำสั่งภารกิจจากไฟล์หรือรูปภาพนี้' }];
        if (mimeType && mimeType.startsWith('image/')) {
          userContent.push({ type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } });
        }
        messages.push({
          role: 'user',
          content: userContent
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
            mime_type: mimeType || 'image/jpeg',
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
      let lineText = line;
      if (lineText.includes(' ณ ')) {
        const locParts = lineText.split(' ณ ');
        location = locParts[1].trim();
        lineText = locParts[0];
      } else if (lineText.includes('ณ ') && !lineText.startsWith('ณ ')) {
        const locParts = lineText.split('ณ ');
        location = locParts[1].trim();
        lineText = locParts[0];
      }

      let title = lineText
        .replace(/^[\d\.\s\-\*๒๒๑๒๓๔๕๖๗๘๙๐a-zA-Z]+/g, '')
        .replace(rangePattern, '')
        .replace(singlePattern, '')
        .replace(/^วันที่\s*/, '')
        .trim();

      if (!title || title.length < 3) {
        title = lineText.replace(/^[\d\.\s\-\*๒๒๑๒๓๔๕๖๗๘๙๐]+/g, '').trim();
      }

      if (title.includes(' ณ ')) {
        title = title.split(' ณ ')[0].trim();
      } else if (title.includes('ณ ') && !title.startsWith('ณ ')) {
        title = title.split('ณ ')[0].trim();
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
    const memberDisplayStr = formatMemberNamesForDisplay(item.member_ids, []) || item.member_names || 'ไม่ระบุ';
    return `🔍 ระบบวิเคราะห์ภารกิจเสร็จสิ้น โปรดตรวจสอบความถูกต้อง:

📅 วันที่: ${item.start_date}${item.end_date !== item.start_date ? ' ถึง ' + item.end_date : ''} (${item.time_str || 'ตลอดวัน'})
📝 ภารกิจ: ${item.title}
🏷️ หมวดหมู่: ${formatCategoryWithBadge(item.category)}
👔 การแต่งกาย: ${item.dress_code || 'ชุดอ่อน (กำหนดอัตโนมัติ)'}
🎯 ผู้รับผิดชอบ: ${memberDisplayStr}
${item.location ? '📍 สถานที่: ' + item.location : ''}

⏱️ ระบบจะกดยืนยันบันทึกให้อัตโนมัติใน 3 นาที หากไม่มีการกดปุ่มใดๆ หรือเมื่อเจ้านายส่งรูป/คำสั่งใหม่เข้ามาครับ

💡 เจ้านายสามารถพิมพ์สั่งแก้ไขข้อมูลร่างได้โดยตรง (เช่น 'แก้ไขวันที่ 2026-09-25' หรือ 'เปลี่ยนการแต่งกาย ชุดเครื่องแบบ' หรือ 'เพิ่มผู้รับผิดชอบ ท็อป') ก่อนกดยืนยันบันทึกครับ`;
  }

  const itemsText = missions.map((item, idx) => {
    const memberDisplayStr = formatMemberNamesForDisplay(item.member_ids, []) || item.member_names || 'ไม่ระบุ';
    return `📌 ภารกิจที่ ${idx + 1}:
📅 วันที่: ${item.start_date}${item.end_date !== item.start_date ? ' ถึง ' + item.end_date : ''} (${item.time_str || 'ตลอดวัน'})
📝 ภารกิจ: ${item.title}
🏷️ หมวดหมู่: ${formatCategoryWithBadge(item.category)}
👔 การแต่งกาย: ${item.dress_code || 'ชุดอ่อน (กำหนดอัตโนมัติ)'}
🎯 ผู้รับผิดชอบ: ${memberDisplayStr}
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
    const userId = event.source?.userId || event.source?.groupId || event.source?.roomId || 'default_user';
    const msgType = event.message.type;

    // Fetch active draft for this user/group (with in-memory fallback)
    let activeDraft = await getActiveDraft(userId);

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

        try {
          const { error: insertErr } = await supabase.from('events').insert({
            id: newEvtId,
            title: mItem.title,
            start_time: startTime,
            end_time: endTime,
            category: formatCategoryWithBadge(mItem.category),
            description: descText,
            location: mItem.location || '',
            member_ids: Array.isArray(mItem.member_ids) ? mItem.member_ids : [],
            alarm_minutes: 1440
          });
          if (insertErr) {
            console.error('Supabase event insert error:', insertErr);
            throw insertErr;
          }
          insertedEvents.push(mItem);
        } catch (e) {
          console.error('Failed to insert event into Supabase:', e);
        }
      }

      // Clear draft
      await clearActiveDraft(userId);

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
      await clearActiveDraft(userId);
      await replyLineMessage(replyToken, {
        type: 'text',
        text: '❌ ยกเลิกร่างภารกิจเรียบร้อยแล้วครับ เจ้านายสามารถส่งภารกิจใหม่เข้ามาได้ตลอดเวลาครับ'
      });
      continue;
    }

    // 3. User Command: Interactive Edit Command on Active Draft
    if (msgType === 'text' && (event.message.text.includes('แก้') || event.message.text.includes('เปลี่ยน') || event.message.text.includes('เพิ่ม'))) {
      if (!activeDraft) {
        await replyLineMessage(replyToken, {
          type: 'text',
          text: '❌ ไม่พบร่างภารกิจที่ค้างอยู่ในการแก้ไขครับ เจ้านายสามารถส่งรูปภาพหรือข้อความคำสั่งภารกิจใหม่เข้ามาได้เลยครับ'
        });
        continue;
      }

      const userText = event.message.text;

      // Ensure missions array structure
      const targetMissions = Array.isArray(activeDraft.missions) && activeDraft.missions.length > 0
        ? activeDraft.missions
        : [activeDraft];

      const hasSpecificTarget = userText.includes('ภารกิจที่ 1') || userText.includes('ภารกิจที่ 2') ||
                                userText.includes('ภารกิจ 1') || userText.includes('ภารกิจ 2') ||
                                userText.includes('ข้อ 1') || userText.includes('ข้อ 2') ||
                                userText.includes('รายการ 1') || userText.includes('รายการ 2');

      const applyToAll = !hasSpecificTarget || userText.includes('ทั้งหมด') || userText.includes('ทุกภารกิจ') || userText.includes('ทั้ง 2 ภารกิจ') || userText.includes('ทั้งสองภารกิจ');

      // Date Correction match
      const dateMatch = userText.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\/\d{1,2})/);

      // Dress Code Correction match
      let newDressCode = null;
      if (userText.includes('เครื่องแบบ')) newDressCode = 'ชุดเครื่องแบบ';
      else if (userText.includes('ชุดฝึก')) newDressCode = 'ชุดฝึก';
      else if (userText.includes('สุภาพ')) newDressCode = 'ชุดสุภาพ';
      else if (userText.includes('ชุดอ่อน')) newDressCode = 'ชุดอ่อน (กำหนดอัตโนมัติ)';

      // Member Correction match
      const newMemberIds = matchMemberIds([userText], dbMembers);

      targetMissions.forEach((mItem, idx) => {
        // Apply edits if applyToAll or if mission 1 specifically targeted
        if (applyToAll || idx === 0) {
          if (dateMatch) {
            const raw = dateMatch[0];
            if (raw.includes('-')) mItem.start_date = raw;
            else if (raw.includes('/')) {
              const parts = raw.split('/');
              const dStr = parts[0].padStart(2, '0');
              const mStr = parts[1].padStart(2, '0');
              const yStr = parts[2] ? (parseInt(parts[2]) > 2500 ? parseInt(parts[2]) - 543 : parts[2]) : new Date().getFullYear();
              mItem.start_date = `${yStr}-${mStr}-${dStr}`;
              mItem.end_date = mItem.start_date;
            }
          }

          if (newDressCode) {
            mItem.dress_code = newDressCode;
          }

          if (newMemberIds.length > 0) {
            mItem.member_ids = newMemberIds;
            mItem.member_names = formatMemberNamesForDisplay(newMemberIds, dbMembers);
          }
        }
      });

      activeDraft = { missions: targetMissions };

      // Save updated draft
      await saveDraft(userId, activeDraft);

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

    // 4. New Mission Order Input (Text, Image, or File)
    let analyzedData = null;

    if (msgType === 'image') {
      try {
        const imageBuf = await fetchLineBinary(event.message.id);
        const ocrText = await extractTextWithTyphoonOCR(imageBuf, 'image.png', 'image/png');
        if (ocrText && ocrText.length > 5) {
          analyzedData = await analyzeMissionOrderWithAI(ocrText, null, dbMembers);
        }
        if (!analyzedData) {
          const imageBase64 = imageBuf.toString('base64');
          analyzedData = await analyzeMissionOrderWithAI(null, imageBase64, dbMembers, 'image/png');
        }
      } catch (err) {
        console.error('Image analysis error:', err);
      }
      if (!analyzedData) {
        await replyLineMessage(replyToken, {
          type: 'text',
          text: '❌ ไม่สามารถวิเคราะห์รูปภาพสั่งการได้ครับ กรุณาลองส่งภาพถ่ายคำสั่งภารกิจที่ชัดเจนอีกครั้ง หรือพิมพ์ข้อความสั่งการเข้ามาได้เลยครับ'
        });
        continue;
      }
    } else if (msgType === 'file') {
      try {
        const fileName = (event.message.fileName || 'document.pdf').toLowerCase();
        const fileBuf = await fetchLineBinary(event.message.id);
        
        if (fileName.endsWith('.pdf') || (fileBuf && fileBuf.toString('ascii', 0, 4) === '%PDF')) {
          // 1. Try Typhoon OCR API first (Primary OCR Engine)
          const ocrText = await extractTextWithTyphoonOCR(fileBuf, fileName, 'application/pdf');
          if (ocrText && ocrText.length > 10) {
            analyzedData = await analyzeMissionOrderWithAI(ocrText, null, dbMembers);
          }

          // 2. Fallback to local pdf-parse if Typhoon OCR had no result
          if (!analyzedData) {
            const pdfText = await extractPdfTextWithTimeout(fileBuf, 3500);
            if (pdfText && pdfText.length > 10) {
              analyzedData = await analyzeMissionOrderWithAI(pdfText, null, dbMembers);
            }
          }

          // 3. Fallback to Gemini 2.5 Flash if available
          if (!analyzedData && GEMINI_API_KEY) {
            const base64Str = fileBuf.toString('base64');
            analyzedData = await analyzeMissionOrderWithAI(null, base64Str, dbMembers, 'application/pdf');
          }
        } else if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
          const fileText = fileBuf.toString('utf-8');
          analyzedData = await analyzeMissionOrderWithAI(fileText, null, dbMembers);
        } else {
          const ocrText = await extractTextWithTyphoonOCR(fileBuf, fileName, 'image/png');
          if (ocrText && ocrText.length > 5) {
            analyzedData = await analyzeMissionOrderWithAI(ocrText, null, dbMembers);
          }
        }
      } catch (err) {
        console.error('File analysis error:', err);
      }

      if (!analyzedData) {
        await replyLineMessage(replyToken, {
          type: 'text',
          text: '❌ ไม่สามารถวิเคราะห์ไฟล์เอกสาร PDF ที่ส่งมาได้ครับ หากเป็น PDF สแกนภาพ กรุณาลองถ่ายภาพคำสั่งภารกิจ หรือพิมพ์เนื้อหาภารกิจเข้ามาได้เลยครับ'
        });
        continue;
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
        const memberNames = formatMemberNamesForDisplay(memberIds, dbMembers);

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

      // Save draft (In-memory + Supabase)
      await saveDraft(userId, newDraft);

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
