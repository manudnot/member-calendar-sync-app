/**
 * ==============================================================================
 * TimeTree Data Importer to Supabase (JSON, CSV & ICS Parser)
 * 
 * Usage:
 *   node scripts/import_timetree.js scripts/timetree_extracted_events.json
 *   node scripts/import_timetree.js /path/to/timetree-export.csv
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  // Supabase package optional
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const filePath = process.argv[2] || path.join(__dirname, 'timetree_extracted_events.json');

if (!fs.existsSync(filePath)) {
  console.log(`❌ Error: File not found at ${filePath}`);
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath, 'utf-8');
const ext = path.extname(filePath).toLowerCase();

let parsedEvents = [];

if (ext === '.json') {
  parsedEvents = JSON.parse(fileContent);
} else if (ext === '.csv') {
  parsedEvents = parseTimeTreeCSV(fileContent);
} else if (ext === '.ics') {
  parsedEvents = parseTimeTreeICS(fileContent);
}

console.log(`\n🎉 Successfully loaded ${parsedEvents.length} TimeTree events from ${path.basename(filePath)}!`);
console.log('Sample parsed event:', JSON.stringify(parsedEvents[0], null, 2));

// If Supabase credentials exist and client is loaded, insert to database
if (createClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  (async () => {
    console.log('\n🚀 Uploading events to Supabase database...');
    const { data, error } = await supabase.from('events').upsert(parsedEvents);
    if (error) {
      console.error('❌ Error uploading to Supabase:', error);
    } else {
      console.log('🎉 Successfully imported all events to Supabase!');
    }
  })();
}

function parseTimeTreeCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) return [];

  const events = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 2) continue;

    events.push({
      id: `evt_tt_${Date.now()}_${i}`,
      title: cols[0] || 'Untitled TimeTree Event',
      start_time: new Date(`${cols[1]} ${cols[2] || '09:00'}`).toISOString(),
      end_time: new Date(`${cols[3] || cols[1]} ${cols[4] || '10:00'}`).toISOString(),
      description: cols[5] || '',
      location: cols[6] || '',
      category: 'TimeTree Import',
      member_ids: ['mem_somchai'],
      alarm_minutes: 15
    });
  }
  return events;
}

function parseTimeTreeICS(icsText) {
  const events = [];
  const vevents = icsText.split('BEGIN:VEVENT');

  for (let i = 1; i < vevents.length; i++) {
    const block = vevents[i].split('END:VEVENT')[0];
    const summaryMatch = block.match(/SUMMARY:(.*)/);
    const dtstartMatch = block.match(/DTSTART:(.*)/);

    if (summaryMatch) {
      events.push({
        id: `evt_tt_ics_${Date.now()}_${i}`,
        title: summaryMatch[1].trim(),
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        category: 'TimeTree Import',
        member_ids: ['mem_somchai'],
        alarm_minutes: 15
      });
    }
  }
  return events;
}
