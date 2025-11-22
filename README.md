# GWEN - Interactive TUI for Multi-Agent Orchestration

**GWEN** is a full-screen terminal application (TUI) for orchestrating multiple agents. Built with TypeScript and Ink, it provides a Claude Code-style interactive interface for running, managing, and creating agents with a Python FastAPI backend.

---

## 🎯 Features

- **Dual-Pane Dashboard**: Live status table showing all agents at a glance
- **Multi-Cloud Monitoring**: Track status across 7 cloud platforms (Cloudflare, AWS, Azure, GCP, GitHub, Datadog, Atlassian)
- **Scrollable Log Feed**: Detailed logs with full scroll support (↑↓, PgUp/PgDn)
- **Full-Screen TUI**: Interactive terminal interface powered by Ink
- **Command Palette**: Press `/` to open a visual command selector
- **Detail View**: Browse individual agent results with full metrics and output
- **Backend Integration**: FastAPI backend handles all agent logic and execution
- **Real-Time Updates**: Dashboard and logs update live during execution
- **Auto-Refresh**: Automatic status checks every 5 minutes
- **14-Day History**: Comprehensive incident tracking across services
- **TRON Aesthetic**: Clean, professional sci-fi theme with neon cyan accents

---

## 📋 Prerequisites

- **Python 3.13+** (backend)
- **Node.js 18+** (CLI)
- **npm** or **yarn**

---

## 🚀 Quick Start (2 Minutes)

### 1. Backend Setup (Python/FastAPI)

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start the backend server
cd backend
python main.py
```

Backend will run on **http://localhost:8000**

### 2. CLI Installation


### 2. CLI Installation

**Option 1: Global Installation (Recommended)**

```bash
npm install
npm run build
npm link
```

Now you can run `gwen` from anywhere:

```bash
gwen
```

**Option 2: Local Development**

```bash
npm install
npm run build
npm start
```

### 3. Quick Test

```bash
gwen

# Inside GWEN:
/health              # Check backend is connected
/list-agents         # See available agents
/run-agent --auto    # Execute all agents
/status              # View results
```

---

## 🎮 What You'll See

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

---

## 📁 Project Structure

```
gwen-cli/ (repo root)
├── backend/              # Python FastAPI backend
│   ├── agents/          # Python monitoring agents (7 services)
│   ├── orchestrator/    # Agent orchestration
│   ├── common/          # Shared utilities
│   ├── main.py          # FastAPI server
│   └── requirements.txt # Python dependencies
├── package.json          # Node.js dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── bin/
│   └── gwen             # Executable entry point
├── src/
│   ├── index.tsx        # Application entry point
│   ├── App.tsx          # Main Ink application component
│   ├── types.ts         # TypeScript type definitions
│   ├── ui/              # UI components
│   │   ├── Header.tsx           # Header component
│   │   ├── DashboardTable.tsx   # Agent status table
│   │   ├── AgentDetailView.tsx  # Full-screen detail view
│   │   ├── Prompt.tsx           # Command input prompt
│   │   ├── OutputPanel.tsx      # Log display
│   │   └── CommandPalette.tsx   # Command selection overlay
│   ├── core/            # Core logic
│   │   ├── command-parser.ts    # Command parsing utilities
│   │   ├── api-client.ts        # Backend API client
│   │   ├── agent-loader.ts      # Agent discovery and loading
│   │   └── agent-runner.ts      # Agent execution engine
│   └── commands/        # Command handlers
│       ├── handlers.ts          # Local agent commands
│       └── api-handlers.ts      # Backend API commands
└── cli-agents/          # Local CLI agent directory
    ├── example-agent/
    │   ├── agent.json   # Agent metadata
    │   └── index.js     # Agent implementation
    └── service-status/
        ├── agent.json
        └── index.js
