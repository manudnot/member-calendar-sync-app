# Development Session Log & Architecture History

## 📅 Session Log: 2026-09-07

### Version 3.4 - Enhanced Member Name & Color Customization UX
- **Preset Color Palette & Custom Picker**: Added 10 vibrant preset color swatches (Emerald, Teal, Blue, Indigo, Purple, Pink, Red, Amber, Lime, Slate) + native color picker with checkmark active indicator.
- **Live Avatar Preview**: Displays instant 2-letter Initials avatar preview in the edit form as the user types member name or changes color.
- **Sidebar Quick Edit**: Added quick edit button (`Edit3`) directly inside the Left Sidebar member list to allow instant editing without opening full management drawer.
- **Git Commit**: `1e57a2a` pushed to `manudnot/member-calendar-sync-app` main branch.
- **Verification**: `npm run build` succeeded in 2.18s (1642 modules transformed).

### Version 3.5 - Removed Sidebar Member Event Count Badge
- **Clean UI Cleanup**: Removed the event count badge (`<span>{count}</span>`) from the sidebar member selection items as requested.
- **Git Commit**: `43e7740` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 3.6 - Toggle Select All / Deselect All Members
- **Interactive Toggle**: Updated sidebar member filter button to toggle between "เลือกทั้งหมด" (Select All) and "ยกเลิกเลือกทั้งหมด" (Deselect All) dynamically.
- **Git Commit**: `6895225` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 3.7 - Strict Layout & Duty-Roster Spec Alignment
- **Removed Sidebar Edit Button**: Removed edit button from Left Sidebar as editing members is strictly managed via the Right Toolbar Member Management drawer (`👥`).
- **Removed Modal Visibility Switch**: Removed duplicate toggle switches from `MemberManagementModal.jsx` so opening/closing member event visibility is handled exclusively via the Left Sidebar checkboxes.
- **Git Commit**: `2810255` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 3.8 - F5 Page Refresh Persistence Fix (LocalStorage + Supabase Upsert)
- **Instant LocalStorage Persistence**: Initialized state and saved member/event CRUD mutations directly to `localStorage` (`member_calendar_members` and `member_calendar_events`) so edited names & colors survive F5 refreshes instantly.
- **Supabase Upsert Sync**: Replaced `.update()` with `.upsert()` for both members and events to guarantee database rows are created or updated automatically on cloud sync.
- **Git Commit**: `8b6d791` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 3.9 - Permanent Fix for F5 Overwrite (Client-First LocalStorage Sync)
- **Root Cause Fix**: Identified that initial `useEffect` fetch from Supabase was unconditionally overwriting `localStorage` with old database rows on page reload (F5).
- **Client-First Sync**: Updated `fetchData()` on mount to check if `localStorage` contains user edits. If so, it preserves local edits (`Champ`, custom colors) and pushes them to Supabase via `.upsert(localMembers)`, preventing any reset upon F5.
- **Git Commit**: `1c53164` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 4.0 - Soft Delete / Member Resignation Mode
- **Soft Delete Action**: Added `UserX` (แจ้งลาออก - Soft Delete) button in `MemberManagementModal.jsx` to archive members without wiping historic task records (`is_archived: true`).
- **Daily Agenda Historical Display**: Rendered soft-deleted members on historical tasks in `DailyAgenda.jsx` with an explicit `(ลาออก)` badge.
- **Future Selection Filtering**: Filtered out soft-deleted members from `Sidebar.jsx` and `MissionModal.jsx` so resigned members cannot be assigned to future events.
- **Restore Capability**: Added `UserCheck` (คืนสภาพสมาชิก) action in `MemberManagementModal.jsx` to easily un-archive members.
- **Git Commit**: `e7ef4f0` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 4.1 - Sorted Member List (Active Top, Resigned Bottom)
- **Member Order Sorting**: Implemented automatic sorting in `MemberManagementModal.jsx` to place active members at the top and soft-deleted/resigned members at the bottom while strictly maintaining their original addition order within each group.
- **Git Commit**: `536cbf4` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 4.2 - Dynamic Repeat Options & Multiple Notifications Management
- **Dynamic Date Labels**: Implemented `getRepeatOptionsForDate` to dynamically generate day-specific options (*Saturday each week*, *1st Saturday each month*, *Every month on the 5*) based on event start date.
- **Custom Repeat Panel**: Integrated Custom Repeat sub-panel for custom interval (repeat every N day/week/month/year) and custom end conditions (*Never*, *On Date*, *After N Occurrences*).
- **Multiple Notifications Triggers**: Added support for adding multiple notification reminders (`+ Add notification`) with custom values and unit selectors (*min before*, *hour before*, *day before*, *week before*).
- **Git Commit**: `a3cac21` pushed to `manudnot/member-calendar-sync-app` main branch.
- **Verification**: `npm run build` completed cleanly in 1.76s.

### Version 4.3 - Full Historical Events Import (545 Events from Dec 2024 to 2026)
- **Supabase Database Wipe & Batch Import**: Cleared demo/test events in Supabase `events` table and imported all **545 historical events** parsed from `his.txt`.
- **Strict Category & Member Rules**:
  - 🔴 **ภารกิจหมาย (`Red - #EF4444`)**: 162 events assigned to virtual member **"เวรหมาย" (`mem_wm`)**.
  - 🟣 **งานหน่วย (`Purple - #8B5CF6`)**: 124 unit events with `member_ids: []`.
  - 🟢 **ประชุม (`Emerald - #10B981`)**: 152 meeting events with `member_ids: []`.
  - 🟤 **การฝึก (`Brown - #795548`)**: 64 training events with `member_ids: []`.
  - 💗 **กิจกรรมพิเศษ (`Pink - #EC4899`)**: 30 special activity events with `member_ids: []`.
  - 🟡 **ภารกิจหน่วย (`Yellow - #F59E0B`)**: 13 unit mission events with `member_ids: []`.
