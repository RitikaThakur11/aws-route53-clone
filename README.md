# AWS Route 53 Console Clone

An enterprise-grade, full-stack clone of the **Amazon Web Services (AWS) Route 53 DNS Management Console**. Built with Next.js (TypeScript, Tailwind CSS), FastAPI (Python, SQLAlchemy, Pydantic), and SQLite with relational integrity and cascade deletes.

---

## 📌 Overview

This project provides an authentic cloud-management console inspired by the AWS Route 53 user experience. It goes far beyond a generic CRUD dashboard by implementing realistic cloud-console workflows, dense data tables, deep DNS RFC validation across 9 record types, automatic default name server / SOA record generation, destructive action protections, and standard BIND zone file import/export capabilities.

---

## 🚀 Key Features

### 1. AWS CloudScape Console Experience
- **AWS Console Shell**: Dark Navy header (`#232f3e`), global region indicator (`Global (DNS)`), IAM session indicator (`admin@example.com / 4829-1029-3847`), and collapsible Route 53 sidebar.
- **Enterprise Data Tables**: Dense layout with sorting, single-row selection, debounced search, type filtering, page size selector (10, 25, 50, 100), and pagination.
- **Record Inspection Drawer**: Slide-out AWS-style details drawer showing full DNS attributes, human-readable TTL durations, technical metadata, and copyable BIND zone records.
- **Destructive Action Protection**: Deletion confirmation dialogs requiring explicit confirmation before cascade-deleting hosted zones and their associated records.
- **Coming Soon Consoles**: Polished preview experiences for Traffic Policies, Health Checks, Route 53 Resolver, and Profiles.

### 2. Hosted Zone Management (`/hosted-zones`)
- **Full CRUD**: Create, list, search, filter, edit description, and delete hosted zones.
- **Public & Private Zones**: Supports both Public and Private VPC hosted zones.
- **Automatic Default Provisioning**: Automatically provisions 4 AWS Route 53 authoritative nameservers (`.com`, `.net`, `.org`, `.co.uk`) and a Start of Authority (`SOA`) record upon creation.
- **Domain Validation & Collision Prevention**: Rejects invalid domain syntaxes and prevents duplicate active zones.

### 3. DNS Resource Record Management (`/hosted-zones/[id]`)
- **All 9 Standard DNS Types Supported**:
  - `A`: IPv4 addresses (`198.51.100.42`)
  - `AAAA`: IPv6 addresses (`2001:db8::1`)
  - `CNAME`: Canonical name aliases (`app.production.net.`) with CNAME coexistence conflict checks
  - `TXT`: Text strings and SPF verification (`v=spf1 include:_spf.google.com ~all`)
  - `MX`: Mail exchange with integer priorities (0–65535) and mail servers
  - `NS`: Delegated name servers
  - `PTR`: Reverse DNS pointer targets
  - `SRV`: Service locators with priority, weight, port, and target
  - `CAA`: Certification Authority Authorization with flags and tags (`issue`, `issuewild`, `iodef`)
  - `SOA`: Start of Authority record
- **Dynamic Type-Specific Forms**: Forms adapt fields, validation patterns, placeholders, and helper text dynamically based on the selected DNS record type.
- **Live FQDN Previews**: Real-time resolution of subdomains to fully qualified domain names.

### 4. Advanced Tools & Bonus Features
- **BIND Zone File Export**: Download standard RFC 1035 zone files (`.zone.txt`).
- **JSON Export**: Export zone configuration and records in JSON format.
- **BIND Zone File Import**: Parse and import standard zone text or file uploads into any hosted zone.

---

## 🛠 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | **Next.js 16 (App Router)** | Modern React server & client components with TypeScript |
| **Styling** | **Tailwind CSS v4** | Custom AWS CloudScape theme tokens and responsive layouts |
| **Icons** | **Lucide React** | Clean, crisp enterprise cloud icons |
| **Backend** | **Python 3.10+ / FastAPI** | High-performance asynchronous REST API framework |
| **Data Validation** | **Pydantic v2** | Strict request/response schemas with DNS RFC type validators |
| **ORM / Database** | **SQLAlchemy 2.0 + SQLite** | Relational schema with `PRAGMA foreign_keys = ON` and cascade deletes |
| **Testing** | **Pytest + HTTPX** | Automated test suite verifying auth, CRUD, validation, and relational cascades |

---

