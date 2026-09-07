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