```

---

## 🎮 Usage & Commands

### Available Commands

| Command | Description |
|---------|-------------|
| `/run-agent --auto` | Execute all agents and update dashboard |
| `/run-agent <name>` | Execute a specific agent (e.g., CloudflareAgent) |
| `/list-agents` | List all available agents |
| `/status` | Get current status of all agents |
| `/logs <name>` | Get detailed logs for specific agent |
| `/detail` | Browse agent results in full-screen detail view |
| `/health` | Check backend health and connection |
| `/help` | Show help information |
| `/exit` | Exit GWEN |

### Command to API Mapping

| CLI Command | Backend API Endpoint |
|------------|---------------------|
| `/run-agent --auto` | `POST /retrieve-status` |
| `/run-agent <name>` | `POST /agents/<name>/execute` |
| `/list-agents` | `GET /` (system info) |
| `/status` | `GET /agent-status` |
| `/logs <name>` | `GET /agent-logs/<name>` |
| `/health` | `GET /health` |


### Dashboard View

The top pane shows a live status table:

```
╭─────────────────────────────────────────────────────────╮
│ DASHBOARD - Live Agent Status                          │
│ Agent              Status          Summary              │
│ ─────────────────────────────────────────────────────── │
│ CloudflareAgent    ✓ Operational  No incidents over... │
│ AzureAgent         ⚠ Degraded     2 incidents over...  │
│ GCPAgent           ✓ Operational  No incidents over... │
│ AWSAgent           ✓ Operational  No incidents over... │
╰─────────────────────────────────────────────────────────╯
```

### Log Feed View

The bottom pane shows scrollable detailed logs:
- **↑↓** - Scroll one line at a time
- **PgUp/PgDn** - Fast scroll (5 lines)
- **Home/End** - Jump to top/bottom

### Command Palette

Press **/** to open the command palette:
- **↑↓** - Navigate commands
- **Enter** - Select command
- **Esc** - Close palette

### Example Session

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

---

## 🎨 Architecture

### System Overview

```
Backend (Port 8000)          CLI (Terminal)
┌─────────────────┐         ┌──────────────────┐
│   FastAPI App   │◄────────│   Ink/React TUI  │
│                 │   HTTP  │                  │
│ 7 Agent Workers │         │  Live Dashboard  │
└─────────────────┘         └──────────────────┘
```

**Key Points:**
- The CLI is a **thin client** - all agent logic runs on the backend
- Real-time log streaming from backend to TUI
- No local agent files needed in CLI
- Backend handles all concurrent execution

### Quick Start

```bash
# Inside GWEN
/new-agent my-agent
```

This creates:

```
cli-agents/my-agent/
├── agent.json    # Configuration
└── index.ts      # Implementation
```

### Agent Structure

**agent.json** - Agent metadata:

```json
{
  "name": "my-agent",
  "version": "1.0.0",
  "description": "My custom agent",
  "author": "GWEN",
  "timeout": 30000
}
```

**index.js** - Agent implementation:

```javascript
/**
 * Agent entry point
 * @param {Object} config - Agent configuration from agent.json
 * @param {Object} context - Execution context with logging
 */
export async function run(config, context) {
  context.log('Agent starting...', 'info');
  
  try {
    // Your agent logic here
    await doSomething();
    
    context.log('Task completed', 'success');
  } catch (error) {
    context.log(`Error: ${error.message}`, 'error');
    throw error;
  }
}
```

### Context API

The `context` object provides:

```javascript
context.log(message, level)
```

**Log Levels:**
- `'info'` - Normal information (white)
- `'success'` - Success messages (green)
- `'warn'` - Warnings (yellow)
- `'error'` - Errors (red)
- `'system'` - System messages (cyan)

---

## 🔧 Development

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/`.

### Watch Mode

```bash
npm run dev
```

Automatically rebuilds on file changes.

### Testing Agents

After building, run GWEN and test your agents:

```bash
npm run build
npm start
# Then type: /run-agent my-agent
```

---

## 🎨 Architecture


### Runtime Flow

```
┌──────────────────────────────────────────────────────────┐
│ User runs `gwen` command                                 │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ bin/gwen → dist/index.js → Ink App boots                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ App.tsx renders:                                         │
│  • Header (GWEN SYSTEM ONLINE)                          │
│  • OutputPanel (log display)                            │
│  • Prompt (command input)                               │
│  • CommandPalette (when "/" typed)                      │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ useInput hook intercepts keystrokes                      │
│  • "/" → Opens command palette                          │
│  • Enter → Executes command                             │
│  • ↑↓ → Navigates palette                               │
│  • Esc → Closes palette                                 │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ command-parser.ts parses input                           │
│  • Extracts command name and arguments                   │
│  • Returns { command, args }                            │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ api-handlers.ts routes command to backend                │
│  • Makes HTTP request to FastAPI                        │
│  • Backend executes agents in parallel                  │
│  • Streams logs back to CLI                             │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Agent logs stream → UI updates in real-time             │
│  • Backend response → addLog() → setState()             │
│  • OutputPanel re-renders with new logs                 │
└──────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App (state management, input handling)
├── Header (static header)
├── OutputPanel (displays logs)
├── Prompt (command input)
└── CommandPalette (command selector)
```

### Data Flow

1. **User Input** → `useInput` hook → Update state
2. **Command Execution** → Handler → API Client → Backend
3. **Backend Processing** → Agents execute → Results returned
4. **UI Update** → `addLog()` → State update → React re-render → Ink terminal update

---

## 🤖 Creating Custom Agents

### Quick Start

```bash
# Inside GWEN
/new-agent my-agent
```

