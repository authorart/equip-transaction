# UX/UI Improvement Suggestions — Chest Equipment MSKH

Reviewed: `dashboard.html`, `form.html` (read in full), plus a grep audit of `admin.html`, `central.html`, `extend.html`, `manual.html`, `equipment_workflow.html`, and the brand sheet `chest-equip-vbd.jpeg`.
Method: UI/UX Pro Max guideline lookups (forms, touch, color-only, charts) + code reading. Nothing was run in a browser, so contrast ratios are estimated from the hex values and visual issues are inferred from CSS.

Context: LINE LIFF mobile-first app for nurses/ward staff, often used in a hurry (the brand says "Proactive & Urgent-aware"), Thai language, Sarabun font.

---

## TL;DR — top 10, in priority order

| # | Fix | Where | Effort | Why |
|---|-----|-------|--------|-----|
| 1 | Remove `user-scalable=no` / `maximum-scale=1` | form, admin, central, extend, dashboard | 5 min | Blocks pinch-zoom; WCAG 1.4.4 failure. Hurts older staff most. |
| 2 | Fix `initCancelForm()` crash (`#formTitle` doesn't exist) | form.html:680 | 5 min | The cancel flow throws before showing the cancel screen. |
| 3 | Fix return-date off-by-one (UTC vs local date) | form.html:520-521 | 10 min | Between 00:00–07:00 Thai time the default/min date is *yesterday*. |
| 4 | Bring form/admin/central/extend onto the brand palette | all non-dashboard pages | 1–2 h | `form.html` still uses teal `#0D7377`/`#095E61`; only dashboard follows the VBD sheet. |
| 5 | Replace emoji icons with one SVG icon set | all | 3–4 h | Brand sheet specifies line icons; emoji render differently per phone and can't be colored/sized consistently. |
| 6 | Make the custom dropdown (`makeCDD`) keyboard/screen-reader accessible | form + dashboard (duplicated) | 2 h | `div` options, no roles, no `aria-expanded`, `<label>` not linked. |
| 7 | Inline field errors + focus the first bad field | form.html | 2 h | One banner error at a time; user re-submits repeatedly. |
| 8 | Replace `alert()/confirm()/prompt()` with in-page dialogs/toasts | dashboard (6), admin, form | 2–3 h | Native dialogs look foreign in LIFF and block the page. |
| 9 | Raise low-contrast text (`#94A3B8`, `#9CA3AF`) | all | 30 min | ~2.5:1 on white; needs 4.5:1. |
| 10 | Add `:focus-visible`, `prefers-reduced-motion`, chart text alternatives | all | 1–2 h | Currently zero of each across the whole project. |

---

## 1. Bugs that are really UX problems (fix first)

### 1.1 Cancel flow crashes — `form.html:680`
`initCancelForm()` runs `document.getElementById('formTitle').textContent = ...`, but no element has `id="formTitle"`. That throws a `TypeError`, so the user never reaches `#cancelSection`, and the cancel link from LINE shows a half-built page.
**Fix:** delete that line (the cancel section already has its own heading), or null-check it.

### 1.2 Date off-by-one — `form.html:520-521`
```js
d.toISOString().split('T')[0]   // UTC date, not local
```
At UTC+7, from 00:00 to 06:59 local this returns *yesterday*, so `min` blocks today and the default "7 days ahead" is 6 days. `dashboard.html` already has a correct local `isoDate(d)` — reuse it in the form.

### 1.3 Zoom is disabled — viewport tags
`maximum-scale=1.0, user-scalable=no` appears in form, admin, central, extend; `maximum-scale=1` in dashboard. iOS ignores part of this, Android/LINE honor it. Use:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
Keep `font-size:16px` on inputs (already done in the form) so iOS doesn't auto-zoom on focus.

### 1.4 Dead/legacy code in dashboard
`#landing`, `.role-card`, `.land-*` CSS remain from the removed role picker (v7). Delete to cut size and confusion.

---

## 2. Visual consistency & brand (VBD sheet)

The VBD sheet defines: Deep Ocean `#0C4A6E`, Air Blue `#0EA5E9`, Fresh Air Green `#F0FDF4`, Clinical Teal `#3F6C5E`, Caution Amber `#F59E0B`, Crisis Red `#EF4444`, Clinical Slate `#F1F5F9`, Deep Slate `#334155`. Type scale: page title 24, section 18, body 14, KPI 40. Status icons: ✓ green circle = available, lock amber circle = in use, ✕ red circle = maintenance.

**What's good:** dashboard already defines these as CSS variables and a JS `C` object, and uses 24/18/14/40 sizes.

**Gaps:**
- **Two design languages.** `form.html` uses teal gradient header (`#095E61→#0D7377`), page bg `#EEF2F7`, blue return button `#1A6DC8`. A user going dashboard → form feels they've changed apps.
  → Extract the `:root` token block from dashboard into each page (or a shared `brand.css` — GitHub Pages can serve it) and map: header → `--ocean`, primary button → `--ocean`, focus ring → `--air`, return button → `--air`/outlined.
- **Hardcoded hex everywhere** (99 inline `style=` in dashboard, 42 in admin, 55 in `equipment_workflow.html`). Move repeated inline styles to classes using the tokens, otherwise the next palette tweak needs a find-and-replace across 7 files.
- **Duplicate tokens in dashboard:** old hex (`#0C4A6E` literals, `#D4DCE8`, `#E5E7EB`) and the v7 `--line`/`--muted` variables coexist. Pick one set.
- **Status icons:** the brand sheet pairs each status with a shape (check / lock / cross). The code has `statusIcon()`, but cards (`.eq-card.avail/.busy/.other`) are differentiated by **border color only**. Add the icon + text to the card header so status isn't color-only (also helps color-blind users — a real concern with green/amber/red).
- **Tagline** "Sustaining Life, Syncing Assets" is English-only in the header sub-line; for ward staff a Thai sub-line or the user's name/role (already shown when logged in) is more useful. Keep the tagline on a splash/about, not the working header.
- **Header emoji 🫁:** replace with the lung+link logo mark from the sheet (SVG).

---

## 3. Accessibility (highest user impact: critical)

Current counts across all 7 pages: `:focus-visible` **0**, `prefers-reduced-motion` **0**, `aria-*` **2** (both in dashboard), `role=` **1**.

### 3.1 Contrast
| Usage | Color on white | ≈ ratio | Fix |
|---|---|---|---|
| `.detail-lbl`, `.ir-l`, muted labels | `#94A3B8` | 2.6:1 | `#64748B` (4.8:1) |
| Placeholder / `.cdd-ph` / `.cdd-arr` | `#9CA3AF` | 2.5:1 | `#6B7280` |
| Amber text/badges | `#F59E0B` on white | 2.1:1 | Use amber only as fill/border; text `#92400E` (already used in badges — good) |
| `.header-sub` `#BAE6FD` on `#0C4A6E` | | ~7:1 | OK |

### 3.2 Focus
Inputs have `outline:none` with a replacement border/box-shadow (OK for mouse), but **buttons, tabs, chips, table rows have no visible focus style**. Add globally:
```css
:focus-visible{outline:3px solid var(--air);outline-offset:2px;border-radius:6px}
```

### 3.3 Clickable `div`/`tr`/`span` (8 in dashboard, 4 admin, 3 central)
Not reachable by keyboard or screen reader. Use `<button>` (or `<a>` for navigation); for table rows, put a real button in the first cell.

### 3.4 Custom dropdown (`makeCDD`, copy-pasted in form.html and dashboard.html)
It exists to work around LIFF `<select>` quirks (good reason), but:
- trigger needs `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`; list `role="listbox"`, options `role="option" aria-selected`.
- arrow keys / Enter / Escape / type-ahead are not handled.
- `<label class="field-label">` has no `for`/`aria-labelledby` → the control has no accessible name.
- 15 ward options + "อื่นๆ" in a fixed-position list: add a search box once options > ~10 (wards, equipment).
- Dedupe: ship as one shared `cdd.js`.

Alternative worth testing first: a native `<select>` inside LIFF v2 works on current iOS/Android LINE builds; if you can reproduce the original problem on current devices, keep the custom one, otherwise native gives full a11y for free.

### 3.5 Errors announced
Error banners (`#errorBanner`, `.err-box`) are plain `div`s. Add `role="alert"` so screen readers announce them, and don't rely on red + ⚠️ alone.

### 3.6 Charts (Chart.js canvases)
Canvases are invisible to assistive tech. For each chart: `role="img"` + `aria-label` summarizing the finding (e.g. "ชำรุด 3 เครื่อง, ส่งซ่อม 2, สูญหาย 1"), and keep a visible table or the existing KPI numbers next to it as the fallback. Donut/stacked-bar series differ only by color — add direct labels or pattern/legend with counts.

### 3.7 Motion
Add:
```css
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
```
Spinners are fine, but `fadeIn`/`translateY`/`scale(.97)` transitions should respect it.

---

## 4. `form.html` — borrow / return flow

This is the highest-traffic screen; optimize for "thumb + 30 seconds".

1. **Validation UX.** `submitForm()` shows one message at a time at the top (`scrollIntoView` center) and the user re-taps submit per missing field. Instead:
   - validate all, mark every bad field with a red border **and** a message under it (`aria-describedby`, `aria-invalid`),
   - show a short summary "กรอกไม่ครบ 3 ช่อง" in the banner with `role="alert"`,
   - move focus to the first invalid field.
2. **Reduce typing on the return form.** Name/ward/phone are already auto-filled from the borrow record — good. Collapse them into a read-only summary card ("ผู้ยืม: …, Ward …, โทร …" + "แก้ไข" link) so the return form is just: pick unit → condition → notes → submit.
3. **Remember the borrower.** Save name/ward/phone in `localStorage` (try/catch — LIFF webviews can block it) or, better, use `liff.getProfile()` / the existing user mapping, so the *borrow* form is pre-filled next time too.
4. **Condition picker.** A dropdown for a 3-option, safety-relevant choice is slow and hides the options. Use three large radio cards with icon + color + text (✓ พร้อมใช้ / ⚠ ชำรุดเล็กน้อย / ✕ ชำรุดมาก). Selecting "ชำรุดมาก" should make "หมายเหตุ" **required** (the warning already says "กรุณาแจ้งรายละเอียด" but nothing enforces it).
5. **Unit picker.** Same idea when ≤ 6 units: show chips with the SubID instead of a dropdown (already auto-selects when scanned from QR — keep).
6. **Order of fields.** Group as: ① อุปกรณ์ (unit + condition) → ② ผู้ยืม/คืน → ③ รายละเอียดการยืม. The "section-title" style is nice; use real headings (`<h2>`) for structure, and drop `text-transform:uppercase` (no effect in Thai, reads as noise on English words).
7. **Submit feedback.** Button already goes to "⏳ กำลังบันทึก…" — good. Also guard against double-tap/network retry (disable + idempotency key `requestId` in payload) because the Apps Script can take several seconds.
8. **Success screen.** It tells users to "press ← or ✕ of the browser" and `goBack()` falls back to `alert()`. Inside LIFF `liff.closeWindow()` is the right action, but `form.html` never calls `liff.init` (the SDK isn't even loaded — only dashboard/admin load it), so `window.liff` is always undefined and the fallback text is what users see. Load the LIFF SDK in form.html, init with the LIFF ID, and make the primary button **"ปิดหน้านี้"** (closeWindow) with a secondary "ดูแดชบอร์ด" link. Remove the long instruction paragraph.
9. **Phone field.** Add `inputmode="tel"`, `pattern`, and format hint; use `autocomplete="tel"` (already there).
10. **Date field.** Show the Buddhist-era Thai date as helper text under the native picker ("คืนวันที่ 26 ต.ค. 2569") and offer quick chips: 3 / 7 / 14 days.
11. **Required marker.** `* ` only in red; add "(จำเป็น)" or a legend line "* = จำเป็นต้องกรอก" for color-independence.
12. **QR mismatch banner** is a strong pattern (clear title, one primary action). Keep; just add `role="alert"` and replace the 🔴/🟡 emoji with the brand status icons.
13. **Loading state.** Replace the bare spinner row with a skeleton of the card (header + 3 grey bars) to avoid layout jump when the form appears.

---

## 5. `dashboard.html`

### 5.1 Navigation
- Header is `height:60px` and tab bar `top:60px` — hardcoded coupling. Use a CSS variable `--hdr-h` and `top:var(--hdr-h)` for both; also add `env(safe-area-inset-top)` for notched phones.
- Up to 6 tabs (3 public + admin + central + super) in a horizontal scroller with the scrollbar hidden: no cue that more exist. Add edge fade (`mask-image` gradient) or a "›" affordance, and `scrollIntoView({inline:'center'})` for the active tab.
- Tabs should be `role="tablist"/"tab"` with `aria-selected`; panes `role="tabpanel"`.
- Deep links: keep section in the URL hash (`#problem`) so refresh/back/share from LINE returns to the same tab (currently resets to "status").
- The red `.cnt` badge on "ชำรุด" needs a text equivalent (`aria-label="3 รายการ"`), not a bare number.

### 5.2 Data tables
- `table{min-width:420px}` + `overflow-x:auto`: on a 360px phone the units table scrolls sideways and the key column (status/days) may be off-screen. For < 600px render rows as **cards** (SubID + status badge on top; "ที่ไหน / ตั้งแต่ / นานกี่วัน" as 2-column details). Keep real tables ≥ 600px.
- Make the "นานกี่วัน" column sortable, and default-sort the "action needed" list by longest-stuck first (the tool's whole purpose per CHANGES-v6).
- Make the whole card/row a button that opens the history panel; show a chevron so it looks tappable.
- Add sticky header row for long tables.

### 5.3 KPI row
`40px` numbers per the brand sheet are good. Improve scannability: put the **status color + icon on the number's tile** (left border 4px in group color), and make each KPI a button that applies that filter to the table below (available → filter; damaged → jump to ชำรุด tab).

### 5.4 Filters (usage page)
`.fbar` is clear. Suggestions: show the *active range as a sentence* above charts ("ต.ค. 2569 · ทุกชนิด · ทุกหน่วยงาน"); add a "ล้างตัวกรอง" button; remember last-used filters per session; month/year segmented control: add `role="group"` + `aria-pressed`.

### 5.5 Charts
- Utilization: the brand sheet shows a **donut (in use vs available) + trend line**. Add a plain-language headline above each chart ("ใช้งาน 62% — สูงกว่าเดือนก่อน 8 จุด") — people read the sentence, then glance at the chart.
- Horizontal bar height uses `barH(n)` — good (avoids overlap). Ensure labels truncate with ellipsis, not clip.
- Show an empty state with a hint when the filter returns nothing ("ไม่มีการยืมในช่วงนี้ — ลองขยายช่วงเวลา").

### 5.6 Loading, offline and freshness
- Latest commits added stale-while-revalidate cache — great. Surface it: a small "อัปเดตล่าสุด 14:32 · กำลังรีเฟรช…" line near the 🔄 button, and a non-blocking banner "แสดงข้อมูลเดิม (ออฟไลน์)" when the refresh fails, instead of silently showing old data.
- Replace the centered spinners with skeleton KPI tiles + table rows for the first load.
- The 🔄 button needs `aria-label="รีเฟรชข้อมูล"` (currently only `title`, which isn't read on touch).

### 5.7 Admin / central action panels
- Bottom sheet (`.panel`) is the right pattern; add: focus trap, `Esc`/swipe-down close, `role="dialog" aria-modal="true" aria-labelledby`, return focus to the opener, and lock body scroll. Close button `✕` needs `aria-label="ปิด"`.
- Destructive/irreversible actions (reject, mark lost/disposed) should use a confirm sheet that names the unit ("ยืนยันแจ้งสูญหาย MV-03?") with a red primary button — not `confirm()`/`prompt()` (6 native dialogs in dashboard, 2 in admin).
- After success, `showSuccess()` overlay blocks the screen; use a toast with "เลิกทำ/ดูรายการ" and auto-dismiss in 4 s, keep the overlay only for the final "ส่งไปจ่ายกลางแล้ว".

### 5.8 Performance
- `liff` SDK and Chart.js are in `<head>` without `defer` — they block first paint. Add `defer`, or load Chart.js only when the Usage tab opens (`import()` / dynamic script).
- `dashboard.html` is 114 KB with ~1,800 lines of inline JS/CSS; splitting CSS/JS into cached files (GitHub Pages) makes repeat opens near-instant inside LINE.
- Add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` and `&display=swap` (already present). Consider subsetting Sarabun to weights 400/600/800 (500/700 unused?) — one fewer file per weight.
- `chest-equip-vbd.jpeg` is 2 MB and untracked; either keep it out of the repo (`.gitignore`) or store a ≤ 300 KB WebP in `docs/` so it isn't deployed to Pages.

---

## 6. Other pages (grep-level findings — verify visually)

- **`admin.html`, `central.html`, `extend.html`:** same viewport/zoom problem, no ARIA, `div onclick` (4 / 3 / 0), and admin uses native `confirm()` + `prompt()`. Apply sections 1–3 above; they likely share the old teal palette.
- **`extend.html`** (12 KB, small): a good candidate to rebuild first on the shared tokens since it's a single task — pick new date → confirm. Show current due date and the *new* due date side by side, with the max allowed extension stated up front.
- **`manual.html`** (52 KB): fine as long-form, but add a sticky table of contents / anchor nav, `scroll-margin-top` for the anchors, and `max-width:70ch` for readability; make sure screenshots have `alt` text and `loading="lazy"`.
- **`equipment_workflow.html`** (55 inline styles, no scripts): a static diagram; make sure it scales on mobile (use SVG or `overflow-x:auto` wrapper) and that step colors map to the same status colors as the dashboard.
- **Rich menu PNGs** (`richmenu_*.png`, 0.5–1 MB each): LINE requires ≤ 1 MB — `richmenu_central.png` is 970 KB, close to the limit. Recompress (pngquant/WebP not supported for rich menus → use optimized PNG or JPEG) and regenerate with the brand palette for consistency.

---

## 7. Shared design tokens (drop-in starting point)

```css
:root{
  /* brand (VBD sheet) */
  --ocean:#0C4A6E; --air:#0EA5E9; --fresh:#F0FDF4; --teal:#3F6C5E;
  --amber:#F59E0B; --red:#EF4444; --mist:#F1F5F9; --slate:#334155;
  /* text on white — all ≥ 4.5:1 */
  --text:#334155; --muted:#64748B; --amber-text:#92400E; --red-text:#B91C1C;
  --line:#E2E8F0;
  /* shape & spacing */
  --r-card:16px; --r-ctl:10px; --gap:12px; --hdr-h:60px;
  /* type (brand scale) */
  --fs-title:24px; --fs-section:18px; --fs-body:14px; --fs-kpi:40px; --fs-min:12px;
}
:focus-visible{outline:3px solid var(--air);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
```

Status system (use the same on cards, badges, charts, tables):

| Status group | Color | Icon (shape) | Text label |
|---|---|---|---|
| พร้อมใช้งาน | `--teal` / bg `--fresh` | check in circle | always shown |
| กำลังใช้งาน | `--amber` / bg `#FEF3C7` | lock in circle | always shown |
| ระหว่างดำเนินการ | `--air` / bg `#E0F2FE` | clock / arrows | always shown |
| ชำรุด/ซ่อม/สูญหาย | `--red` / bg `#FEE2E2` | ✕ in circle | always shown |
| จำหน่าย | `--slate` / bg `--line` | archive | always shown |

Touch/size rules: interactive targets ≥ 44×44 px with ≥ 8 px gaps (chips at 6px padding ≈ 32px tall and `.btn-hdr` ≈ 30px are too small); body text ≥ 14 px, nothing under 12 px (badges are 11–12 px).

---

## 8. Suggested rollout

**Phase 1 — quick wins (≈ 1 day):** items 1–3 and 9 from the TL;DR, `:focus-visible`, reduced-motion, `aria-label`s on icon-only buttons (🔄, ✕), `role="alert"` on error boxes, delete dead landing CSS.

**Phase 2 — consistency (≈ 2–3 days):** shared `brand.css`/tokens, SVG icon set, re-skin form/admin/central/extend, shared `cdd.js` with ARIA + keyboard, toast/dialog components replacing native dialogs.

**Phase 3 — flow polish (≈ 3–5 days):** form validation + condition cards + remembered borrower + LIFF close, dashboard mobile card tables, clickable KPIs, tab deep-links, chart text alternatives, skeleton loaders and "last updated" indicator, lazy-load Chart.js.

**How to verify:** open each page at 360×640 in Chrome DevTools (LINE's in-app browser is the real target — test once on an Android and an iPhone), run Lighthouse Accessibility (target ≥ 95), tab through the borrow form with the keyboard only, and check text contrast with the DevTools color picker.

---

*Open questions for you:* (a) Is the custom dropdown still needed on current LINE versions? (b) Do older/senior staff use the form? If yes, bump base font to 16 px on form pages. (c) Is Thai-only UI acceptable for English terms like "Ready for use / Minor damage"? Mixed-language option labels are long on small screens; Thai first with English in smaller secondary text would shorten them.
