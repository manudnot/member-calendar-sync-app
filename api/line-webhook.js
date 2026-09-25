// api/line-webhook.js - Vercel Serverless Endpoint for LINE Messaging Bot (AI เสมียนกองร้อย)
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aevutuguijjakfhulgjd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8LNKQLJ6snj6AvxPGf2TmA_Sm8KCbhU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '5yYbM9jVR9aNZS6RvDhS8D0ow/t7VHSpE3kX5PQXqK4h0OpEbaqIxj+Oy1eKAYfFBsMF+twQeDmtj0lwfSa30tJJtYHZqeTX35Z7V/9wOpWD5d3Mq0tAt96uWMXfKRDBCcFstKpuSXG26xG+Uy3SWQdB04t89/1O/w1cDnyilFU=';
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '21ce08aa85816d7feb7c0d62f500e779';
const TYPHOON_API_KEY = process.env.TYPHOON_API_KEY || 'sk-JfnzdevrTSBsAw9GRBda4zhHtTNMkEFM9GEnLjc4Pyu0WPaS';

// Dynamic Supabase member fetch & matching
async function fetchMembersFromSupabase() {
  try {
    const { data, error } = await supabase.from('members').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(m => {
        const isArchived = Boolean(m.is_archived) || m.status === 'resigned' || m.status === 'inactive' || m.status === 'archived';
        return {
          ...m,
          rank: m.rank || '',
          first_name: m.first_name || '',
          last_name: m.last_name || '',
          nickname: m.nickname || m.name || '',
          full_name: m.full_name || m.name || '',
          is_archived: isArchived,
          status: m.status || (isArchived ? 'resigned' : 'active')
        };
      });
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

  const activeDbMembers = dbMembers.filter(m => {
    const isArchived = Boolean(m.is_archived) || m.status === 'resigned' || m.status === 'inactive' || m.status === 'archived';
    return !isArchived && (m.status === 'active' || !m.status);
  });

  const isAllRealMembers = memberNamesArray.some(str => {
    const s = String(str).toLowerCase();
    return s.includes('ทุกคน') || s.includes('สมาชิกทุกคน') || s.includes('ทั้งทีม') || s.includes('กำลังพลทุกคน') || s.includes('ทุกนาย');
  });

  if (isAllRealMembers) {
    const realMemberIds = activeDbMembers
      .filter(m => m.member_type !== 'virtual' && m.id !== 'mem_wm')
      .map(m => m.id);
    if (realMemberIds.length > 0) return realMemberIds;
    return ['mem_manudnot', 'mem_third', 'mem_june'];
  }

  const ALIAS_MAP = {
    'mem_manudnot': ['not', 'นอต', 'น็อต', 'นิติพัฒน์', 'มนุษย์นอต', 'โชคกิจ'],
    'mem_third': ['third', 'สุภณัฐ', 'ศุภณัฐ', 'เติร์ธ', 'เทิร์ธ', 'เติร์ท', 'หมวดเติร์ธ', 'ผู้กองเติร์ธ', 'ทองน้ำวน', 'ฝอ.3', 'ฝอ3'],
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

    activeDbMembers.forEach(mem => {
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

async function getRawBody(req) {
  if (req.rawBody) {
    return Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody);
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body);
  }
  if (typeof req.body === 'object' && req.body !== null) {
    return Buffer.from(JSON.stringify(req.body));
  }
  return new Promise((resolve) => {
    if (req.readableEnded) {
      return resolve(Buffer.from(''));
    }
    let chunks = [];
    const onData = (chunk) => chunks.push(chunk);
    const onEnd = () => {
      cleanup();
      resolve(Buffer.concat(chunks));
    };
    const onError = () => {
      cleanup();
      resolve(Buffer.from(''));
    };
    const cleanup = () => {
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('error', onError);
    };
    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);

    setTimeout(() => {
      cleanup();
      resolve(Buffer.concat(chunks));
    }, 1000);
  });
}

function verifyLineSignature(bodyBuffer, signature) {
  if (!signature || !LINE_CHANNEL_SECRET) return true; // Graceful fallback if testing
  const hmac = crypto.createHmac('SHA256', LINE_CHANNEL_SECRET);
  hmac.update(bodyBuffer);
  const calculated = hmac.digest('base64');
  return calculated === signature;
}

async function pushLineMessage(toId, messages) {
  if (!toId) return;
  const body = JSON.stringify({
    to: toId,
    messages: Array.isArray(messages) ? messages : [messages]
  });
  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn('pushLineMessage failed:', res.status, errText);
    }
  } catch (e) {
    console.error('pushLineMessage error:', e);
  }
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

async function replyOrPushLineMessage(replyToken, toId, messages) {
  let replySuccess = false;
  if (replyToken) {
    try {
      const res = await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          replyToken,
          messages: Array.isArray(messages) ? messages : [messages]
        })
      });
      if (res.ok) {
        replySuccess = true;
      } else {
        const errText = await res.text();
        console.warn('replyLineMessage failed (likely expired token), falling back to LINE Push API:', res.status, errText);
      }
    } catch (e) {
      console.warn('replyLineMessage error, falling back to LINE Push API:', e);
    }
  }
  if (!replySuccess && toId) {
    await pushLineMessage(toId, messages);
  }
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

// Draft Engine (Uses Supabase events table + In-Memory Fallback to guarantee draft retention)
if (!globalThis.inMemoryDraftStore) {
  globalThis.inMemoryDraftStore = new Map();
}

async function saveDraft(userId, draftData) {
  if (!userId) return;
  globalThis.inMemoryDraftStore.set(userId, draftData);
  globalThis.inMemoryDraftStore.set('latest', draftData);

  try {
    const draftId = 'draft_' + userId;
    await supabase.from('events').upsert({
      id: draftId,
      title: '[DRAFT]',
      description: JSON.stringify(draftData),
      category: 'DRAFT',
      start_time: '2099-01-01T00:00:00Z',
      end_time: '2099-01-01T00:00:00Z',
      alarm_minutes: 0
    });
  } catch (e) {
    console.warn('Supabase draft upsert notice:', e?.message || e);
  }
}

async function getActiveDraft(userId) {
  if (globalThis.inMemoryDraftStore.has(userId)) {
    return globalThis.inMemoryDraftStore.get(userId);
  }

  try {
    const draftId = 'draft_' + userId;
    const { data: userDrafts } = await supabase
      .from('events')
      .select('description')
      .eq('id', draftId)
      .limit(1);

    if (userDrafts && userDrafts.length > 0 && userDrafts[0].description) {
      const parsed = JSON.parse(userDrafts[0].description);
      globalThis.inMemoryDraftStore.set(userId, parsed);
      return parsed;
    }

    const { data: latestDrafts } = await supabase
      .from('events')
      .select('description')
      .eq('category', 'DRAFT')
      .order('created_at', { ascending: false })
      .limit(1);

    if (latestDrafts && latestDrafts.length > 0 && latestDrafts[0].description) {
      const parsed = JSON.parse(latestDrafts[0].description);
      return parsed;
    }
  } catch (e) {
    console.warn('Supabase draft select notice:', e?.message || e);
  }

  if (globalThis.inMemoryDraftStore.has('latest')) {
    return globalThis.inMemoryDraftStore.get('latest');
  }

  return null;
}

