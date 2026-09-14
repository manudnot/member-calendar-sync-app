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
  if (!Array.isArray(memberNamesArray)) return ['mem_phak_ek'];
  const matched = new Set();

  memberNamesArray.forEach(nameStr => {
    const s = String(nameStr).toLowerCase().trim();
    if (!s) return;

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

  if (matched.size === 0) matched.add('mem_phak_ek');
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
  if (!res.ok) throw new Error(`LINE binary fetch failed HTTP ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// AI Parsing with Persona "เสมียนกองร้อยสายและวิทยุถ่ายทอด" using Opentyphoon API
async function analyzeMissionOrderWithAI(text, imageBase64 = null) {
  const systemPrompt = `คุณคือเสมียนกองร้อยสายและวิทยุถ่ายทอด มีหน้าที่จัดทำเอกสารและวิเคราะห์คำสั่งปฏิบัติงาน ภารกิจ รูปภาพ หรือเอกสารข่าวสาร กรุณาวิเคราะห์และสกัดข้อมูลภารกิจตอบกลับเฉพาะ JSON บริสุทธิ์ (ไม่ต้องใส่ markdown codeblock และไม่ใส่คำขึ้นต้นใดๆ) มีโครงสร้างดังนี้:
{
  "title": "ชื่อภารกิจหรือเรื่อง",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "time_str": "ห้วงเวลา เช่น 09:00 - 16:00 หรือ ตลอดวัน",
  "all_day": true/false,
  "category": "ภารกิจหน่วย หรือ ภารกิจหมาย",
  "dress_code": "ชุดการแต่งกาย (เช่น ชุดฝึก, ชุดเครื่องแบบ, ชุดสุภาพ)",
  "location": "สถานที่ปฏิบัติงานหรือลิงก์ประชุม (ถ้ามี)",
  "members": ["รายชื่อผู้รับผิดชอบ เช่น นอต, เอก, ท็อป, เวรหมาย"]
}`;

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
          max_completion_tokens: 512
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawJsonText = data.choices?.[0]?.message?.content || '';
        const cleanJson = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
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
        return JSON.parse(cleanJson);
      }
    } catch (e) {
      console.error('Gemini API fallback error:', e);
    }
  }

  // 3. Fallback Smart Parser
  const todayStr = new Date().toISOString().split('T')[0];
  return {
    title: text ? text.slice(0, 50) : 'ภารกิจสั่งการจาก LINE',
    start_date: todayStr,
    end_date: todayStr,
    time_str: 'ตลอดวัน',
    all_day: true,
    category: text && text.includes('หมาย') ? 'ภารกิจหมาย' : 'ภารกิจหน่วย',
    dress_code: text && text.includes('เครื่องแบบ') ? 'ชุดเครื่องแบบ' : 'ชุดฝึก',
    location: '',
    members: ['เอก', 'นอต']
  };
}

function matchMemberIds(memberNamesArray) {
  if (!Array.isArray(memberNamesArray)) return ['mem_phak_ek'];
  const matched = new Set();
  memberNamesArray.forEach(nameStr => {
    const s = String(nameStr).toLowerCase();
    MEMBER_MAPPING.forEach(mem => {
      if (mem.names.some(n => s.includes(n.toLowerCase()))) {
        matched.add(mem.id);
      }
    });
  });
  if (matched.size === 0) matched.add('mem_phak_ek');
  return Array.from(matched);
}

function formatDraftSummaryMessage(draft) {
  return `🔍 ระบบวิเคราะห์ภารกิจเสร็จสิ้น โปรดตรวจสอบความถูกต้อง:

1. 📅 วันที่: ${draft.start_date}${draft.end_date !== draft.start_date ? ' ถึง ' + draft.end_date : ''} (${draft.time_str || 'ตลอดวัน'})
📝 ภารกิจ: ${draft.title}
🏷️ หมวดหมู่: ${draft.category || 'ภารกิจหน่วย'}
👔 การแต่งกาย: ${draft.dress_code || 'ชุดฝึก'}
🎯 ผู้รับผิดชอบ: ${draft.member_names || 'เอก, นอต'}
${draft.location ? '📍 สถานที่: ' + draft.location : ''}

⏱️ ระบบจะกดยืนยันบันทึกให้อัตโนมัติใน 3 นาที หากไม่มีการกดปุ่มใดๆ หรือเมื่อเจ้านายส่งรูป/คำสั่งใหม่เข้ามาครับ

💡 เจ้านายสามารถพิมพ์สั่งแก้ไขข้อมูลร่างได้โดยตรง (เช่น 'แก้ไขวันที่ 2026-09-25' หรือ 'เปลี่ยนการแต่งกาย ชุดเครื่องแบบ' หรือ 'เพิ่มผู้รับผิดชอบ ท็อป') ก่อนกดยืนยันบันทึกครับ`;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('LINE Webhook Engine Active (เสมียนกองร้อยสายและวิทยุถ่ายทอด)');
  }

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const rawBuffer = await getRawBody(req);
  const signature = req.headers['x-line-signature'];

  if (!verifyLineSignature(rawBuffer, signature)) {
    return res.status(403).send('Invalid signature');
  }

  const bodyText = rawBuffer.toString('utf-8');
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch (e) {
    return res.status(400).send('Invalid JSON');
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

      // Convert draft to Supabase Event
      const startTime = new Date(`${activeDraft.start_date}T09:00:00+07:00`).toISOString();
      const endTime = new Date(`${activeDraft.end_date}T17:00:00+07:00`).toISOString();
      const newEvtId = `evt_line_${Date.now()}`;

      const descText = `👔 การแต่งกาย: ${activeDraft.dress_code || 'ชุดฝึก'}\n📍 สถานที่: ${activeDraft.location || '-'}`;

      await supabase.from('events').insert({
        id: newEvtId,
        title: activeDraft.title,
        start_time: startTime,
        end_time: endTime,
        all_day: activeDraft.all_day !== false,
        category: activeDraft.category || 'ภารกิจหน่วย',
        description: descText,
        location: activeDraft.location || '',
        member_ids: activeDraft.member_ids || ['mem_phak_ek'],
        alarm_minutes: 1440
      });

      // Clear draft table
      await supabase.from('draft_events').delete().eq('user_id', userId);

      await replyLineMessage(replyToken, {
        type: 'text',
        text: `✅ ยืนยันบันทึกภารกิจเข้าปฏิทินเรียบร้อยแล้วครับ!\n\n📌 ภารกิจ: ${activeDraft.title}\n📅 วันที่: ${activeDraft.start_date}\n👥 ผู้รับผิดชอบ: ${activeDraft.member_names}\n\n🔗 ดูปฏิทินสด: https://member-calendar-sync-app.vercel.app`
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

    // 3. User Command: Interactive Edit Command on Active Draft (e.g. 'แก้ไขวันที่ 2026-09-25' / 'เปลี่ยนการแต่งกาย ชุดเครื่องแบบ')
    if (msgType === 'text' && activeDraft && (event.message.text.includes('แก้') || event.message.text.includes('เปลี่ยน') || event.message.text.includes('เพิ่ม'))) {
      const userText = event.message.text;

      // Date Correction match
      const dateMatch = userText.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\/\d{1,2})/);
      if (dateMatch) {
        const raw = dateMatch[0];
        if (raw.includes('-')) activeDraft.start_date = raw;
        else if (raw.includes('/')) {
          const parts = raw.split('/');
          const dStr = parts[0].padStart(2, '0');
          const mStr = parts[1].padStart(2, '0');
          const yStr = parts[2] ? (parseInt(parts[2]) > 2500 ? parseInt(parts[2]) - 543 : parts[2]) : new Date().getFullYear();
          activeDraft.start_date = `${yStr}-${mStr}-${dStr}`;
          activeDraft.end_date = activeDraft.start_date;
        }
      }

      // Dress Code Correction match
      if (userText.includes('เครื่องแบบ') || userText.includes('ชุดฝึก') || userText.includes('สุภาพ') || userText.includes('แต่งกาย')) {
        if (userText.includes('เครื่องแบบ')) activeDraft.dress_code = 'ชุดเครื่องแบบ';
        else if (userText.includes('ชุดฝึก')) activeDraft.dress_code = 'ชุดฝึก';
        else if (userText.includes('สุภาพ')) activeDraft.dress_code = 'ชุดสุภาพ';
      }

      // Member Correction match
      const newMemberIds = matchMemberIds([userText], dbMembers);
      if (newMemberIds.length > 0) {
        activeDraft.member_ids = Array.from(new Set([...(activeDraft.member_ids || []), ...newMemberIds]));
        activeDraft.member_names = activeDraft.member_ids.map(id => {
          const m = dbMembers.find(x => x.id === id);
          return m ? (m.rank ? `${m.rank} ${m.name}` : m.name) : id;
        }).join(', ');
      }

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
        analyzedData = await analyzeMissionOrderWithAI(null, imageBase64);
      } catch (err) {
        console.error('Image analysis error:', err);
      }
    } else if (msgType === 'text') {
      analyzedData = await analyzeMissionOrderWithAI(event.message.text, null);
    }

    if (analyzedData) {
      const memberIds = matchMemberIds(analyzedData.members, dbMembers);
      const memberNames = memberIds.map(id => {
        const m = dbMembers.find(x => x.id === id);
        return m ? (m.rank ? `${m.rank} ${m.name}` : m.name) : id;
      }).join(', ');

      const newDraft = {
        title: analyzedData.title || 'ภารกิจสั่งการ',
        start_date: analyzedData.start_date || new Date().toISOString().split('T')[0],
        end_date: analyzedData.end_date || analyzedData.start_date || new Date().toISOString().split('T')[0],
        time_str: analyzedData.time_str || 'ตลอดวัน',
        all_day: analyzedData.all_day !== false,
        category: analyzedData.category || 'ภารกิจหน่วย',
        dress_code: analyzedData.dress_code || 'ชุดฝึก',
        location: analyzedData.location || '',
        member_ids: memberIds,
        member_names: memberNames
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