## 📐 System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Frontend                     │
│  (AWS Console Shell • CloudScape UI • Context Stores)   │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Bearer JWT)
┌───────────────────────────▼────────────────────────────┐
│                    FastAPI Backend                     │
│  • Auth Router (/api/auth)                             │
│  • Hosted Zones Router (/api/hosted-zones)             │
│  • DNS Records Router (/api/records)                   │
│  • DNS RFC Validation & BIND Parser Services           │
└───────────────────────────┬────────────────────────────┘
                            │ SQLAlchemy 2.0 ORM
┌───────────────────────────▼────────────────────────────┐
│                   SQLite Database                      │
│  • users (Mock IAM identity)                           │
│  • hosted_zones (1-to-many parent)                     │
│  • dns_records (Cascade delete on parent removal)      │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
aws-route53-clone/
├── README.md                     # Comprehensive project documentation
├── .gitignore                    # Git ignore file
├── backend/                      # Python FastAPI Backend
│   ├── pytest.ini               # Pytest configuration
│   ├── requirements.txt         # Backend Python dependencies
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint & lifespan
│   │   ├── config.py            # Environment settings and database path
│   │   ├── database.py          # SQLAlchemy engine & SQLite foreign key listener
│   │   ├── models/              # SQLAlchemy database models
│   │   │   ├── user.py          # User authentication entity
│   │   │   ├── hosted_zone.py   # Hosted zone entity with cascade relationship
│   │   │   └── dns_record.py    # DNS record entity with type-specific attributes
│   │   ├── schemas/             # Pydantic request & response schemas
│   │   │   ├── auth.py
│   │   │   ├── hosted_zone.py
│   │   │   └── dns_record.py
│   │   ├── routers/             # FastAPI API endpoints
│   │   │   ├── auth.py
│   │   │   ├── hosted_zones.py
│   │   │   └── dns_records.py
│   │   └── services/            # Core business logic & helpers
│   │       ├── auth_service.py  # Password hashing & JWT generation
│   │       ├── dns_validator.py # DNS RFC type validation
│   │       ├── zone_service.py  # Default NS/SOA provisioning & seed data
│   │       └── bind_formatter.py # BIND zone export and parser
│   └── tests/                   # Automated Pytest suite
│       ├── conftest.py          # Test database fixtures & auth headers
│       ├── test_auth.py         # Authentication tests
│       ├── test_hosted_zones.py # Hosted zones CRUD & BIND tests
│       └── test_dns_records.py  # DNS records CRUD & RFC validation tests
└── frontend/                     # Next.js TypeScript Frontend
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── src/
        ├── app/                 # Next.js App Router pages
        │   ├── layout.tsx       # Root layout with Auth & Toast providers
        │   ├── page.tsx         # Redirector to /hosted-zones or /login
        │   ├── login/           # AWS Sign-in Console page
        │   ├── dashboard/       # Route 53 Console Dashboard
        │   ├── hosted-zones/    # Hosted zones table & [id] records page
        │   ├── traffic-policies/# Traffic policies preview console
        │   ├── health-checks/   # Health checks preview console
        │   ├── resolver/        # Route 53 Resolver preview console
        │   └── profiles/        # Route 53 Profiles preview console
        ├── components/
        │   ├── layout/          # AwsHeader, AwsSidebar, Breadcrumbs, ConsoleLayout
        │   ├── common/          # DataTable, SearchBar, FilterDropdown, Pagination, Modal, ConfirmDialog, Badge
        │   ├── hosted-zones/    # CreateZoneModal, EditZoneModal, DeleteZoneDialog, ZoneHeaderSummary
        │   └── records/         # CreateRecordModal, EditRecordModal, RecordDetailsDrawer, ImportZoneModal, Form components
        ├── context/             # AuthContext (session persistence) & ToastContext (AWS alerts)
        ├── lib/                 # Typed API client, DNS utils, constants
        └── types/               # TypeScript interfaces
```

---

## 🗄 Database Schema & Relationships

### `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) | PRIMARY KEY | User UUID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt password hash |
| `name` | VARCHAR(255) | NOT NULL | User display name |
| `account_id` | VARCHAR(32) | NOT NULL | AWS Account ID |
| `created_at` | DATETIME | NOT NULL | UTC timestamp |

### `hosted_zones` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(32) | PRIMARY KEY | Route 53 ID (e.g. `Z0123456789ABCDEF`) |
| `name` | VARCHAR(255) | NOT NULL, INDEX | Apex domain (e.g. `example.com.`) |
| `type` | VARCHAR(20) | NOT NULL | `Public` or `Private` |
| `description` | VARCHAR(500) | NULLABLE | Comment / Description |
| `is_private` | BOOLEAN | NOT NULL | Private VPC indicator |
| `created_at` | DATETIME | NOT NULL | Creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Last update timestamp |