async function clearActiveDraft(userId) {
  if (userId) globalThis.inMemoryDraftStore.delete(userId);
  globalThis.inMemoryDraftStore.delete('latest');

  try {
    const draftId = 'draft_' + userId;
    await supabase.from('events').delete().eq('id', draftId);
    await supabase.from('events').delete().eq('category', 'DRAFT');
  } catch (e) {
    console.warn('Supabase draft delete notice:', e?.message || e);
  }
}

export function formatCategoryWithBadge(catStr) {
  if (!catStr) return '🔴 ภารกิจหน่วย';
  const s = String(catStr).toLowerCase();
  if (s.includes('ติดตั้ง') || s.includes('ติดตั้งทีวี') || s.includes('ติดตั้งระบบ') || s.includes('เดินสาย')) return '🔴 ภารกิจหน่วย';
  if (s.includes('พ่นยุง') || s.includes('กำจัดยุง') || s.includes('แมลง') || s.includes('นวป') || s.includes('เวชกรรม') || s.includes('บ้านพัก') || s.includes('สวัสดิการ')) return '🟣 งานกองพัน';
  if (catStr.includes('🔴') || catStr.includes('🟡') || catStr.includes('🟢') || catStr.includes('🟣') || catStr.includes('🟤') || catStr.includes('🌸')) {
    return catStr;
  }
  if (s.includes('หมาย') || s.includes('royal')) return '🟡 ภารกิจหมาย';
  if (s.includes('ประชุม') || s.includes('meeting') || s.includes('vtc') || s.includes('อบรม')) return '🟢 ประชุม';
  if (s.includes('ฝึก') || s.includes('training') || s.includes('cpx') || s.includes('calflex')) return '🟤 ภารกิจการฝึก';
  if (s.includes('กิจกรรม') || s.includes('พิเศษ') || s.includes('เกิด')) return '🌸 กิจกรรมพิเศษ';
  if (s.includes('งาน') || s.includes('งานหน่วย') || s.includes('งานกองพัน') || s.includes('work') || s.includes('พิธี') || s.includes('เคารพธงชาติ') || s.includes('ส่งคน')) return '🟣 งานกองพัน';
  if (s.includes('หน่วย') || s.includes('unit')) return '🔴 ภารกิจหน่วย';
  return `🟣 ${catStr}`;
}

export function parseTimeRangeToStartEnd(startDate, endDate, timeStr, allDay) {
  const startDay = startDate || new Date().toISOString().split('T')[0];
  const endDay = endDate || startDay;

  if (allDay || !timeStr || timeStr === 'ตลอดวัน' || timeStr.includes('ตลอดวัน')) {
    return {
      startTime: new Date(`${startDay}T00:00:00+07:00`).toISOString(),
      endTime: new Date(`${endDay}T23:59:59+07:00`).toISOString()
    };
  }

  const times = timeStr ? timeStr.match(/(\d{1,2})[\:\.](\d{2})/g) : null;
  if (times && times.length >= 2) {
    const sTime = times[0].replace('.', ':').padStart(5, '0');
    const eTime = times[1].replace('.', ':').padStart(5, '0');
    return {
      startTime: new Date(`${startDay}T${sTime}:00+07:00`).toISOString(),
      endTime: new Date(`${endDay}T${eTime}:00+07:00`).toISOString()
    };
  } else if (times && times.length === 1) {
    const sTime = times[0].replace('.', ':').padStart(5, '0');
    const parts = times[0].split(/[\:\.]/);
    const sHour = parseInt(parts[0]);
    const sMin = parts[1];
    const eHour = Math.min(sHour + 2, 23);
    const eTime = `${String(eHour).padStart(2, '0')}:${sMin}`;
    return {
      startTime: new Date(`${startDay}T${sTime}:00+07:00`).toISOString(),
      endTime: new Date(`${endDay}T${eTime}:00+07:00`).toISOString()
    };
  }

  return {
    startTime: new Date(`${startDay}T00:00:00+07:00`).toISOString(),
    endTime: new Date(`${endDay}T23:59:59+07:00`).toISOString()
  };
}

export async function extractTextWithTyphoonOCR(fileBuf, filename = 'document.pdf', mimeType = 'application/pdf') {
  if (!TYPHOON_API_KEY) return '';
  try {
    const uint8 = new Uint8Array(fileBuf);
    const safeFilename = 'document.pdf';
    const file = new File([uint8], safeFilename, { type: mimeType });
    const formData = new FormData();
    formData.append('file', file);
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
      body: formData,
      signal: AbortSignal.timeout(25000)
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
    } else {
      const errBody = await res.text();
      console.warn('Typhoon OCR API returned non-OK status:', res.status, errBody);
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

    (async () => {
      try {
        const pdfModule = await import('pdf-parse').catch(() => null);
        if (!pdfModule) {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timer);
            resolve('');
          }
          return;
        }
        const PDFParse = pdfModule.PDFParse || pdfModule.default || pdfModule;
        const uint8 = new Uint8Array(fileBuf);
        const parser = new PDFParse({ data: uint8 });
        const textResult = await parser.getText({
          parsePageInfo: true,
          pageJoiner: '\n--- [หน้า page_number / total_number] ---\n'
        });
        let txt = (textResult?.text || '')
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        if (txt.length > maxChars) {
          txt = txt.substring(0, maxChars);
        }

        parser.destroy().catch(() => {});
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          resolve(txt);
        }
      } catch (e) {
        console.warn('PDFParse error:', e?.message || e);
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          resolve('');
        }
      }
    })();
  });
}