- **UI Visibility & Color Engine**: Enhanced `getEventColor` helper and calendar filtering so unassigned team tasks (`member_ids: []`) render correctly across MonthGrid and DailyAgenda views.

### Version 4.4 - Fixed ReferenceError handleOpenMemberManagementModal
- **Root Cause Fix**: Resolved runtime exception in `FirstTimeUserModal.jsx` where prop `onOpenMemberManagement` referenced an undefined function identifier `handleOpenMemberManagementModal`.
- **Inline Modal Handler**: Replaced missing reference in `App.jsx` with `() => { setMemberToEdit(null); setIsMemberManagementOpen(true); }`.
- **Git Commit**: `931b007` pushed to `manudnot/member-calendar-sync-app` main branch for immediate Vercel auto-deployment.

### Version 4.5 - Database Wipe & Full Clean Historical Dataset Import
- **Database Wipe & Batch Upsert**: Wiped old events in Supabase PostgreSQL and imported all 579 clean parsed events.
- **Enhanced Accuracy Features**:
  - **Multi-alarm Triggers**: Parsed exact notification triggers (`1 day before` = 1,440 mins, multi-trigger arrays `[10, 120]`).
  - **Dedicated Meeting URLs**: Extracted Google Meet (`meet.google.com`) and Zoom (`zoom.us`) meeting links directly into dedicated `url` field and descriptions.
  - **Clean Titles**: Stripped system log prefixes (`Title updated`, `Date updated`, `URL updated`) and address line overflow.
- **Git Commit**: `b46c5d3` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 4.6 - Exact AM/PM Start & End Times Parsing (305 Timed Events)
- **Time Parsing Engine**: Parsed specific AM/PM timestamps (e.g. `10:00AM` - `12:00PM`, `8:30AM` - `4:00PM`) for **305 timed events** out of 579, flagging `all_day: false` and converting `start_time` / `end_time` to exact ISO timestamps.
- **All-Day Event Separation**: Preserved `all_day: true` for the 274 pure all-day events without specific hour timestamps.
- **Supabase & Vercel Sync**: Re-imported complete timed dataset to Supabase PostgreSQL database and pushed commit `8f6a462` to GitHub `main` branch.

### Version 4.7 - Fixed All-Day Toggle Override & Time Display (`isAllDayEvent`)
- **Root Cause Fix**: Identified that events loaded from Supabase PostgreSQL lacked an explicit `all_day` column, causing `editingEvent.all_day !== false` to evaluate to `true` and forcing the All-day toggle ON in `MissionModal.jsx`.
- **Smart Time Detection (`isAllDayEvent`)**: Created `isAllDayEvent(evt)` helper in `helpers.js` to inspect ISO timestamp hours (e.g. `10:00` - `12:00`). If non-zero start/end hours exist, it automatically sets `all_day = false`, turning OFF the All-day toggle and displaying the start/end time pickers cleanly in `MissionModal.jsx`, `DailyAgenda.jsx`, and `MonthGrid.jsx`.
- **Git Commit**: `51ed641` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 4.8 - Strict TimeTree MonthGrid Layout & Faded Timed Event Badges
- **Unified Slot Stacking (Zero Gaps)**: Combined all-day banners and timed events into a unified slot index matrix (`slotIndex: 0, 1, 2...`). Timed events on days with all-day banners now stack tightly directly underneath with zero empty space.
- **Faded Color Badges for Timed Events (`_1r1c5vl4`)**:
  - **All-Day Events**: Rendered with solid color background (`backgroundColor: evtColor`, `#ffffff` text).
  - **Timed Events**: Rendered with light faded background tint (`hexToRgba(evtColor, 0.16)`), left border line, colored bullet dot, and time text (`10:00 AM`) on the right side.
- **Git Commit**: `87c31db` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 4.9 - Optimistic UI Update & Async Supabase Confirmation
- **Instant Local UI Updates**: Updated state and `localStorage` immediately upon saving in `MissionModal.jsx` for zero-latency user interaction.
- **Async Supabase Payload & Rollback**: Sent clean schema columns to Supabase. Displayed success Toast upon server confirmation, and auto-rolled back local state if server upsert failed.
- **Git Commit**: `7b106d8` pushed to `manudnot/member-calendar-sync-app` main branch.

### Version 5.0 - Normalized `public.categories` Table Architecture & Dynamic Color Binding
- **Normalized PostgreSQL Categories Table**: Created `public.categories` (`id`, `name`, `color`, `icon`, `is_system`, `created_at`) with 6 official categories (`cat_royal`, `cat_unit`, `cat_meeting`, `cat_work`, `cat_training`, `cat_special`) and linked `category_id` in `public.events`.
- **Dynamic Category & Palette Integration**: Bound `MissionModal.jsx` Label Color options directly to `categories` state and enabled dynamic creation of new custom categories with automatic Supabase & LocalStorage sync.
- **Unified Color Engine**: Updated `getEventColor(evt, categories, members)` in `helpers.js` and `MonthGrid.jsx` to render consistent category colors across all devices.
- **Git Commit**: `614b984` pushed to `manudnot/member-calendar-sync-app` main branch.
- **Verification**: `npm run build` succeeded in 1.92s.






