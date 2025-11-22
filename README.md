# GWEN - Multi-Agent Cloud Status Monitor

**G**lobal **W**atch **E**ngine for **N**etwork services - A Python-based multi-agent orchestration system for monitoring cloud service status across multiple providers.

## Overview

GWEN is a command-line tool that monitors the operational status of major cloud service providers including Cloudflare, AWS, Azure, GCP, GitHub, Datadog, and Atlassian. It aggregates status information, incidents, and scheduled maintenance across all services into a single interface.

### Key Features

- 🌍 **Multi-Provider Monitoring**: Track 7 major cloud providers simultaneously
- 📊 **Real-time Status**: Current operational status and ongoing incidents
- 📅 **Scheduled Maintenance**: View upcoming maintenance windows
- 📜 **Historical Data**: Access up to 14 days of incident history
- 🌎 **Regional Awareness**: Cloudflare incidents grouped by region (US/North America prioritized)
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

GWEN consists of two main components:

1. **Backend (FastAPI)** - Async agent orchestration system with REST API
2. **CLI (Python)** - Command-line interface for querying agent data

```
┌─────────────────┐
│   gwen CLI      │  ← User interface
└────────┬────────┘
         │ HTTP
┌────────▼────────┐
│  FastAPI Server │  ← Orchestrator
└────────┬────────┘
         │
    ┌────┴────┐
    │ Agents  │  ← Data collection
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
   cd backend
   pip install -r requirements.txt
   ```

3. **Make CLI executable** (Unix/Linux/macOS)
   ```bash
   chmod +x bin/gwen
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

In another terminal, run GWEN commands:

```bash
# Show status of all services
python gwen.py status

# List available agents
python gwen.py list-agents

# Show incidents (ongoing and recent)
python gwen.py incidents

# Show scheduled maintenance
python gwen.py maintenance
```

## Usage

### Commands

#### `status [agent]`
Show current operational status of all services or a specific agent.

```bash
# All services
python gwen.py status

# Specific service
python gwen.py status CloudflareAgent
```

**Output includes:**
- Overall status indicator (✅ Operational, ⚠️ Minor, 🔴 Major, 🚨 Critical)
- Active incident count
- Scheduled maintenance count
- Last updated timestamp

#### `incidents [agent] [--days N] [--show-recent]`
Display current and recent incidents.

```bash
# All ongoing incidents
python gwen.py incidents

# Specific service with recent history
python gwen.py incidents CloudflareAgent --show-recent --days 7

# Last 14 days of incidents
python gwen.py incidents --days 14 --show-recent
```

**Options:**
- `--days N` - Number of days to look back (default: 14)
- `--show-recent` - Include resolved incidents

#### `maintenance [agent]`
Show upcoming and in-progress scheduled maintenance.

```bash
# All services
python gwen.py maintenance

# Specific service
python gwen.py maintenance AzureAgent
```

**Displays:**
- 🔧 In-progress maintenance
- 📅 Upcoming maintenance
- Scheduled start and end times
- Affected components

#### `list-agents`
List all available monitoring agents.

```bash
python gwen.py list-agents
```

### Example Output

```
                    Cloud Service Status
┌────────────┬──────────────────┬───────────┬─────────────┬──────────────────────┐
│ Service    │ Status           │ Incidents │ Maintenance │ Last Updated         │
├────────────┼──────────────────┼───────────┼─────────────┼──────────────────────┤
│ Cloudflare │ ⚠️ 2 ongoing     │ 5         │ 1           │ 2025-11-22 11:00:00 │
│ Azure      │ ✅ Operational   │ 0         │ 0           │ 2025-11-22 11:00:01 │
│ AWS        │ ✅ Operational   │ 1         │ 0           │ 2025-11-22 11:00:02 │
│ GCP        │ ✅ Operational   │ 0         │ 1           │ 2025-11-22 11:00:03 │
│ GitHub     │ ✅ Operational   │ 0         │ 0           │ 2025-11-22 11:00:04 │
│ Datadog    │ ✅ Operational   │ 0         │ 0           │ 2025-11-22 11:00:05 │
│ Atlassian  │ ✅ Operational   │ 0         │ 0           │ 2025-11-22 11:00:06 │
└────────────┴──────────────────┴───────────┴─────────────┴──────────────────────┘
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
├── gwen.py                # CLI application
├── bin/
│   └── gwen              # Shell wrapper
└── backend/              # FastAPI backend
    ├── main.py          # API server
    ├── requirements.txt # Dependencies
    ├── agents/          # Monitoring agents
    │   ├── base.py
    │   ├── cloudflare.py
    │   ├── aws.py
    │   ├── azure.py
    │   ├── gcp.py
    │   ├── github.py
    │   ├── datadog.py
    │   └── atlassian.py
    ├── orchestrator/    # Agent orchestration
    └── common/          # Shared utilities
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

### API Error 500
Check backend logs for agent execution errors. Some agents may require API keys or specific network access.

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- CLI powered by [Rich](https://rich.readthedocs.io/)
- Status data from official service status pages
