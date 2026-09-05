/**
 * ==============================================================================
 * Google Apps Script (GAS) Template for TimeTree-Style Calendar Web App
 * 
 * Features:
 * 1. Sync Supabase Events to Google Calendar automatically
 * 2. Sync Google Sheet Rows to Supabase Events
 * 3. Web App Endpoint (doGet) for iCal (.ics) Feed or Webhook
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// CONFIGURATION (Set your Supabase credentials here)
// ------------------------------------------------------------------------------
const SUPABASE_URL = "YOUR_SUPABASE_URL"; // e.g. "https://xxxx.supabase.co"
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const DEFAULT_GCAL_ID = "primary"; // Or specific calendar ID e.g. "xxxx@group.calendar.google.com"

/**
 * Helper function to call Supabase REST API
 */
function fetchSupabase(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    "Prefer": options.prefer || "return=representation"
  };

  const fetchOptions = {
    method: options.method || "GET",
    headers: headers,
    muteHttpExceptions: true
  };

  if (options.payload) {
    fetchOptions.payload = JSON.stringify(options.payload);
  }

  const response = UrlFetchApp.fetch(url, fetchOptions);
  return JSON.parse(response.getContentText());
}

/**
 * 1. SYNC SUPABASE EVENTS TO GOOGLE CALENDAR
 * Run this function manually or set a Time-Driven Trigger (every 15 mins)
 */
function syncSupabaseToGoogleCalendar() {
  Logger.log("Starting sync from Supabase to Google Calendar...");
  
  // Fetch events from Supabase
  const events = fetchSupabase("events?select=*");
  const calendar = CalendarApp.getCalendarById(DEFAULT_GCAL_ID);
  
  if (!calendar) {
    Logger.log("Error: Calendar not found for ID: " + DEFAULT_GCAL_ID);
    return;
  }

  events.forEach(function(evt) {
    const startTime = new Date(evt.start_time);
    const endTime = new Date(evt.end_time);
    
    // Check if event already exists in Google Calendar by search or title
    const existingEvents = calendar.getEvents(startTime, endTime, { search: evt.title });
    
    if (existingEvents.length === 0) {
      const description = `[Member Calendar App]\n${evt.description || ''}\nCategories: ${evt.category || ''}`;
      const newEvent = calendar.createEvent(evt.title, startTime, endTime, {
        description: description,
        location: evt.location || ''
      });
      
      // Set alarm reminder
      if (evt.alarm_minutes) {
        newEvent.addPopupReminder(evt.alarm_minutes);
      }
      
      Logger.log(`Created Google Calendar event: ${evt.title} (${startTime})`);
    } else {
      Logger.log(`Event already exists in Google Calendar: ${evt.title}`);
    }
  });
  
  Logger.log("Sync complete!");
}

/**
 * 2. EXPORT GOOGLE SHEET ROWS TO SUPABASE
 * Expects Sheet format: Title | Start Time (YYYY-MM-DD HH:mm) | End Time | Description | Location | Category | Member IDs (comma separated)
 */
function syncSheetToSupabase() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const title = row[0];
    const startTime = row[1];
    const endTime = row[2];
    const description = row[3];
    const location = row[4];
    const category = row[5] || 'General';
    const memberIdsRaw = row[6] || '';
    
    if (!title || !startTime) continue;
    
    const memberIds = memberIdsRaw ? memberIdsRaw.split(',').map(s => s.trim()) : [];
    const eventId = "evt_gas_" + new Date(startTime).getTime() + "_" + i;
    
    const payload = {
      id: eventId,
      title: title,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime || startTime).toISOString(),
      description: description,
      location: location,
      category: category,
      member_ids: memberIds,
      alarm_minutes: 15
    };
    
    fetchSupabase("events", {
      method: "POST",
      prefer: "resolution=merge-duplicates",
      payload: payload
    });
    
    Logger.log(`Uploaded row ${i} to Supabase: ${title}`);
  }
}

/**
 * 3. WEB APP HTTP GET ENDPOINT (doGet)
 * Can serve an iCal (.ics) stream directly from GAS!
 */
function doGet(e) {
  const memberId = e.parameter.memberId;
  const events = fetchSupabase("events?select=*");
  
  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Member Calendar Sync App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Member Calendar Feed"
  ];
  
  events.forEach(function(evt) {
    // Filter by memberId if specified
    if (memberId && evt.member_ids && !evt.member_ids.includes(memberId)) {
      return;
    }
    
    const startIso = formatDateToICS(new Date(evt.start_time));
    const endIso = formatDateToICS(new Date(evt.end_time));
    
    icsContent.push("BEGIN:VEVENT");
    icsContent.push("UID:" + evt.id + "@member-calendar-sync-app");
    icsContent.push("DTSTAMP:" + formatDateToICS(new Date()));
    icsContent.push("DTSTART:" + startIso);
    icsContent.push("DTEND:" + endIso);
    icsContent.push("SUMMARY:" + escapeICS(evt.title));
    if (evt.description) icsContent.push("DESCRIPTION:" + escapeICS(evt.description));
    if (evt.location) icsContent.push("LOCATION:" + escapeICS(evt.location));
    
    // Add Alarm Reminder
    icsContent.push("BEGIN:VALARM");
    icsContent.push("TRIGGER:-PT" + (evt.alarm_minutes || 15) + "M");
    icsContent.push("ACTION:DISPLAY");
    icsContent.push("DESCRIPTION:Reminder");
    icsContent.push("END:VALARM");
    
    icsContent.push("END:VEVENT");
  });
  
  icsContent.push("END:VCALENDAR");
  
  return ContentService.createTextOutput(icsContent.join("\r\n"))
    .setMimeType(ContentService.MimeType.TEXT);
}

function formatDateToICS(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICS(str) {
  return (str || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