export async function analyzeMissionOrderWithAI(text, imageBase64 = null, dbMembers = [], mimeType = 'image/jpeg') {
  // Current ICT date context (UTC+7)
  const now = new Date();
  const ictNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const todayIso = ictNow.toISOString().split('T')[0];
  const [cYear, cMonth, cDay] = todayIso.split('-').map(Number);

  const todayDateObj = new Date(Date.UTC(cYear, cMonth - 1, cDay));
  const tomorrowObj = new Date(todayDateObj);
  tomorrowObj.setUTCDate(tomorrowObj.getUTCDate() + 1);
  const tomorrowIso = tomorrowObj.toISOString().split('T')[0];

  const datObj = new Date(todayDateObj);
  datObj.setUTCDate(datObj.getUTCDate() + 2);
  const datIso = datObj.toISOString().split('T')[0];

  const activeMembersList = Array.isArray(dbMembers) && dbMembers.length > 0
    ? dbMembers
        .filter(m => !m.is_archived && m.status !== 'resigned' && m.status !== 'inactive' && m.status !== 'archived')
        .map(m => m.nickname || m.name || m.first_name).filter(Boolean).join(', ')
    : 'นอต, เติร์ธ, จูน, เอก, เก่ง, ตั้ม, เวรหมาย';

  const systemPrompt = `คุณคือเสมียนกองร้อยสายและวิทยุถ่ายทอด มีหน้าที่วิเคราะห์คำสั่งปฏิบัติงาน ภารกิจ รูปภาพ หรือเอกสารข่าวสาร 

บริบทวันที่ปัจจุบัน (เวลาประเทศไทย ICT / UTC+7):
- "วันนี้" คือวันที่ ${todayIso} (พ.ศ. ${cYear + 543})
- "พรุ่งนี้" คือวันที่ ${tomorrowIso} (พ.ศ. ${cYear + 543})
- "มะรืนนี้" คือวันที่ ${datIso} (พ.ศ. ${cYear + 543})
ข้อกำหนดวันที่สำคัญ: หากในข้อความมีคำว่า "วันนี้", "พรุ่งนี้", "มะรืนนี้" ให้ใช้บริบทวันที่ข้างต้นระบุ start_date และ end_date ให้ถูกต้อง 100% ห้ามเดาวันที่ย้อนหลังหรือมั่วเด็ดขาด!

สำคัญที่สุด:
1. "title": ต้องสกัดเฉพาะชื่อภารกิจหรือหัวเรื่องหลัก สั้น กระชับ ได้ใจความ ไม่เกิน 5-10 คำ (เช่น "ติดตั้งทีวีคอนเสิร์ต ทภ.1", "นวป.ทบ. ฉีดพ่นยุง", "ประชุม C4I")
   - ห้ามใส่รายละเอียดประชาสัมพันธ์ คำเตือน หรือข้อแนะนำ (เช่น "แจ้งกำลังพลจัดเก็บสิ่งของที่กีดขวาง และงดตากผ้า...") ไว้ใน title ให้สกัดไปใส่ในฟิลด์ "notes"
   - ห้ามระบุยศ นามสกุล หรือรายชื่อผู้รับผิดชอบนำหน้าใน title (เช่น ห้ามใส่ "นอต" หรือ "ร.ท. นิติพัฒน์" ไว้ใน title) ให้สกัดไปใส่ในฟิลด์ "members" เท่านั้น
2. "notes": รายละเอียดเพิ่มเติม ข้อความประชาสัมพันธ์ ข้อควรระวัง หรือหมายเหตุจากคำสั่ง (ถ้าไม่มีให้ใส่ null)
3. "category": เลือกประเภทภารกิจจากรายการดังต่อไปนี้:
   - "🔴 ภารกิจหน่วย" (สำหรับ: งานติดตั้งระบบ/ติดตั้งทีวี/เครื่องเสียง, งานซ้อมแถว, งานพิธีการหน่วย, ภารกิจหลักหน่วย)
   - "🟣 งานกองพัน" (สำหรับ: การฉีดพ่นยุง, กำจัดแมลง, งานบ้านพักอาศัย, งานสวัสดิการ, การซ่อมบำรุงทั่วไป, การพัฒนาพื้นที่, การจัดเตรียมสถานที่, งานหน่วยประจำวัน)
   - "🟡 ภารกิจหมาย" (สำหรับ: ภารกิจรับ-ส่งเสด็จ, ภารกิจพระราชพิธี, ภารกิจหมายกำหนดการ)
   - "🟢 ประชุม" (สำหรับ: ประชุม, VTC, ชี้แจงนโยบาย, สรุปงาน)
   - "🟤 ภารกิจการฝึก" (สำหรับ: การฝึกประจำปี, ฝึกภาคสนาม, โครงการฝึกทางทหาร)
   - "🌸 กิจกรรมพิเศษ" (สำหรับ: งานเลี้ยง, วันเกิด, กิจกรรมสันทนาการ)
4. หากในข้อความต้นฉบับมีสัญลักษณ์หรือตัวเลขหัวข้อ เช่น ๑. หรือ ๒.๒.๑ ให้สกัด 1 รายการภารกิจ ต่อ 1 ข้อหัวข้อเด็ดขาด! ห้ามแยกประโยคย่อยในข้อเดียวกันออกเป็นหลายภารกิจ
5. หากมีหลายวันที่ ให้สกัดแยกเป็นรายการภารกิจเดี่ยวตามทุกๆ วันที่ระบุ ในอาร์เรย์ "missions" โดยทุกรายการใช้ชื่อเรื่อง (title), ผู้รับผิดชอบ (members), สถานที่ (location), การแต่งกาย (dress_code) เดียวกัน
6. ถอนข้อความส่วนสถานที่ (เช่น ประโยคที่ขึ้นต้นด้วย 'ณ ...') ออกจากชื่อภารกิจ (title) โดยนำสถานที่ไปใส่ไว้เฉพาะในฟิลด์ location เท่านั้น ห้ามใส่สถานที่ซ้ำใน title
7. ในฟิลด์ "members": ให้สกัดเฉพาะรายชื่อบุคคลที่มีอยู่จริงในฐานข้อมูลกำลังพล Supabase ต่อไปนี้เท่านั้น: [${activeMembersList}] หากชื่อไม่ตรงกับรายชื่อกำลังพลข้างต้น ให้ members เป็น []

กรุณาวิเคราะห์และสกัดข้อมูลภารกิจตอบกลับเฉพาะ JSON บริสุทธิ์ (ไม่ต้องใส่ markdown codeblock และไม่ใส่คำขึ้นต้นใดๆ) มีโครงสร้างดังนี้:
{
  "missions": [
    {
      "title": "ชื่อภารกิจสั้นกระชับ (5-10 คำ)",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "time_str": "ห้วงเวลา เช่น 09:30 - 12:00 หรือ 10:00 หรือ ตลอดวัน",
      "all_day": false,
      "category": "🔴 ภารกิจหน่วย หรือ 🟣 งานกองพัน หรือ 🟡 ภารกิจหมาย หรือ 🟢 ประชุม หรือ 🟤 ภารกิจการฝึก หรือ 🌸 กิจกรรมพิเศษ",
      "notes": "รายละเอียดประชาสัมพันธ์ คำเตือน หรือข้อแนะนำ (ถ้ามี)",
      "dress_code": "ชุดการแต่งกาย (หากไม่ได้ระบุในข้อความ ให้ใส่ null หรือเว้นว่างไว้)",
      "location": "สถานที่ปฏิบัติงานหรือลิงก์ประชุม (ถ้ามี)",
      "members": ["รายชื่อผู้รับผิดชอบเฉพาะที่มีระบุในข้อความและตรงกับฐานข้อมูล Supabase เท่านั้น"]
    }
  ]
}`;

  // 1. Opentyphoon API (typhoon-v2.5-30b-a3b-instruct) - Primary AI Analyzer
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
          temperature: 0.1,
          max_completion_tokens: 1536
        }),
        signal: AbortSignal.timeout(25000)
      });

      if (res.ok) {
        const data = await res.json();
        const rawJsonText = data.choices?.[0]?.message?.content || '';
        const cleanJson = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedObj = JSON.parse(cleanJson);
        if (parsedObj) {
          const rawMissions = Array.isArray(parsedObj.missions) ? parsedObj.missions : [parsedObj];
          // Filter out empty or broken missions
          const validMissions = rawMissions.filter(m => m && m.title && m.start_date && !m.start_date.includes('-00'));
          if (validMissions.length > 0) {
            validMissions.forEach(m => {
              const rawMembers = Array.isArray(m.members) ? m.members : [];
              const matchedMemberIds = matchMemberIds(rawMembers, dbMembers);

              // Strip assigned member names/nicknames/ranks if prepended in title
              if (m.title && dbMembers.length > 0) {
                dbMembers.forEach(dbM => {
                  const namesToClean = [dbM.nickname, dbM.name, dbM.full_name, dbM.rank ? `${dbM.rank} ${dbM.nickname}` : null].filter(Boolean);
                  namesToClean.forEach(n => {
                    if (n && typeof m.title === 'string' && m.title.startsWith(n)) {
                      m.title = m.title.substring(n.length).trim().replace(/^[\:\-\s]+/, '');
                    }
                  });
                });
              }

              m.member_ids = matchedMemberIds;
              m.member_names = formatMemberNamesForDisplay(matchedMemberIds, dbMembers);
              
              if (m.notes && !m.description) {
                m.description = m.notes;
              }
            });

            return { missions: validMissions };
          }
        }
      }
    } catch (e) {
      console.error('Opentyphoon API error:', e);
    }
  }

  // 2. Fallback Smart Multi-Mission Parser (If Typhoon AI is unavailable or fails)
  const multiMissions = parseAllThaiMissions(text, dbMembers);
  if (Array.isArray(multiMissions) && multiMissions.length > 0) {
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

  if (parsedDates) {
    let cleanTitle = text ? text.trim() : 'ภารกิจสั่งการ';
    if (cleanTitle.length > 80) {
      const lines = cleanTitle.split('\n').map(l => l.trim()).filter(Boolean);
      cleanTitle = lines.find(l => !l.includes('แผนการปฏิบัติ') && !l.includes('วันอังคาร') && !l.includes('ทดสอบ')) || lines[0] || 'ภารกิจสั่งการ';
    }

    return {
      missions: [
        {
          title: cleanTitle.slice(0, 100),
          start_date: parsedDates.start_date,
          end_date: parsedDates.end_date,
          time_str: 'ตลอดวัน',
          all_day: true,
          category: text && text.includes('หมาย') ? '🔴 ภารกิจหมาย' : '🔵 ภารกิจหน่วย',
          dress_code: text && (text.includes('เครื่องแบบ') || text.includes('ชุดฝึก') || text.includes('สุภาพ') || text.includes('ชุดอ่อน'))
            ? (text.includes('เครื่องแบบ') ? 'ชุดเครื่องแบบ' : text.includes('ชุดฝึก') ? 'ชุดฝึก' : text.includes('ชุดอ่อน') ? 'ชุดอ่อน' : 'ชุดสุภาพ')
            : null,
          location: text && text.includes('ณ ') ? text.split('ณ ')[1].split('\n')[0].trim() : '',
          members: []
        }
      ]
    };
  }

  return null;
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
  let pendingDateMissions = [];

  for (const line of lines) {
    let dateObjs = [];

    // Check for range pattern e.g. "11 - 15 ก.ย."
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
        dateObjs.push({
          start_date: `${yearAD}-${monthStr}-${startDay}`,
          end_date: `${yearAD}-${monthStr}-${endDay}`
        });
      }
    } else {
      // Check for multi-days pattern e.g. "11 12 18 19 25 26 ก.ย." or "11, 12, 18, 19 ก.ย."
      const multiMatch = line.match(new RegExp(`^((?:\\d{1,2}[\\s,]+)+)(\\d{1,2})\\s*${monthRegex}\\s*(\\d{2,4})?`, 'i'));
      if (multiMatch) {
        const numbersStr = multiMatch[1] + multiMatch[2];
        const dayNums = numbersStr.split(/[\s,]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 31);
        const monthKey = multiMatch[3].trim();
        let monthStr = null;
        for (const [k, v] of Object.entries(monthsMap)) {
          if (monthKey.includes(k) || k.includes(monthKey)) {
            monthStr = v;
            break;
          }
        }
        if (monthStr && dayNums.length > 0) {
          let rawYear = multiMatch[4] ? parseInt(multiMatch[4]) : 2569;
          let yearAD = rawYear > 2500 ? rawYear - 543 : (rawYear < 100 ? 2000 + (rawYear > 50 ? rawYear - 43 : rawYear + 57) : rawYear);
          if (yearAD > 2090) yearAD -= 543;

          dayNums.forEach(dNum => {
            const dStr = String(dNum).padStart(2, '0');
            dateObjs.push({
              start_date: `${yearAD}-${monthStr}-${dStr}`,
              end_date: `${yearAD}-${monthStr}-${dStr}`
            });
          });
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
            dateObjs.push({
              start_date: `${yearAD}-${monthStr}-${day}`,
              end_date: `${yearAD}-${monthStr}-${day}`
            });
          }
        }
      }
    }

    if (dateObjs.length > 0) {
      dateObjs.forEach(dObj => {
        const newM = {
          title: '',
          start_date: dObj.start_date,
          end_date: dObj.end_date,
          time_str: 'ตลอดวัน',
          all_day: true,
          category: text && text.includes('หมาย') ? '🔴 ภารกิจหมาย' : '🔵 ภารกิจหน่วย',
          dress_code: text && (text.includes('เครื่องแบบ') || text.includes('ชุดฝึก') || text.includes('สุภาพ') || text.includes('ชุดอ่อน'))
            ? (text.includes('เครื่องแบบ') ? 'ชุดเครื่องแบบ' : text.includes('ชุดฝึก') ? 'ชุดฝึก' : text.includes('ชุดอ่อน') ? 'ชุดอ่อน' : 'ชุดสุภาพ')
            : null,
          location: '',
          member_ids: [],
          member_names: 'ไม่ระบุ'
        };
        missions.push(newM);
        pendingDateMissions.push(newM);
      });
    } else if (pendingDateMissions.length > 0) {
      // Subtext line applies title, location, dress code, or members to all pending missions
      let subLine = line;
      let location = '';
      if (subLine.includes(' ณ ')) {
        const locParts = subLine.split(' ณ ');
        location = locParts[1].trim();
        subLine = locParts[0];
      } else if (subLine.includes('ณ ') && !subLine.startsWith('ณ ')) {
        const locParts = subLine.split('ณ ');
        location = locParts[1].trim();
        subLine = locParts[0];
      }

      const memberIds = matchMemberIds([subLine], dbMembers);
      let isMemberLine = subLine.includes('ผู้รับผิดชอบ') || subLine.includes('รับผิดชอบ') || memberIds.length > 0;
      let isDressLine = subLine.includes('ชุด') || subLine.includes('แต่งกาย');

      pendingDateMissions.forEach(m => {
        if (location) m.location = location;
        if (memberIds.length > 0) {
          m.member_ids = memberIds;
          m.member_names = formatMemberNamesForDisplay(memberIds, dbMembers);
        }
        if (subLine.includes('ชุดอ่อน')) m.dress_code = 'ชุดอ่อน';
        else if (subLine.includes('ชุดฝึก')) m.dress_code = 'ชุดฝึก';
        else if (subLine.includes('เครื่องแบบ')) m.dress_code = 'ชุดเครื่องแบบ';

        if (!isMemberLine && !isDressLine && subLine.length > 1 && !subLine.includes('ครับ') && !subLine.includes('ค่ะ')) {
          if (!m.title) {
            m.title = subLine;
          } else {
            m.title = `${m.title} / ${subLine}`;
          }
        }
      });
    }
  }

  // Final cleanup of title for any missions that had empty titles
  missions.forEach(m => {
    if (!m.title || m.title.trim().length === 0) {
      m.title = 'ภารกิจสั่งการ';
    }
  });

  return missions;
}

