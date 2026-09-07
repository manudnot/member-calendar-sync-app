# Development Session Log & Architecture History

## 📅 Session Log: 2026-09-07

### Version 3.1 - Member Management Drawer, Checkbox Multi-Filtering & Clean Sidebar Collapse
- **Mock Data Removal**: Filtered out all mock names ("สมชาย" etc.). Only 8 authentic members are preserved (`manudnot`, `Thanatat Parnsaeng`, `Supanut Tongnumwon`, `WoooddY`, `June`, `ผก.เอก`, `มว.เก่ง`, `มว.ตั้ม`).
- **Sidebar Checkbox Multi-Filter**: Replaced single-select filter with explicit checkboxes (`visibleMemberIds`), allowing users to dynamically check/uncheck multiple members.
- **Member Management Drawer (`MemberManagementModal.jsx`)**: Connected the `👥` button on `RightToolbar` to open a dedicated drawer matching the TimeTree/DutyRoster screenshot (Member List, Search box, Role pills (`Me`, `Creator`, `Virtual member`), `Add` button, and toggle switches).
- **Sidebar Collapse Fix**: Fixed `Sidebar.jsx` CSS transition so clicking `☰` on `Header` toggles the sidebar on both desktop and mobile layouts (`w-0 opacity-0 overflow-hidden` when collapsed).
- **Verification**: `npm run build` executed cleanly with 0 errors.
