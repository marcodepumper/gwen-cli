import { useState, useEffect } from 'react';
import { useInput, useApp, Box, Text } from 'ink';
import { Header } from './ui/Header.js';
import { Prompt } from './ui/Prompt.js';
import { CommandPalette } from './ui/CommandPalette.js';
import { AgentDetailView } from './ui/AgentDetailView.js';
import { DashboardTable } from './ui/DashboardTable.js';
import { LogEntry, Command, AppState, DashboardAgent } from './types.js';
import { parseCommand, shouldShowCommandPalette, filterCommands } from './core/command-parser.js';
import { createCommands } from './commands/api-handlers.js';

const App: React.FC = () => {
  const { exit } = useApp();
  
  // Application state
  const [state, setState] = useState<AppState>({
    logs: [],
    inputValue: '',
    showCommandPalette: false,
    selectedCommandIndex: 0,
    isExecuting: false,
    currentAgent: undefined,
    scrollOffset: 0,
    viewMode: 'main',
    agentResults: [],
    selectedAgentIndex: 0,
    dashboardAgents: [],
  });

  // Prevent duplicate renders by tracking if we're already rendered
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper to add logs
  const addLog = (message: string, level: LogEntry['level'] = 'info', source?: string) => {
    setState(prev => ({
      ...prev,
      logs: [
        ...prev.logs,
        {
          timestamp: new Date(),
          level,
          message,
          source,
        },
      ],
    }));
  };

  // Set executing state
  const setExecuting = (executing: boolean) => {
    setState(prev => ({ ...prev, isExecuting: executing }));
  };

  // Set current agent
  const setCurrentAgent = (agent?: string) => {
    setState(prev => ({ ...prev, currentAgent: agent }));
  };

  // Store agent results for detail view
  const setAgentResults = (results: AppState['agentResults']) => {
    setState(prev => ({ ...prev, agentResults: results }));
  };

  // Update dashboard agents
  const setDashboardAgents = (agents: DashboardAgent[]) => {
    setState(prev => ({ ...prev, dashboardAgents: agents }));
  };

  // Switch to detail view
  const showDetailView = () => {
    setState(prev => ({ ...prev, viewMode: 'detail', selectedAgentIndex: 0 }));
  };

  // Create command handlers (connects to FastAPI backend)
  const commands: Command[] = createCommands(addLog, setExecuting, setCurrentAgent, setAgentResults, showDetailView, setDashboardAgents);

  // Filter commands based on input
  const filteredCommands = filterCommands(commands, state.inputValue);

  // Welcome message and auto-start agents
  useEffect(() => {
    if (!isInitialized) {
      addLog('GWEN System initialized - Connected to backend', 'system');
      addLog('Backend: http://localhost:8000', 'info');
      addLog('Auto-refresh: Every 5 minutes', 'info');
      addLog('Type /help for available commands', 'info');
      setIsInitialized(true);
      
      // Auto-start agents immediately
      const startAgentsCommand = commands.find(cmd => cmd.name === 'start-agents');
      if (startAgentsCommand) {
        startAgentsCommand.execute([]);
      }
      
      // Auto-refresh every 5 minutes (300000ms)
      const interval = setInterval(() => {
        if (!state.isExecuting) {
          addLog('Auto-refresh: Starting agents...', 'system');
          if (startAgentsCommand) {
            startAgentsCommand.execute([]);
          }
        }
      }, 300000);
      
      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [isInitialized, commands, state.isExecuting]);

  // Handle keyboard input
  useInput((input: string, key: any) => {
    // Handle detail view navigation
    if (state.viewMode === 'detail') {
      if (key.escape) {
        setState(prev => ({ ...prev, viewMode: 'main', selectedAgentIndex: 0 }));
        return;
      }

      if (key.leftArrow || (key.shift && key.tab)) {
        setState(prev => ({
          ...prev,
          selectedAgentIndex: Math.max(0, prev.selectedAgentIndex - 1),
        }));
        return;
      }

      if (key.rightArrow || key.tab) {
        setState(prev => ({
          ...prev,
          selectedAgentIndex: Math.min(
            prev.agentResults.length - 1,
            prev.selectedAgentIndex + 1
          ),
        }));
        return;
      }

      // Ignore other input in detail view
      return;
    }

    // Ignore input during execution
    if (state.isExecuting) {
      return;
    }

    // Handle scrolling in main view (when not showing command palette)
    if (!state.showCommandPalette) {
      const maxHeight = 15; // Log feed height
      const totalLogs = state.logs.length;
      
      if (key.upArrow || (key.pageUp)) {
        const scrollAmount = key.pageUp ? 5 : 1;
        setState(prev => {
          const currentOffset = prev.scrollOffset === 0 ? 
            Math.max(0, totalLogs - maxHeight) : prev.scrollOffset;
          const newOffset = Math.max(0, currentOffset - scrollAmount);
          return { ...prev, scrollOffset: newOffset };
        });
        return;
      }

      if (key.downArrow || key.pageDown) {
        const scrollAmount = key.pageDown ? 5 : 1;
        setState(prev => {
          const maxOffset = Math.max(0, totalLogs - maxHeight);
          const currentOffset = prev.scrollOffset === 0 ? maxOffset : prev.scrollOffset;
          const newOffset = Math.min(maxOffset, currentOffset + scrollAmount);
          // Reset to 0 (auto-scroll mode) if at bottom
          return { ...prev, scrollOffset: newOffset === maxOffset ? 0 : newOffset };
        });
        return;
      }

      // Home/End for quick navigation
      if (key.home) {
        setState(prev => ({ ...prev, scrollOffset: 0 }));
        return;
      }

      if (key.end) {
        setState(prev => ({ ...prev, scrollOffset: 0 })); // 0 = auto-scroll to bottom
        return;
      }
    }

    // Handle command palette navigation
    if (state.showCommandPalette) {
      if (key.upArrow) {
        setState(prev => ({
          ...prev,
          selectedCommandIndex: Math.max(0, prev.selectedCommandIndex - 1),
        }));
        return;
      }

      if (key.downArrow) {
        setState(prev => ({
          ...prev,
          selectedCommandIndex: Math.min(
            filteredCommands.length - 1,
            prev.selectedCommandIndex + 1
          ),
        }));
        return;
      }

      if (key.escape) {
        setState(prev => ({
          ...prev,
          showCommandPalette: false,
          inputValue: '',
          selectedCommandIndex: 0,
        }));
        return;
      }

      if (key.return) {
        const selectedCommand = filteredCommands[state.selectedCommandIndex];
        if (selectedCommand) {
          setState(prev => ({
            ...prev,
            inputValue: `/${selectedCommand.name} `,
            showCommandPalette: false,
            selectedCommandIndex: 0,
          }));
        }
        return;
      }
    }

    // Handle backspace
    if (key.backspace || key.delete) {
      setState(prev => {
        const newValue = prev.inputValue.slice(0, -1);
        const showPalette = shouldShowCommandPalette(newValue);
        return {
          ...prev,
          inputValue: newValue,
          showCommandPalette: showPalette,
          selectedCommandIndex: showPalette ? 0 : prev.selectedCommandIndex,
        };
      });
      return;
    }

    // Handle Enter - execute command
    if (key.return) {
      const parsed = parseCommand(state.inputValue);
      
      if (!parsed) {
        addLog('Invalid command. Type /help for available commands', 'error', 'system');
        setState(prev => ({ ...prev, inputValue: '' }));
        return;
      }

      const command = commands.find(
        cmd => cmd.name === parsed.command || cmd.aliases?.includes(parsed.command)
      );

      if (!command) {
        addLog(`Unknown command: ${parsed.command}`, 'error', 'system');
        setState(prev => ({ ...prev, inputValue: '' }));
        return;
      }

      // Clear input
      setState(prev => ({ ...prev, inputValue: '' }));

      // Execute command asynchronously
      command.execute(parsed.args).catch(error => {
        addLog(`Command error: ${error.message}`, 'error', 'system');
      });

      return;
    }

    // Handle Ctrl+C
    if (key.ctrl && input === 'c') {
      addLog('Exiting...', 'system');
      exit();
      return;
    }

    // Regular character input
    if (!key.ctrl && !key.meta && input) {
      setState(prev => {
        const newValue = prev.inputValue + input;
        const showPalette = shouldShowCommandPalette(newValue);
        return {
          ...prev,
          inputValue: newValue,
          showCommandPalette: showPalette,
          selectedCommandIndex: showPalette ? 0 : prev.selectedCommandIndex,
        };
      });
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {state.viewMode === 'main' ? (
        <>
          <Header />
          {/* Dashboard Table - Single Pane */}
          <DashboardTable key="dashboard" agents={state.dashboardAgents} />
          
          <Prompt
            value={state.inputValue}
            isExecuting={state.isExecuting}
            currentAgent={state.currentAgent}
          />
          
          {/* Command Palette - Positioned below prompt to avoid overlap */}
          {state.showCommandPalette && (
            <CommandPalette
              commands={filteredCommands}
              selectedIndex={state.selectedCommandIndex}
              visible={state.showCommandPalette}
            />
          )}
        </>
      ) : (
        <AgentDetailView 
          agents={state.agentResults}
          selectedIndex={state.selectedAgentIndex}
        />
      )}
    </Box>
  );
};

export default App;
