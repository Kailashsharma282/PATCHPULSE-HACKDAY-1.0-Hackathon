# PATCHPULSE — Hackathon Presentation Deck (8 Slides)

**Hackathon:** HACKDAY 1.0  
**Theme:** TECH FOR A BETTER TOMORROW  
**Participant:** Pochiraju Kailash Ram Markandeya Sharma (Solo Participant)  
**Team Name:** kailashsharma8  
**Project:** PATCHPULSE — AI Civic Intelligence & Verification Platform  
**Tagline:** *Detect problems before complaints become crises.*

---

## Slide 1: Title & Vision
- **Project Title:** PATCHPULSE
- **Subtitle:** AI Civic Intelligence & Evidence-Based Verification Platform
- **Tagline:** Detect problems before complaints become crises.
- **Participant:** Pochiraju Kailash Ram Markandeya Sharma
- **Team Name:** kailashsharma8
- **Theme:** TECH FOR A BETTER TOMORROW

---

## Slide 2: The Problem
- **The Complaint Deluge:** High-density zones generate dozens of duplicate complaints for a single defect, crippling operator response.
- **Lack of Intelligence:** Systems simply log text strings without understanding the physical reality of the defect.
- **Arbitrary Prioritization:** Maintenance tasks are sorted by submission timestamp, leaving critical nighttime safety hazards unaddressed.
- **Unverified Resolutions:** Tickets are marked "Resolved" with a button click with zero evidence, leading to persistent citizen dissatisfaction.

---

## Slide 3: The Solution — PATCHPULSE
- **From Complaints to Weak Signals:** We perceive unstructured multi-modal signals (photos, text, voice recordings, and device GPS).
- **Incident Synthesis:** Scattershot signals are unified into structured, deduplicated **Issue Fingerprints**.
- **Transparent Urgency:** Explainable priority scoring from 0 to 100 with clear human-readable factors.
- **Evidence-Based Closing:** Mandatory dual-frame AI computer vision verification before closing tickets.

---

## Slide 4: Core Innovation — PULSE-5
- **P — Perceive:** Ingests photos, speech audio, notes, and telemetry.
- **U — Unify:** Fuses signals using semantic embeddings, spatial Haversine proximity, and temporal decay.
- **L — Learn:** Evaluates physical severity, night vulnerability, and footfall density.
- **S — Score:** 6-factor explainable priority ranking (Severity, Impact, Persistence, Confidence, Vulnerability, Urgency).
- **E — Evidence:** Dual-frame visual delta comparison verifying defect cure.

---

## Slide 5: Technical Architecture
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Leaflet Geospatial Maps, Recharts.
- **Backend:** Node.js, NestJS modular architecture, TypeScript, REST & SSE Streams.
- **Database & ORM:** PostgreSQL & SQLite with Prisma ORM, normalized relational design.
- **AI Engine:** Dual-mode OpenAI API client & High-Precision Deterministic Mock AI engine (zero external latency).
- **State Machine:** Controlled issue lifecycle: `DETECTED` $\rightarrow$ `CORROBORATING` $\rightarrow$ `PRIORITIZED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `VERIFIED_RESOLVED`.

---

## Slide 6: Flagship Live Demo Workflow (Issue #P-024)
- **Step 1-3:** Student uploads photo of dark luminaire at Block C Parking Area $\rightarrow$ AI detects 150W fixture head at 0 lux.
- **Step 4-7:** Second student reports pathway darkness; voice hotline transcribes audio; telemetry confirms 5-day current draw drop.
- **Step 8:** Clustering unifies all 4 signals $\rightarrow$ Priority escalates to **91 (CRITICAL)**.
- **Step 9-10:** Work Order `#PX-0192` auto-generated with suggested equipment (Boom lift, 150W LED) and dispatched to technician Manoj Kumar.
- **Step 11-13:** Technician replaces fixture, uploads after-photo $\rightarrow$ AI verifies 94% visual change & 97% confidence $\rightarrow$ Incident marked **VERIFIED RESOLVED**.

---

## Slide 7: Impact & Scalability
- **75% Noise Reduction:** Merges redundant reports into clean issue fingerprints.
- **100% Verified Outcomes:** Zero ghost resolutions; photographic proof enforced by AI vision.
- **Zero-Friction Adoption:** Citizens report casually by voice or photo without needing to know technical municipal categories.
- **Phased Roadmap:**
  - Phase 1: University & Institutional Campuses (IIT campus baseline).
  - Phase 2: Residential townships & corporate parks.
  - Phase 3: Citywide smart municipal infrastructure.

---

## Slide 8: Future Vision
- **IoT & Sensor Ingestion:** Integrating smart streetlight smart meters, vibration sensors, and water flow meters.
- **Autonomous Drone Patrols:** Pre-scheduled autonomous aerial verification of campus roads and roofs.
- **Predictive Deterioration:** Machine learning models forecasting infrastructure failure before physical breakage occurs.
- **Closing Statement:** PATCHPULSE — Transforming civic maintenance from reactive complaint counting to proactive, evidence-verified intelligence.
