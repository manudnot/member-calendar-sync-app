/**
 * ==============================================================================
 * TimeTree-Style Team Member Calendar Web App - Client Engine
 * Real Calendar: งาน ส/21 (Extracted from TimeTree Web)
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// INITIAL STATE & REAL TIMETREE MEMBERS (8 MEMBERS EXTRACTED)
// ------------------------------------------------------------------------------
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0 - 11
let selectedDateStr = formatDateKey(new Date());
let activeMemberFilter = 'all';

let members = [
  { id: 'mem_woooddy', name: 'WoooddY', color: '#10B981', avatar: '🎖️', email: 'woooddy@unit21.com' },
  { id: 'mem_supanut', name: 'Supanut Tongnumwon', color: '#3B82F6', avatar: '👨‍✈️', email: 'supanut@unit21.com' },
  { id: 'mem_manudnot', name: 'manudnot', color: '#8B5CF6', avatar: '👨‍💻', email: 'manudnot@unit21.com' },
  { id: 'mem_june', name: 'June', color: '#EC4899', avatar: '👩‍💼', email: 'june@unit21.com' },
  { id: 'mem_thanatat', name: 'Thanatat Parnsaeng', color: '#F59E0B', avatar: '👨‍🔬', email: 'thanatat@unit21.com' },
  { id: 'mem_phak_ek', name: 'ผก.เอก', color: '#EF4444', avatar: '👮‍♂️', email: 'ek@unit21.com' },
  { id: 'mem_keng', name: 'มว.เก่ง', color: '#06B6D4', avatar: '👨‍✈️', email: 'keng@unit21.com' },
  { id: 'mem_tum', name: 'มว.ตั้ม', color: '#84CC16', avatar: '👨‍✈️', email: 'tum@unit21.com' }
];

let events = [
  { "id": "evt_tt_1", "title": "Open house All", "start_time": "2024-12-27T09:00:00Z", "end_time": "2024-12-27T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_woooddy", "mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_2", "title": "ตรวจพื้นที่ All บน.6 (ประชุม กฝร. 8:30 / SBAC 9:00)", "start_time": "2025-01-02T08:30:00Z", "end_time": "2025-01-02T16:00:00Z", "all_day": false, "color": "#ef4444", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_3", "title": "ประกาศรายชื่อจิตอาสา", "start_time": "2025-01-03T09:00:00Z", "end_time": "2025-01-03T17:00:00Z", "all_day": true, "color": "#795548", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_4", "title": "STAFFEX", "start_time": "2025-01-06T09:00:00Z", "end_time": "2025-01-10T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_manudnot", "mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_5", "title": "วันเด็ก", "start_time": "2025-01-09T08:00:00Z", "end_time": "2025-01-09T16:00:00Z", "all_day": true, "color": "#ec4899", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_6", "title": "สัมภาษณ์ จอส. รุ่น 8", "start_time": "2025-01-13T09:00:00Z", "end_time": "2025-01-18T17:00:00Z", "all_day": true, "color": "#12b886", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_7", "title": "CPX ท็อป ศยพ.ทอ.", "start_time": "2025-01-26T09:00:00Z", "end_time": "2025-01-30T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_supanut", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_8", "title": "หมาย รับปริญญาธรรมศาสตร์", "start_time": "2025-02-01T08:00:00Z", "end_time": "2025-02-01T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_9", "title": "การฝึกตาม รปจ.", "start_time": "2025-02-07T09:00:00Z", "end_time": "2025-02-11T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_keng"], "alarm_minutes": 15 },
  { "id": "evt_tt_10", "title": "อบรมก่อนฝึก CG", "start_time": "2025-02-10T09:00:00Z", "end_time": "2025-02-12T17:00:00Z", "all_day": true, "color": "#12b886", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_11", "title": "905 ม.ศิลปากร นครปฐม", "start_time": "2025-02-18T09:00:00Z", "end_time": "2025-02-20T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_12", "title": "Unit school / ภาคนอกที่ตั้ง", "start_time": "2025-03-01T09:00:00Z", "end_time": "2025-03-28T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_woooddy", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_13", "title": "กฝร.ห้วยภูมิภาค ระยอง", "start_time": "2025-03-12T09:00:00Z", "end_time": "2025-03-15T17:00:00Z", "all_day": true, "color": "#795548", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_14", "title": "เกณฑ์ทหาร", "start_time": "2025-04-01T08:00:00Z", "end_time": "2025-04-05T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_phak_ek", "mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_15", "title": "ฝึก พัน.ร.ผสม", "start_time": "2025-04-07T09:00:00Z", "end_time": "2025-04-10T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_keng"], "alarm_minutes": 15 },
  { "id": "evt_tt_16", "title": "สอบสัมภาษณ์ นดท.", "start_time": "2025-04-18T09:00:00Z", "end_time": "2025-04-23T17:00:00Z", "all_day": true, "color": "#12b886", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_17", "title": "ภารกิจ VVIP เสด็จฯ", "start_time": "2025-04-25T09:00:00Z", "end_time": "2025-04-28T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_18", "title": "หมาย 904", "start_time": "2025-05-01T09:00:00Z", "end_time": "2025-05-01T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_19", "title": "อบรม C4I บก.ทท.", "start_time": "2025-05-19T09:00:00Z", "end_time": "2025-05-24T17:00:00Z", "all_day": true, "color": "#12b886", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_20", "title": "ประชุม CPX ทน.1", "start_time": "2025-05-28T09:00:00Z", "end_time": "2025-05-30T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_21", "title": "กฝร.68", "start_time": "2025-06-04T09:00:00Z", "end_time": "2025-06-20T17:00:00Z", "all_day": true, "color": "#795548", "member_ids": ["mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_22", "title": "Workshop CPX&LOGEX", "start_time": "2025-06-25T09:00:00Z", "end_time": "2025-06-27T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_thanatat", "mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_23", "title": "INTEX จูน", "start_time": "2025-06-29T09:00:00Z", "end_time": "2025-06-30T17:00:00Z", "all_day": true, "color": "#12b886", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_24", "title": "INTEX จูน / นฝ. Open house", "start_time": "2025-07-01T09:00:00Z", "end_time": "2025-07-05T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_woooddy", "mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_25", "title": "CPX & LOGEX พี่ท็อป", "start_time": "2025-07-13T09:00:00Z", "end_time": "2025-07-18T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_26", "title": "วางพานพุ่ม 904", "start_time": "2025-07-28T09:00:00Z", "end_time": "2025-07-28T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_27", "title": "ตรวจสอบน้ำท่วม", "start_time": "2025-08-01T09:00:00Z", "end_time": "2025-08-01T17:00:00Z", "all_day": true, "color": "#12b886", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_28", "title": "128 ปี โรงเรียนนายร้อยพระจุลจอมเกล้า", "start_time": "2025-08-05T08:00:00Z", "end_time": "2025-08-05T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_29", "title": "RBC สระแก้ว", "start_time": "2025-08-20T09:00:00Z", "end_time": "2025-08-22T17:00:00Z", "all_day": true, "color": "#795548", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_30", "title": "ประชุมประจำเดือน / CCOC", "start_time": "2025-08-28T09:00:00Z", "end_time": "2025-08-29T17:00:00Z", "all_day": true, "color": "#8b5cf6", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_31", "title": "โทรหาผมหงอก", "start_time": "2025-09-02T09:00:00Z", "end_time": "2025-09-02T10:00:00Z", "all_day": false, "color": "#ec4899", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_32", "title": "1330 ซักซ้อม มุทิตาจิต", "start_time": "2025-09-18T13:30:00Z", "end_time": "2025-09-18T17:00:00Z", "all_day": false, "color": "#795548", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_80", "title": "ฝึก CALFLEX", "start_time": "2026-09-05T09:00:00Z", "end_time": "2026-09-08T17:00:00Z", "all_day": true, "color": "#3b82f6", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_81", "title": "1000 ประชุมหารือ การติดต่อสื่อสาร กกล.บูรพา และ ส.พัน.2", "start_time": "2026-09-09T10:00:00Z", "end_time": "2026-09-09T12:00:00Z", "all_day": false, "color": "#12b886", "member_ids": ["mem_supanut"], "location": "https://meet.google.com/cqp-hwsa-eet", "alarm_minutes": 15 },
  { "id": "evt_tt_82", "title": "จเร ทภ.1 ตรวจคุณภาพชีวิต", "start_time": "2026-09-10T09:00:00Z", "end_time": "2026-09-10T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_83", "title": "908 ครบ 100 วัน / หมาย 904 HMSV", "start_time": "2026-09-18T09:00:00Z", "end_time": "2026-09-19T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_84", "title": "หมาย 904 HMSV", "start_time": "2026-09-24T09:00:00Z", "end_time": "2026-09-25T17:00:00Z", "all_day": true, "color": "#ef4444", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 }
];

let supabaseClient = null;

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// Default Credentials for Live Supabase Integration
const DEFAULT_SUPABASE_URL = "https://aevutuguijjakfhulgjd.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_8LNKQLJ6snj6AvxPGf2TmA_Sm8KCbhU";

// DOM Elements
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const leftSidebar = document.getElementById('leftSidebar');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const todayBtn = document.getElementById('todayBtn');
const currentMonthYearEl = document.getElementById('currentMonthYear');
const calendarDaysGridEl = document.getElementById('calendarDaysGrid');
const memberFilterListEl = document.getElementById('memberFilterList');
const selectAllMembersBtn = document.getElementById('selectAllMembersBtn');

const tabMonthly = document.getElementById('tabMonthly');
const tabWeekly = document.getElementById('tabWeekly');

const selectedDateTitleEl = document.getElementById('selectedDateTitle');
const dailyEventListEl = document.getElementById('dailyEventList');
const quickAddDailyBtn = document.getElementById('quickAddDailyBtn');

const eventModal = document.getElementById('eventModal');
const openAddEventBtn = document.getElementById('openAddEventBtn');
const closeEventModalBtn = document.getElementById('closeEventModalBtn');
const cancelEventBtn = document.getElementById('cancelEventBtn');
const eventForm = document.getElementById('eventForm');
const formMemberSelectorEl = document.getElementById('formMemberSelector');
const formSelectAllMembersBtn = document.getElementById('formSelectAllMembersBtn');
const eventAllDayToggle = document.getElementById('eventAllDayToggle');
const eventStartTimeGroup = document.getElementById('eventStartTimeGroup');
const eventEndTimeGroup = document.getElementById('eventEndTimeGroup');
const colorPaletteGroup = document.getElementById('colorPaletteGroup');
const eventColorInput = document.getElementById('eventColor');

const icalModal = document.getElementById('icalModal');
const openIcalModalBtn = document.getElementById('openIcalModalBtn');
const closeIcalModalBtn = document.getElementById('closeIcalModalBtn');
const closeIcalDrawerBtn = document.getElementById('closeIcalDrawerBtn');
const icalMemberSelect = document.getElementById('icalMemberSelect');
const icalUrlInput = document.getElementById('icalUrlInput');
const copyIcalUrlBtn = document.getElementById('copyIcalUrlBtn');
const appleCalWebcalBtn = document.getElementById('appleCalWebcalBtn');
const googleCalSubscribeBtn = document.getElementById('googleCalSubscribeBtn');
const qrCodeImg = document.getElementById('qrCodeImg');

const rtMembersBtn = document.getElementById('rtMembersBtn');
const rtIcalBtn = document.getElementById('rtIcalBtn');
const rtAddBtn = document.getElementById('rtAddBtn');

document.addEventListener('DOMContentLoaded', async () => {
  initSupabaseIfConfigured();
  await loadDataFromSupabaseOrLocal();
  renderMemberSidebar();
  renderCalendarGrid();
  renderDailyAgenda(selectedDateStr);
  setupEventListeners();
  updateIcalModalUrl();
});

function initSupabaseIfConfigured() {
  const urlParams = new URLSearchParams(window.location.search);
  const supaUrl = urlParams.get('supaUrl') || localStorage.getItem('SUPABASE_URL') || DEFAULT_SUPABASE_URL;
  const supaKey = urlParams.get('supaKey') || localStorage.getItem('SUPABASE_ANON_KEY') || DEFAULT_SUPABASE_KEY;

  if (supaUrl && supaKey && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(supaUrl, supaKey);
      console.log('Connected to Supabase Client successfully!');
    } catch (e) {
      console.warn('Supabase initialization failed:', e);
    }
  }
}

async function loadDataFromSupabaseOrLocal() {
  if (supabaseClient) {
    try {
      const { data: supaMembers } = await supabaseClient.from('members').select('*');
      if (supaMembers && supaMembers.length > 0) members = supaMembers;

      const { data: supaEvents } = await supabaseClient.from('events').select('*');
      if (supaEvents && supaEvents.length > 0) events = supaEvents;
    } catch (err) {
      console.warn('Could not fetch from Supabase, using local state:', err);
    }
  }
}

function renderMemberSidebar() {
  memberFilterListEl.innerHTML = '';

  members.forEach(mem => {
    const item = document.createElement('div');
    const isChecked = activeMemberFilter === 'all' || activeMemberFilter === mem.id;
    item.className = `member-sidebar-item ${activeMemberFilter === mem.id ? 'active' : ''}`;

    item.innerHTML = `
      <div class="member-item-left">
        <span class="member-avatar-dot" style="background:${mem.color}">${mem.avatar}</span>
        <span class="member-name">${mem.name}</span>
      </div>
      <input type="checkbox" class="member-checkbox" ${isChecked ? 'checked' : ''}>
    `;

    item.addEventListener('click', (e) => {
      if (activeMemberFilter === mem.id) {
        activeMemberFilter = 'all';
      } else {
        activeMemberFilter = mem.id;
      }
      renderMemberSidebar();
      renderCalendarGrid();
      renderDailyAgenda(selectedDateStr);
    });

    memberFilterListEl.appendChild(item);
  });

  // Modal ical select
  icalMemberSelect.innerHTML = `<option value="team">👥 ลิงก์รวมกิจกรรมของทั้งทีม (All Team)</option>`;
  members.forEach(mem => {
    const opt = document.createElement('option');
    opt.value = mem.id;
    opt.textContent = `${mem.avatar} ${mem.name}`;
    icalMemberSelect.appendChild(opt);
  });

  // Event Form Checkboxes
  formMemberSelectorEl.innerHTML = '';
  members.forEach(mem => {
    const label = document.createElement('label');
    label.className = 'member-chip-checkbox';
    label.innerHTML = `
      <input type="checkbox" name="selectedMembers" value="${mem.id}">
      <span style="width:10px;height:10px;border-radius:50%;background:${mem.color}"></span>
      ${mem.avatar} ${mem.name}
    `;
    formMemberSelectorEl.appendChild(label);
  });
}

function renderCalendarGrid() {
  currentMonthYearEl.textContent = `${THAI_MONTHS[currentMonth]} ${currentYear + 543}`;
  calendarDaysGridEl.innerHTML = '';

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const todayStr = formatDateKey(new Date());

  // Days from previous month
  for (let i = firstDayIndex; i > 0; i--) {
    const dayNum = prevMonthDays - i + 1;
    const cell = document.createElement('div');
    cell.className = 'day-cell other-month';
    cell.innerHTML = `
      <div class="day-header-row">
        <span class="day-num">${dayNum}</span>
      </div>
    `;
    calendarDaysGridEl.appendChild(cell);
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(currentYear, currentMonth, day);
    const dateStr = formatDateKey(dateObj);
    const dayOfWeek = dateObj.getDay();

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (dayOfWeek === 0) cell.classList.add('sun');
    if (dayOfWeek === 6) cell.classList.add('sat');
    if (dateStr === todayStr) cell.classList.add('today');
    if (dateStr === selectedDateStr) cell.classList.add('selected');

    const dayEvents = getFilteredEventsForDate(dateStr);

    let eventsPillsHtml = '';
    if (dayEvents.length > 0) {
      eventsPillsHtml = `<div class="day-events-container">`;
      dayEvents.slice(0, 3).forEach(evt => {
        const mem = getMemberById(evt.member_ids ? evt.member_ids[0] : null);
        const evtColor = evt.color || (mem ? mem.color : '#12b886');
        const isAllDay = evt.all_day !== false; // Default true if omitted

        if (isAllDay) {
          // SOLID COLOR PILL FOR ALL-DAY EVENT (เต็มวัน)
          eventsPillsHtml += `
            <div class="event-pill all-day" style="background-color: ${evtColor}" onclick="event.stopPropagation(); openEditEventModal('${evt.id}')" title="${escapeHtml(evt.title)}">
              <span>${escapeHtml(evt.title)}</span>
            </div>
          `;
        } else {
          // FADED / LIGHT BACKGROUND PILL FOR TIMED EVENT (มีเวลา)
          const timeStr = formatTimeShort(evt.start_time);
          eventsPillsHtml += `
            <div class="event-pill timed" style="--event-color: ${evtColor}; --event-bg-light: ${hexToRgba(evtColor, 0.15)}" onclick="event.stopPropagation(); openEditEventModal('${evt.id}')" title="${timeStr} ${escapeHtml(evt.title)}">
              <span class="event-pill-time">${timeStr}</span>
              <span>${escapeHtml(evt.title)}</span>
            </div>
          `;
        }
      });
      if (dayEvents.length > 3) {
        eventsPillsHtml += `
          <div class="event-pill all-day" style="background:#868e96">
            <span>+${dayEvents.length - 3} งาน</span>
          </div>
        `;
      }
      eventsPillsHtml += `</div>`;
    }

    cell.innerHTML = `
      <div class="day-header-row">
        <span class="day-num">${day}</span>
      </div>
      ${eventsPillsHtml}
    `;

    cell.addEventListener('click', () => {
      selectedDateStr = dateStr;
      renderCalendarGrid();
      renderDailyAgenda(dateStr);
    });

    calendarDaysGridEl.appendChild(cell);
  }
}

function renderDailyAgenda(dateStr) {
  const d = new Date(dateStr);
  const formattedThaiDate = `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
  
  selectedDateTitleEl.textContent = `ตารางงานประจำวันที่ ${formattedThaiDate}`;
  dailyEventListEl.innerHTML = '';

  const dayEvents = getFilteredEventsForDate(dateStr);

  if (dayEvents.length === 0) {
    dailyEventListEl.innerHTML = `
      <div class="empty-agenda-text">
        <p>🎉 ไม่มีกิจกรรมในวันที่เลือก</p>
      </div>
    `;
    return;
  }

  dayEvents.forEach(evt => {
    const item = document.createElement('div');
    item.className = 'agenda-event-item';

    const mem = getMemberById(evt.member_ids ? evt.member_ids[0] : null);
    const evtColor = evt.color || (mem ? mem.color : '#12b886');
    item.style.borderLeftColor = evtColor;

    let memberBadgesHtml = '';
    if (Array.isArray(evt.member_ids)) {
      evt.member_ids.forEach(mId => {
        const m = getMemberById(mId);
        if (m) {
          memberBadgesHtml += `<span class="badge-pill" style="background:${m.color}">${m.avatar} ${m.name}</span>`;
        }
      });
    }

    const isAllDay = evt.all_day !== false;
    const timeDisplay = isAllDay ? '📌 ทั้งวัน (All-day)' : `⏰ ${formatTime(evt.start_time)} - ${formatTime(evt.end_time)}`;

    item.innerHTML = `
      <div class="agenda-event-left" onclick="openEditEventModal('${evt.id}')">
        <span class="agenda-event-title">${escapeHtml(evt.title)}</span>
        <div class="agenda-event-meta">
          <span>${timeDisplay}</span>
          ${evt.location ? `<span>📍 ${escapeHtml(evt.location)}</span>` : ''}
          ${evt.url ? `<span>🔗 <a href="${escapeHtml(evt.url)}" target="_blank" onclick="event.stopPropagation()">ลิงก์</a></span>` : ''}
          <div class="agenda-member-badges">${memberBadgesHtml}</div>
        </div>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="today-chip-btn" onclick="event.stopPropagation(); openEditEventModal('${evt.id}')">✏️ แก้ไข</button>
        <button class="today-chip-btn" style="color:#e03131; border-color:#far" onclick="event.stopPropagation(); deleteEvent('${evt.id}')">ลบ</button>
      </div>
    `;

    dailyEventListEl.appendChild(item);
  });
}

function setupEventListeners() {
  toggleSidebarBtn.addEventListener('click', () => {
    leftSidebar.classList.toggle('collapsed');
  });

  selectAllMembersBtn.addEventListener('click', () => {
    activeMemberFilter = 'all';
    renderMemberSidebar();
    renderCalendarGrid();
    renderDailyAgenda(selectedDateStr);
  });

  prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendarGrid();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendarGrid();
  });

  todayBtn.addEventListener('click', () => {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    selectedDateStr = formatDateKey(now);
    renderCalendarGrid();
    renderDailyAgenda(selectedDateStr);
  });

  tabMonthly.addEventListener('click', () => {
    tabMonthly.classList.add('active');
    tabWeekly.classList.remove('active');
  });

  tabWeekly.addEventListener('click', () => {
    tabWeekly.classList.add('active');
    tabMonthly.classList.remove('active');
  });

  openAddEventBtn.addEventListener('click', () => openAddEventModalForDate(selectedDateStr));
  quickAddDailyBtn.addEventListener('click', () => openAddEventModalForDate(selectedDateStr));

  closeEventModalBtn.addEventListener('click', closeEventModal);
  cancelEventBtn.addEventListener('click', closeEventModal);

  // All-day Toggle Listener
  eventAllDayToggle.addEventListener('change', () => {
    if (eventAllDayToggle.checked) {
      eventStartTimeGroup.classList.add('hidden');
      eventEndTimeGroup.classList.add('hidden');
    } else {
      eventStartTimeGroup.classList.remove('hidden');
      eventEndTimeGroup.classList.remove('hidden');
    }
  });

  // Select All Members in Form
  formSelectAllMembersBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('input[name="selectedMembers"]');
    checkboxes.forEach(cb => cb.checked = true);
  });

  // Color Palette Selector Listener
  colorPaletteGroup.querySelectorAll('.color-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      colorPaletteGroup.querySelectorAll('.color-option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      eventColorInput.value = btn.dataset.color;
    });
  });

  eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveEventFromForm();
  });

  openIcalModalBtn.addEventListener('click', () => {
    updateIcalModalUrl();
    icalModal.classList.remove('hidden');
  });

  closeIcalModalBtn.addEventListener('click', () => icalModal.classList.add('hidden'));
  closeIcalDrawerBtn.addEventListener('click', () => icalModal.classList.add('hidden'));

  icalMemberSelect.addEventListener('change', updateIcalModalUrl);

  copyIcalUrlBtn.addEventListener('click', () => {
    icalUrlInput.select();
    navigator.clipboard.writeText(icalUrlInput.value);
    alert('✅ คัดลอกลิงก์ iCal Subscription เรียบร้อยแล้ว! สามารถนำไป Paste ใน Apple Calendar / Google Calendar ได้เลย');
  });

  // Right toolbar handlers
  rtMembersBtn.addEventListener('click', () => leftSidebar.classList.toggle('collapsed'));
  rtIcalBtn.addEventListener('click', () => {
    updateIcalModalUrl();
    icalModal.classList.remove('hidden');
  });
  rtAddBtn.addEventListener('click', () => openAddEventModalForDate(selectedDateStr));
}

function openAddEventModalForDate(dateStr) {
  document.getElementById('eventId').value = '';
  document.getElementById('eventTitle').value = '';
  document.getElementById('eventStartDate').value = dateStr;
  document.getElementById('eventEndDate').value = dateStr;
  document.getElementById('eventStartTime').value = '09:00';
  document.getElementById('eventEndTime').value = '10:00';
  document.getElementById('eventLocation').value = '';
  document.getElementById('eventUrl').value = '';
  document.getElementById('eventDescription').value = '';
  document.getElementById('eventRepeat').value = 'none';

  eventAllDayToggle.checked = true;
  eventStartTimeGroup.classList.add('hidden');
  eventEndTimeGroup.classList.add('hidden');

  // Default color Emerald
  eventColorInput.value = '#12b886';
  colorPaletteGroup.querySelectorAll('.color-option-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.color === '#12b886');
  });

  const checkboxes = document.querySelectorAll('input[name="selectedMembers"]');
  checkboxes.forEach(cb => {
    cb.checked = (activeMemberFilter !== 'all' && cb.value === activeMemberFilter) || cb.value === 'mem_woooddy';
  });

  eventModal.classList.remove('hidden');
}

function openEditEventModal(eventId) {
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  document.getElementById('eventId').value = evt.id;
  document.getElementById('eventTitle').value = evt.title || '';

  const startDateKey = formatDateKey(new Date(evt.start_time));
  const endDateKey = evt.end_time ? formatDateKey(new Date(evt.end_time)) : startDateKey;
  
  document.getElementById('eventStartDate').value = startDateKey;
  document.getElementById('eventEndDate').value = endDateKey;

  const isAllDay = evt.all_day !== false;
  eventAllDayToggle.checked = isAllDay;

  if (isAllDay) {
    eventStartTimeGroup.classList.add('hidden');
    eventEndTimeGroup.classList.add('hidden');
  } else {
    eventStartTimeGroup.classList.remove('hidden');
    eventEndTimeGroup.classList.remove('hidden');
    document.getElementById('eventStartTime').value = formatTimeRaw(evt.start_time);
    document.getElementById('eventEndTime').value = formatTimeRaw(evt.end_time);
  }

  const evtColor = evt.color || '#12b886';
  eventColorInput.value = evtColor;
  colorPaletteGroup.querySelectorAll('.color-option-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.color === evtColor);
  });

  document.getElementById('eventRepeat').value = evt.repeat || 'none';
  document.getElementById('eventAlarm').value = evt.alarm_minutes || 15;
  document.getElementById('eventLocation').value = evt.location || '';
  document.getElementById('eventUrl').value = evt.url || '';
  document.getElementById('eventDescription').value = evt.description || '';

  const checkboxes = document.querySelectorAll('input[name="selectedMembers"]');
  checkboxes.forEach(cb => {
    cb.checked = Array.isArray(evt.member_ids) && evt.member_ids.includes(cb.value);
  });

  eventModal.classList.remove('hidden');
}

function closeEventModal() {
  eventModal.classList.add('hidden');
}

async function saveEventFromForm() {
  const eventId = document.getElementById('eventId').value;
  const title = document.getElementById('eventTitle').value;
  const startDate = document.getElementById('eventStartDate').value;
  const endDate = document.getElementById('eventEndDate').value;
  const isAllDay = eventAllDayToggle.checked;
  
  let startTime = '09:00';
  let endTime = '10:00';

  if (!isAllDay) {
    startTime = document.getElementById('eventStartTime').value || '09:00';
    endTime = document.getElementById('eventEndTime').value || '10:00';
  }

  const color = eventColorInput.value || '#12b886';
  const repeat = document.getElementById('eventRepeat').value;
  const alarmMins = parseInt(document.getElementById('eventAlarm').value, 10);
  const location = document.getElementById('eventLocation').value;
  const url = document.getElementById('eventUrl').value;
  const description = document.getElementById('eventDescription').value;

  const selectedMembers = [];
  document.querySelectorAll('input[name="selectedMembers"]:checked').forEach(cb => {
    selectedMembers.push(cb.value);
  });

  if (selectedMembers.length === 0) {
    alert('กรุณาเลือกสมาชิกอย่างน้อย 1 คน');
    return;
  }

  const startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
  const endIso = new Date(`${endDate}T${endTime}:00`).toISOString();

  const eventPayload = {
    id: eventId || `evt_${Date.now()}`,
    title: title,
    start_time: startIso,
    end_time: endIso,
    all_day: isAllDay,
    color: color,
    repeat: repeat,
    alarm_minutes: alarmMins,
    location: location,
    url: url,
    description: description,
    member_ids: selectedMembers
  };

  if (eventId) {
    // UPDATE EXISTING EVENT
    const idx = events.findIndex(e => e.id === eventId);
    if (idx !== -1) events[idx] = eventPayload;

    if (supabaseClient) {
      try {
        await supabaseClient.from('events').update(eventPayload).eq('id', eventId);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }
  } else {
    // INSERT NEW EVENT
    events.push(eventPayload);

    if (supabaseClient) {
      try {
        await supabaseClient.from('events').insert([eventPayload]);
      } catch (err) {
        console.warn('Supabase insert warning:', err);
      }
    }
  }

  closeEventModal();
  renderCalendarGrid();
  renderDailyAgenda(selectedDateStr);
}

async function deleteEvent(eventId) {
  if (!confirm('คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?')) return;

  events = events.filter(e => e.id !== eventId);

  if (supabaseClient) {
    try {
      await supabaseClient.from('events').delete().eq('id', eventId);
    } catch (err) {
      console.warn('Supabase delete warning:', err);
    }
  }

  renderCalendarGrid();
  renderDailyAgenda(selectedDateStr);
}

function updateIcalModalUrl() {
  const selected = icalMemberSelect.value;
  const baseUrl = window.location.origin;
  
  let feedUrl = '';
  if (selected === 'team') {
    feedUrl = `${baseUrl}/api/feed?team=true`;
  } else {
    feedUrl = `${baseUrl}/api/feed?memberId=${selected}`;
  }

  icalUrlInput.value = feedUrl;

  const webcalUrl = feedUrl.replace(/^https?:\/\//, 'webcal://');
  appleCalWebcalBtn.href = webcalUrl;

  const googleSubscribeUrl = `https://calendar.google.com/calendar/r/settings/addcalendar?cid=${encodeURIComponent(feedUrl)}`;
  googleCalSubscribeBtn.href = googleSubscribeUrl;

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(feedUrl)}`;
  qrCodeImg.src = qrApiUrl;
}

function formatDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

function formatTimeRaw(isoStr) {
  if (!isoStr) return '09:00';
  const date = new Date(isoStr);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatTimeShort(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function getFilteredEventsForDate(dateStr) {
  return events.filter(evt => {
    const evtDateStr = formatDateKey(new Date(evt.start_time));
    if (evtDateStr !== dateStr) return false;

    if (activeMemberFilter === 'all') return true;

    if (Array.isArray(evt.member_ids)) {
      return evt.member_ids.includes(activeMemberFilter);
    }
    return false;
  });
}

function getMemberById(memberId) {
  return members.find(m => m.id === memberId);
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(18, 184, 134, ${alpha})`;
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
