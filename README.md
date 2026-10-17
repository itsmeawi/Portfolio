# AWI // Systems & Software Engineering (Vectr-Caliber Architecture)

A modern developer portfolio web app engineered with the high-end, technical, and industrial aesthetic of **Vectr** (`vectrfl.com`). Features cinematic **GSAP 3** and **ScrollTrigger** orchestration, dynamic spotlight mouse illumination, magnetic button physics, and direct cloud integration with a private **Google Spreadsheet** using **Google Apps Script**.

Repository: [https://github.com/itsmeawi/Portfolio.git](https://github.com/itsmeawi/Portfolio.git)  
Connected Sheet: [Google Spreadsheet (`1ZBKFAWajAClVhBj17anFys4ACJGHy9NJBof75dew_iQ`)](https://docs.google.com/spreadsheets/d/1ZBKFAWajAClVhBj17anFys4ACJGHy9NJBof75dew_iQ/edit)  
Production Endpoint: `https://script.google.com/macros/s/AKfycbyhmon-zEpPQQh2zNL34b3WEQkG6_mEalmB3dK2QMwZxJ5yAniWRCgr4te2ehB24wwwAg/exec`  

---

## ⚡ Vectr-Inspired Design & Engineering Pillars

1. **Color Palette & Atmosphere:**
   - Deep industrial background tones (`#06080f` void and `#0b0f19` slate-950).
   - Electric ice-blue and cyber cyan glowing accents (`#38bdf8`, `#22d3ee`, `#0ea5e9`).
   - High-contrast crisp white titles and muted silver typography (`text-slate-100` and `text-slate-400`).
   - Technical monospace typography (`JetBrains Mono`) for telemetry data and indices.

2. **GSAP 3 & ScrollTrigger Kinetics:**
   - **Hero Entry Sequence:** Staggered timeline reveal animating floating pill navbar, industrial badge, monumental headline, subtitle, action buttons, and architecture telemetry card.
   - **Scroll-Triggered Reveals:** Section headers, capability matrices, and project cards smoothly translate and fade in using `ScrollTrigger.batch()`.
   - **Progress Track Fill:** 4-phase methodology flow steps with animated progress bars.
   - **Counter Rollers:** Metric numbers roll smoothly using GSAP decimal/integer counters.

3. **Interactive Micro-Interactions:**
   - **Spotlight Cards:** Dynamic cursor coordinates calculate `--mouse-x` and `--mouse-y` to produce an electric cyan radial illumination over card borders on mouse movement.
   - **Magnetic Button Physics:** Buttons attract toward the cursor with elastic physics on hover.
   - **Confetti Celebrations:** Multi-cannon celebration bursts upon verified database submission.

---

## 📋 Sections & Architecture

- **Floating Glassmorphism Pill Navbar:** System status pulse, section links (`Overview`, `Projects`, `Capabilities`, `Workflow`, `Contact`), and live Sheets API indicator.
- **Hero Telemetry & Architecture Visualizer:** High-impact technical positioning with real-time simulated node graph and operational metrics.
- **Metrics Bar:** Proven SLA delivery, latency benchmarks, and production experience.
- **Selected Works Grid:** Technical case studies featuring:
  - *Portfolio Connect & Google Cloud Apps Script Engine*
  - *AetherOS // Real-Time Consensus & Task Stream*
  - *QuantumLedger // Real-Time Immutable Audit Stream*
  - *EdgeMesh // Anycast Cloud Gateway & Firewall*
- **Technical Capabilities Matrix:** Architecture, Frontend Engineering, Cloud Automation, and Zero-Trust Security.
- **Methodology & Workflow:** 4-step execution flow inspired by mission-critical aerospace and industrial staffing models.
- **Lead Intake Portal (Google Sheets Form):**
  - Fields: `name`, `lastname`, `gmail`, `contact`, `address`.
  - Real-time client-side live mirror card.
  - Concurrency-safe dispatch to Google Sheets via `Code.gs`.
  - Auto-draft persistence in `sessionStorage`.

---

## 🛠️ Quick Start & Local Development

Run the lightweight local development server:

```powershell
node -e "const http=require('http'),fs=require('fs'),path=require('path');const mime={'html':'text/html','css':'text/css','js':'application/javascript'};http.createServer((req,res)=>{let p=path.join(process.cwd(),req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(p,(e,d)=>{if(e){res.writeHead(404);res.end();}else{res.writeHead(200,{'Content-Type':mime[path.extname(p).slice(1)]||'text/plain'});res.end(d);}});}).listen(3000,()=>console.log('Server: http://localhost:3000/'));"
```

Open: **`http://localhost:3000/`**

---

## 📂 Repository File Structure

```
Portfolio/
├── index.html        # Main Vectr-grade layout (Hero, Projects, Matrix, Workflow, Form)
├── styles.css        # Slate-950 industrial palette, spotlight card physics, responsive grid
├── app.js            # GSAP 3 timeline, ScrollTrigger, spotlight tracker, Google Sheets API
├── Code.gs           # Serverless Google Apps Script backend (deployed in Google Drive)
├── documentation.md  # Detailed technical architectural documentation
├── README.md         # Project overview and quick start guide
└── .gitignore        # Git ignore rules
```

---

## 📄 License

MIT License. Designed & Developed by [itsmeawi](https://github.com/itsmeawi).
