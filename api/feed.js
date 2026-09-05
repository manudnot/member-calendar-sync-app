const { createClient } = require('@supabase/supabase-js');
const ics = require('ics');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Pre-loaded extracted TimeTree events
let SAMPLE_EVENTS = [];
try {
  const jsonPath = path.join(__dirname, '../scripts/timetree_extracted_events.json');
  if (fs.existsSync(jsonPath)) {
    SAMPLE_EVENTS = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not load timetree_extracted_events.json fallback');
}

const SAMPLE_MEMBERS = [
  { id: 'mem_woooddy', name: 'WoooddY', color: '#10B981', avatar: '🎖️', email: 'woooddy@unit21.com' },
  { id: 'mem_supanut', name: 'Supanut Tongnumwon', color: '#3B82F6', avatar: '👨‍✈️', email: 'supanut@unit21.com' },
  { id: 'mem_manudnot', name: 'manudnot', color: '#8B5CF6', avatar: '👨‍💻', email: 'manudnot@unit21.com' },
  { id: 'mem_june', name: 'June', color: '#EC4899', avatar: '👩‍💼', email: 'june@unit21.com' },
  { id: 'mem_thanatat', name: 'Thanatat Parnsaeng', color: '#F59E0B', avatar: '👨‍🔬', email: 'thanatat@unit21.com' },
  { id: 'mem_phak_ek', name: 'ผก.เอก', color: '#EF4444', avatar: '👮‍♂️', email: 'ek@unit21.com' },
  { id: 'mem_keng', name: 'มว.เก่ง', color: '#06B6D4', avatar: '👨‍✈️', email: 'keng@unit21.com' },
  { id: 'mem_tum', name: 'มว.ตั้ม', color: '#84CC16', avatar: '👨‍✈️', email: 'tum@unit21.com' }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="calendar-feed.ics"');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { memberId, team } = req.query;
  let events = [];
  let memberName = 'Team';

  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await supabase.from('events').select('*');
      
      if (!error && data && data.length > 0) {
        events = data;
      } else {
        events = SAMPLE_EVENTS;
      }

      if (memberId) {
        const { data: memberData } = await supabase.from('members').select('name').eq('id', memberId).single();
        if (memberData) memberName = memberData.name;
      }
    } else {
      events = SAMPLE_EVENTS;
      if (memberId) {
        const found = SAMPLE_MEMBERS.find(m => m.id === memberId);
        if (found) memberName = found.name;
      }
    }

    if (memberId && !team) {
      events = events.filter(evt => {
        if (Array.isArray(evt.member_ids)) {
          return evt.member_ids.includes(memberId);
        }
        if (typeof evt.member_ids === 'string') {
          return evt.member_ids.includes(memberId);
        }
        return false;
      });
    }

    const icsEvents = events.map(evt => {
      const start = new Date(evt.start_time);
      const end = new Date(evt.end_time);
      const alarmMins = evt.alarm_minutes || 15;

      return {
        id: evt.id || `evt_${Math.random().toString(36).substr(2, 9)}`,
        title: evt.title || 'Untitled Event',
        description: `${evt.description || ''}\nCategory: ${evt.category || 'General'}`,
        location: evt.location || '',
        start: [start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes()],
        end: [end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes()],
        alarms: [
          {
            action: 'display',
            description: `Reminder: ${evt.title}`,
            trigger: { minutes: alarmMins, before: true }
          }
        ]
      };
    });

    if (icsEvents.length === 0) {
      const emptyIcs = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Member Calendar Sync App//EN',
        `X-WR-CALNAME:${memberName} Schedule`,
        'END:VCALENDAR'
      ].join('\r\n');
      return res.status(200).send(emptyIcs);
    }

    const { error, value } = ics.createEvents(icsEvents, {
      calName: `${memberName} Calendar Feed`
    });

    if (error) {
      console.error('ICS generation error:', error);
      return res.status(500).send('Error generating iCal feed');
    }

    return res.status(200).send(value);

  } catch (err) {
    console.error('Serverless function error:', err);
    return res.status(500).send('Internal Server Error');
  }
};