export function parseThaiMissionDates(text) {
  if (!text) return null;

  const now = new Date();
  const ictNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const todayIso = ictNow.toISOString().split('T')[0];
  const [cYear, cMonth, cDay] = todayIso.split('-').map(Number);
  const todayDateObj = new Date(Date.UTC(cYear, cMonth - 1, cDay));

  let s = String(text);

  if (s.includes('พรุ่งนี้')) {
    const tomObj = new Date(todayDateObj);
    tomObj.setUTCDate(tomObj.getUTCDate() + 1);
    const tomIso = tomObj.toISOString().split('T')[0];
    return { start_date: tomIso, end_date: tomIso };
  }

  if (s.includes('มะรืนนี้') || s.includes('มะรืน')) {
    const datObj = new Date(todayDateObj);
    datObj.setUTCDate(datObj.getUTCDate() + 2);
    const datIso = datObj.toISOString().split('T')[0];
    return { start_date: datIso, end_date: datIso };
  }

  if (s.includes('วันนี้')) {
    return { start_date: todayIso, end_date: todayIso };
  }

  const thaiDigits = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
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

export function parseRosterUpdatesByDate(text, dbMembers = []) {
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
  const rangePattern = new RegExp(`(\\d{1,2})\\s*[-–ถึง]\\s*(\\d{1,2})\\s*${monthRegex}`, 'i');
  const singlePattern = new RegExp(`(\\d{1,2})\\s*${monthRegex}`, 'i');

  const lines = s.split('\n').map(l => l.trim()).filter(Boolean);
  const updates = [];

  lines.forEach(line => {
    const memberIds = matchMemberIds([line], dbMembers);
    if (memberIds.length === 0) return;

    let matchedDates = [];
    const rangeMatch = line.match(rangePattern);
    if (rangeMatch) {
      const startDay = parseInt(rangeMatch[1]);
      const endDay = parseInt(rangeMatch[2]);
      const monthKey = rangeMatch[3].trim();
      let monthStr = null;
      for (const [k, v] of Object.entries(monthsMap)) {
        if (monthKey.includes(k) || k.includes(monthKey)) {
          monthStr = v;
          break;
        }
      }
      if (monthStr && startDay <= endDay) {
        for (let d = startDay; d <= endDay; d++) {
          matchedDates.push(`${monthStr}-${String(d).padStart(2, '0')}`);
        }
      }
    } else {
      const singleMatch = line.match(singlePattern);
      if (singleMatch) {
        const day = parseInt(singleMatch[1]);
        const monthKey = singleMatch[2].trim();
        let monthStr = null;
        for (const [k, v] of Object.entries(monthsMap)) {
          if (monthKey.includes(k) || k.includes(monthKey)) {
            monthStr = v;
            break;
          }
        }
        if (monthStr) {
          matchedDates.push(`${monthStr}-${String(day).padStart(2, '0')}`);
        }
      }
    }

    if (matchedDates.length > 0) {
      updates.push({
        dateKeys: matchedDates,
        member_ids: memberIds
      });
    }
  });

  return updates;
}

export function formatDraftSummaryMessage(draftObj) {
  const missions = Array.isArray(draftObj.missions) && draftObj.missions.length > 0
    ? draftObj.missions
    : [draftObj];

  const BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  const formatDressCodeLine = (dc) => {
    if (!dc || dc === 'ไม่ระบุ' || dc === 'null' || dc.includes('กำหนดอัตโนมัติ')) return '';
    const clean = dc.startsWith('ชุด') ? dc : `ชุด${dc}`;
    return `\n👔 ${clean}`;
  };

  const formatNotesLine = (notes) => {
    if (!notes || notes === 'null' || notes === 'ไม่ระบุ') return '';
    return `\n📌 รายละเอียด: ${notes}`;
  };

  if (missions.length === 1) {
    const item = missions[0];
    const memberDisplayStr = formatMemberNamesForDisplay(item.member_ids, []) || item.member_names || 'ไม่ระบุ';
    const dateStr = `${item.start_date}${item.end_date && item.end_date !== item.start_date ? ' ถึง ' + item.end_date : ''} (${item.time_str || 'ตลอดวัน'})`;
    const catBadge = formatCategoryWithBadge(item.category);
    const dressLine = formatDressCodeLine(item.dress_code);
    const notesLine = formatNotesLine(item.notes || item.description);
    const locLine = item.location ? `\n📍 สถานที่: ${item.location}` : '';

    return `📋 สรุปร่างภารกิจ (1 รายการ):

${dateStr}
📝 ${item.title}
${catBadge}${dressLine}${notesLine}
🎯 ผู้รับผิดชอบ: ${memberDisplayStr}${locLine}

⏱️ บันทึกให้อัตโนมัติใน 3 นาที`;
  }

  const itemsText = missions.map((item, idx) => {
    const memberDisplayStr = formatMemberNamesForDisplay(item.member_ids, []) || item.member_names || 'ไม่ระบุ';
    const badge = BADGES[idx] || `${idx + 1}️⃣`;
    const dateStr = `${item.start_date}${item.end_date && item.end_date !== item.start_date ? ' ถึง ' + item.end_date : ''} (${item.time_str || 'ตลอดวัน'})`;
    const catBadge = formatCategoryWithBadge(item.category);
    const dressLine = formatDressCodeLine(item.dress_code);
    const notesLine = formatNotesLine(item.notes || item.description);
    const locLine = item.location ? `\n📍 สถานที่: ${item.location}` : '';

    return `${badge} ${dateStr}\n📝 ${item.title}\n${catBadge}${dressLine}${notesLine}\n🎯 ผู้รับผิดชอบ: ${memberDisplayStr}${locLine}`;
  }).join('\n\n');

  return `📋 สรุปร่างภารกิจ (${missions.length} รายการ):\n\n${itemsText}\n\n⏱️ บันทึกให้อัตโนมัติใน 3 นาที`;
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

  try {
    const dbMembers = await fetchMembersFromSupabase();

    for (const event of events) {
      if (event.type !== 'message') continue;

    const replyToken = event.replyToken;
    const sourceType = event.source?.type;
    const isGroupChat = sourceType === 'group' || sourceType === 'room';
    const userId = event.source?.groupId || event.source?.roomId || event.source?.userId || 'default_user';
    const msgType = event.message.type;
    const rawText = msgType === 'text' ? (event.message.text || '').trim() : '';

    // Fetch active draft for this user/group (with in-memory fallback)
    let activeDraft = await getActiveDraft(userId);
    const hasActiveDraft = Boolean(activeDraft);

    const hasPirabTrigger = rawText.includes('พิราบ');

    // 0. Group Chat Gatekeeper Filter: Ignore general chat in groups if idle and no 'พิราบ' trigger
    if (isGroupChat && !hasActiveDraft && !hasPirabTrigger) {
      continue;
    }

    // Standalone trigger word activation ('พิราบ', 'พิราบ เพิ่มภารกิจ')
    if (hasPirabTrigger && (rawText === 'พิราบ' || rawText === 'พิราบ เพิ่มภารกิจ' || rawText === 'พิราบ เปิดโหมด' || rawText === 'เพิ่มภารกิจ')) {
      await saveDraft(userId, { missions: [], isGroupActive: true });
      await replyOrPushLineMessage(replyToken, userId, {
        type: 'text',
        text: '🕊️ พิราบพร้อมรับภารกิจ! เจ้านายสามารถส่งรูปภาพ หรือพิมพ์ข้อความคำสั่งเข้ามาได้เลยครับ'
      });
      continue;
    }

    // 1. User Command: Confirming Save (✅ ยืนยันบันทึก / ยืนยัน)
    if (msgType === 'text' && (event.message.text.includes('ยืนยัน') || event.message.text.includes('บันทึก'))) {
      if (!activeDraft) {
        await replyOrPushLineMessage(replyToken, userId, {
          type: 'text',
          text: '❌ ไม่พบร่างภารกิจที่ค้างอยู่ เจ้านายสามารถส่งรูปภาพคำสั่ง หรือข้อความภารกิจใหม่เข้ามาได้เลยครับ'
        });
        continue;
      }

      // Handle Update Draft Confirmation (for existing database events)
      if (activeDraft.isUpdateDraft && Array.isArray(activeDraft.updateItems)) {
        const updateItems = activeDraft.updateItems;
        const updatedEvents = [];
        for (const uEvt of updateItems) {
          try {
            const { error: updErr } = await supabase
              .from('events')
              .update({ member_ids: uEvt.new_member_ids })
              .eq('id', uEvt.id);
            if (!updErr) {
              updatedEvents.push(uEvt);
            }
          } catch (err) {
            console.error('Update event error:', err);
          }
        }

        await clearActiveDraft(userId);

        const summaryLines = updatedEvents.map((u, i) => `${i + 1}. ${u.start_date} - ${u.title}\n   🎯 ผู้รับผิดชอบ: ${u.new_member_names}`);
        await replyOrPushLineMessage(replyToken, userId, {
          type: 'text',
          text: `✅ ยืนยันบันทึกการอัปเดตผู้รับผิดชอบในปฏิทินเรียบร้อยแล้ว (${updatedEvents.length} รายการ):\n\n` + summaryLines.join('\n\n')
        });
        continue;
      }

      // Convert draft to Supabase Event (Supports single or multi-mission)
      const missionsToSave = Array.isArray(activeDraft.missions) && activeDraft.missions.length > 0
        ? activeDraft.missions
        : [activeDraft];

      const insertedEvents = [];
      for (const mItem of missionsToSave) {
        const newEvtId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const { startTime, endTime } = parseTimeRangeToStartEnd(
          mItem.start_date,
          mItem.end_date,
          mItem.time_str,
          mItem.all_day
        );
        const descParts = [];
        if (mItem.dress_code && mItem.dress_code !== 'ไม่ระบุ' && mItem.dress_code !== 'ชุดอ่อน (กำหนดอัตโนมัติ)') {
          descParts.push(`👔 การแต่งกาย: ${mItem.dress_code}`);
        }
        if (mItem.notes || mItem.description) {
          descParts.push(mItem.notes || mItem.description);
        }
        const descText = descParts.join('\n');

        const isExplicitAllDay = mItem.all_day === true || (!mItem.time_str || mItem.time_str === 'ตลอดวัน' || mItem.time_str.includes('ตลอดวัน'));

        try {
          let { error: insertErr } = await supabase.from('events').insert({
            id: newEvtId,
            title: mItem.title,
            start_time: startTime,
            end_time: endTime,
            all_day: isExplicitAllDay,
            category: formatCategoryWithBadge(mItem.category),
            description: descText,
            location: mItem.location || '',
            member_ids: Array.isArray(mItem.member_ids) ? mItem.member_ids : [],
            alarm_minutes: 1440
          });

          // Fallback if all_day column is not yet created in Supabase events table
          if (insertErr && insertErr.code === 'PGRST204') {
            const fallbackRes = await supabase.from('events').insert({
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
            insertErr = fallbackRes.error;
          }

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

      const confirmText = `✅ ยืนยันบันทึก ${insertedEvents.length} ภารกิจ\n\n` + insertedEvents.map((item, idx) => `${idx + 1}. ${item.title} (${item.start_date}${item.time_str && item.time_str !== 'ตลอดวัน' ? ' ' + item.time_str : ''})`).join('\n');

      await replyOrPushLineMessage(replyToken, userId, {
        type: 'text',
        text: confirmText
      });
      continue;
    }

    // 2. User Command: Cancel Draft (❌ ยกเลิก)
    if (msgType === 'text' && event.message.text.includes('ยกเลิก') && !event.message.text.includes('ยกเลิกภารกิจที่')) {
      await clearActiveDraft(userId);
      await replyOrPushLineMessage(replyToken, userId, {
        type: 'text',
        text: '❌ ยกเลิกร่างภารกิจเรียบร้อยแล้วครับ เจ้านายสามารถส่งภารกิจใหม่เข้ามาได้ตลอดเวลาครับ'
      });
      continue;
    }

    // 2.5 User Command: Delete Specific Mission from Draft (ลบภารกิจ 2,3,4 / ลบข้อ 2 / ลบ 2)
    if (msgType === 'text' && (event.message.text.includes('ลบ') || event.message.text.includes('ตัด') || event.message.text.includes('เอาออก'))) {
      if (!activeDraft) {
        await replyOrPushLineMessage(replyToken, userId, {
          type: 'text',
          text: '❌ ไม่พบร่างภารกิจที่ค้างอยู่ในการลบครับ เจ้านายสามารถส่งรูปภาพหรือข้อความคำสั่งภารกิจใหม่เข้ามาได้เลยครับ'
        });
        continue;
      }

      const numbers = event.message.text.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const targetMissions = Array.isArray(activeDraft.missions) && activeDraft.missions.length > 0
          ? activeDraft.missions
          : [activeDraft];

        const indicesToDelete = new Set(numbers.map(n => parseInt(n) - 1));
        const remainingMissions = targetMissions.filter((_, idx) => !indicesToDelete.has(idx));
        const deletedNums = Array.from(indicesToDelete).map(i => i + 1).filter(n => n >= 1 && n <= targetMissions.length).sort((a, b) => a - b);

        if (remainingMissions.length === 0) {
          await clearActiveDraft(userId);
          await replyOrPushLineMessage(replyToken, userId, {
            type: 'text',
            text: '❌ ลบภารกิจทั้งหมดในร่างเรียบร้อยแล้วครับ เจ้านายสามารถส่งคำสั่งภารกิจใหม่เข้ามาได้ตลอดเวลาครับ'
          });
          continue;
        }

        activeDraft = { missions: remainingMissions };
        await saveDraft(userId, activeDraft);

        const delStr = deletedNums.length > 0 ? deletedNums.join(', ') : 'ที่ระบุ';
        await replyOrPushLineMessage(replyToken, userId, [
          {
            type: 'text',
            text: `🗑️ ลบภารกิจข้อ ${delStr} ออกจากร่างเรียบร้อยแล้วครับ! โปรดตรวจสอบภารกิจที่เหลือ:\n\n` + formatDraftSummaryMessage(activeDraft),
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
    }

    // 2.5 Smart Date-Based Roster Assignment Update (Draft Mode & Supabase Event Mode)
    if (msgType === 'text') {
      const rosterUpdates = parseRosterUpdatesByDate(rawText, dbMembers);
      if (rosterUpdates.length > 0) {
        if (activeDraft) {
          // Mode 1: Update Active Draft
          const targetMissions = Array.isArray(activeDraft.missions) && activeDraft.missions.length > 0
            ? activeDraft.missions
            : [activeDraft];

          let updatedCount = 0;
          targetMissions.forEach(mItem => {
            if (!mItem.start_date) return;
            rosterUpdates.forEach(upd => {
              const matchesDate = upd.dateKeys.some(dk => mItem.start_date.endsWith(dk));
              if (matchesDate) {
                mItem.member_ids = upd.member_ids;
                mItem.member_names = formatMemberNamesForDisplay(upd.member_ids, dbMembers);
                updatedCount++;
              }
            });
          });

          if (updatedCount > 0) {
            activeDraft = { missions: targetMissions };
            await saveDraft(userId, activeDraft);

            await replyOrPushLineMessage(replyToken, userId, [
              {
                type: 'text',
                text: `🔄 อัปเดตรายชื่อผู้รับผิดชอบตามวันที่ในร่างภารกิจสำเร็จแล้ว (${updatedCount} รายการ)! โปรดตรวจสอบความถูกต้อง:\n\n` + formatDraftSummaryMessage(activeDraft),
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
        } else if (rawText.includes('อัพเดท') || rawText.includes('แก้ไข') || rawText.includes('นายทหารควบคุม') || rawText.includes('ผู้รับผิดชอบ') || rawText.includes('รายชื่อ') || rawText.includes('ขอรับรายชื่อ')) {
          // Mode 2: Update Already Saved Events in Supabase Database (Draft Preview + Quick Reply Buttons)
          try {
            const { data: dbEvents, error: fetchErr } = await supabase.from('events').select('*');
            if (!fetchErr && Array.isArray(dbEvents) && dbEvents.length > 0) {
              const currentYear = new Date().getFullYear();
              const targetYearStr = `${currentYear}`;

              // Extract title keywords from rawText header (e.g. "งานพระบรมศพ", "ซ้อมริ้วขบวน", "ริ้วขบวน")
              const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
              const headerText = lines.slice(0, 3).join(' ');
              const titleKeywords = ['ซ้อมริ้วขบวน', 'ริ้วขบวน', 'งานพระบรมศพ', 'พระบรมศพ', 'พ่นยุง', 'ประชุม', 'ฝึก'].filter(k => headerText.includes(k));

              const updatedItems = [];
              for (const evt of dbEvents) {
                const evtDateIso = evt.start_time ? evt.start_time.split('T')[0] : '';
                // Rule 1: Must be in target year 2026 (never match past 2025 events)
                if (!evtDateIso.startsWith(targetYearStr)) continue;

                // Rule 2: If title keywords were specified in prompt header, match ONLY events containing those keywords!
                if (titleKeywords.length > 0) {
                  const matchesTitle = titleKeywords.some(kw => evt.title && evt.title.includes(kw));
                  if (!matchesTitle) continue;
                } else {
                  // Ignore general unrelated event titles
                  if (evt.title && (evt.title.includes('งานแต่ง') || evt.title.includes('หมาย 9') || evt.title.includes('เปิดหน่วยฝึก') || evt.title.includes('รับส่งหน้าที่'))) {
                    continue;
                  }
                }

                rosterUpdates.forEach(upd => {
                  const matchesDate = upd.dateKeys.some(dk => evtDateIso.endsWith(dk));
                  if (matchesDate) {
                    const oldMembersStr = formatMemberNamesForDisplay(evt.member_ids, dbMembers) || 'ไม่ระบุ';
                    const newMembersStr = formatMemberNamesForDisplay(upd.member_ids, dbMembers);
                    updatedItems.push({
                      id: evt.id,
                      title: evt.title,
                      start_date: evtDateIso,
                      old_member_names: oldMembersStr,
                      new_member_ids: upd.member_ids,
                      new_member_names: newMembersStr
                    });
                  }
                });
              }

              if (updatedItems.length > 0) {
                // Save update draft instead of modifying database immediately
                const updateDraftData = {
                  isUpdateDraft: true,
                  updateItems: updatedItems
                };
                await saveDraft(userId, updateDraftData);

                const firstTitle = updatedItems[0]?.title ? updatedItems[0].title.replace('/ ทั้งวัน', '').trim() : 'ภารกิจ';
                const summaryLines = updatedItems.map((u, i) => `${i + 1}. ${u.start_date} - ${u.title}\n   🎯 ผู้รับผิดชอบ: ${u.old_member_names} ➔ ${u.new_member_names}`);

                // Build Quick Reply buttons above keyboard
                const quickReplyItems = [
                  {
                    type: 'action',
                    action: {
                      type: 'message',
                      label: `✅ ยืนยันบันทึก (${firstTitle.slice(0, 12)})`,
                      text: '✅ ยืนยันบันทึกการอัปเดต'
                    }
                  }
                ];

                if (updatedItems.length > 1) {
                  quickReplyItems.push({
                    type: 'action',
                    action: {
                      type: 'message',
                      label: '✅ ยืนยันบันทึกทั้งหมด',
                      text: '✅ ยืนยันบันทึกการอัปเดต'
                    }
                  });
                }

                quickReplyItems.push({
                  type: 'action',
                  action: { type: 'message', label: '❌ ยกเลิก', text: '❌ ยกเลิก' }
                });

                await replyOrPushLineMessage(replyToken, userId, [
                  {
                    type: 'text',
                    text: `📋 ร่างอัปเดตผู้รับผิดชอบ (${updatedItems.length} รายการ):\n\n` + summaryLines.join('\n\n') + '\n\nโปรดตรวจสอบและเลือกยืนยันการบันทึกเหนือคีย์บอร์ดด้านล่างครับ:',
                    quickReply: {
                      items: quickReplyItems
                    }
                  }
                ]);
                continue;
              } else {
                await replyOrPushLineMessage(replyToken, userId, {
                  type: 'text',
                  text: '❌ ไม่พบภารกิจในปี 2026 ที่ตรงกับวันที่และหัวข้อที่ระบุสำหรับการอัปเดตครับ'
                });
                continue;
              }
            }
          } catch (dbErr) {
            console.error('Database event roster update error:', dbErr);
          }
        }
      }
    }

    // 3. User Command: Interactive Edit Command on Active Draft
    if (msgType === 'text' && (event.message.text.includes('แก้') || event.message.text.includes('เปลี่ยน') || event.message.text.includes('เพิ่ม'))) {
      if (!activeDraft) {
        await replyOrPushLineMessage(replyToken, userId, {
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

      const lines = userText.split('\n').map(l => l.trim()).filter(Boolean);
      let isItemizedEdit = false;

      lines.forEach(line => {
        const numMatch = line.match(/(?:ภารกิจ\s*|ข้อ\s*|รายการ\s*)?(\d{1,2})[\:\.\)\s]+(.+)/i);
        if (numMatch) {
          const missionIdx = parseInt(numMatch[1]) - 1;
          const editContent = numMatch[2].trim();

          if (missionIdx >= 0 && missionIdx < targetMissions.length) {
            isItemizedEdit = true;
            const mItem = targetMissions[missionIdx];

            // Check date in editContent
            const dateMatch = editContent.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\/\d{1,2})/);
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

            // Check dress code
            if (editContent.includes('เครื่องแบบ')) mItem.dress_code = 'ชุดเครื่องแบบ';
            else if (editContent.includes('ชุดฝึก')) mItem.dress_code = 'ชุดฝึก';
            else if (editContent.includes('สุภาพ')) mItem.dress_code = 'ชุดสุภาพ';

            // Check member
            const mMemberIds = matchMemberIds([editContent], dbMembers);
            if (mMemberIds.length > 0) {
              mItem.member_ids = mMemberIds;
              mItem.member_names = formatMemberNamesForDisplay(mMemberIds, dbMembers);
            }

            // Clean title
            let cleanTitle = editContent
              .replace(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\/\d{1,2})/, '')
              .replace(/เครื่องแบบ|ชุดฝึก|ชุดสุภาพ|ชุดอ่อน/g, '')
              .replace(/^ภารกิจ\s*/, '')
              .trim();

            if (mMemberIds.length > 0) {
              mMemberIds.forEach(id => {
                const nameStr = formatMemberNamesForDisplay([id], dbMembers);
                if (nameStr && nameStr !== 'ไม่ระบุ') cleanTitle = cleanTitle.replace(new RegExp(nameStr, 'gi'), '').trim();
              });
            }

            if (cleanTitle && cleanTitle.length > 1) {
              mItem.title = cleanTitle;
            }
          }
        }
      });

      if (!isItemizedEdit) {
        const hasSpecificTarget = userText.includes('ภารกิจที่ 1') || userText.includes('ภารกิจที่ 2') ||
                                  userText.includes('ภารกิจ 1') || userText.includes('ภารกิจ 2') ||
                                  userText.includes('ข้อ 1') || userText.includes('ข้อ 2') ||
                                  userText.includes('รายการ 1') || userText.includes('รายการ 2');

        const applyToAll = !hasSpecificTarget || userText.includes('ทั้งหมด') || userText.includes('ทุกภารกิจ') || userText.includes('ทั้ง 2 ภารกิจ') || userText.includes('ทั้งสองภารกิจ');

        const dateMatch = userText.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\/\d{1,2})/);

        let newDressCode = null;
        if (userText.includes('เครื่องแบบ')) newDressCode = 'ชุดเครื่องแบบ';
        else if (userText.includes('ชุดฝึก')) newDressCode = 'ชุดฝึก';
        else if (userText.includes('สุภาพ')) newDressCode = 'ชุดสุภาพ';
        else if (userText.includes('ชุดอ่อน')) newDressCode = 'ชุดอ่อน (กำหนดอัตโนมัติ)';

        const newMemberIds = matchMemberIds([userText], dbMembers);

        targetMissions.forEach((mItem, idx) => {
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
      }

      activeDraft = { missions: targetMissions };

      // Save updated draft
      await saveDraft(userId, activeDraft);

      await replyOrPushLineMessage(replyToken, userId, [
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
        await replyOrPushLineMessage(replyToken, userId, {
          type: 'text',
          text: '❌ ไม่สามารถวิเคราะห์รูปภาพสั่งการได้ครับ กรุณาลองส่งภาพถ่ายคำสั่งภารกิจที่ชัดเจนอีกครั้ง หรือพิมพ์ข้อความสั่งการเข้ามาได้เลยครับ'
        });
        continue;
      }
    } else if (msgType === 'file') {
      const fileName = (event.message.fileName || 'document.pdf');

      let fileBuf = null;
      try {
        fileBuf = await fetchLineBinary(event.message.id);
      } catch (dlErr) {
        console.error('LINE binary download error:', dlErr);
        await replyOrPushLineMessage(replyToken, userId, {
          type: 'text',
          text: `❌ ไม่สามารถดาวน์โหลดไฟล์เอกสารจาก LINE ได้ (${dlErr?.message || dlErr})\n\nกรุณาลองส่งไฟล์ใหม่อีกครั้งครับ`
        });
        continue;
      }

      let ocrText = '';
      let ocrErrStr = '';

      const lowerName = fileName.toLowerCase();
      if (lowerName.endsWith('.pdf') || (fileBuf && fileBuf.toString('ascii', 0, 4) === '%PDF')) {
        try {
          ocrText = await extractTextWithTyphoonOCR(fileBuf, fileName, 'application/pdf');
        } catch (ocrE) {
          ocrErrStr = ocrE?.message || String(ocrE);
          console.warn('Typhoon OCR error:', ocrE);
        }

        if (!ocrText || ocrText.length < 5) {
          try {
            ocrText = await extractPdfTextWithTimeout(fileBuf, 5000);
          } catch (pdfE) {
            console.warn('pdf-parse fallback error:', pdfE);
          }
        }
      } else if (lowerName.endsWith('.txt') || lowerName.endsWith('.csv')) {
        ocrText = fileBuf.toString('utf-8');
      } else {
        try {
          ocrText = await extractTextWithTyphoonOCR(fileBuf, fileName, 'image/png');
        } catch (ocrE) {
          ocrErrStr = ocrE?.message || String(ocrE);
        }
      }

      if (ocrText && ocrText.length > 5) {
        try {
          analyzedData = await analyzeMissionOrderWithAI(ocrText, null, dbMembers);
        } catch (aiErr) {
          console.error('AI analysis error:', aiErr);
          await replyOrPushLineMessage(replyToken, userId, {
            type: 'text',
            text: `❌ อ่านเอกสารสำเร็จแต่ไม่สามารถวิเคราะห์ภารกิจด้วย Typhoon AI ได้ (${aiErr?.message || aiErr})`
          });
          continue;
        }
      }

      if (!analyzedData) {
        const detailMsg = ocrErrStr ? `\n(รายละเอียด: ${ocrErrStr})` : '';
        await replyOrPushLineMessage(replyToken, userId, {
          type: 'text',
          text: `❌ ไม่สามารถสกัดข้อความภารกิจจากไฟล์ "${fileName}" ด้วย Typhoon OCR ได้ครับ${detailMsg}\n\nกรุณาลองถ่ายภาพคำสั่งภารกิจ หรือพิมพ์เนื้อหาภารกิจเข้ามาได้เลยครับ`
        });
        continue;
      }
    } else if (msgType === 'text') {
      const cleanMissionText = event.message.text.replace(/พิราบ\s*/gi, '').trim();
      analyzedData = await analyzeMissionOrderWithAI(cleanMissionText || event.message.text, null, dbMembers);
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
          dress_code: m.dress_code || '',
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
      await replyOrPushLineMessage(replyToken, userId, [
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
  } catch (err) {
    console.error('Async webhook event processing error:', err);
  }

  return res.status(200).json({ status: 'success' });
}
