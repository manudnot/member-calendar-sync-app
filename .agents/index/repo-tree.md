# Repository File Tree & Architecture Structure

```text
member-calendar-sync-app/
├── .agents/
│   ├── AGENTS.md                  # Project agent guidelines (DutyRoster Standard)
│   ├── index/
│   │   ├── repo-tree.md           # Project directory map
│   │   └── session-log.md         # Activity log & version history
│   ├── rules/
│   │   └── supa-calendar.md       # Supabase & iCal standards
│   └── skills/
│       └── frontend-design/
│           └── SKILL.md           # Duty-Roster UI design specs
├── api/
│   └── feed.js                    # Vercel Serverless Function for iCal (.ics) feed
├── gas/
│   └── Code.gs                    # Google Apps Script sync template
├── src/
│   ├── main.jsx                   # React Entrypoint
│   ├── App.jsx                    # Core App Engine & Supabase State Manager
│   ├── index.css                  # Tailwind Directives & Glassmorphism Utilities
│   ├── components/
│   │   ├── Header.jsx             # Top Navbar, Month Navigator & Theme Switcher (☀️/🌙/💻)
│   │   ├── Sidebar.jsx            # Left Member Filter Sidebar & Initials Avatars
│   │   ├── RightToolbar.jsx       # Right Action Bar (Members, iCal, Add)
│   │   ├── Toast.jsx              # Toast Notification Component
│   │   ├── Scheduler/
│   │   │   ├── MonthGrid.jsx      # Calendar Month Grid (Sun Red / Sat Blue)
│   │   │   ├── DailyAgenda.jsx    # Daily Task Drawer & Task Cards
│   │   │   └── MissionModal.jsx   # Create/Edit Event & Memo Drawer (DutyRoster Style)
│   │   └── Modals/
│   │       └── IcalModal.jsx      # Dynamic iCal (.ics) Subscription Link & QR Code Modal
│   └── utils/
│       ├── helpers.js             # Date & Time formatting utilities
│       └── supabase.js            # Supabase Client Integration
├── index.html                     # Vite Entry HTML
├── package.json                   # Dependencies (React, Vite, Lucide-React, TailwindCSS, Supabase)
├── tailwind.config.js             # Tailwind Custom Colors & Dark Theme Tokens
├── postcss.config.js
├── vite.config.js                 # Vite Bundler Config
├── GEMINI.md                      # Project rules & overview
├── README.md                      # Setup and Vercel deployment guide
└── vercel.json                    # Vercel Deployment Configuration
```
