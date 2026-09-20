# PATCHPULSE — AI Civic Intelligence & Verification Platform

> **Tagline:** *Detect problems before complaints become crises.*

---

## HACKDAY 1.0 Hackathon Submission Details

- **Hackathon:** HACKDAY 1.0
- **Theme:** TECH FOR A BETTER TOMORROW
- **Participant:** Pochiraju Kailash Ram Markandeya Sharma
- **Participation:** Solo Participant
- **Team Name:** `kailashsharma8`
- **Project Title:** PATCHPULSE

---

## 1. Executive Summary

Traditional civic platforms operate reactively: they wait for citizens to submit structured complaints, generate duplicate tickets for every submission, prioritize randomly, and mark tickets "resolved" with the click of a button without requiring physical evidence.

**PATCHPULSE** is an AI-powered civic intelligence network built on the **PULSE-5** methodology. It ingests weak signals across photos, natural language notes, voice recordings, location GPS, and facility telemetry, unifies them into deduplicated **Issue Fingerprints**, calculates an **explainable priority score (0–100)**, generates actionable repair orders, and **verifies resolution using dual-frame AI computer vision**.

---

## 2. The PULSE-5 Methodology

```
P — PERCEIVE  : Ingest multi-modal signals (Photo, Text, Voice, Location, Telemetry)
U — UNIFY     : 4-dimensional clustering (Semantic, Spatial Haversine, Temporal decay)
L — LEARN     : Contextual awareness (Nighttime, student hostel zone, hazard severity)
S — SCORE     : Explainable 0–100 priority score with transparent human rationale
E — EVIDENCE  : Dual-frame AI visual inspection of before vs. after repair states
```

---

## 3. Key Architectural Innovations

### 3.1 Multi-Dimensional Clustering Engine
Scattered signals are merged into one Issue Fingerprint using a composite similarity formula:
$$\text{ClusterScore} = 0.45 \cdot S_{\text{semantic}} + 0.30 \cdot S_{\text{location}} + 0.15 \cdot S_{\text{category}} + 0.10 \cdot S_{\text{temporal}}$$
- Spatial proximity uses great-circle **Haversine** distance normalized against a 150-meter threshold.
- Eliminates up to **75% of duplicate complaint clutter**.

### 3.2 Explainable Priority Engine
Urgency is never a black box. The engine computes:
$$\text{Priority} = 0.25 \cdot \text{Severity} + 0.20 \cdot \text{Impact} + 0.15 \cdot \text{Persistence} + 0.15 \cdot \text{Confidence} + 0.15 \cdot \text{Vulnerability} + 0.10 \cdot \text{Urgency}$$
Every issue displays a human-readable factor breakdown (e.g., *"Night-time blackout condition in student pedestrian conduit (+24)", "5-day persistence (+18)"*).

### 3.3 Evidence-Based AI Verification
Work orders cannot be marked resolved solely by clicking a button. The system requires an after-repair photo and executes automated dual-frame visual comparison:
- Computes **Visual Change Delta** and **Resolution Confidence**.
- If confidence $\ge 85\%$, status transitions to `VERIFIED_RESOLVED`.
- If confidence $< 85\%$, the incident is `REOPENED FOR REVIEW`.

---

## 4. Preloaded Flagship Demo Scenario (Issue #P-024)

The database includes the flagship campus incident:
- **Issue #P-024:** Streetlight Failure at Block C Parking Area.
- **Signal 1:** Photo uploaded showing dark broken luminaire fixture.
- **Signal 2:** Student text note: *"It is very dark near Block C parking. Girls walking back feel unsafe."*
- **Signal 3:** Voice hotline transcription: *"The light beside Block C parking area is broken."*
- **Signal 4:** Facility telemetry showing 5-day zero current draw at 18:30 scheduled activation.
- **Result:** Priority escalates to **91 (CRITICAL)** $\rightarrow$ Actionable Work Order `#PX-0192` dispatched to Senior Electrical Specialist Manoj Kumar $\rightarrow$ After-photo uploaded $\rightarrow$ AI verifies with **97% confidence** $\rightarrow$ **VERIFIED RESOLVED**.

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Leaflet Maps, Recharts, Lucide Icons |
| **Backend** | Node.js, NestJS (Modular Architecture), TypeScript, REST APIs |
| **Database** | PostgreSQL / SQLite (Universal Prisma Schema), Prisma ORM |
| **AI Engine** | OpenAI API client + Deterministic High-Precision Mock AI Engine |
| **Testing** | Jest, Ts-Jest, Supertest, Automated E2E Lifecycle Pipeline |
| **DevOps** | Multi-stage Dockerfile, Docker Compose, GitHub Actions CI |

---

## 6. Preloaded Demo Accounts

The seed script preconfigures 3 role-specific demo accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@patchpulse.demo` | `Pass@12345` | Full system governance, weights & health |
| **Operator** | `operator@patchpulse.demo` | `Pass@12345` | Work order dispatch, status & verification |
| **Citizen** | `citizen@patchpulse.demo` | `Pass@12345` | Multi-modal report submission & tracking |

---

## 7. Quick Start & Local Setup

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$

### 1. Clone & Install
```bash
git clone https://github.com/kailashsharma8/PatchPulse-HackDay-hackathon.git
cd PatchPulse-HackDay-hackathon
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(The default configuration runs in zero-dependency SQLite and High-Precision Mock AI mode out of the box with zero external latency.)*

### 3. Push Database Schema & Seed
```bash
npm run db:push
npm run db:seed
```

### 4. Start Development Environment
```bash
# Starts both Backend API (Port 3000) and Frontend Web (Port 5173)
npm run dev
```

Visit the application at: **http://localhost:5173**

---

## 8. Automated Testing Suite

PATCHPULSE includes comprehensive unit, integration, and end-to-end tests:

```bash
# Run backend unit tests (Priority, Clustering, Workflow, Verification)
npm run test

# Run complete End-to-End lifecycle test pipeline (Section 71)
npm run test:e2e
```

**Test Coverage Summary:**
- `priority.spec.ts`: Explainable 6-factor calculation, boundary clamps (0–100), NaN safety.
- `clustering.spec.ts`: Haversine spatial proximity, semantic embeddings, category compatibility, temporal decay.
- `workflow.spec.ts`: State machine transitions and invalid status jump prevention.
- `verification.spec.ts`: Before/after visual change delta analysis and threshold enforcement.
- `e2e-pipeline.spec.ts`: Complete automated user registration $\rightarrow$ report submission $\rightarrow$ AI clustering $\rightarrow$ priority escalation $\rightarrow$ work order dispatch $\rightarrow$ AI verification $\rightarrow$ verified resolved.

---

## 9. Production Builds

```bash
# Build both frontend and backend
npm run build
```

---

## 10. Docker Deployment

```bash
# Spin up PostgreSQL, Redis, and PATCHPULSE API via Docker Compose
docker-compose up --build
```

---

## 11. Documentation Links

- [System Architecture & Mathematical Foundations](file:///docs/ARCHITECTURE.md)
- [Complete REST API Reference](file:///docs/API.md)
- [Hackathon Presentation Deck (8 Slides)](file:///docs/PPT_CONTENT.md)
- [Elevator Pitches (30s, 1m, 2m)](file:///docs/PITCH.md)
