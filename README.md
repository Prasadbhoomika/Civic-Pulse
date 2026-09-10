# CivicPulse // Cyberpunk Intelligent Civic Issue Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-00E5FF.svg)](https://react.dev)
[![Cyberpunk Theme](https://img.shields.io/badge/Design-Cyberpunk_HUD_v2.4-FF2BD6.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-7CFF4F.svg)](LICENSE)

**CivicPulse** is an academic-grade full-stack civic technology infrastructure platform built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with a **Cyberpunk Smart City Command Center** visual aesthetic.

It manages the complete lifecycle of urban infrastructure issues (potholes, streetlights, garbage accumulation, water leaks, drainage, electrical hazards, etc.) through intelligent duplicate detection, dynamic priority scoring, evidence-based resolution, and SLA deadline tracking.

---

## 🚀 Key Features & Capabilities

- 🤖 **AI Geospatial Duplicate Detection**: Scans existing unresolved reports within a configurable radius (e.g. 150m) and text similarity score. Shows prompt to support existing issues vs creating duplicates.
- 📊 **Intelligent Priority Score Index (0–100)**: Modular scoring formula evaluating reported severity, citizen supporters, pending age, category urgency, and location risk.
- ⏳ **Dynamic SLA Tracking**: Assigns SLA resolution deadlines based on priority (Critical: 24h, High: 48h, Medium: 72h, Low: 7 days). Provides live countdown timers and status indicators (Within SLA, Due Soon, SLA Breached).
- 📸 **Evidence-Based Resolution**: Field workers upload after-resolution photo evidence. Citizens inspect side-by-side before/after evidence to approve or reopen unresolved complaints.
- 👥 **Multi-Role Role-Based Workflows**:
  - **Citizen**: Report issues, select map coordinates, upload evidence, support complaints, verify resolutions, track timelines.
  - **Field Worker**: View assigned workload, navigate GPS map routes, upload progress notes and resolution evidence.
  - **Department Officer**: Oversee department queue, assign field workers, override priorities, monitor SLA compliance.
  - **System Admin**: Control center analytics, city health index, user management, category distribution charts, geographic heatmaps.
- 🗺️ **Dark-Themed Cartographic Maps**: Leaflet maps with custom neon status markers, marker popups, location picker mode, and incident heatmaps.
- ⚡ **Cyberpunk HUD Aesthetics**: Futuristic command-center visual identity built with Space Grotesk & JetBrains Mono typography, scanline overlays, neon accents, and responsive layout.

---

## 📐 Project Architecture Diagram

```
                              ┌──────────────────────────────────┐
                              │     REACT + VITE FRONTEND        │
                              │ (Cyberpunk HUD, Recharts, Maps)  │
                              └────────────────┬─────────────────┘
                                               │  REST API (Axios + JWT)
                                               ▼
                              ┌──────────────────────────────────┐
                              │     EXPRESS.JS / NODE BACKEND    │
                              │ (Controllers, Middleware, Auth)  │
                              └──────┬────────────────────┬──────┘
                                     │                    │
          ┌──────────────────────────┴──────┐     ┌───────┴──────────────────────────┐
          │  INTELLIGENT SERVICES ENGINE    │     │  MONGODB + MONGOOSE DATABASE     │
          │  - Priority Scoring Service     │     │  - 2DSphere Geospatial Indexes   │
          │  - Duplicate Detector           │     │  - User, Complaint, Dept Schemas │
          │  - SLA Countdown Calculator     │     │  - Audit Logs & Notifications    │
          │  - AI Vision Service Layer      │     └──────────────────────────────────┘
          └─────────────────────────────────┘
```

---

## 🔑 Sample Credentials for Testing & Demonstration

All accounts are pre-seeded via `npm run seed` with password: **`password123`**

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **System Admin** | Dr. Evelyn Vance | `admin@civicpulse.city` | `password123` |
| **Department Officer** | Cmdr. Marcus Sterling | `officer@civicpulse.city` | `password123` |
| **Field Worker** | Jack K. (Engineer #04) | `worker@civicpulse.city` | `password123` |
| **Citizen** | Alice Mercer | `citizen@civicpulse.city` | `password123` |

*(Note: The login page includes a **1-Click Demo Login** bar to switch between any role instantly for testing).*

---

## 🚢 DevOps / Deployment

See **[DEVOPS.md](DEVOPS.md)** for Docker, Docker Compose, GitHub Actions, Jenkins, Nginx and Kubernetes deployment. The repository now includes production-style health/readiness probes, container builds, CI smoke tests, Kubernetes manifests, HPA and secret/config separation.

## 🛠️ Installation & Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally at `mongodb://127.0.0.1:27017` OR a MongoDB Atlas URI.

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds 30+ complaints, departments, and demo user accounts
npm run dev      # Starts Express API at http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite React App at http://localhost:3000
```

---

## 🗄️ Database Schemas Overview

- **User**: Name, Email, Password Hash (bcrypt), Role (`citizen`, `worker`, `officer`, `admin`), Department ObjectId, Phone, GeoJSON Location point.
- **Complaint**: Complaint ID (`CP-YYYY-XXXX`), Title, Description, Category, Severity, Priority Score (0-100), Priority Level, Location (`2dsphere`), Address, Photos, Reporter, Department, Assigned Worker, Status, Support Count, SLA Deadline, Resolution Evidence.
- **Department**: Code, Name, Description, Responsible Categories, Officers.
- **Notification**: User, Complaint, Type, Message, Read Status, Timestamps.
- **ComplaintHistory**: Complaint, Previous Status, New Status, Changed By, Audit Comment, Timestamp.
- **Verification**: Complaint, Citizen, Result (`approved`/`rejected`), Reason, Timestamp.

---

## 📡 API Endpoint Summary

### Authentication
- `POST /api/auth/register` - Register user account
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/me` - Get current authenticated user profile

### Complaints & Workflow
- `POST /api/complaints` - Report new civic issue (Runs AI duplicate check & priority score)
- `GET /api/complaints` - Query complaints with search, category, status, priority, and pagination
- `GET /api/complaints/:id` - Fetch detailed complaint case file with timeline history & comments
- `PATCH /api/complaints/:id/status` - Update lifecycle status
- `PATCH /api/complaints/:id/assign` - Officer assigns field worker
- `POST /api/complaints/:id/support` - Support/upvote existing complaint (+1 count & score boost)
- `POST /api/complaints/:id/resolve` - Worker submits resolution evidence (after photo + notes)
- `POST /api/complaints/:id/verify` - Citizen approves or reopens resolved complaint
- `GET /api/complaints/nearby` - Geospatial `$near` location query

### Analytics & System
- `GET /api/analytics/admin` - Control center dashboard analytics & heatmap points
- `GET /api/analytics/department` - Department workload metrics
- `GET /api/notifications` - Fetch user in-app alerts

---

## 🧪 Testing Checklist

- [x] **Auth & Role Authorization**: Test login with Citizen, Worker, Officer, and Admin credentials.
- [x] **Geospatial Duplicate Detection**: Create a report near an existing issue to verify the AI duplicate modal warning.
- [x] **Priority Meter**: Verify priority score calculation (0–100) and breakdown elements.
- [x] **Field Worker Resolution**: Assign worker, submit resolution photo evidence, verify status update to `resolved`.
- [x] **Citizen Verification**: Verify side-by-side evidence comparison and approve/reopen workflow.
- [x] **SLA Countdown**: Verify live ticking countdown and SLA breach badge calculations.
- [x] **Analytics & Charts**: Inspect Recharts category bar charts, monthly trends, and dark cartographic Leaflet map.

---

## 🔮 Future Enhancements
1. TensorFlow.js Vision integration for native automated image classification.
2. Real-time WebSockets (Socket.io) push notifications for live field status updates.
3. Mobile React Native app for offline GPS photo capture in remote areas.

---

**Built for Civic Technology & Smart City Urban Management.**
