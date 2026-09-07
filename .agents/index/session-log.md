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
- **Verification**: `npm run build` completed cleanly in 1.53s.
