# GWEN - Multi-Agent Cloud Status Monitor

**G**lobal **W**atch **E**ngine for **N**etwork services - A Python-based multi-agent orchestration system for monitoring cloud service status across multiple providers.

## Overview

GWEN is a command-line tool that monitors the operational status of major cloud service providers including Cloudflare, AWS, Azure, GCP, GitHub, Datadog, and Atlassian. It aggregates status information, incidents, and scheduled maintenance across all services into a single interface.

### Key Features

- 🌍 **Multi-Provider Monitoring**: Track 7 major cloud providers simultaneously
- 📊 **Real-time Status**: Current operational status and ongoing incidents
- 🔍 **Component-Level Details**: See individual component status (e.g., specific data centers, regions)
- 📅 **Scheduled Maintenance**: View upcoming maintenance windows
- 📜 **Historical Data**: Access up to 14 days of incident history
- 🌎 **Regional Awareness**: Cloudflare incidents and components grouped by region (US/North America prioritized)
- 🎨 **Beautiful CLI**: Clean, formatted terminal output using Rich library
- ⚡ **Async Performance**: Fast concurrent agent execution

### Monitored Services

- **Cloudflare** - Global CDN and security services
- **AWS** - Amazon Web Services
- **Azure** - Microsoft cloud platform
- **GCP** - Google Cloud Platform
- **GitHub** - Development platform and services
- **Datadog** - Monitoring and analytics platform
- **Atlassian** - Jira, Confluence, and other services

## Architecture

GWEN is a pure Python application with two main components:

1. **Backend (FastAPI)** - Async agent orchestration system with REST API
2. **CLI (gwen.py)** - Rich-formatted command-line interface

```
┌──────────────────┐
│   gwen.py CLI    │  ← User interface (Rich library)
└────────┬─────────┘
         │ HTTP (aiohttp)
┌────────▼─────────┐
│  FastAPI Server  │  ← Orchestrator
│  (port 8000)     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │ 7 Agents│  ← Data collection from status APIs
    └─────────┘
```

## Installation

### Prerequisites

- Python 3.9 or higher
- pip package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/marcodepumper/gwen-cli.git
   cd gwen-cli
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Windows Users**
   Use the included `gwen.bat` wrapper for shorter commands:
   ```cmd
   gwen status
   gwen maintenance
   gwen help
   ```

4. **Unix/Linux/macOS Users**
   Make CLI executable:
   ```bash
   chmod +x bin/gwen
   # Then use: ./bin/gwen status
   ```

## Quick Start

### 1. Start the Backend Server

In one terminal, start the FastAPI backend:

```bash
cd backend
python -m uvicorn main:app --port 8000
```

The backend will initialize all 7 monitoring agents and listen on `http://127.0.0.1:8000`.

### 2. Use the CLI

**Windows (using gwen.bat wrapper):**
```cmd
gwen status
gwen incidents
gwen maintenance
gwen help
```

**Unix/Linux/macOS:**
```bash
python gwen.py status
python gwen.py incidents
python gwen.py maintenance
python gwen.py help
```

## Usage

### Commands

#### `status [agent]`
Show current operational status of all services or a specific agent.

```bash
# All services - shows summary table
gwen status

# Specific service - shows detailed breakdown
gwen status CloudflareAgent
```

**Summary table includes:**
- Overall status indicator (✅ Operational, ⚠️ Minor, 🔴 Major, 🚨 Critical)
- **Component status** - Non-operational components even when overall status is OK
- Active incident count
- Scheduled maintenance count
- Last updated timestamp

**Detailed view includes:**
- Current status with description
- Ongoing incidents with details
- Non-operational components grouped by region
- Scheduled maintenance (sorted soonest first)

**Example component details:**
```
Overall Status: All Systems Operational

Non-Operational Components:

  North America:
    Re-Routed: DTW, ORF, ANC
    Partially Re-Routed: FSD
```

#### `incidents [agent] [--days N] [--show-recent]`
Display current and recent incidents.

```bash
# All ongoing incidents
gwen incidents

# Specific service with recent history
gwen incidents CloudflareAgent --show-recent --days 7

# Last 14 days of incidents
gwen incidents --days 14 --show-recent
```

**Options:**
- `--days N` - Number of days to look back (default: 14)
- `--show-recent` - Include resolved incidents

**Features:**
- Separates ongoing vs. resolved incidents
- Shows incident impact, status, and timestamps
- Filters by service or shows all

#### `maintenance [agent]`
Show upcoming and in-progress scheduled maintenance.

```bash
# All services
gwen maintenance

# Specific service - shows regional grouping
gwen maintenance CloudflareAgent
```

