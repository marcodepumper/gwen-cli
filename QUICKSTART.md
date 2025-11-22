# GWEN Quick Start Guide

Get the multi-cloud status monitoring CLI running in 2 minutes.

## Prerequisites

- **Python 3.13+** (backend)
- **Node.js 18+** (CLI)
- **npm**

## Setup

### 1. Backend Setup (Python/FastAPI)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

Backend will run on **http://localhost:8000**

### 2. CLI Setup (TypeScript/Ink)

```bash
# Navigate to CLI directory
cd gwen-cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Start GWEN
node dist/index.js
```

## What You'll See

The GWEN CLI automatically:
- Connects to the backend at http://localhost:8000
- Starts all 7 agents immediately
- Displays a live dashboard with real-time status updates
- Auto-refreshes every 5 minutes

The dashboard monitors:
1. **Cloudflare** - CDN/DNS status + scheduled maintenance
2. **AWS** - Health Dashboard events
3. **Azure** - Public cloud status (RSS feed)
4. **GCP** - Cloud Platform incidents
5. **GitHub** - Services status
6. **Datadog** - Monitoring platform status
7. **Atlassian** - Jira/Confluence/Bitbucket status

Each agent shows:
- **Current status** (Operational/Degraded/Issues Detected)
- **14-day incident summary**
- **Color-coded indicators** (✓ Operational, ⚠ Degraded)

## CLI Commands

| Command | Description |
|---------|-------------|
| `/start-agents` | Execute all agents |
| `/run-agent <name>` | Execute a specific agent |
| `/list-agents` | List all available agents |
| `/detail` | Browse detailed agent results |
| `/help` | Show command reference |
| `/exit` | Exit GWEN |

**Tips**:
- Press `/` to open the command palette
- Use arrow keys to navigate
- Press ESC to close dialogs

## Features

✨ **Terminal Dashboard**: Beautiful TUI powered by Ink (React for CLIs)  
🔄 **Auto-Refresh**: Automatic status checks every 5 minutes  
🎯 **Minimalist**: Only essential commands - no redundancy  
🏢 **Multi-Service Monitoring**: 7 cloud platforms and services  
📊 **14-Day History**: Comprehensive incident tracking  
📋 **Human-Readable**: Formatted data with clear status descriptions  
🎨 **Color-coded**: Visual indication of service health  

## Architecture

```
Backend (Port 8000)          CLI (Terminal)
┌─────────────────┐         ┌──────────────────┐
│   FastAPI App   │◄────────│   Ink/React TUI  │
│                 │   HTTP  │                  │
│ 7 Agent Workers │         │  Live Dashboard  │
└─────────────────┘         └──────────────────┘
```

## API Endpoints

The backend exposes:
- `GET /agent-status` - All agent states
- `GET /agent-logs/{agent_name}` - Detailed logs
- `POST /retrieve-status` - Trigger full status check
- `GET /health` - Health check

CLI automatically calls these endpoints.

## Development Workflow

### Terminal 1 - Backend
```bash
python main.py
# Backend running on http://localhost:8000
```

### Terminal 2 - CLI
```bash
cd gwen-cli
node dist/index.js
# CLI connects to backend and starts monitoring
```

### Making Changes

**Backend**: Python changes auto-reload with uvicorn  
**CLI**: TypeScript changes require rebuild: `npm run build`

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.13+)
- Install dependencies: `pip install -r requirements.txt`

### CLI won't start
- Check Node version: `node --version` (need 18+)
- Build the CLI: `cd gwen-cli && npm run build`
- Verify dist/index.js exists

### CLI can't connect to backend
- Verify backend is running on port 8000
- Check backend logs for errors
- Ensure no firewall blocking localhost:8000

## Next Steps

1. **Use Commands**: Press `/` to see available commands
2. **View Details**: Run `/detail` to browse full agent results
3. **Add More Agents**: Create new agent in `agents/` directory
4. **Production Deploy**: 
   - Backend: `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`
   - CLI: Package with `npm run build` and distribute

## File Structure

```
gwen/
├── agents/               # 7 monitoring agents
├── orchestrator/         # Agent coordination
├── common/              # Shared utilities
├── gwen-cli/            # Terminal UI
│   ├── src/
│   │   ├── ui/         # UI components
│   │   ├── commands/   # Command handlers
│   │   ├── core/       # API client
│   │   └── App.tsx     # Main app
│   └── package.json
├── main.py             # FastAPI server
├── requirements.txt    # Python deps
└── README.md          # Full documentation
```

## Support

- Full docs: See `README.md`
- CLI docs: See `gwen-cli/README.md`
- Issues: Check CLI output + backend logs

---

**You're ready!** 🚀 Backend and CLI should be running with live monitoring
