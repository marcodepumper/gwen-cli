# GWEN CLI - Quick Start with Backend

## Prerequisites

1. **Backend running** on `http://localhost:8000`
2. **Node.js 18+** installed

## Setup

```bash
cd gwen-cli
npm install
npm link
```

## Usage

### Start Backend First

```bash
# In the main gwen directory
python main.py
```

### Launch GWEN CLI

```bash
gwen
```

## Available Commands

Once in GWEN:

- `/help` - Show all commands
- `/health` - Check backend connection
- `/list-agents` - List all agents from backend
- `/status` - Get current status of all agents
- `/run-agent --auto` - Execute all agents via backend
- `/run-agent <name>` - Execute specific agent (e.g., `/run-agent CloudflareAgent`)
- `/logs <name>` - Get logs for specific agent
- `/exit` - Exit GWEN

## Quick Test

```bash
gwen

# Inside GWEN:
/health              # Check backend is connected
/list-agents         # See available agents
/run-agent --auto    # Execute all agents
/status              # View results
```

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   GWEN CLI      │────────▶│  FastAPI Backend │
│   (Node.js)     │  HTTP   │   (Python)       │
│   Port: N/A     │         │   Port: 8000     │
└─────────────────┘         └──────────────────┘
        │                            │
        │                            ▼
        │                    ┌──────────────┐
        │                    │  7 Agents    │
        │                    │  (Parallel)  │
        │                    └──────────────┘
        │
        └─ TUI Display (Ink/React)
```

## Commands Map to API

| CLI Command | Backend API Endpoint |
|------------|---------------------|
| `/run-agent --auto` | `POST /retrieve-status` |
| `/run-agent <name>` | `POST /agents/<name>/execute` |
| `/list-agents` | `GET /` (system info) |
| `/status` | `GET /agent-status` |
| `/logs <name>` | `GET /agent-logs/<name>` |
| `/health` | `GET /health` |

## Troubleshooting

### "Backend health check failed"

- Make sure Python backend is running: `python main.py`
- Check it's accessible at http://localhost:8000
- Try: `curl http://localhost:8000/health`

### "Failed to list agents"

- Backend must be running first
- Check firewall isn't blocking port 8000

### CLI not found

```bash
cd gwen-cli
npm link
```

## Example Session

```
$ gwen

◢◤ GWEN SYSTEM ONLINE ◥◣
Multi-Agent Orchestration Interface · Type / for commands

◆ [20:00:00] [system] GWEN System initialized - Connected to backend
• [20:00:00] [system] Backend: http://localhost:8000
• [20:00:00] Type /help for available commands

▶ /health
◆ [20:00:05] [system] Checking backend health...
✓ [20:00:05] [system] Status: healthy
• [20:00:05] [system] Orchestrator Running: false
• [20:00:05] [system] Agents Count: 7

▶ /run-agent --auto
◆ [20:00:10] [system] Triggering all agents via backend...
• [20:00:10] [system] Execution ID: exec_abc123
✓ [20:00:15] [system] Overall Status: success
• [20:00:15] [system] Total Time: 4.23s
✓ [20:00:15] [CloudflareAgent] CloudflareAgent: completed
✓ [20:00:15] [AWSAgent] AWSAgent: completed
...
```

## Notes

- The CLI is a **thin client** - all agent logic runs on the backend
- Real-time log streaming from backend to TUI
- No local agent files needed in CLI
- Backend handles all concurrent execution
