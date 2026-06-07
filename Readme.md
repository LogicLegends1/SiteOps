# SiteOps

**SiteOps** is a construction operations management platform that connects Site Engineers, Project Managers, and Operations Managers in a single, unified workflow. It brings real-time activity tracking, workforce management, issue reporting, and predictive delay intelligence into one system — replacing scattered spreadsheets and status calls with a structured, role-based interface.

## 🚀 Live Demo

**Hosted Application:**  
https://site-ops-eight.vercel.app/

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web Interface | Next.js |
| ML Service (internal) | Python · FastAPI · Uvicorn |

The application runs as a **single container**. Next.js serves the web interface on port `3000` and is the only externally exposed surface. The Python service runs internally on port `8000` — not intended to be accessed directly in production — and handles ML tasks such as powering the Predictive Delay Engine.

---

## How It Works

Three roles interact with the platform at different levels:

**Site Engineers** log in to see their assigned activities and workforce, report incremental progress with optional photo evidence, and raise issues against specific activities. Every progress update is stored as an immutable audit log entry — e.g. *"Engineer marked progress from 30% → 40% — evidence attached."*

**Project Managers** schedule activities with start/end dates and headcount requirements, assign personnel (including Site Engineers) to those activities, and monitor workforce composition via the Workforce Dashboard. A Predictive Delay Engine surfaces anticipated risks so managers can act before delays materialise.

**Operations Managers** get a geospatial project map on login, showing live progress across every active project. They create new projects, attach documentation and overall schedules, manage workforce at the organisational level, and assign Project Managers — at which point a project transitions from *Not Started* to *Ongoing*.

---

## Get Started

### Option A — Docker (Recommended)

Runs both services together in a single container. Suitable for staging, demos, or anyone who just wants the app running without configuring a local environment.

**Prerequisites:** Docker installed and running.

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/siteops.git
cd siteops
```

### 2. Build the Image

```bash
docker build -t siteops .
```

### 3. Run the Container

```bash
docker run -p 3000:3000 siteops
```

The startup script launches the Python ML service internally and brings up Next.js as the main entrypoint.

| Service | URL |
|---|---|
| Web App (Next.js) | http://localhost:3000 |

---

### Option B — Run Services Manually

Preferred for active development. Run each service in its own terminal so you get hot-reload and independent logs.

**Prerequisites:** Node.js 20+, Python 3.11+

#### Terminal 1 — Python / FastAPI

```bash
cd services/python_service

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API available at:

```text
http://localhost:8000
```

Interactive API Documentation:

```text
http://localhost:8000/docs
```

#### Terminal 2 — Next.js

```bash
cd services/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Web application available at:

```text
http://localhost:3000
```

> **Note:** For a production-equivalent build locally, run:
>
> ```bash
> npm run build && npm start
> ```

---

## Project Structure

```text
siteops/
├── services/
│   ├── web/                  # Next.js frontend
│   └── python_service/       # FastAPI backend
│       ├── main.py
│       └── requirements.txt
├── Dockerfile
└── start.sh                  # Container entrypoint
```
