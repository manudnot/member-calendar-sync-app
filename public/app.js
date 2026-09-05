/**
 * ==============================================================================
 * TimeTree-Style Team Member Calendar Web App - Client Engine
 * Real Calendar: งาน ส/21 (Extracted from TimeTree Web)
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// INITIAL STATE & REAL TIMETREE MEMBERS (8 MEMBERS EXRACTED)
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
  { id: 'mem_phak_ek', 'name': 'ผก.เอก', color: '#EF4444', avatar: '👮‍♂️', email: 'ek@unit21.com' },
  { id: 'mem_keng', name: 'มว.เก่ง', color: '#06B6D4', avatar: '👨‍✈️', email: 'keng@unit21.com' },
  { id: 'mem_tum', name: 'มว.ตั้ม', color: '#84CC16', avatar: '👨‍✈️', email: 'tum@unit21.com' }
];

// Pre-loaded events with exact colors and member assignments from 27/12/2024 onwards
let events = [
  { "id": "evt_tt_1", "title": "Open house All", "start_time": "2024-12-27T09:00:00Z", "end_time": "2024-12-27T17:00:00Z", "category": "Open House (Purple)", "member_ids": ["mem_woooddy", "mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_2", "title": "ตรวจพื้นที่ All บน.6 (ประชุม กฝร. 8:30 / SBAC 9:00)", "start_time": "2025-01-02T08:30:00Z", "end_time": "2025-01-02T16:00:00Z", "category": "ตรวจพื้นที่ (Red)", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_3", "title": "ประกาศรายชื่อจิตอาสา", "start_time": "2025-01-03T09:00:00Z", "end_time": "2025-01-03T17:00:00Z", "category": "จิตอาสา (Brown)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_4", "title": "STAFFEX", "start_time": "2025-01-06T09:00:00Z", "end_time": "2025-01-10T17:00:00Z", "category": "ฝึกศึกษา (Blue)", "member_ids": ["mem_manudnot", "mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_5", "title": "วันเด็ก", "start_time": "2025-01-09T08:00:00Z", "end_time": "2025-01-09T16:00:00Z", "category": "กิจกรรมพิเศษ (Pink)", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_6", "title": "สัมภาษณ์ จอส. รุ่น 8", "start_time": "2025-01-13T09:00:00Z", "end_time": "2025-01-18T17:00:00Z", "category": "คัดเลือก (Emerald)", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_7", "title": "CPX ท็อป ศยพ.ทอ.", "start_time": "2025-01-26T09:00:00Z", "end_time": "2025-01-30T17:00:00Z", "category": "CPX (Purple)", "member_ids": ["mem_supanut", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_8", "title": "หมาย รับปริญญาธรรมศาสตร์", "start_time": "2025-02-01T08:00:00Z", "end_time": "2025-02-01T17:00:00Z", "category": "ภารกิจหมาย (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_9", "title": "การฝึกตาม รปจ.", "start_time": "2025-02-07T09:00:00Z", "end_time": "2025-02-11T17:00:00Z", "category": "ฝึกศึกษา (Blue)", "member_ids": ["mem_keng"], "alarm_minutes": 15 },
  { "id": "evt_tt_10", "title": "อบรมก่อนฝึก CG", "start_time": "2025-02-10T09:00:00Z", "end_time": "2025-02-12T17:00:00Z", "category": "อบรม (Emerald)", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_11", "title": "905 ม.ศิลปากร นครปฐม", "start_time": "2025-02-18T09:00:00Z", "end_time": "2025-02-20T17:00:00Z", "category": "ภารกิจหมาย (Red)", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_12", "title": "Unit school / ภาคนอกที่ตั้ง", "start_time": "2025-03-01T09:00:00Z", "end_time": "2025-03-28T17:00:00Z", "category": "Unit School (Blue)", "member_ids": ["mem_woooddy", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_13", "title": "กฝร.ห้วยภูมิภาค ระยอง", "start_time": "2025-03-12T09:00:00Z", "end_time": "2025-03-15T17:00:00Z", "category": "กฝร. (Brown)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_14", "title": "เกณฑ์ทหาร", "start_time": "2025-04-01T08:00:00Z", "end_time": "2025-04-05T17:00:00Z", "category": "ภารกิจพิเศษ (Purple)", "member_ids": ["mem_phak_ek", "mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_15", "title": "ฝึก พัน.ร.ผสม", "start_time": "2025-04-07T09:00:00Z", "end_time": "2025-04-10T17:00:00Z", "category": "การฝึก (Blue)", "member_ids": ["mem_keng"], "alarm_minutes": 15 },
  { "id": "evt_tt_16", "title": "สอบสัมภาษณ์ นดท.", "start_time": "2025-04-18T09:00:00Z", "end_time": "2025-04-23T17:00:00Z", "category": "สอบ (Emerald)", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_17", "title": "ภารกิจ VVIP เสด็จฯ", "start_time": "2025-04-25T09:00:00Z", "end_time": "2025-04-28T17:00:00Z", "category": "ภารกิจสำคัญ (Red)", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_18", "title": "หมาย 904", "start_time": "2025-05-01T09:00:00Z", "end_time": "2025-05-01T17:00:00Z", "category": "ภารกิจหมาย (Red)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_19", "title": "อบรม C4I บก.ทท.", "start_time": "2025-05-19T09:00:00Z", "end_time": "2025-05-24T17:00:00Z", "category": "อบรม (Emerald)", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_20", "title": "ประชุม CPX ทน.1", "start_time": "2025-05-28T09:00:00Z", "end_time": "2025-05-30T17:00:00Z", "category": "ประชุม (Purple)", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_21", "title": "กฝร.68", "start_time": "2025-06-04T09:00:00Z", "end_time": "2025-06-20T17:00:00Z", "category": "กฝร. (Brown)", "member_ids": ["mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_22", "title": "Workshop CPX&LOGEX", "start_time": "2025-06-25T09:00:00Z", "end_time": "2025-06-27T17:00:00Z", "category": "Workshop (Blue)", "member_ids": ["mem_thanatat", "mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_23", "title": "INTEX จูน", "start_time": "2025-06-29T09:00:00Z", "end_time": "2025-06-30T17:00:00Z", "category": "INTEX (Emerald)", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_24", "title": "INTEX จูน / นฝ. Open house", "start_time": "2025-07-01T09:00:00Z", "end_time": "2025-07-05T17:00:00Z", "category": "Open House (Purple)", "member_ids": ["mem_woooddy", "mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_25", "title": "CPX & LOGEX พี่ท็อป", "start_time": "2025-07-13T09:00:00Z", "end_time": "2025-07-18T17:00:00Z", "category": "CPX (Blue)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_26", "title": "วางพานพุ่ม 904", "start_time": "2025-07-28T09:00:00Z", "end_time": "2025-07-28T17:00:00Z", "category": "ภารกิจพิธี (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_27", "title": "ตรวจสอบน้ำท่วม", "start_time": "2025-08-01T09:00:00Z", "end_time": "2025-08-01T17:00:00Z", "category": "ช่วยเหลือประชาชน (Emerald)", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_28", "title": "128 ปี โรงเรียนนายร้อยพระจุลจอมเกล้า", "start_time": "2025-08-05T08:00:00Z", "end_time": "2025-08-05T17:00:00Z", "category": "พิธีการ (Red)", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_29", "title": "RBC สระแก้ว", "start_time": "2025-08-20T09:00:00Z", "end_time": "2025-08-22T17:00:00Z", "category": "RBC (Brown)", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_30", "title": "ประชุมประจำเดือน / CCOC", "start_time": "2025-08-28T09:00:00Z", "end_time": "2025-08-29T17:00:00Z", "category": "ประชุม (Purple)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_31", "title": "โทรหาผมหงอก", "start_time": "2025-09-02T09:00:00Z", "end_time": "2025-09-02T10:00:00Z", "category": "ส่วนตัว (Pink)", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_32", "title": "1330 ซักซ้อม มุทิตาจิต", "start_time": "2025-09-18T13:30:00Z", "end_time": "2025-09-18T17:00:00Z", "category": "ซักซ้อม (Brown)", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_33", "title": "ซ้อมย่อย/ซ้อมใหญ่รับส่งหน้าที่ มหน.1", "start_time": "2025-09-25T09:00:00Z", "end_time": "2025-09-26T17:00:00Z", "category": "รับส่งหน้าที่ (Red)", "member_ids": ["mem_phak_ek", "mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_34", "title": "รับส่งหน้าที่ มหน.1", "start_time": "2025-10-01T09:00:00Z", "end_time": "2025-10-01T17:00:00Z", "category": "รับส่งหน้าที่ (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_35", "title": "หมาย 905 / หมาย 919", "start_time": "2025-10-09T09:00:00Z", "end_time": "2025-10-10T17:00:00Z", "category": "ภารกิจหมาย (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_36", "title": "พระบรมมหาราชวัง (19.00 น.)", "start_time": "2025-10-27T19:00:00Z", "end_time": "2025-11-01T21:00:00Z", "category": "ภารกิจวัง (Red)", "member_ids": ["mem_woooddy", "mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_37", "title": "ติดตั้ง vtc หอประชุม ท.", "start_time": "2025-11-05T09:00:00Z", "end_time": "2025-11-05T17:00:00Z", "category": "การสื่อสาร (Emerald)", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_38", "title": "งานแต่ง💕 เจ 22", "start_time": "2025-11-09T17:00:00Z", "end_time": "2025-11-09T22:00:00Z", "category": "งานสังคม (Pink)", "member_ids": ["mem_june", "mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_39", "title": "รอง จก.ยศ. ตรวจหน่วย", "start_time": "2025-11-18T09:00:00Z", "end_time": "2025-11-18T17:00:00Z", "category": "ตรวจหน่วย (Purple)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_40", "title": "Big cleaning", "start_time": "2025-11-26T09:00:00Z", "end_time": "2025-11-26T17:00:00Z", "category": "ทำความสะอาด (Blue)", "member_ids": ["mem_woooddy", "mem_keng"], "alarm_minutes": 15 },
  { "id": "evt_tt_41", "title": "ต่อใบขับขี่", "start_time": "2025-12-01T09:00:00Z", "end_time": "2025-12-01T12:00:00Z", "category": "ส่วนตัว (Pink)", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_42", "title": "งานนาเดีย", "start_time": "2025-12-12T09:00:00Z", "end_time": "2025-12-13T17:00:00Z", "category": "งานสังคม (Pink)", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_43", "title": "สวนสนาม ส/1", "start_time": "2025-12-22T08:00:00Z", "end_time": "2025-12-26T17:00:00Z", "category": "สวนสนาม (Red)", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_44", "title": "วันเด็ก", "start_time": "2026-01-09T08:00:00Z", "end_time": "2026-01-09T16:00:00Z", "category": "กิจกรรมพิเศษ (Pink)", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_45", "title": "สัมภาษณ์ จอส. รุ่น 8", "start_time": "2026-01-13T09:00:00Z", "end_time": "2026-01-13T17:00:00Z", "category": "คัดเลือก (Emerald)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_46", "title": "อบรมประวัติศาสตร์ ค่ายพระราม 6", "start_time": "2026-01-19T09:00:00Z", "end_time": "2026-01-19T17:00:00Z", "category": "อบรม (Brown)", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_47", "title": "ฝึก กฝร staffex กองพล", "start_time": "2026-01-26T09:00:00Z", "end_time": "2026-01-30T17:00:00Z", "category": "การฝึก (Blue)", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_48", "title": "การบำเพ็ญพระราชกุศลถวายพระพร", "start_time": "2026-02-01T09:00:00Z", "end_time": "2026-02-01T17:00:00Z", "category": "พิธีการ (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_49", "title": "ฝึก staffex กรม กองพัน", "start_time": "2026-02-02T09:00:00Z", "end_time": "2026-02-06T17:00:00Z", "category": "การฝึก (Blue)", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_50", "title": "อบรมก่อนฝึก CG", "start_time": "2026-02-10T09:00:00Z", "end_time": "2026-02-12T17:00:00Z", "category": "อบรม (Emerald)", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_51", "title": "905 ม.ศิลปากร นครปฐม", "start_time": "2026-02-18T09:00:00Z", "end_time": "2026-02-20T17:00:00Z", "category": "ภารกิจหมาย (Red)", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_52", "title": "สนับสนุนสื่อสาร จอส.รุ่น 8", "start_time": "2026-03-09T09:00:00Z", "end_time": "2026-03-21T17:00:00Z", "category": "สื่อสาร (Emerald)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_53", "title": "Unit school", "start_time": "2026-03-17T09:00:00Z", "end_time": "2026-03-18T17:00:00Z", "category": "Unit School (Blue)", "member_ids": ["mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_54", "title": "ภาคกองพัน", "start_time": "2026-03-23T09:00:00Z", "end_time": "2026-03-23T17:00:00Z", "category": "การฝึก (Blue)", "member_ids": ["mem_keng"], "alarm_minutes": 15 },
  { "id": "evt_tt_55", "title": "สนับสนุนการฝึกแผนป้องกันเขต", "start_time": "2026-03-28T09:00:00Z", "end_time": "2026-03-28T17:00:00Z", "category": "แผนป้องกัน (Purple)", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_56", "title": "นฝ. เปิดหน่วยฝึก", "start_time": "2026-04-01T09:00:00Z", "end_time": "2026-04-03T17:00:00Z", "category": "เปิดหน่วยฝึก (Purple)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_57", "title": "สอบสัมภาษณ์ นดท.", "start_time": "2026-04-17T09:00:00Z", "end_time": "2026-04-20T17:00:00Z", "category": "สอบ (Emerald)", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_58", "title": "ตรวจสอบครูทหารใหม่", "start_time": "2026-04-27T09:00:00Z", "end_time": "2026-04-27T17:00:00Z", "category": "ตรวจหน่วย (Purple)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_59", "title": "นฝ. นดร.12 นิเทศก์อบรม", "start_time": "2026-04-29T09:00:00Z", "end_time": "2026-04-30T17:00:00Z", "category": "นิเทศ (Brown)", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_60", "title": "พิธีถวายราชฯ วันฉัตรมงคล", "start_time": "2026-05-01T09:00:00Z", "end_time": "2026-05-01T17:00:00Z", "category": "พิธีการ (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_61", "title": "ซ้อมตรวจ สดน.", "start_time": "2026-05-06T09:00:00Z", "end_time": "2026-05-06T17:00:00Z", "category": "ซักซ้อม (Brown)", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_62", "title": "นิเทศโรคลมร้อน", "start_time": "2026-05-19T09:00:00Z", "end_time": "2026-05-19T17:00:00Z", "category": "นิเทศ (Emerald)", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_63", "title": "ตรวจเอกสารสนามยิงปืน", "start_time": "2026-05-28T09:00:00Z", "end_time": "2026-05-29T17:00:00Z", "category": "ตรวจเอกสาร (Purple)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_64", "title": "กฝร.พดท.69 ภาคสนาม ภูมิภาค มทบ.12", "start_time": "2026-06-06T09:00:00Z", "end_time": "2026-06-13T17:00:00Z", "category": "กฝร. (Brown)", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_65", "title": "จเร ทภ.1 ตรวจคุณภาพชีวิต", "start_time": "2026-06-17T09:00:00Z", "end_time": "2026-06-19T17:00:00Z", "category": "จเรตรวจ (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_66", "title": "ทหารใหม่ฝึกช่างไม้ ดุสิต", "start_time": "2026-06-20T09:00:00Z", "end_time": "2026-06-29T17:00:00Z", "category": "การฝึก (Blue)", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_67", "title": "Open house", "start_time": "2026-07-03T09:00:00Z", "end_time": "2026-07-03T17:00:00Z", "category": "Open House (Purple)", "member_ids": ["mem_june"], "alarm_minutes": 15 },
  { "id": "evt_tt_68", "title": "สอบ กพ.", "start_time": "2026-07-05T08:00:00Z", "end_time": "2026-07-05T17:00:00Z", "category": "สอบ (Emerald)", "member_ids": ["mem_thanatat"], "alarm_minutes": 15 },
  { "id": "evt_tt_69", "title": "หมอมาทำฟัน", "start_time": "2026-07-14T09:00:00Z", "end_time": "2026-07-16T17:00:00Z", "category": "สวัสดิการ (Pink)", "member_ids": ["mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_70", "title": "ตักบาตร ถวายราชสีกก", "start_time": "2026-07-24T07:00:00Z", "end_time": "2026-07-24T12:00:00Z", "category": "พิธีการ (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_71", "title": "วางพานพุ่ม สนามหลวง", "start_time": "2026-07-28T08:00:00Z", "end_time": "2026-07-28T17:00:00Z", "category": "พิธีการ (Red)", "member_ids": ["mem_phak_ek", "mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_72", "title": "908 ครบ 50 วัน", "start_time": "2026-07-30T09:00:00Z", "end_time": "2026-07-30T17:00:00Z", "category": "ภารกิจหมาย (Red)", "member_ids": ["mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_73", "title": "หมาย 904 HMSV", "start_time": "2026-08-01T09:00:00Z", "end_time": "2026-08-01T17:00:00Z", "category": "ภารกิจหมาย (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_74", "title": "ทดสอบร่างกาย", "start_time": "2026-08-05T07:30:00Z", "end_time": "2026-08-05T12:00:00Z", "category": "ทดสอบ (Blue)", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_75", "title": "เตรียม 2", "start_time": "2026-08-10T09:00:00Z", "end_time": "2026-08-10T17:00:00Z", "category": "เตรียมการ (Purple)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_76", "title": "ถวายราชสีกการะ 908", "start_time": "2026-08-11T09:00:00Z", "end_time": "2026-08-11T17:00:00Z", "category": "พิธีการ (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_77", "title": "รับตรวจ จเร ทบ. / ประชุม กยก.ทภ.1", "start_time": "2026-08-19T09:00:00Z", "end_time": "2026-08-19T17:00:00Z", "category": "จเรตรวจ (Red)", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_78", "title": "ประชุม พระบรมศพ", "start_time": "2026-08-21T09:00:00Z", "end_time": "2026-08-21T17:00:00Z", "category": "ประชุม (Red)", "member_ids": ["mem_supanut"], "alarm_minutes": 15 },
  { "id": "evt_tt_79", "title": "Party 01", "start_time": "2026-08-26T18:00:00Z", "end_time": "2026-08-26T21:00:00Z", "category": "Party (Pink)", "member_ids": ["mem_thanatat", "mem_supanut", "mem_manudnot"], "alarm_minutes": 15 },
  { "id": "evt_tt_80", "title": "ฝึก CALFLEX", "start_time": "2026-09-05T09:00:00Z", "end_time": "2026-09-08T17:00:00Z", "category": "การฝึก (Blue)", "member_ids": ["mem_keng", "mem_tum"], "alarm_minutes": 15 },
  { "id": "evt_tt_81", "title": "1000 ประชุมหารือ การติดต่อสื่อสาร กกล.บูรพา และ ส.พัน.2", "start_time": "2026-09-09T10:00:00Z", "end_time": "2026-09-09T12:00:00Z", "category": "ประชุมสื่อสาร (Emerald)", "member_ids": ["mem_supanut"], "location": "https://meet.google.com/cqp-hwsa-eet", "alarm_minutes": 15 },
  { "id": "evt_tt_82", "title": "จเร ทภ.1 ตรวจคุณภาพชีวิต", "start_time": "2026-09-10T09:00:00Z", "end_time": "2026-09-10T17:00:00Z", "category": "จเรตรวจ (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 },
  { "id": "evt_tt_83", "title": "908 ครบ 100 วัน / หมาย 904 HMSV", "start_time": "2026-09-18T09:00:00Z", "end_time": "2026-09-19T17:00:00Z", "category": "ภารกิจหมาย (Red)", "member_ids": ["mem_phak_ek", "mem_woooddy"], "alarm_minutes": 15 },
  { "id": "evt_tt_84", "title": "หมาย 904 HMSV", "start_time": "2026-09-24T09:00:00Z", "end_time": "2026-09-25T17:00:00Z", "category": "ภารกิจหมาย (Red)", "member_ids": ["mem_phak_ek"], "alarm_minutes": 15 }
];

let supabaseClient = null;

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// DOM Elements
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const todayBtn = document.getElementById('todayBtn');
const currentMonthYearEl = document.getElementById('currentMonthYear');
const calendarDaysGridEl = document.getElementById('calendarDaysGrid');
const memberFilterListEl = document.getElementById('memberFilterList');

const selectedDateTitleEl = document.getElementById('selectedDateTitle');
const selectedDateSubtitleEl = document.getElementById('selectedDateSubtitle');
const dailyEventListEl = document.getElementById('dailyEventList');
const quickAddDailyBtn = document.getElementById('quickAddDailyBtn');

const eventModal = document.getElementById('eventModal');
const openAddEventBtn = document.getElementById('openAddEventBtn');
const closeEventModalBtn = document.getElementById('closeEventModalBtn');
const cancelEventBtn = document.getElementById('cancelEventBtn');
const eventForm = document.getElementById('eventForm');
const formMemberSelectorEl = document.getElementById('formMemberSelector');

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

const mobileFabBtn = document.getElementById('mobileFabBtn');

document.addEventListener('DOMContentLoaded', async () => {
  initSupabaseIfConfigured();
  await loadDataFromSupabaseOrLocal();
  renderMemberFilters();
  renderCalendarGrid();
  renderDailyAgenda(selectedDateStr);
  setupEventListeners();
  updateIcalModalUrl();
});

function initSupabaseIfConfigured() {
  const urlParams = new URLSearchParams(window.location.search);
  const supaUrl = urlParams.get('supaUrl') || localStorage.getItem('SUPABASE_URL');
  const supaKey = urlParams.get('supaKey') || localStorage.getItem('SUPABASE_ANON_KEY');

  if (supaUrl && supaKey && window.supabase) {
    supabaseClient = window.supabase.createClient(supaUrl, supaKey);
    console.log('Connected to Supabase Client successfully!');
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

function renderMemberFilters() {
  memberFilterListEl.innerHTML = '';

  const allChip = document.createElement('div');
  allChip.className = `member-chip ${activeMemberFilter === 'all' ? 'active' : ''}`;
  allChip.innerHTML = `<span class="member-dot" style="background:#3b82f6"></span> 👥 ทั้งหมด <span class="check-mark">✓</span>`;
  allChip.addEventListener('click', () => {
    activeMemberFilter = 'all';
    renderMemberFilters();
    renderCalendarGrid();
    renderDailyAgenda(selectedDateStr);
  });
  memberFilterListEl.appendChild(allChip);

  members.forEach(mem => {
    const chip = document.createElement('div');
    chip.className = `member-chip ${activeMemberFilter === mem.id ? 'active' : ''}`;
    chip.innerHTML = `<span class="member-dot" style="background:${mem.color}"></span> ${mem.avatar} ${mem.name} <span class="check-mark">✓</span>`;
    chip.addEventListener('click', () => {
      activeMemberFilter = mem.id;
      renderMemberFilters();
      renderCalendarGrid();
      renderDailyAgenda(selectedDateStr);
    });
    memberFilterListEl.appendChild(chip);
  });

  icalMemberSelect.innerHTML = `<option value="team">👥 ลิงก์รวมกิจกรรมของทั้งทีม (All Team)</option>`;
  members.forEach(mem => {
    const opt = document.createElement('option');
    opt.value = mem.id;
    opt.textContent = `${mem.avatar} ${mem.name}`;
    icalMemberSelect.appendChild(opt);
  });

  formMemberSelectorEl.innerHTML = '';
  members.forEach(mem => {
    const label = document.createElement('label');
    label.className = 'checkbox-member-label';
    label.innerHTML = `
      <input type="checkbox" name="selectedMembers" value="${mem.id}">
      <span class="member-dot" style="background:${mem.color}"></span>
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

  for (let i = firstDayIndex; i > 0; i--) {
    const dayNum = prevMonthDays - i + 1;
    const cell = document.createElement('div');
    cell.className = 'day-cell other-month';
    cell.innerHTML = `<span class="day-number">${dayNum}</span>`;
    calendarDaysGridEl.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(currentYear, currentMonth, day);
    const dateStr = formatDateKey(dateObj);

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (dateStr === todayStr) cell.classList.add('today');
    if (dateStr === selectedDateStr) cell.classList.add('selected');

    const dayEvents = getFilteredEventsForDate(dateStr);

    let dotsHtml = '';
    if (dayEvents.length > 0) {
      dotsHtml = `<div class="day-event-dots">`;
      dayEvents.slice(0, 3).forEach(evt => {
        const mem = getMemberById(evt.member_ids ? evt.member_ids[0] : null);
        const bgColor = mem ? mem.color : '#3b82f6';
        dotsHtml += `<div class="event-dot-item" style="background:${bgColor}">${escapeHtml(evt.title)}</div>`;
      });
      if (dayEvents.length > 3) {
        dotsHtml += `<div class="event-dot-item" style="background:#475569">+${dayEvents.length - 3} งาน</div>`;
      }
      dotsHtml += `</div>`;
    }

    cell.innerHTML = `
      <span class="day-number">${day}</span>
      ${dotsHtml}
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
  selectedDateSubtitleEl.textContent = activeMemberFilter === 'all' 
    ? 'แสดงกิจกรรมของสมาชิกทุกคน' 
    : `แสดงเฉพาะกิจกรรมของ ${getMemberById(activeMemberFilter)?.name || ''}`;

  dailyEventListEl.innerHTML = '';
  const dayEvents = getFilteredEventsForDate(dateStr);

  if (dayEvents.length === 0) {
    dailyEventListEl.innerHTML = `
      <div class="no-events-box">
        <p>🎉 ไม่มีกิจกรรมในวันที่เลือก</p>
        <button class="btn-sm btn-outline" style="margin-top:8px" onclick="openAddEventModalForDate('${dateStr}')">+ เพิ่มกิจกรรมใหม่</button>
      </div>
    `;
    return;
  }

  dayEvents.forEach(evt => {
    const card = document.createElement('div');
    card.className = 'event-card';

    const firstMember = getMemberById(evt.member_ids ? evt.member_ids[0] : null);
    if (firstMember) {
      card.style.borderLeftColor = firstMember.color;
    }

    let memberBadgesHtml = '';
    if (Array.isArray(evt.member_ids)) {
      evt.member_ids.forEach(mId => {
        const m = getMemberById(mId);
        if (m) {
          memberBadgesHtml += `<span class="event-member-badge" style="background:${m.color}">${m.avatar} ${m.name}</span>`;
        }
      });
    }

    const startTimeFormatted = formatTime(evt.start_time);
    const endTimeFormatted = formatTime(evt.end_time);

    card.innerHTML = `
      <div class="event-card-header">
        <span class="event-card-title">${escapeHtml(evt.title)}</span>
        <span class="event-card-category">${escapeHtml(evt.category || 'General')}</span>
      </div>
      <div class="event-card-time">⏰ ${startTimeFormatted} - ${endTimeFormatted}</div>
      <div class="event-card-members">${memberBadgesHtml}</div>
      ${evt.location ? `<div class="event-card-location">📍 ${escapeHtml(evt.location)}</div>` : ''}
      ${evt.description ? `<div class="event-card-desc">📝 ${escapeHtml(evt.description)}</div>` : ''}
      <div class="event-card-actions">
        <button class="event-action-btn delete" onclick="deleteEvent('${evt.id}')">🗑️ ลบ</button>
      </div>
    `;

    dailyEventListEl.appendChild(card);
  });
}

function setupEventListeners() {
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

  openAddEventBtn.addEventListener('click', () => openAddEventModalForDate(selectedDateStr));
  quickAddDailyBtn.addEventListener('click', () => openAddEventModalForDate(selectedDateStr));
  mobileFabBtn.addEventListener('click', () => openAddEventModalForDate(selectedDateStr));

  closeEventModalBtn.addEventListener('click', closeEventModal);
  cancelEventBtn.addEventListener('click', closeEventModal);

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
}

function openAddEventModalForDate(dateStr) {
  document.getElementById('eventId').value = '';
  document.getElementById('eventTitle').value = '';
  document.getElementById('eventStartDate').value = dateStr;
  document.getElementById('eventEndDate').value = dateStr;
  document.getElementById('eventStartTime').value = '09:00';
  document.getElementById('eventEndTime').value = '10:00';
  document.getElementById('eventLocation').value = '';
  document.getElementById('eventDescription').value = '';

  const checkboxes = document.querySelectorAll('input[name="selectedMembers"]');
  checkboxes.forEach(cb => {
    cb.checked = (activeMemberFilter !== 'all' && cb.value === activeMemberFilter) || cb.value === 'mem_woooddy';
  });

  eventModal.classList.remove('hidden');
}

function closeEventModal() {
  eventModal.classList.add('hidden');
}

async function saveEventFromForm() {
  const title = document.getElementById('eventTitle').value;
  const startDate = document.getElementById('eventStartDate').value;
  const startTime = document.getElementById('eventStartTime').value;
  const endDate = document.getElementById('eventEndDate').value;
  const endTime = document.getElementById('eventEndTime').value;
  const category = document.getElementById('eventCategory').value;
  const alarmMins = parseInt(document.getElementById('eventAlarm').value, 10);
  const location = document.getElementById('eventLocation').value;
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

  const newEvent = {
    id: `evt_${Date.now()}`,
    title: title,
    start_time: startIso,
    end_time: endIso,
    category: category,
    alarm_minutes: alarmMins,
    location: location,
    description: description,
    member_ids: selectedMembers
  };

  events.push(newEvent);

  if (supabaseClient) {
    try {
      await supabaseClient.from('events').insert([newEvent]);
    } catch (err) {
      console.warn('Supabase insert warning:', err);
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
