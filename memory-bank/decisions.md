# Nyaya AI — Key Decisions

## Design: Dark Luxury / Nura Health Aesthetic
- **Background:** `#0A0A0A`, surface `#111113`, elevated `#1C1C1E`
- **Primary accent:** `nyaya-500` (`#0A84FF` blue) instead of standard red/amber
- **Gold accent:** `amber-500` (`#D4AF37`) for premium highlights
- **Typography:** Outfit (display headlines), Plus Jakarta Sans (UI headings), Cormorant Garamond (dramatic italics), Inter (body)
- **CSS noise overlay:** SVG feTurbulence at 0.035 opacity on `body::after`
- **Glass utility:** `backdrop-filter: blur(20px)` with `rgba(255,255,255,0.05)` bg
- **Icons:** lucide-react exclusively — never emoji as icons

## Routing
- Added `/search` route for `LegalSearch` page
- Page transitions via `AnimatePresence` + `motion.div` wrapping `Routes`

## Backend Configuration
- Port forced to 8001 (8000 was in use by another service)
- PostgreSQL connection via SQLAlchemy async

## Known Issues
- Backend `evidence_forensics.py` is a stub (missing from repo) — needs HuggingFace models + EasyOCR for real implementation

## Model Limitations
- **Cannot read image files via Read tool.** The AI model (deepseek-v4-flash-free) does not support image input. NEVER use Read tool on `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp` files. Images can only be referenced via URL in the browser, not loaded by the agent.

## Emoji → lucide-react Migration
- Dashboard.jsx had 20+ emoji icons used as UI elements. Systematic replacement:
  - `⚖️` → `<Scale />`, `🗃️` → `<FolderArchive />`, `➕` → `<Plus />`, `⚠️` → `<AlertTriangle />`
  - `✅` → `<CheckCircle />`, `📄` → `<FileText />`, `🔍` → `<Search />`, `▶` → `<ChevronRight />`
  - `🎞️` → `<Film />`, `🎙️` → `<Mic />`, `🖼️` → `<Image />`, `🏛️` → `<Landmark />`
  - `📭` → `<Inbox />`, `⬇` → `<Download />`, `⬅` → `<ArrowLeft />`, `➔` → `<ArrowRight />`, `🚀` → `<Rocket />`
- Pattern: every emoji that serves as an icon (not decorative text) gets a matching lucide component.
- New icons imported as destructured named exports from "lucide-react".

## Dashboard Dark Theme Conversion
- Original Dashboard used stone-50/amber-700 light theme, inconsistent with LandingPage/Login/Signup.
- Converted all `bg-stone-50`, `bg-white/80`, `bg-amber-50`, `text-amber-700`, `text-stone-900` to dark equivalents (`bg-surface`, `bg-white/[0.03]`, `text-nyaya-500`, `text-white`, `text-stone-400/500`).
- Font classes added: `font-display` on header, `font-heading` on section titles.
- NextUI component overrides: `classNames` prop for Tabs/Dropdown dark styling.
- Modal content classNames updated to surface theme.

## Lessons Learned & Prevented Mistakes

1. **Avoid Git Bloat (Venvs & Node Modules):** Ensure a comprehensive `.gitignore` is initialized *before* staging files to prevent uploading heavy system/python environments and packages, which lead to git server unpack failures.
2. **Address Port Mismatches Early:** Standardize and verify communication ports between frontend proxies (`vite.config.js` target) and backend APIs (Uvicorn port) immediately during setup.
3. **Clean OCR Noise systematically:** Strip out known metadata-heavy blocks (e.g., properties/particulars sections) before parsing text to prevent years, values, and serial numbers from triggering false positive section matches.
4. **Handle Regional Numeral Forms:** Convert Devanagari numerals (e.g., `१२३४`) to ASCII digits (`1234`) right after extraction to support regional language OCR outputs.
5. **Optimize CPU OCR with Early-Exit:** OCR processing on CPU is slow (~70-90s per run). Implement early-exit quality scoring so that if a pass confidently extracts target sections, it skips subsequent image enhancements.
6. **Resolve UI Event Propagation Issues:** Use explicit click triggers and `e.stopPropagation()` when custom component frameworks (like NextUI) wrap standard HTML inputs (like file inputs) to prevent buttons from swallowing click events.

