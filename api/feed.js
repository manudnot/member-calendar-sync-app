import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aevutuguijjakfhulgjd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8LNKQLJ6snj6AvxPGf2TmA_Sm8KCbhU';



function foldLine(line) {
  if (line.length <= 75) return line;
  let result = '';
  let current = line;
  while (current.length > 75) {
    result += current.substring(0, 75) + '\r\n ';
    current = current.substring(75);
  }
  return result + current;
}

function escapeIcsText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function formatDateUtc(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function getBkkDateStr(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return null;
  
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);

  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  return `${y}${m}${day}`;
}

function getBkkNextDayStr(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return null;
  const next = new Date(d.getTime() + 86400000);
  return getBkkDateStr(next.toISOString());
}

function checkIsAllDay(evt) {
  if (!evt) return true;
  if (evt.all_day === true) return true;
  if (evt.all_day === false) return false;

  if (evt.start_time && evt.end_time) {
    const s = new Date(evt.start_time);
    const e = new Date(evt.end_time);
    const diffMs = e.getTime() - s.getTime();
    
    if (diffMs >= 12 * 3600 * 1000) {
      const sMin = s.getUTCMinutes();
      const eMin = e.getUTCMinutes();
      if ((sMin === 0 || sMin === 59) && (eMin === 0 || eMin === 59)) {
        return true;
      }
    }
  }
  return false;
}

function getTriggerString(alarmMins) {
  const mins = Number(alarmMins) || 15;
  if (mins >= 1440 && mins % 1440 === 0) {
    const days = mins / 1440;
    return `-P${days}D`;
  }
  if (mins >= 60 && mins % 60 === 0) {
    const hours = mins / 60;
    return `-PT${hours}H`;
  }
  return `-PT${mins}M`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="calendar-feed.ics"');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { memberId, team } = req.query || {};
  let events = [];
  let memberName = 'Team';

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: eventsData, error: eventsErr } = await supabase.from('events').select('*');
    
    if (!eventsErr && eventsData && eventsData.length > 0) {
      events = eventsData;
    } else {
      events = [];
    }

    // Fetch all members dynamically from Supabase
    const { data: allMembersData } = await supabase.from('members').select('*');
    const allMembers = allMembersData || [];

    let currentMember = null;
    if (memberId) {
      currentMember = allMembers.find(m => m.id === memberId);
      if (currentMember) {
        if (currentMember.member_type === 'virtual') {
          const emptyIcs = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Member Calendar Sync App//EN',
            `X-WR-CALNAME:Sig21 ${escapeIcsText(currentMember.name || 'Virtual Member')} Subscription Disabled`,
            'END:VCALENDAR'
          ].join('\r\n');
          return res.status(200).send(emptyIcs);
        }
        if (currentMember.name) memberName = currentMember.name;
      }
    }

    // Filter events for specific member if not all-team feed
    if (memberId && (team !== 'true' && team !== '1')) {
      const searchKeywords = [];
      if (currentMember && currentMember.name) {
        searchKeywords.push(currentMember.name.toLowerCase());
      }
      if (memberId === 'mem_manudnot') searchKeywords.push('น็อต', 'นอต', 'not');
      if (memberId === 'mem_third') searchKeywords.push('ท็อป', 'third');
      if (memberId === 'mem_june') searchKeywords.push('จูน', 'june');
      if (memberId === 'mem_thanatat') searchKeywords.push('พี่ท็อป', 'top');
      if (memberId === 'mem_phak_ek') searchKeywords.push('เอก', 'ผก.เอก');
      if (memberId === 'mem_keng') searchKeywords.push('เก่ง');
      if (memberId === 'mem_tum') searchKeywords.push('ตั้ม');
      if (memberId === 'mem_woooddy') searchKeywords.push('แชมป์', 'champ');

      events = events.filter(evt => {
        let mIds = [];
        if (Array.isArray(evt.member_ids)) {
          mIds = evt.member_ids;
        } else if (typeof evt.member_ids === 'string') {
          try {
            const parsed = JSON.parse(evt.member_ids);
            if (Array.isArray(parsed)) mIds = parsed;
            else mIds = [evt.member_ids];
          } catch (e) {
            mIds = [evt.member_ids];
          }
        }

        if (mIds.includes(memberId)) return true;

        if (searchKeywords.length > 0) {
          const text = `${evt.title || ''} ${evt.description || ''}`.toLowerCase();
          return searchKeywords.some(kw => text.includes(kw));
        }

        return false;
      });
    }

    const calTitle = (memberId && (team !== 'true' && team !== '1'))
      ? `Sig21 ${memberName}`
      : 'Sig21 รวมภารกิจ';

    // Build iCal Stream Lines
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Member Calendar Sync App//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      foldLine(`X-WR-CALNAME:${escapeIcsText(calTitle)}`),
      'X-WR-TIMEZONE:Asia/Bangkok',
      'X-PUBLISHED-TTL:PT1H',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H'
    ];

    const nowIso = formatDateUtc(new Date());

    events.forEach(evt => {
      const startDate = evt.start_time ? new Date(evt.start_time) : new Date();
      const endDate = evt.end_time ? new Date(evt.end_time) : new Date(startDate.getTime() + 3600000);
      
      const isAllDay = checkIsAllDay(evt);

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${evt.id || 'evt_' + Math.random().toString(36).substring(2, 9)}@member-calendar-sync-app.vercel.app`);
      lines.push(`DTSTAMP:${nowIso}`);

      if (isAllDay) {
        const startStr = getBkkDateStr(evt.start_time);
        const nextDayStr = getBkkNextDayStr(evt.end_time || evt.start_time);
        lines.push(`DTSTART;VALUE=DATE:${startStr}`);
        lines.push(`DTEND;VALUE=DATE:${nextDayStr}`);
      } else {
        lines.push(`DTSTART:${formatDateUtc(startDate)}`);
        lines.push(`DTEND:${formatDateUtc(endDate)}`);
      }

      lines.push(foldLine(`SUMMARY:${escapeIcsText(evt.title || 'Untitled Event')}`));

      let desc = evt.description || '';
      if (evt.category) {
        desc = `[${evt.category}] ${desc}`;
      }
      if (evt.url) {
        desc += `\\nURL: ${evt.url}`;
      }
      if (desc.trim()) {
        lines.push(foldLine(`DESCRIPTION:${escapeIcsText(desc.trim())}`));
      }

      if (evt.url && evt.url.trim()) {
        lines.push(foldLine(`URL:${escapeIcsText(evt.url.trim())}`));
      }

      if (evt.location && evt.location.trim()) {
        lines.push(foldLine(`LOCATION:${escapeIcsText(evt.location.trim())}`));
      }

      // Add VALARM push notification trigger
      const alarmMins = evt.alarm_minutes || 15;
      const triggerStr = getTriggerString(alarmMins);

      lines.push('BEGIN:VALARM');
      lines.push(`TRIGGER:${triggerStr}`);
      lines.push('ACTION:DISPLAY');
      lines.push(foldLine(`DESCRIPTION:แจ้งเตือน: ${escapeIcsText(evt.title || 'ภารกิจ')}`));
      lines.push('END:VALARM');

      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n');
    return res.status(200).send(icsContent);

  } catch (err) {
    console.error('Serverless function feed error:', err);
    return res.status(500).send(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Error//EN\r\nX-WR-CALNAME:Error\r\nEND:VCALENDAR`);
  }
}