### `dns_records` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) | PRIMARY KEY | Record UUID |
| `hosted_zone_id` | VARCHAR(32) | FOREIGN KEY (`hosted_zones.id` ON DELETE CASCADE) | Parent hosted zone ID |
| `name` | VARCHAR(255) | NOT NULL, INDEX | FQDN or subdomain |
| `type` | VARCHAR(10) | NOT NULL, INDEX | `A`, `AAAA`, `CNAME`, `TXT`, `MX`, `NS`, `PTR`, `SRV`, `CAA`, `SOA` |
| `ttl` | INTEGER | NOT NULL (Default: 300) | Time-to-live in seconds |
| `value` | TEXT | NOT NULL | Target IP, host, or string |
| `priority` | INTEGER | NULLABLE | Priority (MX & SRV) |
| `weight` | INTEGER | NULLABLE | Weight (SRV) |
| `port` | INTEGER | NULLABLE | Port number (SRV) |
| `flags` | INTEGER | NULLABLE | Flags (CAA) |
| `tag` | VARCHAR(32) | NULLABLE | Tag (CAA: `issue`, `issuewild`, `iodef`) |
| `routing_policy`| VARCHAR(32) | NOT NULL (Default: `Simple`) | Routing policy |
| `created_at` | DATETIME | NOT NULL | Creation timestamp |
| `updated_at` | DATETIME | NOT NULL | Last update timestamp |

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/login`: Authenticates mock user and returns JWT token.
- `POST /api/auth/logout`: Terminates console session.
- `GET /api/auth/me`: Retrieves current authenticated user profile.

### Hosted Zones
- `GET /api/hosted-zones`: List hosted zones with `search`, `type` filter, and pagination (`page`, `page_size`).
- `POST /api/hosted-zones`: Create hosted zone (Status: `201 Created`). Automatically provisions default NS and SOA records.
- `GET /api/hosted-zones/{id}`: Get zone details and record count.
- `PATCH /api/hosted-zones/{id}`: Update zone description (Status: `200 OK`).
- `DELETE /api/hosted-zones/{id}`: Delete zone and cascade-delete all records (Status: `204 No Content`).
- `GET /api/hosted-zones/{id}/records`: List records for a zone with search and type filter.
- `GET /api/hosted-zones/{id}/export?format=bind|json`: Export zone in BIND or JSON format.
- `POST /api/hosted-zones/{id}/import`: Import BIND zone file contents into the hosted zone.

### DNS Records
- `POST /api/hosted-zones/{zone_id}/records`: Create a record with type-specific RFC validation (Status: `201 Created`).
- `GET /api/records/{id}`: Retrieve single record details.
- `PATCH /api/records/{id}`: Update record attributes (Status: `200 OK`).
- `DELETE /api/records/{id}`: Delete single record (Status: `204 No Content`).

---

## 🔐 Mock Authentication

Authentication is intentionally mocked for evaluation purposes:
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Session**: Persisted across browser refreshes using `localStorage` and verified against `/api/auth/me`.

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### 1. Start Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API will be live at: `http://localhost:8000` (Swagger UI at `http://localhost:8000/docs`).

### 2. Run Backend Automated Tests
```bash
cd backend
pytest -v
```

### 3. Start Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:3000`.

---

## 📸 User Flow Walkthrough

1. **Sign In**: Navigate to `http://localhost:3000/login` and log in with `admin@example.com` / `password123`.
2. **Hosted Zones Console**: View existing seeded hosted zones (`example.com`, `cloud-infra.internal`).
3. **Create Hosted Zone**: Click **Create hosted zone**, enter `mycloudapp.io`, select **Public hosted zone**, and submit.
4. **Inspect Default Records**: Open `mycloudapp.io` to view automatically created 4 NS and 1 SOA records.
5. **Add DNS Records**:
   - Create an `A` record: Name `api`, Value `198.51.100.42`, TTL `300`.
   - Create an `MX` record: Priority `10`, Value `mail.mycloudapp.io.`.
   - Create a `TXT` record: Value `v=spf1 include:_spf.google.com ~all`.
6. **Search & Filter**: Search for `api` and filter by `A` record type.
7. **Record Details Drawer**: Click any record row to slide open the technical inspection drawer and copy the BIND snippet.
8. **Export Zone**: Click **Export BIND** in the zone header to download the zone file.
9. **Delete Zone**: Click **Delete** to test cascade-deletion protection.
