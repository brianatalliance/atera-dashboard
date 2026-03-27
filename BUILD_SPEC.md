# Atera RMM Dashboard — Build Specification

## Overview
Build a network operations dashboard for Atera RMM. Data is pre-loaded as static JSON files in `client/public/data/`. This is a static frontend app — no backend API needed. The dashboard should feel like a NOC/monitoring tool.

## Art Direction
- **Dark-first** — default to dark mode. Professional NOC/monitoring aesthetic.
- **Color palette**: Dark slate/charcoal surfaces (#0f1117, #161b22, #1c2128), teal primary accent (#22d3ee / cyan-400 for status/online), amber for warnings (#f59e0b), red for critical (#ef4444), green for success/online (#22c55e). 
- **Typography**: Inter for body, JetBrains Mono for data values/counts (tabular-nums). Max heading size text-xl.
- **Spacing**: Dense but not cramped. 4px grid.
- **NO hero sections, NO marketing copy** — this is a working dashboard.

## Data Files (client/public/data/)
- `summary.json` — KPIs, distributions by customer/OS/status/priority/source
- `active-alerts.json` — Currently active (non-archived) alerts
- `recent-alerts.json` — Last 50 alerts for timeline
- `agents.json` — All 279 agents with details
- `open-tickets.json` — Open + Pending tickets
- `customers.json` — 5 customers with metadata
- `alert-trend.json` — Monthly alert counts by severity (last 12 months)
- `ticket-trend.json` — Monthly ticket counts (last 12 months)

## Layout
Full-viewport dashboard with collapsible sidebar navigation. NO body scroll. Main content area scrolls independently.

### Sidebar
- Atera-style NOC logo (inline SVG — geometric, minimal)
- Nav items: Overview, Agents, Alerts, Tickets, Customers
- Collapsible (icon-only mode)
- Show active alert count badge on Alerts nav item
- Dark background slightly offset from main

### Pages

#### 1. Overview (default page)
- **KPI row** (5 cards): Total Agents (with online/offline counts), Active Alerts, Open Tickets, Pending Tickets, Total Customers
  - Online agents shows green dot + count, offline shows gray
  - Active alerts card should pulse if count > 0, red accent
  - Use tabular-nums for all numbers
- **Agents by Customer** — horizontal bar chart (Recharts)
- **Online vs Offline by Customer** — stacked bar chart
- **Alert Trend** (12 months) — area chart, stacked by severity (Critical=red, Warning=amber, Info=blue)
- **Ticket Trend** (12 months) — line chart
- **Tickets by Source** — donut chart
- **Active Alerts Table** — sortable table with severity indicator (colored dot), title, device, customer, time ago
- **OS Distribution** — horizontal bar chart or treemap

#### 2. Agents Page
- Filterable/searchable table of all 279 agents
- Columns: Status (online dot), Name, Customer, OS, IP, Processor, RAM (MB), Last Seen, User
- Search box filters by name, customer, IP, user
- Filter dropdown by customer
- Filter by online/offline status
- Sort by any column
- Pagination (25 per page)
- Click row to expand detail card (processor, memory, vendor, domain, etc.)

#### 3. Alerts Page
- Active alerts prominently at top
- Recent alerts timeline below (last 50)
- Filter by severity, customer
- Color-coded severity badges: Critical=red, Warning=amber, Info=blue

#### 4. Tickets Page
- Open/Pending tickets table
- Columns: ID, Title, Status, Priority, Type, Source, Customer, End User, Created
- Filter by status, priority, customer
- Tickets by Status donut chart
- Tickets by Priority bar chart

#### 5. Customers Page
- Card grid showing each customer
- Each card: name, domain, agent count, ticket count, address, phone
- Click to filter other pages by that customer (or just show detail)

## Technical Requirements
- Use Recharts for all charts (already installed)
- Use shadcn/ui components (Card, Table, Badge, Button, Input, Tabs, Select)
- Use lucide-react icons
- Hash-based routing with wouter + useHashLocation
- Dark mode as default — implement light/dark toggle in header
- All data fetched from `/data/*.json` using fetch (they're static files)
- Use React Query for data fetching with proper loading states
- Skeleton loaders while data loads
- Responsive — works on tablet too (sidebar collapses on smaller screens)
- tabular-nums on all numeric values
- Include PerplexityAttribution component in footer area
- data-testid attributes on interactive elements

## CSS Theme (index.css)
Replace all `red` placeholders with this NOC-inspired dark palette in HSL:
- Background: 220 20% 7% (dark navy-black)
- Card/surface: 220 16% 11%
- Primary accent: 190 90% 50% (cyan/teal)
- Border: 220 10% 18%
- Foreground text: 210 20% 90%
- Muted text: 215 15% 55%
- Destructive: 0 70% 55% (red for critical)
- Warning: 38 92% 50% (amber)
- Success: 142 71% 45% (green)

