---
name: frontend-design
description: Guideline for building premium, high-fidelity front-end interfaces, avoiding cheap emojis, and adhering to strict typography, SVG icons, color tokens, and layout rules for Duty-Roster & TimeTree apps.
---

# Frontend Design Specification

This specification governs all UI/UX components in the Member Calendar Sync App to ensure a state-of-the-art, developer-quality visual identity.

---

## 🎨 Core Design Rules

### 1. No Cheap Emojis (Use SVG Icons & Monospace Text)
* **AVOID:** Generic emojis scattered across headers, titles, buttons, and member chips.
* **PREFER:** Crisp inline SVG icons (Lucide / Heroicons style) and Monospace badge typography (`font-family: monospace`) for times, IDs, and metadata.

### 2. Member Initials Avatars
* Members are represented by rounded solid/gradient avatars displaying their **2-letter Initials** (e.g. `WD` for WoooddY, `SN` for Supanut, `MN` for manudnot).
* Avatars use crisp typography (`font-weight: 700; font-size: 0.75rem`) with subtle drop shadows.

### 3. Duty-Roster Color Tokens & Hierarchy
* **Primary Brand Accent:** TimeTree Emerald (`#10b981` / `#059669`)
* **Secondary Accent:** Steel Blue (`#3b82f6`)
* **Surface Background:** Pure White `#ffffff` with Soft Slate `#f8f9fa`
* **Card & Panel Dividers:** Thin border lines `1px solid #e2e8f0` / `rgba(0, 0, 0, 0.06)`
* **Day Headers:** Sunday Red (`#e03131`), Saturday Blue (`#1971c2`), Weekdays Dark (`#1e293b`)

### 4. Calendar Grid & Event Pills
* **All-day Event Pills:** Solid background color badge (`background-color: var(--event-color)`), white text (`#ffffff`), rounded corners (`border-radius: 6px`).
* **Timed Event Pills:** Translucent background (`rgba(var(--event-rgb), 0.12)`), solid left indicator line (`border-left: 3px solid var(--event-color)`), dark/colored text, monospace start time.

### 5. Form & Modal Controls
* Header Tab Switcher: Sliding pill tab (`Event` | `Memo`)
* All-day Toggle Switch: iOS/Duty-Roster style smooth slider
* Color Palette Selector: Circular color option buttons with active ring highlight (`ring-2 ring-emerald-500 scale-110`)