**Features:**
- Sorted by date (soonest first)
- In-progress maintenance prioritized
- **Regional grouping** - Maintenance windows grouped by geographic region
- Compact location codes (DFW, LAX, EZE, SIN, etc.)
- Date ranges for each region

**Example regional output:**
```
North America: 13 scheduled
  Locations: RIC, IAD, ORD, LAX, EWR, DFW, SJC, SEA, MIA
  Dates: 2025-11-24 to 2025-12-02

Latin America & Caribbean: 13 scheduled
  Locations: EZE, BOG, LIM, CWB, GRU, NVT, ARI, MDE, SJO, QRO
  Dates: 2025-11-25 to 2025-12-02
```

#### `list-agents`
List all available monitoring agents.

```bash
gwen list-agents
```

#### `help`
Display detailed command reference with examples.

```bash
gwen help
```

### Example Output

```
                    Cloud Service Status
┌────────────┬──────────────────┬────────────────────┬───────────┬─────────────┬──────────────────────┐
│ Service    │ Status           │ Components         │ Incidents │ Maintenance │ Last Updated         │
├────────────┼──────────────────┼────────────────────┼───────────┼─────────────┼──────────────────────┤
│ Cloudflare │ ✅ Operational   │ ⚠ 4 re-routed      │ 0         │ 0           │ 2025-11-22 11:00:00 │
│ Azure      │ ✅ Operational   │ ✓ All OK           │ 0         │ 0           │ 2025-11-22 11:00:01 │
│ AWS        │ ⚠️ 1 ongoing     │ ✓ All OK           │ 3         │ 0           │ 2025-11-22 11:00:02 │
│ GCP        │ ✅ Operational   │ ✓ All OK           │ 0         │ 1           │ 2025-11-22 11:00:03 │
│ GitHub     │ ✅ Operational   │ ✓ All OK           │ 0         │ 0           │ 2025-11-22 11:00:04 │
│ Datadog    │ ✅ Operational   │ ✓ All OK           │ 0         │ 0           │ 2025-11-22 11:00:05 │
│ Atlassian  │ ✅ Operational   │ ✓ All OK           │ 0         │ 0           │ 2025-11-22 11:00:06 │
└────────────┴──────────────────┴────────────────────┴───────────┴─────────────┴──────────────────────┘

💡 Tip: Run 'python gwen.py status CloudflareAgent' for detailed component status
```

## API Endpoints

The backend provides REST endpoints for integration:

- `GET /` - System information
- `GET /health` - Health check
- `POST /retrieve-status` - Execute all agents and get status
- `GET /agent-status` - Get all agent statuses
- `GET /agents` - List available agents
- `POST /agents/{agent_name}/execute` - Execute specific agent

### Example API Usage

```bash
# Execute all agents
curl -X POST http://localhost:8000/retrieve-status

# Get status
curl http://localhost:8000/agent-status

# Execute specific agent
curl -X POST http://localhost:8000/agents/CloudflareAgent/execute
```

## Project Structure

```
gwen-cli/
├── gwen.py              # Python CLI application (486 lines)
├── gwen.bat             # Windows wrapper (shorter commands)
├── bin/
│   └── gwen            # Unix/Linux/macOS wrapper
└── backend/            # FastAPI backend
    ├── main.py         # API server with REST endpoints
    ├── requirements.txt
    ├── agents/         # 7 monitoring agents
    │   ├── base.py
    │   ├── cloudflare.py  # Component-level tracking
    │   ├── aws.py         # RSS feed parsing
    │   ├── azure.py       # RSS feed parsing
    │   ├── gcp.py
    │   ├── github.py
    │   ├── datadog.py
    │   └── atlassian.py
    ├── orchestrator/   # Agent orchestration
    │   └── orchestrator.py
    └── common/         # Shared utilities
        ├── models.py   # Pydantic data models
        ├── config.py
        └── logging.py
```

## Development

### Adding a New Agent

1. Create a new agent class in `backend/agents/`
2. Inherit from `BaseAgent`
3. Implement `_execute_task()` method
4. Register in `backend/orchestrator/orchestrator.py`

### Running Tests

```bash
cd backend
pytest
```

## Troubleshooting

### Backend not connecting
Ensure the backend is running on port 8000:
```bash
cd backend
python -m uvicorn main:app --port 8000
```

Check if backend is accessible:
```bash
curl http://localhost:8000/health
```

### API Error 500
Check backend logs for agent execution errors. Some agents may require API keys or specific network access.

### Commands not working
- **Windows**: Use `gwen` commands (via gwen.bat wrapper)
- **Unix/Linux/macOS**: Use `python gwen.py` or `./bin/gwen`

### Component status not showing
Component-level details are currently available for Cloudflare only. Other services show overall status.

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- CLI powered by [Rich](https://rich.readthedocs.io/)
- Status data from official service status pages
