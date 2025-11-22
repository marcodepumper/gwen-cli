import * as path from 'path';
import * as fs from 'fs/promises';
import { Command, LogEntry } from '../types.js';
import { discoverAgents, loadAgent, getAgentConfig } from '../core/agent-loader.js';
import { runAgent } from '../core/agent-runner.js';

/**
 * Create all command handlers for the application
 */
export function createCommands(
  agentsDir: string,
  addLog: (message: string, level?: LogEntry['level'], source?: string) => void,
  setExecuting: (executing: boolean) => void,
  setCurrentAgent: (agent?: string) => void
): Command[] {
  return [
    {
      name: 'run-agent',
      description: 'Execute a specific agent',
      execute: async (args: string[]) => {
        if (args.length === 0) {
          addLog('Usage: /run-agent <agent-name> or /run-agent --auto', 'error', 'system');
          return;
        }

        const isAuto = args[0] === '--auto';

        if (isAuto) {
          addLog('Auto-running all agents...', 'system');
          const agents = await discoverAgents(agentsDir);
          
          for (const agentConfig of agents) {
            setCurrentAgent(agentConfig.name);
            const agent = await loadAgent(agentsDir, agentConfig.name);
            
            if (!agent) {
              addLog(`Failed to load agent: ${agentConfig.name}`, 'error', agentConfig.name);
              continue;
            }

            setExecuting(true);
            try {
              await runAgent(agent, agentConfig, (msg, level) => 
                addLog(msg, level, agentConfig.name)
              );
            } catch (error) {
              // Error already logged in runAgent
            }
            setExecuting(false);
          }
          
          setCurrentAgent(undefined);
          addLog('Auto-run complete', 'success', 'system');
          return;
        }

        const agentName = args[0];
        const config = await getAgentConfig(agentsDir, agentName);
        
        if (!config) {
          addLog(`Agent not found: ${agentName}`, 'error', 'system');
          addLog('Use /list-agents to see available agents', 'info', 'system');
          return;
        }

        const agent = await loadAgent(agentsDir, agentName);
        
        if (!agent) {
          addLog(`Failed to load agent: ${agentName}`, 'error', 'system');
          return;
        }

        setCurrentAgent(agentName);
        setExecuting(true);

        try {
          await runAgent(agent, config, (msg, level) => 
            addLog(msg, level, agentName)
          );
        } catch (error) {
          // Error already logged in runAgent
        } finally {
          setExecuting(false);
          setCurrentAgent(undefined);
        }
      },
    },
    {
      name: 'list-agents',
      description: 'List all available agents',
      aliases: ['ls', 'agents'],
      execute: async () => {
        addLog('Discovering agents...', 'system');
        const agents = await discoverAgents(agentsDir);

        if (agents.length === 0) {
          addLog('No agents found', 'warn', 'system');
          addLog('Use /new-agent to create one', 'info', 'system');
          return;
        }

        addLog(`Found ${agents.length} agent(s):`, 'success', 'system');
        agents.forEach(agent => {
          addLog(`  • ${agent.name} v${agent.version} - ${agent.description}`, 'info');
        });
      },
    },
    {
      name: 'new-agent',
      description: 'Scaffold a new agent',
      execute: async (args: string[]) => {
        if (args.length === 0) {
          addLog('Usage: /new-agent <agent-name>', 'error', 'system');
          return;
        }

        const agentName = args[0];
        const agentPath = path.join(agentsDir, agentName);

        try {
          // Check if agent already exists
          try {
            await fs.access(agentPath);
            addLog(`Agent already exists: ${agentName}`, 'error', 'system');
            return;
          } catch {
            // Agent doesn't exist, continue
          }

          // Create agent directory
          await fs.mkdir(agentPath, { recursive: true });

          // Create agent.json
          const config = {
            name: agentName,
            version: '1.0.0',
            description: `${agentName} agent`,
            author: 'GWEN',
            timeout: 30000,
          };

          await fs.writeFile(
            path.join(agentPath, 'agent.json'),
            JSON.stringify(config, null, 2),
            'utf-8'
          );

          // Create index.ts template
          const template = `/**
 * ${agentName} Agent
 * 
 * This agent template provides a starting point for building custom agents.
 */

export async function run(config, context) {
  context.log('Starting ${agentName} execution...', 'info');

  try {
    // TODO: Implement your agent logic here
    
    // Example: Simulate some work
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    context.log('Agent task completed', 'success');
    
    // Example: Log some results
    context.log(\`Agent: \${config.name} v\${config.version}\`, 'info');
    
  } catch (error) {
    context.log(\`Error: \${error.message}\`, 'error');
    throw error;
  }
}
`;

          await fs.writeFile(
            path.join(agentPath, 'index.ts'),
            template,
            'utf-8'
          );

          addLog(`Agent created: ${agentName}`, 'success', 'system');
          addLog(`Location: ${agentPath}`, 'info', 'system');
          addLog('Edit index.ts to implement your agent logic', 'info', 'system');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          addLog(`Failed to create agent: ${errorMessage}`, 'error', 'system');
        }
      },
    },
    {
      name: 'groups',
      description: 'Manage agent groups',
      execute: async () => {
        addLog('Agent groups feature coming soon...', 'info', 'system');
      },
    },
    {
      name: 'help',
      description: 'Show help information',
      aliases: ['?', 'h'],
      execute: async () => {
        addLog('GWEN Command Reference', 'system');
        addLog('', 'info');
        addLog('/run-agent <name>  - Execute a specific agent', 'info');
        addLog('/run-agent --auto  - Execute all agents sequentially', 'info');
        addLog('/list-agents       - List all available agents', 'info');
        addLog('/new-agent <name>  - Create a new agent', 'info');
        addLog('/groups            - Manage agent groups', 'info');
        addLog('/help              - Show this help', 'info');
        addLog('/exit              - Exit GWEN', 'info');
        addLog('', 'info');
        addLog('Press / to open command palette', 'system');
      },
    },
    {
      name: 'exit',
      description: 'Exit GWEN',
      aliases: ['quit', 'q'],
      execute: async () => {
        addLog('Shutting down GWEN...', 'system');
        process.exit(0);
      },
    },
  ];
}
