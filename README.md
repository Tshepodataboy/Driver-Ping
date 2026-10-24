# 🚗 Driver-Ping

---

## 📌 Executive Summary

**Driver-Ping** is an intelligent, real-time driver alert and vehicle reporting platform built to bridge the communication gap between citizens and vehicle drivers on the road.

Whether it's an emergency alert, an unsafe driving report, or an ownership verification ping, **Driver-Ping** enables instant, secure, and privacy-focused driver notifications powered by automated AI processing via Google Gemini and persistent storage on Supabase PostgreSQL.

---

## 🌟 Key Features

* ⚡ **Instant Driver Ping System**: Rapid incident logging and driver notification via direct messaging and OTP-based dispatch.
* 🛡️ **Vehicle Ownership Verification**: Structured workflows to verify vehicle-driver pairings securely.
* 🤖 **AI-Assisted Summaries & Triage**: Automated processing of incoming incident reports using Google Gemini AI.
* 📊 **Comprehensive Audit Logs**: Complete trail of delivery logs, trusted contact alerts, and incident histories.
* 🔒 **PostgreSQL & Row-Level Safety**: Enterprise-grade relational data modeling built directly for Supabase.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    %% Clients
    subgraph Clients["📱 Client Layer"]
        UserApp["Web Application (Vite + Tailwind)"]
        MobileClient["Mobile Web Interface"]
    end

    %% Application Server
    subgraph Server["⚡ Server Layer (Node.js / Express / TS)"]
        API["REST & Auth Controller (server.ts)"]
        GeminiService["Gemini AI Service Module"]
    end

    %% External Services
    subgraph External["☁️ External Cloud Services"]
        GeminiAI["Google Gemini API"]
        Supabase["Supabase (PostgreSQL 17)"]
        Railway["Railway Cloud Hosting"]
    end

    %% Connections
    UserApp -->|HTTPS / REST| API
    MobileClient -->|HTTPS / REST| API
    API -->|Prompt & Analysis| GeminiService
    GeminiService -->|Structured AI Summary| GeminiAI
    API -->|SQL Queries / Pooler :5432| Supabase
    Server -.->|Deployed on| Railway

```

---

## 🗄️ Database Schema & Data Flow

```mermaid
erDiagram
    USERS ||--o{ VEHICLES : "owns"
    USERS ||--o{ TRUSTED_CONTACTS : "configures"
    VEHICLES ||--o{ VEHICLE_DRIVERS : "assigned_to"
    VEHICLES ||--o{ REPORTS : "receives"
    REPORTS ||--o{ DELIVERY_LOGS : "triggers"
    USERS ||--o{ AUDIT_LOGS : "generates"

    USERS {
        uuid id PK
        string full_name
        string phone_number
        string email
        timestamp created_at
    }

    VEHICLES {
        uuid id PK
        uuid owner_id FK
        string license_plate
        string make_model
        timestamp registered_at
    }

    REPORTS {
        uuid id PK
        uuid vehicle_id FK
        string report_type
        string message
        string status
        timestamp created_at
    }

    DELIVERY_LOGS {
        uuid id PK
        uuid report_id FK
        string channel
        string status
        timestamp sent_at
    }

```

---

## 🛠️ Tech Stack & Prerequisites

### Tech Stack

| Category | Technology |
| --- | --- |
| **Language** | TypeScript / Node.js |
| **Database** | PostgreSQL 17 (Hosted via Supabase) |
| **Frontend** | Vite, Tailwind CSS, HTML5 |
| **AI Integration** | Google Gemini API (`@google/genai`) |
| **Database Client** | `pg` (Node-Postgres) & `@supabase/supabase-js` |
| **Deployment Target** | Railway Platform |

### Prerequisites

* **Node.js** `v20.x` or higher
* **npm** or **bun** package manager
* **Supabase Account** with an active PostgreSQL project
* **Google Gemini API Key**

---

## ⚙️ Quick Start & Local Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Tshepodataboy/Driver-Ping.git
cd Driver-Ping

```

### 2️⃣ Install Dependencies

*Use `--legacy-peer-deps` to handle Vite peer dependency flags:*

```bash
npm install --legacy-peer-deps

```

### 3️⃣ Configure Environment Variables

Create a local `.env` file in the root folder based on `.env.example`:

```env
# Supabase PostgreSQL Connection
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Supabase API Credentials
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Security & Services
JWT_SECRET="your_secure_random_jwt_secret_minimum_32_characters"
GEMINI_API_KEY="your_google_gemini_api_key"
PORT=3000

```

> **⚠️ Important Note on Passwords:**
> If your database password contains special characters (e.g. `&`, `#`, `@`, `%`), ensure they are **URL-encoded** inside your `DATABASE_URL` string (e.g., replace `&` with `%26`).

---

## 🧪 Database Connection Verification

Verify your connection to your Supabase PostgreSQL instance before running or deploying:

```bash
npx tsx scripts/verify-supabase-connection.ts

```

#### Expected Success Output:

```text
[1/4] Attempting direct PostgreSQL connection handshake...
✅ Handshake succeeded!

[2/4] Querying database version & server time...
✅ Engine: PostgreSQL 17.11 on x86_64-pc-linux-gnu

[3/4] Verifying schema tables in public schema...
✅ Found 9 tables in public schema

==========================================
RESULT: REAL POSTGRESQL CONNECTION SUCCEEDED!
==========================================

```

---

## 🚀 Running the Development Server

Start the local server:

```bash
npm run dev
# or
npx tsx server.ts

```

The application will be live at `http://localhost:3000`.

---

## 🚢 Production Deployment (Railway Guide)

Deployment to **Railway** takes under 3 minutes:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as GitHub
    participant Rwy as Railway Engine
    participant Supa as Supabase DB

    Dev->>Git: git push origin main
    Git->>Rwy: Webhook Trigger
    Rwy->>Rwy: npm run build
    Rwy->>Supa: Handshake & Verification
    Supa-->>Rwy: Connection Confirmed
    Rwy->>Dev: Live Public URL Generated 🚀

```

### Step-by-Step Instructions

1. **Push to GitHub**:
```bash
git add .
git commit -m "Build: ready for production"
git push origin main

```


2. **Create Railway Project**:
* Open [Railway.app](https://railway.app/).
* Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
* Select `Tshepodataboy/Driver-Ping`.


3. **Configure Environment Variables**:
In Railway's **Variables** tab, add:
* `DATABASE_URL`
* `SUPABASE_URL`
* `SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`
* `JWT_SECRET`
* `GEMINI_API_KEY`
* `PORT` = `3000`


4. **Generate Domain**:
* Go to **Settings** $\rightarrow$ **Networking** $\rightarrow$ Click **Generate Domain**.
* Access your live, globally accessible deployment!



---

## 📁 Repository Structure

```text
Driver-Ping/
├── .env.example              # Environment variables template
├── package.json              # Project dependencies & scripts
├── server.ts                 # Express / API Application Server
├── vite.config.ts            # Frontend build configuration
├── scripts/
│   └── verify-supabase-connection.ts  # Handshake & schema verifier
├── src/
│   ├── db/
│   │   └── schema.sql        # Full Supabase PostgreSQL DDL schema
│   └── ...                   # Frontend/Backend modules
└── README.md                 # System documentation

```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.