# Technology Stack

**Analysis Date:** 2026-07-22

## Languages

**Primary:**
- JavaScript (ES6+) - Game engine, UI rendering, real-time sync
- HTML5 - Page markup and structure
- CSS3 - Styling, animations, responsive design

**Secondary:**
- Python 3 - Simulation engine for game balance research and strategy analysis

## Runtime

**Environment:**
- Browser (Chrome, Safari, Firefox, Edge)
- Python 3 (for offline simulation)

**Package Manager:**
- None (browser build uses CDN and inline scripts)
- Python standard library only (no external dependencies)

## Frameworks

**Core:**
- Firebase SDK v12.15.0 (compat) - Realtime database for multiplayer sync
  - `firebase-app-compat.js` - Core Firebase app initialization
  - `firebase-database-compat.js` - Realtime Database client

**UI:**
- No framework - vanilla HTML/CSS/JavaScript with inline styles and scripts

**Testing/Development:**
- `cocoa_pirates_sim.py` - Python-based game simulator (no external frameworks)

## Key Dependencies

**Critical:**
- Firebase Realtime Database v12.15.0 - Multiplayer game state synchronization
  - Client: Loaded via CDN from `https://www.gstatic.com/firebasejs/`
  - Used for: game rooms, player seats, real-time events, chat, game logs, feedback

## Configuration

**Environment:**
- Firebase config embedded in `index.html` (lines 4542-4551)
- Contains public API key and database URL (intended public exposure per docs)
- No environment variables required

**Build:**
- Single HTML file served directly (no build step)
- All JavaScript inline in `<script>` tags
- CSS embedded in `<style>` tags
- Assets served from `/assets/` directory

## Platform Requirements

**Development:**
- Text editor for HTML/CSS/JS editing
- Python 3.x for running `cocoa_pirates_sim.py`
- Git for version control

**Production:**
- Static hosting (GitHub Pages, Netlify, or any HTTP server)
- Firebase Realtime Database project (free Spark tier sufficient)
- HTTPS recommended for production (Firebase config references public domain)

## Asset Pipeline

**Images:**
- PNG format for custom ingredient icons (`/assets/ingredients/*.png`)
- PNG format for UI icons (`/assets/icons/*.png`)
- PNG format for board elements (`/assets/board.png`, `/assets/dock.png`, etc.)
- PNG format for animated elements (compass dial, wind arrow, etc.)
- Fallback emoji rendering if image assets fail to load (`iconAt()` function in index.html line ~807)

**Delivery:**
- Static files served from repo root and `/assets/` subdirectories
- No image optimization or build step

## Compatibility Notes

**Browser Support:**
- Modern browsers (ES6 support required)
- CSS Grid and Flexbox required
- Service Worker optional (not used)
- LocalStorage required for host-game recovery feature

**Firebase Restrictions:**
- API key restricted to `wyattroy.github.io/*`, `localhost/*`, and `playpastrypirates.com/*` domains
- File protocol (`file://`) works for game but may show warnings on Firebase Auth calls

---

*Stack analysis: 2026-07-22*
