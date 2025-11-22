# GWEN - Interactive TUI for Multi-Agent Orchestration

**GWEN** is a full-screen terminal application (TUI) for orchestrating multiple agents. Built with TypeScript and Ink, it provides a Claude Code-style interactive interface for running, managing, and creating agents.

---

## 🎯 Features

- **Dual-Pane Dashboard**: Live status table showing all agents at a glance
- **Scrollable Log Feed**: Detailed logs with full scroll support (↑↓, PgUp/PgDn)
- **Full-Screen TUI**: Interactive terminal interface powered by Ink
- **Command Palette**: Press `/` to open a visual command selector
- **Detail View**: Browse individual agent results with full metrics and output
- **Backend Integration**: Connects to FastAPI backend for real agent execution
- **Real-Time Updates**: Dashboard and logs update live during execution
- **TRON Aesthetic**: Clean, professional sci-fi theme with neon cyan accents

---

## 📋 Prerequisites

- **Node.js 18+**
- **npm** or **yarn**

---

## 🚀 Installation

### Option 1: Global Installation (Recommended)

```bash
npm install
npm run build
npm link
```

Now you can run `gwen` from anywhere:

```bash
gwen
```

### Option 2: Local Development

```bash
npm install
npm run build
npm start
```

---

## 📁 Project Structure

```
gwen-cli/ (repo root)
├── backend/              # Python FastAPI backend
│   ├── agents/          # Python monitoring agents
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

## 🎮 Usage

### Launch GWEN

```bash
gwen
```

Once launched, GWEN takes over the terminal. You interact with it by typing commands.

### Available Commands

| Command | Description |
|---------|-------------|
| `/run-agent --auto` | Execute all agents and update dashboard |
| `/run-agent <name>` | Execute a specific agent |
| `/list-agents` | List all available agents |
| `/status` | Get current status of all agents |
| `/logs <name>` | Get detailed logs for specific agent |
| `/detail` | Browse agent results in full-screen detail view |
| `/health` | Check backend health |
| `/help` | Show help information |
| `/exit` | Exit GWEN |

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

---

## 🤖 Creating Agents

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
│ handlers.ts routes to command handler                    │
│  • /run-agent → runAgent()                              │
│  • /list-agents → listAgents()                          │
│  • /new-agent → createAgent()                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ agent-loader.ts discovers and loads agent                │
│  • Reads agents/ directory                              │
│  • Parses agent.json                                    │
│  • Loads index.js module                                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ agent-runner.ts executes agent                           │
│  • Creates AgentContext with log callback               │
│  • Calls agent.run(config, context)                     │
│  • Handles timeout and errors                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│ Agent streams logs → UI updates in real-time            │
│  • context.log() → addLog() → setState()                │
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
2. **Command Execution** → Handler → Agent Loader → Agent Runner
3. **Agent Logging** → `context.log()` → `addLog()` → State update
4. **UI Update** → React re-render → Ink terminal update

---

## 🎨 TRON Aesthetic

The UI uses:
- **Colors**: Neon cyan (`#00FFFF`), white, black
- **Borders**: Rounded borders with cyan color
- **Symbols**: `◢◤◥◣` (header), `▶` (prompt), `•✓✖⚠◆` (logs)
- **Fonts**: Terminal monospace

---

## 🐛 Troubleshooting

### TypeScript Errors

The TypeScript errors about missing modules (react, ink, path, fs) will resolve once you run:

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
3. Agent is in the `agents/` directory

### Logs Not Appearing

Check:
- `context.log()` is called with valid level
- Agent function is `async`
- Errors are caught and logged

---

## 📝 Examples

### Example 1: Run Single Agent

```
▶ /run-agent example-agent
```

Output:
```
◆ [12:34:56] [system] Starting agent: example-agent
• [12:34:56] [example-agent] Example agent starting...
• [12:34:56] [example-agent] Fetching data...
✓ [12:34:57] [example-agent] Data retrieved successfully
✓ [12:34:57] [example-agent] Example agent completed
✓ [12:34:57] [system] Agent completed: example-agent
```

### Example 2: Auto-Run All Agents

```
▶ /run-agent --auto
```

Executes all agents in sequence.

### Example 3: Create New Agent

```
▶ /new-agent deploy-checker
```

Creates `cli-agents/deploy-checker/` with templates.

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
