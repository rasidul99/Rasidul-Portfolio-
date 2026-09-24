# RST Portfolio — Modular, AI-Friendly Design System & Architecture

An award-winning 3D interactive WebGL portfolio engineered with a modular, section-isolated architecture, central design tokens, separate content data layer, and a hardened Node.js media server.

---

## 🚀 Quick Start (Running Locally)

```bash
# Start the modular server on port 3005
$env:PORT="3005"; node server.js

# Or using npm scripts
npm start
```

Open your browser to: **[http://localhost:3005](http://localhost:3005)**  
CodeMoly Case Study: **[http://localhost:3005/projects/CodeMoly](http://localhost:3005/projects/CodeMoly)**

---

## 📁 Modular Project Architecture

```
RST Protfolio/
├── server.js                       # Primary Modular Server Entry Point
├── package.json                    # Node.js process manifest & scripts
│
├── server/                         # [MODULAR BACKEND ENGINE]
│   ├── config.js                   # Server environment, ports & MIME types
│   ├── file-resolver.js            # Hardened path resolution & anti-traversal security
│   ├── range-streamer.js           # HTTP 206 Partial Content video streaming
│   └── error-logger.js            # POST /log-error client telemetry logger (100KB limit)
│
├── src/                            # [SOURCE DATA LAYER]
│   └── data/
│       ├── codeMolyData.js         # CodeMoly case study text, colors, specs & metrics
│       └── navigationData.js       # Top navigation links, logo text & drawer options
│
├── Rasidul.co/                      # [PRIMARY FRONTEND APPLICATION ROOT]
│   ├── index.html                  # Landing Page / Home WebGL Canvas Engine
│   ├── about/index.html            # About Me Page & WebGL State
│   ├── projects/CodeMoly/index.html# CodeMoly Case Study Page
│   └── _astro/
│       ├── tokens.css              # Central Design System Token Registry
│       ├── about.CNa9RfUh.css      # Core Portfolio Styling Engine
│       └── hoisted.CJiXW_YI.js     # Three.js 3D Engine & Post-Processing Shaders
│
└── docs/                           # [ARCHITECTURAL DOCUMENTATION]
    ├── PROJECT_MAP.md              # Complete Project Architecture & Directory Map
    ├── AI_EDITING_GUIDE.md         # Safety Rules & Decision Tree for AI Assistants
    ├── DESIGN_SYSTEM.md            # Color Matrix, Typography & Layout Tokens Reference
    ├── COMPONENTS.md               # Reusable UI Components Inventory & Rules
    ├── SECTIONS.md                 # Section Isolation & Container ID Ownership Map
    ├── ASSETS.md                   # Static 3D Models, EXR Textures & Video Stream Guide
    └── SERVER.md                   # Backend Architecture & Security Guide
```

---

## 🎨 Centralized Design System Tokens

All colors, typography, spacing, border radii, and transitions are centralized in [`Rasidul.co/_astro/tokens.css`](file:///E:/Rasidul%20Islam/Development/Code/RST%20Protfolio/RST%20Protfolio/Rasidul.co/_astro/tokens.css):

```css
:root {
    --bg-portfolio: #000000;
    --border-portfolio: rgba(255, 255, 255, 0.12);
    --text-primary: #ffffff;
    --text-subtle: rgba(255, 255, 255, 0.6);
    --header-color: #0016ec; /* Electric Blue Accent */
    --font-sans: Aeonik, sans-serif;
    --font-mono: IBMPlexMono, monospace;
}
```

---

## 🔒 Implemented Security Hardening

1. **Path Traversal Protection (`server/file-resolver.js`)**: Prevents `%2e%2e%2f` URL-encoded attacks from escaping `ROOT_DIR` via `path.normalize()` and `startsWith(ROOT_DIR)` validation.
2. **Memory DoS Protection (`server/error-logger.js`)**: Limits `POST /log-error` telemetry payload sizes to 100KB.

---

## 🤖 Guidelines for AI Assistants & Developers

Refer to [`docs/AI_EDITING_GUIDE.md`](file:///E:/Rasidul%20Islam/Development/Code/RST%20Protfolio/RST%20Protfolio/docs/AI_EDITING_GUIDE.md) before making edits:
- **Rule 1**: Modifying Section A must never unintentionally affect Section B. Use section-scoped IDs (`#section-hero`, `#section-2`, `#section-impact`).
- **Rule 2**: Separate Content from Layout. Edit text & metric values in `src/data/codeMolyData.js`.
- **Rule 3**: Do NOT edit `server.js` when making frontend-only styling changes.