This creates:

```
cli-agents/my-agent/
├── agent.json    # Configuration
└── index.ts      # Implementation
```

### Agent Structure

**agent.json** - Agent metadata:

```json
{
  "name": "my-agent",
  "version": "1.0.0",
  "description": "My custom agent",
  "author": "GWEN",
  "timeout": 30000
}
```

**index.js** - Agent implementation:

```javascript
/**
 * Agent entry point
 * @param {Object} config - Agent configuration from agent.json
 * @param {Object} context - Execution context with logging
 */
export async function run(config, context) {
  context.log('Agent starting...', 'info');
  
  try {
    // Your agent logic here
    await doSomething();
    
    context.log('Task completed', 'success');
  } catch (error) {
    context.log(`Error: ${error.message}`, 'error');
    throw error;
  }
}
```

### Context API

The `context` object provides:

```javascript
context.log(message, level)
```

**Log Levels:**
- `'info'` - Normal information (white)
- `'success'` - Success messages (green)
- `'warn'` - Warnings (yellow)
- `'error'` - Errors (red)
- `'system'` - System messages (cyan)

---

## 🔧 Development

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/`.

### Watch Mode

```bash
npm run dev
```

Automatically rebuilds on file changes.

### Development Workflow

**Terminal 1 - Backend**
```bash
cd backend
python main.py
# Backend running on http://localhost:8000
```

**Terminal 2 - CLI**
```bash
npm run build
npm start
# CLI connects to backend and starts monitoring
```

### Making Changes

- **Backend**: Python changes auto-reload with uvicorn  
- **CLI**: TypeScript changes require rebuild: `npm run build`

### Testing Agents

After building, run GWEN and test your agents:

```bash
npm run build
npm start
# Then type: /run-agent my-agent
```

---

## 🎨 TRON Aesthetic

The UI uses:
- **Colors**: Neon cyan (`#00FFFF`), white, black
- **Borders**: Rounded borders with cyan color
- **Symbols**: `◢◤◥◣` (header), `▶` (prompt), `•✓✖⚠◆` (logs)
- **Fonts**: Terminal monospace

---

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.13+)
- Install dependencies: `pip install -r backend/requirements.txt`
- Check port 8000 is not in use

### CLI won't start
- Check Node version: `node --version` (need 18+)
- Build the CLI: `npm run build`
- Verify `dist/index.js` exists

### "Backend health check failed"
- Make sure Python backend is running: `cd backend && python main.py`
- Check it's accessible at http://localhost:8000
- Try: `curl http://localhost:8000/health`
- Ensure no firewall is blocking localhost:8000

### "Failed to list agents"
- Backend must be running first
- Check firewall isn't blocking port 8000

### CLI not found (after npm link)
```bash
npm link
```

### TypeScript Errors

TypeScript errors about missing modules will resolve once you run:

```bash
npm install
```

### Permission Denied (bin/gwen)

Make the bin script executable:

```bash
chmod +x bin/gwen
```

### Agent Not Found

Ensure:
1. Agent has `agent.json` and `index.js`
2. `index.js` exports a `run()` function
3. Agent is in the `cli-agents/` directory (for local) or `backend/agents/` (for backend)

### Logs Not Appearing

Check:
- `context.log()` is called with valid level
- Agent function is `async`
- Errors are caught and logged

---

## 📝 Examples

### Example 1: Run Single Agent

```
▶ /run-agent CloudflareAgent
```

Output:
```
◆ [12:34:56] [system] Starting agent: CloudflareAgent
• [12:34:56] [CloudflareAgent] Fetching Cloudflare status...
✓ [12:34:57] [CloudflareAgent] Status: Operational
✓ [12:34:57] [system] Agent completed: CloudflareAgent
```

### Example 2: Auto-Run All Agents

```
▶ /run-agent --auto
```

Executes all 7 agents in parallel via backend.

### Example 3: Create New Agent

```
▶ /new-agent deploy-checker
```

Creates `cli-agents/deploy-checker/` with templates.

---

## 🚀 Production Deployment

### Backend
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### CLI Distribution
```bash
npm run build
# Distribute the dist/ folder and bin/gwen
```

---

## 🚀 Next Steps

1. **Add More Agents**: Create agents for your use cases
2. **Extend Commands**: Add custom commands in `handlers.ts`
3. **Customize UI**: Modify components in `src/ui/`
4. **Add Persistence**: Store execution history in a database
5. **WebSocket Support**: Real-time updates from remote agents

---

## 📄 License

MIT

---

## 🆘 Support

For issues or questions, create an issue in the repository.

---

**Built with [Ink](https://github.com/vadimdemedes/ink) - React for CLIs** 🎨
