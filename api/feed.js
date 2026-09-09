import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aevutuguijjakfhulgjd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8LNKQLJ6snj6AvxPGf2TmA_Sm8KCbhU';

const SAMPLE_MEMBERS = [
  { id: 'mem_manudnot', name: 'Not' },
  { id: 'mem_third', name: 'Third' },
  { id: 'mem_june', name: 'June' },
  { id: 'mem_thanatat', name: 'Top' },
  { id: 'mem_phak_ek', name: 'เอก' },
  { id: 'mem_keng', name: 'เก่ง' },
  { id: 'mem_tum', name: 'ตั้ม' },
  { id: 'mem_woooddy', name: 'Champ' },
  { id: 'mem_wm', name: 'เวรหมาย' }
];

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

function formatDateOnly(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
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
    const { data: eventsData } = await supabase.from('events').select('*').eq('is_deleted', false);
    
    if (eventsData && eventsData.length > 0) {
      events = eventsData;
    }

    if (memberId) {
      const { data: memberData } = await supabase.from('members').select('name, member_type').eq('id', memberId).single();
      if (memberData) {
        if (memberData.member_type === 'virtual') {
          const emptyIcs = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Member Calendar Sync App//EN',
            `X-WR-CALNAME:${escapeIcsText(memberData.name || 'Virtual Member')} Subscription Disabled`,
            'END:VCALENDAR'
          ].join('\r\n');
          return res.status(200).send(emptyIcs);
        }
        if (memberData.name) memberName = memberData.name;
      } else {
        const found = SAMPLE_MEMBERS.find(m => m.id === memberId);
        if (found) memberName = found.name;
      }
    }

    // Filter events for specific member if not all-team feed
    if (memberId && (team !== 'true' && team !== '1')) {
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
        return mIds.includes(memberId);
      });
    }

    const calTitle = (memberId && (team !== 'true' && team !== '1'))
      ? `ปฏิทินคุณ ${memberName}`
      : 'ปฏิทินรวมภารกิจ';

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
      
      const isAllDay = evt.all_day === true || 
        (startDate.getUTCHours() === 9 && startDate.getUTCMinutes() === 0 && endDate.getUTCHours() === 17 && endDate.getUTCMinutes() === 0);

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${evt.id || 'evt_' + Math.random().toString(36).substring(2, 9)}@member-calendar-sync-app.vercel.app`);
      lines.push(`DTSTAMP:${nowIso}`);

      if (isAllDay) {
        lines.push(`DTSTART;VALUE=DATE:${formatDateOnly(startDate)}`);
        // For all-day events in RFC 5545, DTEND is exclusive (next day)
        const nextDay = new Date(endDate.getTime() + 86400000);
        lines.push(`DTEND;VALUE=DATE:${formatDateOnly(nextDay)}`);
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

      if (evt.location && evt.location.trim()) {
        lines.push(foldLine(`LOCATION:${escapeIcsText(evt.location.trim())}`));
      }

      // Add VALARM push notification trigger
      const alarmMins = evt.alarm_minutes || 15;
      const triggerStr = getTriggerString(alarmMins);

      lines.push('BEGIN:VALARM');
      lines.push(`TRIGGER:${triggerStr}`);
      lines.push('ACTION:DISPLAY');
      lines.push(foldLine(`DESCRIPTION:Reminder: ${escapeIcsText(evt.title || 'Event')}`));
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
